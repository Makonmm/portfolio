import os
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("API")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("sucesso!")
    else:
        supabase = None
        logger.error("FALHA.")
except Exception as e:
    supabase = None
    logger.error(f"Erro ao conectar: {e}")

app = FastAPI(title="API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MetricRequest(BaseModel):
    slug: str


@app.get("/api/metrics/{slug}")
def get_metrics(slug: str):
    if not supabase:
        raise HTTPException(
            status_code=503, detail="Banco de dados não conectado")

    try:
        response = supabase.table("metrics").select(
            "*").eq("slug", slug).execute()
        if not response.data:
            return {"views": 0, "upvotes": 0, "downvotes": 0}
        return response.data[0]
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        return {"views": 0, "upvotes": 0, "downvotes": 0}


@app.post("/api/view")
def register_view(req: MetricRequest, request: Request, background_tasks: BackgroundTasks):
    if not supabase:
        raise HTTPException(
            status_code=503, detail="Banco de dados não conectado")
    client_ip = request.headers.get(
        "x-forwarded-for") or request.client.host or "unknown"
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    def _increment():
        try:
            supabase.rpc("increment_view", {
                "page_slug": req.slug,
                "user_ip": client_ip
            }).execute()
            logger.info(f"View processada: {req.slug} IP: {client_ip}")
        except Exception as e:
            logger.error(f"Erro: {e}")

    background_tasks.add_task(_increment)
    return {"status": "queued"}
