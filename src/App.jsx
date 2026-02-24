import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
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
  FiCode, FiUser, FiLink, FiFileText, FiArrowLeft, FiCalendar, FiX, FiCloud, FiChevronRight
} from 'react-icons/fi';
import { SiHackerrank, SiTryhackme } from 'react-icons/si';

if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

const PROJECTS = [
  { id: "SOC_SIM", title: "SOC Simulator", description: "Plataforma de automação de SOC que integra Engenharia de Dados e Security. Processa arquivos .pcap via containers, indexa no Elasticsearch e utiliza um Agente de IA (Llama 3.3) para triagem automática e geração de relatórios.", tags: ["Elastic Stack", "Docker", "Llama 3.3", "Zeek"], type: "Blue Team + AI" },
  { id: "SEC_POT", title: "AI SecPot", description: "Infraestrutura de honeypot na AWS. Captura TTPs adversários e usa um Agente LLM para correlacionar eventos e comportamentos suspeitos, alimentando um painel de simulação de SOC.", tags: ["AWS", "LLM Agent", "Python", "Threat Intel"], type: "Cloud + AI" },
  { id: "LOG_AI", title: "Logger AI", description: "Ferramenta de pesquisa em Offsec que simula Keyloggers/RATs. Captura contexto de janelas, exfiltra via Discord Webhook e usa IA para estruturar logs.", tags: ["Python", "WinAPI", "LLM Analysis"], type: "Offsec + AI" },
  { id: "C2_RAT", title: "Remote Control (C2)", description: "Desenvolvimento de infraestrutura de Comando e Controle (C2). Permite administração remota via shell, transferência de arquivos, e keylogging. Focado em simulações Red Team.", tags: ["Socket TCP/IP", "C2 Arch", "Red Team"], type: "Malw. Dev" },
  { id: "NET_CLF", title: "Malicious Traffic Classifier", description: "Modelo de Deep Learning com PyTorch para classificar tráfego de rede como malicioso ou benigno. Foco em detecção de anomalias em pacotes.", tags: ["PyTorch", "Deep Learning", "Network Sec"], type: "Cyber Ops" },
  { id: "DS_BOT", title: "Discord LLM DeepSearch", description: "Chatbot avançado com memória de contexto e capacidade de 'Deep Search' na web via comandos. Integra LLMs para processar consultas complexas e manter histórico.", tags: ["Discord API", "LLM", "Web Scraping"], type: "Automation" },
  { id: "FRAUD_AI", title: "Credit Card Fraud Detector", description: "Modelo preditivo capaz de identificar fraudes em transações financeiras. Atingiu 99% de acurácia em dados não vistos (blind test).", tags: ["Scikit-Learn", "Numpy", "Fraud Ops"], type: "Finance Sec" },
  { id: "CPP_SIGN", title: "Digital Sign Classificator", description: "Classificador desenvolvido do zero em C++ para validação de certificados e assinaturas digitais. Foco em alta performance e eficiência de memória.", tags: ["C++", "Cryptography"], type: "Low Level" },
  { id: "FACE_CNN", title: "Facial Landmark Detection", description: "Rede Neural Convolucional (CNN) via Keras para biometria. Detecta pontos-chave (olhos, nariz, mandíbula) para autenticação e análise facial.", tags: ["Keras", "TensorFlow", "Computer Vision"], type: "Biometrics" }
];

const SKILL_CATEGORIES = [
  { title: "Offensive Security", icon: <FiLock className="text-zinc-400" />, items: ["Pentesting", "Nmap / Wireshark", "OWASP", "Cryptography", "Metasploit", "Burp Suite", "Social Engineering", "Maldev"] },
  { title: "Defensive Security", icon: <FiShield className="text-zinc-400" />, items: ["Threat Intelligence", "SIEM Architecture", "IAM / AWS Security", "Firewall Rules", "Vulnerability Mgmt", "Incident Response", "Network Infra"] },
  { title: "Artificial Intelligence", icon: <FiCpu className="text-zinc-400" />, items: ["LLM Agents", "PyTorch & TensorFlow", "Computer Vision (CNNs)", "Machine/Deep Learning"] },
  { title: "Dev & Cloud Ops", icon: <FiCode className="text-zinc-400" />, items: ["Python (Advanced)", "C++", "AWS Cloud", "Docker / Containers", "Linux / Bash Scripting", "SQL / PostgreSQL"] }
];

const CERTIFICATES = [
  { name: "Professional Cloud Security (CPCS)", issuer: "IBSEC", date: "Jan 2026", id: "cpcs-2026", skills: ["Cloud Arch", "IAM", "STRIDE"], icon: <FiCloud />, image: "/images/cloud_ibsec.PNG" },
  { name: "Red Team Operations (CRTOM)", issuer: "RED TEAM LEADERS", date: "Dez 2025", id: "crtom-x92", skills: ["Adversary Emulation", "C2 Governance"], icon: <FiLock />, image: "/images/crtom.PNG" },
  { name: "Certified Ethical Hacker (CEH)", issuer: "IBSEC", date: "Mar 2025", id: "ceh-2025", skills: ["Pentest", "Exploitation"], icon: <FiShield />, image: "/images/ceh.PNG" },
  { name: "Analista SOC (IC-SOC-380)", issuer: "IBSEC", date: "Abr 2025", id: "soc-380", skills: ["SIEM", "Incident Response"], icon: <FiEye />, image: "/images/soc.PNG" },
  { name: "AWS Cloud Practitioner", issuer: "AWS", date: "Ago 2025", id: "aws-cloud", skills: ["Cloud Security", "IAM"], icon: <FiAward />, image: "/images/awsEssentials.PNG" },
  { name: "IBM AI Engineering", issuer: "IBM", date: "Dez 2024", id: "ibm-ai", skills: ["Deep Learning", "TensorFlow"], icon: <FiCpu />, image: "/images/ibm.PNG" }
];

const EXPERIENCES = [
  { role: "Cyber Threat Hunter", company: "IPV7 [HuntersPay]", period: "Abr 2025 - Presente", description: "Detecção e investigação proativa de vulnerabilidades e ameaças utilizando Threat Hunting e Bug Bounty em redes e aplicações. Atingindo o TOP 1 no Ranking de reports de vulnerabilidades na plataforma.", tech: ["Threat Hunting", "Forensics", "Python", "Bug Bounty"] },
  { role: "Desenvolvedor (IA)", company: "ARC TECH BRASIL", period: "Mar 2024 - Abr 2025", description: "Desenvolvimento de projetos com foco em Machine Learning e Agentes de IA. Criação de Chatbot corporativo RAG.", tech: ["Deep Learning", "AI Agents", "Python"] },
  { role: "Suporte de Infraestrutura", company: "ARC TECH BRASIL", period: "Mar 2023 - Fev 2024", description: "Implantação e gerenciamento de infraestrutura de redes. Configuração de Firewalls, VPNs e monitoramento de tráfego.", tech: ["Network Infra", "Firewall", "VPN", "Security"] },
  { role: "Suporte Técnico N1", company: "Ibi - Internet Brasileira Incrível", period: "Out 2022 - Mar 2023", description: "Suporte especializado em infraestrutura ISP. Configuração de roteadores e troubleshooting de conectividade.", tech: ["ISP Ops", "Troubleshooting", "Networking"] }
];

const SOCIAL_LINKS = [
    { name: "GitHub", url: "https://github.com/Makonmm", icon: <FiGithub />, label: "Repos", color: "hover:text-white" },
    { name: "LinkedIn", url: "https://linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/", icon: <FiLinkedin />, label: "Professional", color: "hover:text-blue-400" },
    { name: "TryHackMe", url: "https://tryhackme.com/p/zurawie", icon: <SiTryhackme />, label: "Cyber Training", color: "hover:text-red-500" },
    { name: "HackerRank", url: "https://www.hackerrank.com/profile/matheushenriqu45", icon: <SiHackerrank />, label: "Algorithms", color: "hover:text-green-500" }
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
          setPosts(loadedPosts.sort((a, b) => new Date(b.date?.split('/').reverse().join('-') || 0) - new Date(a.date?.split('/').reverse().join('-') || 0)));
      };
      loadPosts();
  }, []);
  return posts;
};

const FiFolder = () => <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;

const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="flex flex-col mb-8 font-mono">
        <h2 className="text-xl md:text-2xl font-medium flex items-center gap-3 text-zinc-100">
            <span className="text-zinc-500">{icon}</span>
            <span>{title}</span>
        </h2>
        {subtitle && <span className="text-sm text-zinc-500 mt-1 pl-8">{subtitle}</span>}
    </div>
);

const ProjectCard = ({ project, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-zinc-900/30 border border-white/5 rounded-xl p-6 hover:bg-zinc-800/40 hover:border-white/10 transition-all duration-300 flex flex-col h-full"
    >
      <div className="mb-4 flex justify-between items-start font-mono">
          <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-800 text-zinc-300">{project.type}</span>
       </div>
      <h3 className="text-lg font-medium mb-3 text-zinc-100 group-hover:text-emerald-400 transition-colors tracking-tight">{project.title}</h3>
      <p className="text-zinc-400 text-sm mb-6 flex-grow leading-relaxed">{project.description}</p>
      <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-500 mt-auto">
        {project.tags.map(tag => (
          <span key={tag} className="before:content-['#'] group-hover:text-zinc-400 transition-colors">{tag}</span>
        ))}
      </div>
    </motion.div>
);

const CertModal = ({ cert, onClose }) => {
  if (!cert) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()} 
          className="relative max-w-4xl w-full bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center bg-zinc-950 p-4 border-b border-white/5 font-mono text-sm">
            <span className="text-zinc-400 flex items-center gap-2"><FiEye /> {cert.id}</span>
            <button onClick={onClose} className="text-zinc-500 hover:text-red-400 transition-colors"><FiX size={20}/></button>
          </div>
          <div className="p-4 bg-black/50 flex justify-center">
             <img src={cert.image} alt={cert.name} className="w-full h-auto max-h-[70vh] object-contain rounded" />
          </div>
          <div className="p-4 bg-zinc-950 border-t border-white/5 flex justify-between items-center font-mono text-sm">
             <h3 className="text-zinc-100 font-medium">{cert.name}</h3>
             <span className="text-zinc-500">{cert.date}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    if (location.pathname === '/') {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
        navigate(`/#${id}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black/60 backdrop-blur-md border-b border-white/5 p-4 text-sm flex justify-between items-center z-50 font-mono">
        <div className="flex items-center gap-6 max-w-6xl mx-auto w-full">
          <Link to="/" className="text-zinc-100 font-medium flex items-center gap-2 hover:text-white transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            [matheush.sys]
          </Link>
          
          <nav className="hidden md:flex gap-5 text-zinc-400 ml-auto text-xs lg:text-sm">
              <button onClick={() => handleScroll('about')} className="hover:text-zinc-100 transition-colors">~/about</button>
              <button onClick={() => handleScroll('projects')} className="hover:text-zinc-100 transition-colors">~/projects</button>
              <button onClick={() => handleScroll('experience')} className="hover:text-zinc-100 transition-colors">~/experience</button>
              <button onClick={() => handleScroll('certs')} className="hover:text-zinc-100 transition-colors">~/certs</button>
              <button onClick={() => handleScroll('links')} className="hover:text-zinc-100 transition-colors">~/links</button>
              <Link to="/writeups" className="hover:text-zinc-100 transition-colors">~/writeups</Link>
          </nav>
        </div>
    </header>
  );
};

const InteractiveTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(['Digite "help" para ver os comandos disponíveis.']);
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
      if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      let response = '';

      switch (cmd) {
        case 'help': response = 'Available commands: ls, whoami, contact, clear, exit, date'; break;
        case 'ls': response = 'drwx------ home/\ndrwxr-xr-x writeups/\ndrwxr-xr-x projects/\n-r--r--r-- about_me.txt'; break;
        case 'whoami': response = 'Visitor (UID: 1001) | Gid: 1001 | Groups: 1001(guest)'; break;
        case 'contact': response = 'LinkedIn: https://linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/\nGitHub: https://github.com/Makonmm\nTryHackMe: https://tryhackme.com/p/zurawie'; break;
        case 'sudo': response = 'user is not in the sudoers file. This incident will be reported.'; break;
        case 'date': response = new Date().toString(); break;
        case 'clear': setHistory([]); setInput(''); return;
        case 'exit': setIsOpen(false); setInput(''); return;
        default: response = cmd ? `bash: ${cmd}: command not found` : '';
      }

      if(cmd) setHistory([...history, `guest@matheush:~$ ${cmd}`, response]);
      else setHistory([...history, `guest@matheush:~$`]);
      setInput('');
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-zinc-900/80 text-zinc-400 px-4 py-3 font-mono text-sm border border-white/10 hover:bg-zinc-800 hover:text-zinc-100 transition-all z-50 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur-md">
      <FiTerminal /> Terminal
    </button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="fixed bottom-6 right-6 w-full max-w-[450px] h-80 bg-zinc-950/95 border border-white/10 p-0 font-mono text-sm text-zinc-300 shadow-2xl z-50 flex flex-col rounded-xl overflow-hidden backdrop-blur-xl">
      <div className="flex justify-between items-center bg-zinc-900/50 p-3 border-b border-white/5">
        <span className="text-zinc-500 font-medium flex items-center gap-2"><FiTerminal /> bash</span>
        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-red-400 transition-colors"><FiX /></button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.startsWith('guest@') ? <span className="text-emerald-400/80">{line}</span> : <span className="text-zinc-400">{line}</span>}
          </div>
        ))}
        <div className="flex items-center">
          <span className="mr-2 text-emerald-400/80 whitespace-nowrap">guest@matheush:~$</span>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-grow text-zinc-100 focus:ring-0 w-full" autoFocus spellCheck="false" />
        </div>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
};

const HomePage = () => {
    const location = useLocation();
    const [selectedCert, setSelectedCert] = useState(null);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [location]);

    return (
        <div className="max-w-4xl mx-auto px-6 py-24 flex-grow relative z-10 w-full">
            
            {/* HERO SECTION */}
            <section className="mb-32 pt-12">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="font-mono text-zinc-500 text-sm mb-4 flex items-center gap-2">
                    <FiTerminal /> <span>matheus@sys:~$ ./whoami</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-zinc-100 mb-6">
                  Matheus Henrique
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl font-mono mb-8">
                  [<span className="text-emerald-400/90">Ciência Da Computação</span> | <span className="text-emerald-400/90">Cybersecurity</span> & <span className="text-emerald-400/90">IA</span>]<br/>
                  Bem-vindo (a) ao meu portfólio, aqui você encontra informações técnicas e profissionais sobre mim :)
                </p>
                <div className="flex gap-4 font-mono text-sm">
                    <a href="https://linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/" target="_blank" rel="noreferrer" 
                       className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg transition-all flex items-center gap-2">
                        <FiLinkedin /> Conectar
                    </a>
                    <a href="https://github.com/Makonmm" target="_blank" rel="noreferrer"
                       className="border border-white/10 hover:border-white/20 text-zinc-300 px-5 py-2.5 rounded-lg transition-all flex items-center gap-2">
                        <FiGithub /> GitHub
                    </a>
                </div>
              </motion.div>
            </section>

            {/* ABOUT */}
            <section id="about" className="mb-24 scroll-mt-32">
                <SectionTitle icon={<FiUser />} title="~/about_me.txt" />
                <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} 
                    className="bg-zinc-900/30 border border-white/5 rounded-xl p-8 text-zinc-300 leading-relaxed space-y-4"
                >
                    <p>
                        Graduando em Ciência da Computação com foco em Segurança da Informação, Inteligência Artificial aplicada e Engenharia de Sistemas. Minha trajetória combina Cibersegurança, Infraestrutura de Redes e desenvolvimento de soluções baseadas em Machine Learning e Agentes de IA voltados para análise de ameaças.
                    </p>
                    <p>
                        Possuo conhecimento prático em segurança ofensiva e defensiva, análise de vulnerabilidades, monitoramento de eventos e desenvolvimento de modelos de IA/Agentes.
                    </p>
                    <p>
                        Participo ativamente de atividades práticas como CTFs, Bug Bounty e Threat Hunting, mantendo aprendizado contínuo na arquitetura de software seguro e proteção de dados.
                    </p>
                </motion.div>
            </section>

            {/* PROJECTS */}
            <section id="projects" className="mb-24 scroll-mt-32">
              <SectionTitle icon={<FiFolder />} title="~/projects" subtitle={`${PROJECTS.length} repositories found`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PROJECTS.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </section>

            {/* EXPERIENCE */}
            <section id="experience" className="mb-24 scroll-mt-32">
              <SectionTitle icon={<FiActivity />} title="~/experience.log" />
              <div className="relative border-l border-white/10 ml-4 space-y-10 py-2">
                {EXPERIENCES.map((exp, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative pl-8">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-black"></div>
                    <div className="flex flex-col mb-1">
                      <h3 className="text-lg font-medium text-zinc-100">{exp.role}</h3>
                      <span className="text-sm font-mono text-emerald-400/80 mb-2">{exp.company} <span className="text-zinc-600 ml-2">{exp.period}</span></span>
                    </div>
                    <p className="text-zinc-400 text-sm mb-3 leading-relaxed">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {exp.tech.map((t, i) => (<span key={i} className="text-[10px] font-mono bg-white/5 text-zinc-400 px-2 py-1 rounded">{t}</span>))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SKILLS */}
            <section className="mb-24">
              <SectionTitle icon={<FiCode />} title="~/skills" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SKILL_CATEGORIES.map((cat, index) => (
                  <div key={index} className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                     <div className="flex items-center gap-3 mb-4 text-zinc-100 font-medium">
                        {cat.icon} {cat.title}
                     </div>
                     <ul className="space-y-2">
                        {cat.items.map((item, i) => (
                            <li key={i} className="text-sm text-zinc-400 font-mono flex items-center gap-2">
                                <span className="text-zinc-600">-</span> {item}
                            </li>
                        ))}
                     </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* CERTIFICATES */}
            <section id="certs" className="mb-24 scroll-mt-32">
              <SectionTitle icon={<FiAward />} title="~/certificates" subtitle="View credentials" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CERTIFICATES.map((cert, index) => (
                  <motion.div 
                    key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedCert(cert)}
                    className="group flex flex-col p-5 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-800/40 hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                       <div className="text-emerald-400/80 text-2xl">{cert.icon}</div>
                       <div className="text-xs font-mono text-zinc-500">{cert.date}</div>
                    </div>
                    <h3 className="text-zinc-100 font-medium mb-1 group-hover:text-white transition-colors flex items-center gap-2">
                        {cert.name} <FiEye className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                    </h3>
                    <span className="text-sm text-zinc-400 mb-4">{cert.issuer}</span>
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {cert.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="text-[10px] font-mono bg-white/5 text-zinc-500 px-2 py-1 rounded">{skill}</span>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
            </section>

            {/* LINKS */}
            <section id="links" className="mb-12 scroll-mt-32">
              <SectionTitle icon={<FiLink />} title="~/links"  />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SOCIAL_LINKS.map((link, index) => (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" 
                     className={`group flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-800/50 hover:border-white/10 transition-all duration-300`}>
                      <div className={`text-3xl mb-3 text-zinc-500 ${link.color} transition-colors`}>{link.icon}</div>
                      <h3 className="font-medium text-zinc-300 group-hover:text-zinc-100 mb-1">{link.name}</h3>
                      <span className="text-xs text-zinc-600 font-mono tracking-wide">{link.label}</span>
                  </a>
                ))}
              </div>
            </section>

        </div>
    );
};

const WriteupsPage = ({ posts }) => (
    <div className="max-w-4xl mx-auto px-6 py-24 flex-grow relative w-full min-h-screen">
        <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors font-mono mb-6 text-sm">
                <FiArrowLeft /> cd ..
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
                <FiFileText className="text-zinc-500" /> ~/writeups
            </h1>
        </div>

        <div className="flex flex-col gap-3">
            {posts.length > 0 ? posts.map((post) => (
                <Link to={`/writeups/${post.id}`} key={post.id} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-800/40 hover:border-white/10 transition-all">
                    <div className="flex flex-col">
                        <span className="text-zinc-100 font-medium mb-1 group-hover:text-emerald-400 transition-colors">{post.title}</span>
                        <div className="flex items-center gap-3 font-mono text-xs text-zinc-500">
                            <span>{post.date}</span>
                            <div className="flex gap-2">
                                {post.tags && post.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <FiChevronRight className="text-zinc-600 group-hover:text-zinc-300 mt-4 sm:mt-0" />
                </Link>
            )) : (
                <div className="text-zinc-500 font-mono p-4 bg-zinc-900/20 rounded-xl border border-white/5">Directory is empty.</div>
            )}
        </div>
    </div>
);
const ArticleReader = ({ posts }) => {
    const { id } = useParams();
    const post = posts.find(p => p.id === id);

    if (!post) return <div className="text-center mt-32 text-red-400 font-mono">404: FILE NOT FOUND</div>;

    return (
        <div className="max-w-3xl mx-auto px-6 py-24 flex-grow relative w-full min-h-screen">
            <Link to="/writeups" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors font-mono mb-10 text-sm">
                <FiArrowLeft /> ls ./writeups
            </Link>

            <article className="prose prose-invert prose-zinc max-w-none">
                <header className="mb-12 border-b border-white/10 pb-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags && post.tags.map(tag => (
                            <span key={tag} className="text-xs font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-100 mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 font-mono text-sm text-zinc-500">
                        <span className="flex items-center gap-2"><FiCalendar /> {post.date}</span>
                    </div>
                </header>

                <div className="text-zinc-300 leading-relaxed text-base md:text-lg">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-semibold text-zinc-100 mt-10 mb-4" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-medium text-zinc-100 mt-8 mb-4" {...props} />,
                            a: ({node, ...props}) => <a className="text-emerald-400 hover:underline underline-offset-4" {...props} />,
                            code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <div className="my-6 rounded-lg overflow-hidden border border-white/10 text-sm">
                                        <div className="bg-zinc-900 px-4 py-2 text-xs font-mono text-zinc-500 border-b border-white/5">{match[1]}</div>
                                        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem', background: '#09090b' }} {...props}>
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-white/5 text-zinc-300 px-1.5 py-0.5 rounded font-mono text-sm border border-white/10" {...props}>{children}</code>
                                )
                            }
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
};

function App() {
  const posts = useMarkdownPosts();

  return (
    <Router>
        <div className="min-h-screen relative flex flex-col bg-[#050505] text-zinc-300 selection:bg-emerald-500/30 selection:text-white overflow-x-hidden font-sans">
          
          <Header />

          <main className="flex-grow w-full flex justify-center">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/writeups" element={<WriteupsPage posts={posts} />} />
                <Route path="/writeups/:id" element={<ArticleReader posts={posts} />} />
            </Routes>
          </main>

          <InteractiveTerminal />

          <footer className="border-t border-white/5 bg-black/40 mt-auto relative z-20">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-zinc-500 text-xs font-mono">
                    <p>© {new Date().getFullYear()} Matheus Henrique. All rights reserved.</p>
                </div>
                <div className="flex gap-6">
                    <a href="https://github.com/Makonmm" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <FiGithub size={18} />
                    </a>
                    <a href="https://linkedin.com/in/matheus-henrique-ramos-siqueira-890052200/" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <FiLinkedin size={18} />
                    </a>
                </div>
            </div>
          </footer>
        </div>
    </Router>
  );
}

export default App;