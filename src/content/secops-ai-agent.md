---
id: "secops-ai-agent"
title: "Criando um Agente De IA assistente especialista em segurança"
date: "17/12/2025"
tags: ["AI Engineering", "Cybersecurity", "AWS", "Mistral-Nemo", "SecOps"]
description: "Como construí um Agente de IA que roda localmente para operações de segurança utilizando Mistral-Nemo, Roteamento Semântico e infraestrutura blindada na AWS."
---

# Introdução

No cenário atual de Cibersegurança, a privacidade é inegociável. Sob essa ótica, resolvi desenvolver um projeto pessoal de um Agente De IA especialista a fim de auxiliar em tarefas de segurança cibernética de maneira mais segura e controlada, sendo executado na própria máquina do profissional.

---

# 1. O Cérebro

Optei pelo **Mistral-Nemo** (parceria da Mistral AI com a NVIDIA). Diferente de modelos generalistas massivos, o Nemo se demonstrou ótimo em tarefas que envolvem janelas de contextos extensas, como análise de logs, análises de segurança, além de não ser um modelo gigantesco.

Além disso, por rodar localmente via Ollama, garantimos soberania total dos dados: nenhuma informação sai do nosso perímetro.

---

# 2. Arquitetura Neuro-Simbólica

A maioria dos chatbots segue um fluxo linear simples. Para operações de segurança, isso é insuficiente, pois LLMs tendem a "alucinar" fatos recentes ou falhar em tarefas determinísticas (como verificar se um IP está na *blocklist*).

Optei, então, por implementar uma arquitetura de **Agentes ReAct (Reasoning + Acting)**. 

### O Fluxo de Decisão Inteligente
O sistema opera através de um pipeline de roteamento semântico:

1.  **Orquestração e Segurança:** A requisição chega via API segura e passa por uma camada de autenticação rigorosa.
2.  **Análise de Intenção:** Antes de gerar uma resposta, o sistema "pensa" sobre o que foi pedido. Ele classifica a intenção do usuário entre categorias como "Pesquisa de Ameaças", "Análise de Código" ou "Consulta de Conhecimento Interno".
3.  **Uso de Ferramentas (Tool Calling):**
    * Se o modelo detectar a necssidade do uso, ele acionará uma função tool (uma busca na web, por exemplo, por CVEs).
4.  **Síntese:** O Mistral-Nemo recebe os dados brutos das ferramentas e compila uma resposta técnica, contextualizada e acionável.

---

# 3. Integrações

O backend foi construído em **Python** com **FastAPI**, com foco em eficiência.

### Ferramentas Especializadas
Em vez de deixar o modelo "adivinhar", implementei funções Python específicas que o agente pode invocar. Por exemplo, a ferramenta de **Threat Intelligence** não faz uma busca genérica no Google. Ela utiliza APIs de busca profunda para varrer repositórios de exploits, bases de dados de vulnerabilidades (NVD/Mitre) e fóruns técnicos, filtrando ruído e entregando apenas inteligência de alta fidelidade para o modelo processar.

---

# Conclusão

O **projeto** demonstra que a verdadeira potência das LLMs na segurança não vem apenas do tamanho do modelo, mas da arquitetura. Ao combinar a capacidade de raciocínio do **Mistral-Nemo** com ferramentas determinísticas, criamos um assistente que potencializa a capacidade humana de análise sem comprometer a privacidade dos dados.