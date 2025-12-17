import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import { Buffer } from 'buffer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { 
  FiTerminal, FiCpu, FiActivity, FiHardDrive, FiAward, FiCheckCircle, 
  FiShield, FiGithub, FiLinkedin, FiWifi, FiEye, FiDatabase, FiLock, 
  FiCode, FiUser, FiLink, FiFileText, FiArrowLeft, FiCalendar, FiX 
} from 'react-icons/fi';
import { SiHackerrank, SiTryhackme } from 'react-icons/si';

if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

const PROJECTS = [
  {
    id: "PID_SEC_POT",
    title: "AI SecPot (AWS + LLM)",
    description: "Infraestrutura de honeypot na AWS. Captura TTPs adversários e usa um Agente LLM para correlacionar eventos e comportamentos suspeitos, alimentando um painel de simulação de SOC.",
    tags: ["AWS", "LLM Agent", "Python", "Threat Intel"],
    type: "CLOUD + AI"
  },
  {
    id: "PID_LOG_AI",
    title: "Logger AI (Malware Simulator)",
    description: "Ferramenta de pesquisa em Offsec que simula Keyloggers/RATs. Captura contexto de janelas e telas, exfiltra via Discord Webhook e usa IA para estruturar os logs. Inclui persistência em Registry e auto-limpeza.",
    tags: ["Python", "WinAPI", "Evasion", "LLM Analysis"],
    type: "OFFSEC + AI"
  },
  {
    id: "PID_C2_RAT",
    title: "Remote Control (C2) RAT",
    description: "Desenvolvimento de infraestrutura de Comando e Controle (C2). Permite administração remota via shell, transferência de arquivos, captura de webcam e keylogging. Focado em simulações Red Team.",
    tags: ["Socket TCP/IP", "C2 Arch", "Spyware", "Red Team"],
    type: "MALWARE DEV"
  },
  {
    id: "PID_NET_CLF",
    title: "Malicious Traffic Classifier",
    description: "Modelo de Deep Learning com PyTorch para classificar tráfego de rede como malicioso ou benigno. Foco em detecção de anomalias em pacotes.",
    tags: ["PyTorch", "Deep Learning", "Pandas", "Network Sec"],
    type: "CYBER OPS"
  },
  {
    id: "PID_DS_BOT",
    title: "Discord LLM DeepSearch",
    description: "Chatbot avançado com memória de contexto e capacidade de 'Deep Search' na web via comandos. Integra LLMs para processar consultas complexas e manter histórico de conversa.",
    tags: ["Discord API", "LLM", "Web Scraping", "Bot Dev"],
    type: "AUTOMATION"
  },
  {
    id: "PID_FRAUD_AI",
    title: "Credit Card Fraud Detector",
    description: "Modelo preditivo capaz de identificar fraudes em transações financeiras. Atingiu 99% de acurácia em dados não vistos (blind test).",
    tags: ["Scikit-Learn", "Numpy", "Fraud Ops"],
    type: "FINANCE SEC"
  },
  {
    id: "PID_CPP_SIGN",
    title: "Digital Sign Classificator",
    description: "Classificador desenvolvido do zero em C++ para validação de certificados e assinaturas digitais. Foco em alta performance e eficiência de memória.",
    tags: ["C++", "Machine Learning", "Cryptography"],
    type: "LOW LEVEL"
  },
  {
    id: "PID_FACE_CNN",
    title: "Facial Landmark Detection",
    description: "Rede Neural Convolucional (CNN) via Keras para biometria. Detecta pontos-chave (olhos, nariz, mandíbula) para autenticação e análise facial.",
    tags: ["Keras", "TensorFlow", "Computer Vision"],
    type: "BIOMETRICS"
  }
];

const SKILL_CATEGORIES = [
  {
    title: "OFFENSIVE SEC (RED TEAM)",
    icon: <FiLock className="text-red-500" />,
    items: ["Pentesting", "Nmap / Wireshark", "OWASP", "Cryptography", "Metasploit Framework", "Burp Suite"]
  },
  {
    title: "DEFENSIVE SEC (BLUE TEAM)",
    icon: <FiShield className="text-blue-500" />,
    items: ["Threat Intelligence", "SIEM Architecture", "IAM / AWS Security", "Firewall Rules", "Vulnerability Mgmt", "Incident Response"]
  },
  {
    title: "ARTIFICIAL INTELLIGENCE",
    icon: <FiCpu className="text-purple-500" />,
    items: ["LLM Agents (LangChain & StrandsAgents)", "PyTorch & TensorFlow", "Computer Vision (CNNs)", "Scikit-Learn / Pandas", "Deep Learning", "Data Analysis"]
  },
  {
    title: "DEV & CLOUD OPS",
    icon: <FiCode className="text-green-500" />,
    items: ["Python (Advanced)", "C++ (Low Level)", "AWS Cloud", "Docker / Containers", "Linux / Bash Scripting", "SQL / PostgreSQL"]
  }
];

const CERTIFICATES = [
  {
    name: "Certified Ethical Hacker (CEH)",
    issuer: "IBSEC",
    date: "Mar 2025 - Mar 2028",
    id: "CRED_ID: 2c683a1d0a307ad6",
    skills: ["Pentest", "Network Analysis", "Exploitation", "Criptografia"],
    icon: <FiShield />
  },
  {
    name: "Analista SOC (IC-SOC-380)",
    issuer: "IBSEC",
    date: "Abr 2025 - Abr 2028",
    id: "CRED_ID: 2867162bfc8744c9",
    skills: ["SIEM", "IDS/IPS", "Incident Response", "Log Analysis"],
    icon: <FiEye />
  },
  {
    name: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    date: "Ago 2025",
    id: "MODULE_AWS_CLOUD",
    skills: ["IAM", "Cloud Security", "Machine Learning", "Deploy"],
    icon: <FiAward />
  },
  {
    name: "IBM AI Engineering",
    issuer: "IBM",
    date: "Dez 2024",
    id: "MODULE_AI_ENG",
    skills: ["Deep Learning", "TensorFlow", "PyTorch", "LLM Arch"],
    icon: <FiCpu />
  },
  {
    name: "Desenvolvedor Python",
    issuer: "EBAC",
    date: "Mai 2024",
    id: "DEV_PYTHON_FULL",
    skills: ["API REST", "Docker", "SQL", "Backend"],
    icon: <FiTerminal />
  },
  {
    name: "EFSET English Certificate (C1)",
    issuer: "EF Standard English Test",
    date: "Jan 2021",
    id: "LANG_PKG_EN_US",
    skills: ["Fluent English", "Advanced Reading"],
    icon: <FiCheckCircle />
  }
];

const EXPERIENCES = [
  {
    role: "Cyber Threat Hunter",
    company: "IPV7 (Freelance)",
    period: "Abr 2025 - Presente",
    description: "Atuação especializada em operações de Segurança Ofensiva, com foco primário em Bug Bounty e Pentesting. Condução de testes de intrusão em aplicações web, APIs e infraestruturas de rede para identificar vulnerabilidades críticas (OWASP Top 10). Pesquisa ativa de vetores de ataque, exploração de falhas de lógica de negócio e elaboração de relatórios técnicos com Provas de Conceito (PoC) para mitigação de riscos.",
    tech: ["Pentest", "Bug Bounty", "Burp Suite", "OWASP", "Vulnerability Research"]
  },
  {
    role: "Desenvolvedor de IA & ML",
    company: "Freelance",
    period: "Mar 2024 - Mai 2025",
    description: "Desenvolvimento end-to-end de soluções de Inteligência Artificial. Criação de Agentes Autônomos, modelos de Visão Computacional e algoritmos de Machine Learning para classificação e predição. Projetos focados em resolver problemas complexos com arquiteturas de Deep Learning modernas.",
    tech: ["Deep Learning", "Computer Vision", "AI Agents", "Python", "Data Science"]
  },
  {
    role: "Suporte Técnico N1 (Redes)",
    company: "Ibi - Internet Brasileira Incrível",
    period: "Out 2022 - Mar 2023",
    description: "Gestão de infraestrutura de redes ISP. Responsável pelo provisionamento lógico de rotas, configuração avançada de roteadores/CPEs e troubleshooting de protocolos de rede. Garantia da estabilidade do link e suporte técnico especializado na camada de infraestrutura.",
    tech: ["Network Infrastructure", "Routing Protocols", "ISP Ops", "Troubleshooting", "Hardware Config"]
  }
];

const SOCIAL_LINKS = [
    { name: "GitHub", url: "https://github.com/Makonmm?tab=repositories", icon: <FiGithub />, label: "Perfil no GitHub", color: "group-hover:text-white" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/", icon: <FiLinkedin />, label: "Perfil no Linkedin", color: "group-hover:text-blue-400" },
    { name: "TryHackMe", url: "https://tryhackme.com/p/zurawie", icon: <SiTryhackme />, label: "Perfil no TryHackMe", color: "group-hover:text-red-500" },
    { name: "HackerRank", url: "https://www.hackerrank.com/profile/matheushenriqu45", icon: <SiHackerrank />, label: "Perfil no Hackerrank", color: "group-hover:text-green-500" }
];

const useMarkdownPosts = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const loadPosts = async () => {
            const modules = import.meta.glob('./content/*.md', { query: '?raw', import: 'default' });
            const loadedPosts = [];

            for (const path in modules) {
                const rawText = await modules[path]();
                const { data, content } = matter(rawText);
                loadedPosts.push({
                    ...data,
                    content: content,
                    slug: path.split('/').pop().replace('.md', ''),
                    id: data.id || path.split('/').pop().replace('.md', '')
                });
            }
            setPosts(loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
        };
        loadPosts();
    }, []);

    return posts;
};

const GlitchText = ({ text, isGuiMode }) => (
  <div className="glitch-wrapper">
    <h1 
      className={`text-4xl md:text-6xl font-bold mb-6 relative z-10 font-mono ${!isGuiMode ? 'glitch-text' : ''}`} 
      data-text={text}
    >
      {text}
    </h1>
  </div>
);

const BinaryAssemblyBackground = ({ isGuiMode }) => {
    const symbols = ["0", "1", "MOV", "PUSH", "POP", "RET", "JMP", "XOR", "NOP", "INT 3", "0x00", "0xFF"];
    
    if (isGuiMode) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 text-xs text-cyber-primary font-mono select-none">
                {[...Array(250)].map((_, i) => (
                    <span key={i} className="animate-pulse" style={{ animationDelay: `${Math.random() * 5}s`, opacity: Math.random() }}>
                        {symbols[Math.floor(Math.random() * symbols.length)]}
                    </span>
                ))}
            </div>
        </div>
    )
}

const TypingEffect = ({ text, delay, isGuiMode }) => {
    if (isGuiMode) {
      return (
        <div className="block mb-1">
          <span className="hover:text-cyber-accent hover:font-bold transition-colors cursor-default">{text}</span>
        </div>
      )
    }

    const letters = Array.from(text);
    const container = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.03, delayChildren: delay } }) };
    const child = { visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 5 } };
    return (
      <motion.div variants={container} initial="hidden" animate="visible" className="block mb-1">
        {letters.map((letter, index) => (
          <motion.span variants={child} key={index} className="hover:text-cyber-accent hover:font-bold transition-colors cursor-default">{letter === " " ? "\u00A0" : letter}</motion.span>
        ))}
      </motion.div>
    );
};

const ProjectCard = ({ project, index, isGuiMode }) => (
    <motion.div
      initial={!isGuiMode ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-gray-900/50 border border-cyber-secondary/40 p-6 hover:border-cyber-accent hover:shadow-[0_0_20px_rgba(255,0,60,0.2)] transition-all duration-300 flex flex-col h-full backdrop-blur-sm"
    >
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-secondary/30 group-hover:border-cyber-accent transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-secondary/30 group-hover:border-cyber-accent transition-colors"></div>
      <div className="mb-4 flex justify-between items-start">
          <span className="text-[10px] border border-cyber-accent/50 text-cyber-accent px-2 py-0.5 rounded bg-cyber-accent/5">{project.type}</span>
          <span className="text-[10px] text-gray-600 font-mono group-hover:text-cyber-primary transition-colors">{project.id}</span>
       </div>
      <h3 className="text-xl font-bold mb-3 text-gray-100 group-hover:text-cyber-accent transition-colors tracking-tight">{project.title}</h3>
      <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-2 text-xs font-bold text-cyber-secondary mb-6">
        {project.tags.map(tag => (
          <span key={tag} className="text-[10px] text-gray-500 before:content-['#'] group-hover:text-cyber-primary transition-colors">{tag}</span>
        ))}
      </div>
       {/* <button className={`mt-auto w-full py-2 border border-cyber-secondary/20 text-xs text-gray-400 hover:bg-cyber-accent hover:text-white hover:border-transparent transition-all uppercase tracking-widest flex justify-center items-center gap-2 ${!isGuiMode && 'group-hover:animate-pulse'}`}>
          <FiTerminal /> Deploy_View
       </button> */}
    </motion.div>
);

const InteractiveTerminal = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState(['Digite "help" para ver os comandos disponíveis.']);
    const [isOpen, setIsOpen] = useState(false);
    const bottomRef = useRef(null);
  
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);
  
    const handleCommand = (e) => {
      if (e.key === 'Enter') {
        const cmd = input.trim().toLowerCase();
        let response = '';
  
        switch (cmd) {
          case 'help': 
            response = 'Available commands: ls, whoami, contact, clear, exit, date'; 
            break;
          case 'ls': 
            response = 'drwx------ home/\ndrwxr-xr-x writeups/\ndrwxr-xr-x projects/\n-r--r--r-- about_me.txt'; 
            break;
          case 'whoami': 
            response = 'Visitor (UID: 1001) | Gid: 1001 | Groups: 1001(guest)'; 
            break;
          case 'contact': 
            response = 'LinkedIn: https://www.linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/\nGitHub: https://github.com/Makonmm\nTryHackMe: https://tryhackme.com/p/zurawie'; 
            break;
          case 'sudo': 
            response = 'user is not in the sudoers file. This incident will be reported.'; 
            break;
          case 'date': 
            response = new Date().toString(); 
            break;
          case 'clear': 
            setHistory([]); 
            setInput(''); 
            return;
          case 'exit': 
            setIsOpen(false); 
            setInput(''); 
            return;
          default: 
            response = `bash: ${cmd}: command not found`;
        }
  
        setHistory([...history, `guest@portfolio:~$ ${cmd}`, response]);
        setInput('');
      }
    };
  
    if (!isOpen) return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-black/80 text-cyber-secondary px-4 py-2 font-mono text-xs font-bold border border-cyber-primary/50 hover:bg-cyber-primary hover:text-black transition-all z-50 rounded flex items-center gap-2 shadow-lg backdrop-blur-sm"
      >
        <FiTerminal />  TERMINAL
      </button>
    );
  
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-6 right-6 w-full max-w-[400px] h-80 bg-black/95 border border-cyber-secondary/50 p-0 font-mono text-xs text-green-500 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 flex flex-col rounded overflow-hidden backdrop-blur-md"
      >
        <div className="flex justify-between items-center bg-gray-900 p-2 border-b border-gray-800">
          <span className="text-gray-400 font-bold flex items-center gap-2"><FiTerminal /> bash -- 80x24</span>
          <button onClick={() => setIsOpen(false)} className="text-red-500 hover:text-white transition-colors p-1"><FiX /></button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {history.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-words leading-relaxed">
              {line.startsWith('guest@') ? <span className="text-white">{line}</span> : <span className="text-green-400/90">{line}</span>}
            </div>
          ))}
          <div className="flex items-center">
            <span className="mr-2 text-cyber-secondary whitespace-nowrap">guest@portfolio:~$</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              className="bg-transparent outline-none flex-grow text-white focus:ring-0 w-full"
              autoFocus
              spellCheck="false"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </motion.div>
    );
};

const HomePage = ({ isGuiMode }) => {
    return (
        <div className="container mx-auto px-4 py-12 md:px-8 lg:px-16 flex-grow relative z-10">
            <section className="mb-24 pt-8 relative">
              <BinaryAssemblyBackground isGuiMode={isGuiMode} />
              <motion.div initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1 }} className="text-center">
                <p className="text-cyber-secondary mb-4 font-mono text-sm">> _whoami.sh</p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <span className="text-cyber-accent text-4xl md:text-6xl font-bold tracking-tighter">{`$>#`}</span>
                    <div className="flex flex-col items-center">
                        <span className="text-xl md:text-2xl text-gray-400 mb-[-5px] tracking-widest">ID:</span>
                        <GlitchText text="Matheus Henrique" isGuiMode={isGuiMode} />
                    </div>
                    <span className="text-cyber-accent text-4xl md:text-6xl font-bold tracking-tighter">{`#<$`}</span>
                </div>
                <div className="max-w-2xl mx-auto border-l-2 border-cyber-secondary/50 pl-6 ml-auto mr-auto space-y-3 text-lg text-gray-300 font-mono mt-12 relative text-left">
                    <div className="absolute top-0 left-[-2px] w-[2px] h-1/3 bg-cyber-accent shadow-[0_0_10px_#ff003c]"></div>
                  <TypingEffect text="> Estudante De Ciência Da Computação | Bug Hunter | Hacker Ético Certificado." delay={0.5} isGuiMode={isGuiMode} />
                  <TypingEffect text="> Foco em operações Red Team/Blue Team, LLMs e Agentes de IA." delay={2.5} isGuiMode={isGuiMode} />
                  <TypingEffect text="> Aqui você encontrará informações profissionais/técnicas sobre mim, projetos e artigos." delay={4.5} isGuiMode={isGuiMode} />
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6 }} className="mt-12">
                    <a href="https://www.linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/" target="_blank" className="inline-flex items-center gap-2 bg-cyber-secondary/10 border border-cyber-secondary text-cyber-secondary px-8 py-4 hover:bg-cyber-secondary hover:text-black hover:scale-105 transition-all duration-300 group">
                        <FiTerminal />
                        <span>Conecte-se comigo </span>
                        <span className={`w-2 h-4 bg-cyber-secondary group-hover:bg-black ml-2 ${!isGuiMode && 'animate-blink'}`}></span>
                    </a>
                </motion.div>
              </motion.div>
            </section>

            <section className="mb-24">
                <div className="flex items-center justify-between mb-8 border-b border-cyber-secondary/30 pb-2 font-mono">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                        <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00300000</span>
                        <FiUser className="text-cyber-accent" /> cat about_me.txt
                    </h2>
                    <span className="text-xs text-cyber-secondary">READ PERMISSION ONLY</span>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    className={`border-l-4 border-cyber-accent p-6 md:p-8 font-mono text-gray-300 leading-relaxed group relative overflow-hidden ${isGuiMode ? 'bg-black/90' : 'bg-black/60 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-sm'}`}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><FiActivity size={100} /></div>
                    <div className="space-y-4"> 
                        <p><span className="text-cyber-accent font-bold">{`root@root:~$`}</span> Sou estudante de Ciência da Computação com foco em Cibersegurança (ofensiva e defensiva) e Inteligência Artificial aplicada. Tenho experiência em redes, testes de intrusão, análise de ameaças e desenvolvimento de projetos de IA/ML voltados à detecção de fraudes, tráfego malicioso e análise comportamental.</p>
                        <p>Entre meus projetos recentes, destaco o desenvolvimento de um <span className="text-white font-bold">Honeypot com Agente LLM</span> para análise de ataques em tempo real e modelos de Machine Learning para classificação de tráfego de rede e detecção de fraudes em cartões de crédito.</p>
                        <p>Participo ativamente de <span className="text-cyber-accent">CTFs, Bug Bounties e Threat Hunting</span>, aplicando continuamente meus conhecimentos em Segurança Ofensiva (Red Team), Defensiva (SIEM, EDR) e Forense Digital. Meu objetivo é aplicar conhecimento técnico em problemas reais, relevantes e de alto impacto.</p>
                    </div>
                </motion.div>
            </section>

            <section className="mb-24">
                <div className="flex items-center justify-between mb-12 border-b border-cyber-secondary/30 pb-2 font-mono">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                        <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00350000</span>
                        <FiActivity className="text-cyber-accent" /> tail -f career.log
                    </h2>
                    <span className="text-xs text-cyber-secondary">PROCESS MONITORING</span>
                </div>
                <div className="relative border-l-2 border-cyber-secondary/20 ml-3 md:ml-6 space-y-12">
                    {EXPERIENCES.map((exp, index) => (
                        <motion.div key={index} initial={!isGuiMode ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative pl-8 md:pl-12">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black border-2 border-cyber-accent rounded-full shadow-[0_0_10px_rgba(255,0,60,0.5)]"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-cyber-accent transition-colors">{exp.role} <span className="text-cyber-secondary">@ {exp.company}</span></h3>
                                <span className="text-xs font-mono text-gray-500 border border-cyber-secondary/30 px-2 py-1 rounded bg-black/50 mt-2 sm:mt-0 w-fit">{exp.period}</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 font-mono leading-relaxed max-w-3xl">{exp.description}</p>
                            <div className="flex flex-wrap gap-2">{exp.tech.map((t, i) => (<span key={i} className="text-[10px] text-cyber-accent border border-cyber-accent/20 px-2 py-0.5 rounded opacity-80">{t}</span>))}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mb-24">
              <div className="flex items-center justify-between mb-12 border-b border-cyber-secondary/30 pb-4 font-mono">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                  <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00401000</span>
                  <FiActivity className="text-cyber-accent" /> 
                  <span className="text-cyber-primary">./some_projects</span><span className="text-gray-600">.sh</span>
                </h2>
                <div className="flex flex-col items-end">
                    {!isGuiMode && <span className="text-xs text-cyber-secondary animate-pulse">SCANNING REPOSITORIES...</span>}
                    <span className="text-[10px] text-gray-500">Total Found: {PROJECTS.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PROJECTS.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} isGuiMode={isGuiMode} />
                ))}
              </div>
            </section>

            <section className="mb-24">
               <div className="flex items-center justify-between mb-8 border-b border-cyber-secondary/30 pb-2 font-mono">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                  <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00402000</span>
                  <FiDatabase className="text-cyber-accent" /> ./load_kernel_modules.sh
                </h2>
                <span className="text-xs text-cyber-secondary">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SKILL_CATEGORIES.map((cat, index) => (
                  <motion.div key={index} initial={!isGuiMode ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-black/40 border border-cyber-secondary/30 p-6 hover:border-cyber-accent transition-colors group">
                     <div className="flex items-center gap-3 mb-4 border-b border-cyber-secondary/20 pb-2"><span className="text-xl">{cat.icon}</span><h3 className="font-bold text-cyber-primary">{cat.title}</h3></div>
                     <div className="grid grid-cols-1 gap-2">{cat.items.map((item, i) => (<div key={i} className="flex justify-between items-center text-xs md:text-sm font-mono text-gray-400 group-hover:text-gray-200"><span>{`> ${item}`}</span><span className="text-cyber-secondary/50 group-hover:text-cyber-accent">[LOADED]</span></div>))}</div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mb-24">
               <div className="flex items-center justify-between mb-8 border-b border-cyber-secondary/30 pb-2 font-mono">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                  <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00403000</span>
                  <FiAward className="text-cyber-accent" /> ./my_credentials_dump.py
                </h2>
                <span className="text-xs border border-cyber-secondary/50 px-2 py-1 text-cyber-secondary rounded">UID: 0 (ROOT)</span>
              </div>
              <div className="space-y-4">
                {CERTIFICATES.map((cert, index) => (
                  <motion.div key={index} initial={!isGuiMode ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative border-l-2 border-cyber-secondary/30 bg-gray-900/40 p-5 overflow-hidden group hover:border-cyber-accent transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyber-accent/10 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 text-cyber-accent text-2xl drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]">{cert.icon}</div>
                        <div><h3 className="text-lg font-bold text-gray-100 group-hover:text-cyber-accent transition-colors">{cert.name}</h3><p className="text-sm text-cyber-secondary font-semibold">{cert.issuer}</p><div className="flex flex-wrap gap-2 mt-2">{cert.skills.map(skill => (<span key={skill} className="text-[10px] uppercase tracking-wider text-gray-400 bg-black/50 px-2 py-0.5 rounded border border-gray-800">{skill}</span>))}</div></div>
                      </div>
                      <div className="text-right md:text-right text-xs text-gray-500 font-mono w-full md:w-auto mt-2 md:mt-0 flex flex-col items-start md:items-end">
                         <span className="block text-cyber-secondary mb-1">VALID: <span className="text-gray-300">{cert.date}</span></span>
                         <span className="block opacity-50 group-hover:opacity-100 transition-opacity font-mono text-[10px]">{cert.id}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="mb-12">
               <div className="flex items-center justify-between mb-8 border-b border-cyber-secondary/30 pb-2 font-mono">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
                  <span className="text-gray-600 font-mono text-sm mr-2 hidden md:inline">0x00500000</span>
                  <FiLink className="text-cyber-accent" /> ./my_links.sh
                </h2>
                <span className="text-xs text-cyber-secondary">AVAILABLE NODES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SOCIAL_LINKS.map((link, index) => (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center p-6 bg-black/40 border border-cyber-secondary/30 hover:bg-cyber-secondary/5 hover:border-cyber-accent transition-all duration-300 relative overflow-hidden">
                     <div className={`text-4xl mb-3 text-gray-400 ${link.color} transition-colors`}>{link.icon}</div>
                     <h3 className="font-bold text-gray-200 group-hover:text-white mb-1">{link.name}</h3>
                     <span className="text-[10px] text-cyber-secondary font-mono tracking-widest opacity-70 group-hover:opacity-100">{link.label}</span>
                     <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-secondary/50 group-hover:border-cyber-accent"></div>
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-secondary/50 group-hover:border-cyber-accent"></div>
                  </a>
                ))}
              </div>
            </section>
        </div>
    );
};

const WriteupsPage = ({ posts, isGuiMode }) => {
    return (
        <div className="container mx-auto px-4 py-12 md:px-8 lg:px-16 flex-grow relative z-10 min-h-screen">
            <BinaryAssemblyBackground isGuiMode={isGuiMode} />
            
            <div className="mb-8">
                <Link to="/" className="inline-flex items-center gap-2 text-cyber-secondary hover:text-cyber-accent transition-colors font-mono mb-4">
                    <FiArrowLeft /> cd ..
                </Link>
                <div className="flex items-center gap-2 border-b border-cyber-secondary/30 pb-4">
                    <FiFileText className="text-3xl text-cyber-accent" />
                    <h1 className="text-3xl font-bold font-mono text-white">/var/www/writeups</h1>
                </div>
            </div>

            <div className="grid gap-4">
                <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-mono text-gray-500 px-4 pb-2 border-b border-gray-800">
                    <div className="col-span-2">PERMISSIONS</div>
                    <div className="col-span-2">DATE</div>
                    <div className="col-span-6">TITLE</div>
                    <div className="col-span-2">TAGS</div>
                </div>

                {posts.length > 0 ? posts.map((post) => (
                    <Link to={`/writeups/${post.id}`} key={post.id} className="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 bg-black/40 border border-gray-800 hover:border-cyber-accent hover:bg-cyber-secondary/5 transition-all font-mono items-center">
                        <div className="col-span-2 text-xs text-gray-500 group-hover:text-cyber-secondary">-rwxr-xr-x</div>
                        <div className="col-span-2 text-xs text-gray-400">{post.date}</div>
                        <div className="col-span-6 font-bold text-white group-hover:text-cyber-primary">{post.title}</div>
                        <div className="col-span-2 flex gap-2 overflow-hidden">
                            {post.tags && post.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] bg-gray-800 px-1 rounded text-gray-300 whitespace-nowrap">{tag}</span>
                            ))}
                        </div>
                    </Link>
                )) : (
                    <div className="text-gray-500 font-mono p-4">./writeups: directory is empty</div>
                )}
            </div>
        </div>
    );
};

const ArticleReader = ({ posts }) => {
    const { id } = useParams();
    const post = posts.find(p => p.id === id);

    if (!post) return <div className="text-center mt-20 text-red-500 font-mono">404: FILE NOT FOUND</div>;

    return (
        <div className="container mx-auto px-4 py-12 md:px-8 max-w-4xl flex-grow relative z-10 min-h-screen">
            <Link to="/writeups" className="inline-flex items-center gap-2 text-cyber-secondary hover:text-cyber-accent transition-colors font-mono mb-8">
                <FiArrowLeft /> :q! (quit)
            </Link>

            <article className="bg-black/90 border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyber-accent"></div>
                
                <header className="mb-10 border-b border-gray-800 pb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags && post.tags.map(tag => (
                            <span key={tag} className="text-xs font-mono text-black bg-cyber-secondary px-2 py-1 rounded font-bold">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold font-mono text-white mb-4 leading-tight">{post.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                        <FiCalendar /> {post.date} <span className="mx-2">|</span> <FiUser /> Matheus Henrique
                    </div>
                </header>

                <div className="font-sans text-gray-300 leading-relaxed text-lg">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold font-mono text-cyber-primary mt-12 mb-6 border-l-4 border-cyber-accent pl-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold font-mono text-white mt-10 mb-4" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold font-mono text-cyber-secondary mt-8 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-6 leading-8" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 space-y-2 marker:text-cyber-accent pl-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 space-y-2 marker:text-cyber-accent pl-4" {...props} />,
                            li: ({node, ...props}) => <li className="ml-2" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-8 bg-gray-900/50 p-4 rounded-r" {...props} />,
                            a: ({node, ...props}) => <a className="text-cyber-accent hover:underline decoration-wavy underline-offset-4 transition-colors" {...props} />,
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <div className="my-8 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
                                        <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700 flex justify-between items-center">
                                            <span className="uppercase font-bold tracking-wider">{match[1]}</span>
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        </div>
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, padding: '1.5rem', background: '#0a0a0a', fontSize: '0.9rem' }}
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-gray-800 text-cyber-secondary px-1.5 py-0.5 rounded font-mono text-sm border border-gray-700 mx-1" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-800 text-xs font-mono text-gray-600 text-center">
                    <p>EOF: {post.id}.md</p>
                    <p className="mt-2 text-[10px]">HASH: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
            </article>
        </div>
    );
};

function App() {
  const [booting, setBooting] = useState(true);
  const [bootLogs, setBootLogs] = useState([]);
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 4.2, net: 450 });
  const [isGuiMode, setIsGuiMode] = useState(false);
  const posts = useMarkdownPosts();

  useEffect(() => {
    const logs = [
      "Initialising KERNEL_CORE_V4...",
      "Loading modules: neural_net.ko, cyber_sec.ko...",
      "Mounting /dev/sda1 on /root...",
      "Starting networking daemon... OK",
      "ACCESS GRANTED. Welcome, Operator."
    ];
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        setBootLogs(prev => [...prev, logs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 800); 
      }
    }, 150); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        setMetrics({
            cpu: Math.floor(Math.random() * 25) + 5, 
            ram: (Math.random() * 1.5 + 3.5).toFixed(1),
            net: Math.floor(Math.random() * 300) + 100
        });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen bg-black p-8 flex flex-col justify-end font-mono overflow-hidden">
        {bootLogs.map((log, index) => (
          <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-500 text-xs md:text-sm">
            <span className="text-gray-500">[{new Date().toISOString().slice(11,19)}]</span> <span className="text-cyber-primary">{log}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  const appClassName = "min-h-screen relative flex flex-col bg-cyber-dark text-cyber-primary selection:bg-cyber-accent selection:text-white transition-colors duration-500";

  return (
    <Router>
        <div className={appClassName}>
          
          {!isGuiMode && (
            <>
              <div className="crt-overlay"></div>
              <div className="cyber-noise"></div>
            </>
          )}

          <header className="sticky top-0 bg-black/90 backdrop-blur border-b border-cyber-secondary/30 p-2 text-[10px] md:text-xs flex justify-between items-center z-50 font-mono shadow-[0_0_10px_rgba(0,255,65,0.1)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-cyber-secondary">
                <FiTerminal className={`inline text-lg ${!isGuiMode && 'animate-pulse'}`} />
                <span className="opacity-80">root@matheush:~/projects $</span>
              </div>
              <nav className="hidden md:flex gap-4 ml-4 font-bold">
                  <Link to="/" className="hover:text-cyber-accent transition-colors">[HOME]</Link>
                  <Link to="/writeups" className="hover:text-cyber-accent transition-colors">[WRITE-UPS]</Link>
              </nav>
            </div>

            <div className="flex gap-6 font-bold items-center text-cyber-secondary">
              <div className="hidden md:flex gap-6">
                  <span className="flex items-center gap-2"><FiCpu /> CPU: {metrics.cpu}%</span>
                  <span className="flex items-center gap-2"><FiHardDrive /> RAM: {metrics.ram}GB</span>
                  <span className={`flex items-center gap-2 ${!isGuiMode && 'text-cyber-accent animate-pulse'}`}><FiActivity /> ONLINE</span>
              </div>
              <button 
                onClick={() => setIsGuiMode(!isGuiMode)} 
                className="border px-2 py-1 rounded hover:bg-cyber-secondary hover:text-black transition-all text-[10px] border-cyber-secondary text-cyber-secondary"
              >
                {isGuiMode ? "[ HACKER_MODE ]" : "[ STATIC_MODE ]"}
              </button>
            </div>
          </header>

          <Routes>
              <Route path="/" element={<HomePage isGuiMode={isGuiMode} />} />
              <Route path="/writeups" element={<WriteupsPage posts={posts} isGuiMode={isGuiMode} />} />
              <Route path="/writeups/:id" element={<ArticleReader posts={posts} />} />
          </Routes>

          <InteractiveTerminal />

          <footer className="border-t border-cyber-secondary/30 bg-black/80 backdrop-blur-sm mt-auto relative z-20">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-cyber-secondary text-xs font-mono text-center md:text-left">
                        <p className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${isGuiMode ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span> SYSTEM STATUS: STABLE</p>
                        <p className="opacity-50 mt-1">Encrypted Connection (TLS 1.3) | {new Date().getFullYear()}</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/Makonmm?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <FiGithub className="text-xl group-hover:text-cyber-accent transition-colors" />
                        </a>
                        <a href="https://www.linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <FiLinkedin className="text-xl group-hover:text-cyber-accent transition-colors" />
                        </a>
                    </div>
                </div>
            </div>
          </footer>
        </div>
    </Router>
  );
}

export default App;