# FindMyJob 🚀
> **Multi-Agent AI Candidate Intelligence & Hiring Arbitration Panel**

FindMyJob is an AI-powered recruitment and candidate intelligence system. It ingests candidate resumes, extracts structured career profiles, and dispatches them across a **5-Agent Multi-Model Debate Panel** to evaluate fit, technical depth, communication, and authenticity.

---

## 🧠 The 5-Agent Multi-Model Debate Panel

| Agent | Role | Model | Focus |
| :--- | :--- | :--- | :--- |
| **Agent 1** | **Technical Evaluator** | `openai/gpt-oss-120b` | Evaluates technical depth, architecture design, and system scalability. |
| **Agent 2** | **HR & Culture Evaluator** | `openai/gpt-oss-20b` | Analyzes communication clarity, self-presentation consistency, and teamwork signals. |
| **Agent 3** | **Hiring Manager** | `groq/compound` | Assesses practical role fit for Cargonet AI, team needs, and onboarding ramp-up risk. |
| **Agent 4** | **The Skeptic** | `groq/compound-mini` | Investigates unverified metrics, claim inflation, and red flags. |
| **Agent 5** | **Chief Judge (Meta-Evaluator)** | `openai/gpt-oss-120b` | Arbitrates the debate, resolves cross-examinations, computes mathematical deduction metrics, and delivers the final hiring recommendation. |

---

## ⚡ Features

- **Applicant Experience**:
  - Interactive Job Details viewer with responsibilities, ecosystem stack, and *"What This Role Is NOT"*.
  - Drag-and-drop PDF resume dropzone with real-time parsing.
  - Automatic shortlist evaluation ($\ge 80$ score threshold) with congratulations banner and Chief Judge decisive remark.
- **Employer / Recruiter Dashboard**:
  - Live candidate pipeline connected to an embedded SQLite database.
  - 4-Agent scores and decisive remarks grid on every candidate card.
  - On-demand *"Run Debate"* triggers for live multi-model cross-examination.
  - Modal with 5-agent debate synthesis, trust weights, and structured career timeline.
- **Auth System**:
  - Secure role-based authentication (Applicant / Employer) powered by native SQLite and scrypt password hashing.

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY into .env
node app.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
MIT License
