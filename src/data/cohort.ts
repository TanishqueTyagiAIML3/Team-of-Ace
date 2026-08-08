import { CohortData } from '../types';

export const COHORT_DATA: CohortData = {
  cohort: "AI Cohort · 31 days · 8 modules",
  modules: [
    { n: 1, title: "Environment & Tooling", days: [1, 3] },
    { n: 2, title: "Data Foundations", days: [4, 6] },
    { n: 3, title: "Embeddings & Vector Search", days: [7, 10] },
    { n: 4, title: "LLM Core, Prompting & Fine-Tuning", days: [11, 15] },
    { n: 5, title: "Chatbot Application Build", days: [16, 20] },
    { n: 6, title: "Agentic AI & MCP", days: [21, 24] },
    { n: 7, title: "Evaluation, Security & Deployment", days: [25, 28] },
    { n: 8, title: "Production & Capstone", days: [29, 31] }
  ],
  days: [
    {
      day: 1,
      title: "VS Code & Python Environment Setup",
      type: "SETUP",
      tools: ["VS Code", "Python", "Python Extension", "Pylance", "Virtual Environment"],
      objectives: ["Install VS Code and Python", "Configure workspace", "Create .venv", "Run debug script"]
    },
    {
      day: 2,
      title: "Local LLM & AI Coding Assistant Setup",
      type: "SETUP",
      tools: ["Ollama", "Qwen2.5-Coder", "GitHub Copilot", "Cline"],
      objectives: ["Install Ollama", "Test local coding model", "Connect Copilot/Cline"]
    },
    {
      day: 3,
      title: "First AI Project, React Frontend & GitHub",
      type: "BUILD",
      tools: ["Python", "Ollama", "FastAPI", "React", "Vite", "Git", "GitHub"],
      objectives: ["CLI chatbot", "FastAPI backend", "React frontend", "Connect & publish"]
    },
    {
      day: 4,
      title: "Reading & Processing Structured Data",
      type: "BUILD",
      tools: ["Pandas", "SQLite", "SQL", "SQLAlchemy"],
      objectives: ["Healthcare datasets", "Pandas cleaning", "SQLite storage", "SQL queries"]
    },
    {
      day: 5,
      title: "Reading & Processing Unstructured Data",
      type: "BUILD",
      tools: ["pdfplumber", "PyPDF", "python-docx", "Tesseract OCR", "BeautifulSoup"],
      objectives: ["Extract PDF/Word text", "OCR forms", "Scrape webpage", "Clean & store"]
    },
    {
      day: 6,
      title: "Building the Knowledge Base",
      type: "BUILD",
      tools: ["LangChain Text Splitters", "JSONL", "Python"],
      objectives: ["Unified knowledge base", "Document chunking", "Attach metadata", "Export JSONL"]
    },
    {
      day: 7,
      title: "Embeddings Explained",
      type: "AI_CORE",
      tools: ["Sentence Transformers", "OpenAI Embeddings", "Scikit-learn", "Matplotlib"],
      objectives: ["Vector embeddings concept", "Generate embeddings", "PCA visualization", "Cluster analysis"]
    },
    {
      day: 8,
      title: "Vector Databases Overview",
      type: "BUILD",
      tools: ["ChromaDB", "Pinecone"],
      objectives: ["RAG vector DB role", "Local Chroma setup", "Pinecone cloud comparison", "Select DB"]
    },
    {
      day: 9,
      title: "Building & Populating the Vector Database",
      type: "BUILD",
      tools: ["ChromaDB", "Sentence Transformers"],
      objectives: ["Load embeddings", "Store metadata", "Test semantic search", "Evaluate retrieval"]
    },
    {
      day: 10,
      title: "The Retrieval & Matching Engine",
      type: "SHIP_IT",
      tools: ["SQLite", "ChromaDB", "Python"],
      objectives: ["Query router (SQL vs Vector)", "Hybrid retrieval", "Result deduplication", "Evaluate accuracy"]
    },
    {
      day: 11,
      title: "RAG End-to-End & LLM API Basics",
      type: "BUILD",
      tools: ["OpenAI SDK", "Ollama", "Groq", "Python"],
      objectives: ["Connect retrieval to LLM", "Grounded prompt", "Generate answers", "Evaluate vs baseline"]
    },
    {
      day: 12,
      title: "Prompt Engineering Fundamentals",
      type: "LEARN",
      tools: ["LLMs", "Prompt Templates"],
      objectives: ["Zero-shot, few-shot, CoT", "System prompts", "Compare accuracy & compliance", "Finalize prompt"]
    },
    {
      day: 13,
      title: "Advanced Prompting: Function Calling & Structured Outputs",
      type: "BUILD",
      tools: ["OpenAI Function Calling", "Pydantic", "Python"],
      objectives: ["Tool schemas", "Function calling execution", "Pydantic validation", "Log tool calls"]
    },
    {
      day: 14,
      title: "Fine-Tuning: Concepts & When to Use It",
      type: "LEARN",
      tools: ["JSONL", "OpenAI", "LoRA", "QLoRA"],
      objectives: ["RAG vs Fine-tuning", "Dataset creation", "Train/test splits"]
    },
    {
      day: 15,
      title: "Fine-Tuning: Hands-On with LoRA & QLoRA",
      type: "SHIP_IT",
      tools: ["PEFT", "Transformers", "BitsAndBytes", "LoRA"],
      objectives: ["Fine-tune LLM", "Compare base vs fine-tuned", "Measure tone & quality"]
    },
    {
      day: 16,
      title: "Chatbot Backend & API Integration",
      type: "BUILD",
      tools: ["FastAPI", "SQLite", "Python"],
      objectives: ["/chat endpoint", "Session management", "Conversation history API"]
    },
    {
      day: 17,
      title: "Chatbot Frontend Development",
      type: "BUILD",
      tools: ["Streamlit", "Requests", "UUID"],
      objectives: ["Interactive chat UI", "Backend API connection", "Plan selector"]
    },
    {
      day: 18,
      title: "Full-Stack Integration & Streaming Responses",
      type: "BUILD",
      tools: ["FastAPI", "StreamingResponse", "SSE", "Streamlit"],
      objectives: ["SSE streaming tokens", "Loading indicators", "Graceful error handling"]
    },
    {
      day: 19,
      title: "Response Formatting & Rich Outputs",
      type: "BUILD",
      tools: ["Pydantic", "Markdown", "Streamlit"],
      objectives: ["Add citations", "Structured cards for coverage", "Render Markdown tables"]
    },
    {
      day: 20,
      title: "Conversation Memory & Context Management",
      type: "SHIP_IT",
      tools: ["SQLite", "FastAPI", "LLM", "Token Management"],
      objectives: ["Persist session history", "Context summarization", "Manage token budget"]
    },
    {
      day: 21,
      title: "Agentic Frameworks: LangChain Agents & Tool Use",
      type: "BUILD",
      tools: ["LangChain", "LangChain Agents", "ReAct"],
      objectives: ["ReAct reasoning agent", "Wrap tools", "Analyze reasoning traces"]
    },
    {
      day: 22,
      title: "Multi-Agent Orchestration",
      type: "BUILD",
      tools: ["CrewAI", "LangGraph", "Python"],
      objectives: ["Specialist agents", "Router agent delegation", "Multi-agent workflow"]
    },
    {
      day: 23,
      title: "Model Context Protocol (MCP)",
      type: "BUILD",
      tools: ["MCP Python SDK", "Claude Desktop", "Cline"],
      objectives: ["MCP server creation", "Expose chatbot tools", "Connect MCP client"]
    },
    {
      day: 24,
      title: "Agentic Chatbot Integration",
      type: "SHIP_IT",
      tools: ["LangChain", "MCP", "FastAPI"],
      objectives: ["Integrate agents & MCP", "Retries & timeouts", "Failure testing"]
    },
    {
      day: 25,
      title: "Chatbot Evaluation & Testing",
      type: "SHIP_IT",
      tools: ["Python", "Evaluation Dataset"],
      objectives: ["Benchmark dataset", "Evaluate accuracy & grounding", "Identify failure cases"]
    },
    {
      day: 26,
      title: "Performance Optimization & Cost Management",
      type: "OPTIMIZE",
      tools: ["tiktoken", "FastAPI"],
      objectives: ["Measure token usage", "Prompt compression", "Response caching"]
    },
    {
      day: 27,
      title: "Security, Privacy & Guardrails",
      type: "BUILD",
      tools: ["FastAPI", "Input Validation"],
      objectives: ["API security", "Sanitize inputs", "Prompt injection safeguards"]
    },
    {
      day: 28,
      title: "Docker & Kubernetes Deployment",
      type: "SHIP_IT",
      tools: ["Docker", "Kubernetes", "FastAPI", "React"],
      objectives: ["Containerize frontend & backend", "Deploy to K8s", "Health checks"]
    },
    {
      day: 29,
      title: "Monitoring, Logging & Observability",
      type: "BUILD",
      tools: ["Python Logging", "Prometheus", "Grafana"],
      objectives: ["Structured logging", "Monitor latency & tool calls", "Grafana dashboard"]
    },
    {
      day: 30,
      title: "Production Readiness & Final Testing",
      type: "SHIP_IT",
      tools: ["FastAPI", "Docker", "Kubernetes"],
      objectives: ["End-to-end regression testing", "Operational docs", "Production launch"]
    },
    {
      day: 31,
      title: "Capstone Project & Final Demo",
      type: "CAPSTONE",
      tools: ["FastAPI", "React", "LangChain", "MCP", "Docker", "Kubernetes"],
      objectives: ["Enterprise chatbot demo", "RAG + MCP + Agents", "Final presentation"]
    }
  ]
};
