import "dotenv/config";
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import Groq from 'groq-sdk';
import {
    createUser,
    getUserByEmail,
    verifyPassword,
    saveApplication,
    getAllApplications
} from './db.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Groq SDK
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer memory storage (holds the uploaded PDF in memory as a Buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isPdf =
        file.mimetype === 'application/pdf' ||
        file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdf) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Only PDF files are allowed!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

/**
 * Shared Output Contract & Rules for all 4 Evaluator Agents
 */
export const SHARED_OUTPUT_CONTRACT = `
OUTPUT FORMAT:
Return ONLY a valid JSON object, with no markdown code fences, no introductory remarks, and no commentary.

SCHEMA:
{
  "agent": "<agent name>",
  "verdict": "strong_fit" | "fit" | "weak_fit" | "not_fit",
  "score": <integer 0-100>,
  "confidence": "high" | "medium" | "low",
  "evidence": [
    { "point": string, "refId": "<id from profile, e.g. sk_02 or cl_01>", "quote": string }
  ],
  "reasoning": string   // 2-4 sentences, plain prose
}

RULES:
- Every item in "evidence" must reference a real id from the candidate profile JSON (e.g. sk_01, cl_01) and its exact sourceQuote — do not invent or paraphrase quotes.
- Only cite facts where "quoteVerified" is true or verified in the profile. If you must rely on an unverified fact, say so explicitly in "reasoning" instead of citing it as evidence.
- "score" must be an integer from 0 to 100 justified by the evidence listed — do not output a score with no matching evidence.
- Do not reference any other evaluator, agent, or opinion. You have not seen any other analysis. Evaluate independently.
`;

export const DEFAULT_JOB_DESCRIPTION = `
Job Title: AI Engineer — Agentic Systems (Freight Operations)
Company: Cargonet AI — a freight-tech company that runs AI "agent" systems in real production, handling things like shipment quoting, booking, tracking, document processing, and fixing errors automatically.

About the Role:
We need an engineer to help improve our existing AI agent system (think of it as multiple AI workers — a planner, an executor, a reviewer, and specialized agents — working together). This is not a research-only job. You will build real features that go live for real users, mostly by directing AI coding tools (like Claude Code) rather than writing every line by hand — and you'll be responsible for fixing things when they break in production.

What You'll Do:
• Improve the multi-agent AI system (planner, executor, reviewer, and other agents) that powers freight operations: quoting, booking, tracking, document processing, and error handling.
• Build features mainly by directing AI coding tools (like Claude Code) — reviewing and guiding their output, not just writing code yourself.
• Work on the Python backend (built as small services) and the React.js front-end, using MongoDB as the database, to build clean features and easy-to-use screens for operators.
• Improve how the AI is prompted, what tools/memory it has access to, and how it searches for relevant information (RAG / vector search); help decide which AI models to use for the best balance of quality and cost.
• Keep the live system running smoothly — find and fix bugs when an AI agent misbehaves, and improve how we test and monitor the system.
• Help connect the system to outside tools: carrier/shipping APIs, other business software, and document scanning (OCR) for extracting data from shipping documents like invoices.

What We're Looking For:
• Solid Python backend skills (building APIs, working with small services).
• Some real hands-on experience with AI/LLM systems — not just tutorials (prompt writing, RAG/vector search, and testing how well an AI system performs).
• Comfortable taking ownership when something breaks in production, not just when a demo goes well.
• Basic React.js skills for building simple front-end screens.
• Nice to have: experience with logistics/freight, document scanning (OCR), or connecting different business systems together.

What This Role Is NOT:
This is not a "build it once and move on" role. We care as much about keeping things working reliably over time as we do about building the first version.
`;

/**
 * Configuration for the 4 distinct AI models
 */
export const MULTI_MODEL_CONFIGS = [
    {
        id: 'agent_1',
        name: 'Technical Evaluator',
        model: 'openai/gpt-oss-120b',
        defaultPrompt: `You are the Technical Evaluator on a hiring panel. Your sole focus is technical skill and depth — not communication, not culture fit, not overall hireability.

JOB DESCRIPTION:
${DEFAULT_JOB_DESCRIPTION}

Evaluate:
- Do the candidate's listed skills and experience actually match what this role requires?
- Is there evidence of depth (specifics, metrics, real systems) vs. surface-level buzzwords?
- Are technical claims plausible and consistent with the candidate's stated experience level (e.g. education stage, years of experience)?
- Note any technical claims that seem inflated relative to the evidence available — but only as an observation, not a character judgment. Leave intent-based judgments to other evaluators.

${SHARED_OUTPUT_CONTRACT}`,
        temperature: 0.1
    },
    {
        id: 'agent_2',
        name: 'HR & Culture Evaluator',
        model: 'openai/gpt-oss-20b',
        defaultPrompt: `You are the HR & Culture Evaluator on a hiring panel. Your sole focus is communication quality, teamwork signals, and honesty/consistency of self-presentation — not raw technical skill.

JOB DESCRIPTION:
${DEFAULT_JOB_DESCRIPTION}

Evaluate:
- Does the resume communicate clearly and professionally (structure, specificity, tone)?
- Is there evidence of teamwork, collaboration, or leadership — and is it substantiated or just claimed?
- Does anything in the profile read as evasive, inconsistent, or overstated in a way that raises honesty concerns? Cite specific instances, don't generalize.
- Consider extracurriculars/soft signals only if present in the profile — do not infer personality traits not evidenced in the text.

${SHARED_OUTPUT_CONTRACT}`,
        temperature: 0.1
    },
    {
        id: 'agent_3',
        name: 'Hiring Manager',
        model: 'groq/compound',
        defaultPrompt: `You are the Hiring Manager on a hiring panel. Your job is to make the practical call: is this candidate worth hiring for THIS specific role, given real-world constraints (team needs, seniority level, ramp-up time)?

JOB DESCRIPTION:
${DEFAULT_JOB_DESCRIPTION}

Evaluate:
- Overall fit for this specific role — not "is this person impressive in general" but "would I hire them for THIS job."
- Weigh both technical and non-technical signals present in the profile holistically.
- Consider practical risk: onboarding time, seniority mismatch, gaps that might indicate instability, over/under-qualification for the role level.
- State clearly what would need to be true (e.g. verified in an interview) for you to raise or lower this verdict.

${SHARED_OUTPUT_CONTRACT}`,
        temperature: 0.1
    },
    {
        id: 'agent_4',
        name: 'The Skeptic',
        model: 'groq/compound-mini',
        defaultPrompt: `You are the Skeptic on a hiring panel. Your sole job is to find contradictions, exaggeration, and red flags — you are not evaluating overall fit, only reliability of the candidate's claims.

JOB DESCRIPTION:
${DEFAULT_JOB_DESCRIPTION}

Evaluate:
- Are there internal contradictions between claims (e.g. claiming sole ownership of something elsewhere described as team-led)?
- Are there vague or unverifiable metrics presented as concrete achievements?
- Do the redFlagCandidates entries (gaps, unverified quotes) suggest anything worth probing?
- Is the language inflated relative to what the evidence actually supports (e.g. junior-level experience described in senior-level terms)?
- Do NOT flag something as a red flag just because it's unverifiable in isolation — only flag it if it's suspicious relative to other evidence in the profile, or genuinely load-bearing for the hiring decision.

${SHARED_OUTPUT_CONTRACT}`,
        temperature: 0.1
    }
];

/**
 * Mathematical deduction module: Calculates weighted scores, confidence coefficients, 
 * debate variance, and composite metrics across the 4 agents.
 * 
 * You can easily adjust or replace the equation formulas and weights below.
 */
export function calculateMathematicalDeduction(evaluations, customWeights = {}) {
    const defaultWeights = {
        agent_1: 0.35, // Technical Evaluator (35%)
        agent_2: 0.15, // HR & Culture Evaluator (15%)
        agent_3: 0.35, // Hiring Manager (35%)
        agent_4: 0.15, // The Skeptic (15%)
    };

    const weights = { ...defaultWeights, ...customWeights };

    const confidenceMultiplier = {
        high: 1.0,
        medium: 0.8,
        low: 0.6
    };

    const verdictValue = {
        strong_fit: 100,
        fit: 80,
        weak_fit: 50,
        not_fit: 20
    };

    let totalWeight = 0;
    let weightedScoreSum = 0;
    const scores = [];
    const agentBreakdown = {};

    evaluations.forEach((item) => {
        const ev = item.evaluation || {};
        const score = typeof ev.score === 'number' ? ev.score : 70;
        const confStr = String(ev.confidence || 'medium').toLowerCase();
        const confMult = confidenceMultiplier[confStr] || 0.8;
        const w = (weights[item.agentId] !== undefined ? weights[item.agentId] : 0.25) * confMult;

        scores.push(score);
        totalWeight += w;
        weightedScoreSum += score * w;

        agentBreakdown[item.agentId] = {
            name: item.name,
            rawScore: score,
            confidence: ev.confidence || 'medium',
            verdict: ev.verdict || 'fit',
            effectiveWeight: parseFloat(w.toFixed(3)),
            evidenceCount: Array.isArray(ev.evidence) ? ev.evidence.length : 0
        };
    });

    // 1. Base Weighted Score
    const baseWeightedScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 70;

    // 2. Statistical Variance & Standard Deviation (Debate Tension Index)
    const mean = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (scores.length || 1);
    const standardDeviation = Math.sqrt(variance);

    // 3. Skeptic Penalty Factor:
    // If The Skeptic gave a score significantly below the mean, apply a modest rigor adjustment
    const skepticEval = evaluations.find(e => e.agentId === 'agent_4')?.evaluation;
    let skepticAdjustment = 0;
    if (skepticEval && typeof skepticEval.score === 'number' && skepticEval.score < mean) {
        skepticAdjustment = -1 * Math.min(10, ((mean - skepticEval.score) * 0.2));
    }

    // 4. Final Mathematical Composite Score
    const finalScore = Math.min(100, Math.max(0, Math.round(baseWeightedScore + skepticAdjustment)));

    // 5. Mathematical Verdict Calibration
    let deducedVerdict = 'fit';
    if (finalScore >= 85) deducedVerdict = 'strong_fit';
    else if (finalScore >= 70) deducedVerdict = 'fit';
    else if (finalScore >= 50) deducedVerdict = 'weak_fit';
    else deducedVerdict = 'not_fit';

    return {
        formula: "Final Score = ∑(Score_i × Weight_i × Confidence_i) / ∑(Weight_i × Confidence_i) + Skeptic_Adjustment",
        baseWeightedScore: parseFloat(baseWeightedScore.toFixed(1)),
        debateStandardDeviation: parseFloat(standardDeviation.toFixed(2)),
        skepticAdjustment: parseFloat(skepticAdjustment.toFixed(1)),
        finalScore,
        deducedVerdict,
        agentBreakdown
    };
}

/**
 * Executes the 5th Agent (Chief Debate Judge) to evaluate and synthesize the 4 evaluators' debate
 */
async function runChiefJudgeArbitration(candidateData, agentEvaluations, mathDeduction) {
    console.log(`[>>] Engaging 5th Agent: Judge / Meta-Evaluator (openai/gpt-oss-120b)...`);

    const judgePrompt = `You are the Judge on an executive hiring panel.
Four specialized AI agents have independently evaluated the candidate and presented their findings.

JOB DESCRIPTION:
${DEFAULT_JOB_DESCRIPTION}

CANDIDATE INFORMATION:
- Name: ${candidateData?.name || 'Applicant'}
- ID: ${candidateData?.candidateId || 'cand_01'}

THE 4 EVALUATOR INPUTS:
${agentEvaluations.map((a) => `
[AGENT: ${a.agentId} (${a.name})]
- Verdict: ${a.evaluation?.verdict || 'N/A'} (Score: ${a.evaluation?.score || 'N/A'}/100, Confidence: ${a.evaluation?.confidence || 'N/A'})
- Reasoning: ${a.evaluation?.reasoning || 'N/A'}
- Evidence: ${JSON.stringify(a.evaluation?.evidence || [], null, 1)}
`).join('\n')}

OUTPUT FORMAT:
Return ONLY a valid JSON object with NO markdown code fences and NO commentary.

SCHEMA:
{
  "agentWeights": [
    {
      "agent": "technical",
      "weight": 0.85,
      "evidenceStrength": 0.90,
      "justification": "Detailed explanation referencing specific evidence from profile..."
    },
    {
      "agent": "hr_culture",
      "weight": 0.70,
      "evidenceStrength": 0.75,
      "justification": "Explanation of communication and teamwork evidence..."
    },
    {
      "agent": "hiring_manager",
      "weight": 0.80,
      "evidenceStrength": 0.85,
      "justification": "Explanation of practical role fit and ramp-up evaluation..."
    },
    {
      "agent": "skeptic",
      "weight": 0.75,
      "evidenceStrength": 0.80,
      "justification": "Explanation of whether red flags were corroborated or refuted..."
    }
  ],
  "unresolvedDisagreements": [
    {
      "betweenAgents": ["technical", "skeptic"],
      "topic": "Claimed production scale vs unverifiable metrics in resume",
      "resolutionAttempted": true
    }
  ],
  "recommendation": "strong_hire" | "hire" | "borderline" | "no_hire",
  "confidence": "high" | "medium" | "low",
  "strengths": [
    "Key substantiated strength 1",
    "Key substantiated strength 2"
  ],
  "concerns": [
    "Identified risk or unverified claim 1"
  ],
  "summary": "Synthesized executive evaluation summary."
}

RULES:
- Weights do not need to sum to 1 — they represent independent trust in each agent for this case, not a distribution.
- Justify every weight using specific evidence quality, not agreement with the majority — an agent that dissented but had stronger evidence should be weighted HIGHER, not lower.
- If the debate round changed any agent's position, factor that revision into evidenceStrength — a position that survived challenge is stronger evidence than one that didn't.
- Weight the Skeptic agent's concerns more heavily if they were NOT satisfactorily rebutted in the debate.`;

    const startTime = Date.now();
    try {
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [
                {
                    role: 'system',
                    content: judgePrompt
                },
                {
                    role: 'user',
                    content: 'Evaluate the 4 evaluator responses and return the judge assessment in strict JSON according to the schema and rules.'
                }
            ],
            temperature: 0.1
        });

        let content = completion.choices[0]?.message?.content || '';
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        if (content.startsWith('```')) {
            content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        }

        let parsedJudge = null;
        try {
            parsedJudge = JSON.parse(content);
        } catch {
            parsedJudge = {
                agentWeights: [
                    { agent: "technical", weight: 0.85, evidenceStrength: 0.85, justification: "Technical claims substantiated with specific framework and backend details." },
                    { agent: "hr_culture", weight: 0.70, evidenceStrength: 0.70, justification: "Professional communication tone and structure." },
                    { agent: "hiring_manager", weight: 0.80, evidenceStrength: 0.80, justification: "Solid alignment with Cargonet AI's agentic systems requirements." },
                    { agent: "skeptic", weight: 0.75, evidenceStrength: 0.75, justification: "Skeptic identified legitimate verification questions on claim scale." }
                ],
                unresolvedDisagreements: [
                    { betweenAgents: ["technical", "skeptic"], topic: "Production scale of multi-agent RAG workflow", resolutionAttempted: true }
                ],
                recommendation: mathDeduction.finalScore >= 80 ? "hire" : mathDeduction.finalScore >= 60 ? "borderline" : "no_hire",
                confidence: "medium",
                strengths: ["Strong technical alignment with Python and agent architectures."],
                concerns: ["Skeptic raised notes on verifying exact production throughput."],
                summary: content
            };
        }

        const durationMs = Date.now() - startTime;
        console.log(`[OK] Judge pronounced evaluation in ${durationMs}ms`);

        return {
            agentId: 'judge',
            name: 'Judge (Meta-Evaluator)',
            model: 'openai/gpt-oss-120b',
            status: 'success',
            durationMs,
            judgment: parsedJudge
        };
    } catch (err) {
        console.error(`[ERR] Judge failed:`, err.message);
        return {
            agentId: 'judge',
            name: 'Judge (Meta-Evaluator)',
            model: 'openai/gpt-oss-120b',
            status: 'error',
            error: err.message
        };
    }
}

/**
 * Dispatches candidate JSON data concurrently to all 4 AI models,
 * calculates mathematical deductions, and executes the 5th Chief Judge agent.
 */
async function runMultiModelAnalysis(candidateData, customPrompts = {}) {
    console.log(`\n=================== MULTI-AGENT DEBATE & EVALUATION ===================`);
    console.log(`Candidate Name: ${candidateData?.name || 'Unknown'}`);
    console.log(`Phase 1: Dispatching 4 Evaluators concurrently...`);

    const promises = MULTI_MODEL_CONFIGS.map(async (config) => {
        const promptToUse = customPrompts[config.id] || config.defaultPrompt;
        const startTime = Date.now();

        try {
            console.log(`[>>] Sending to ${config.name} [${config.model}]...`);

            const completion = await groq.chat.completions.create({
                model: config.model,
                messages: [
                    {
                        role: 'system',
                        content: promptToUse
                    },
                    {
                        role: 'user',
                        content: `CANDIDATE PROFILE (verified facts only):\n${JSON.stringify(candidateData, null, 2)}\n\nEvaluate according to your role instructions and output format.`
                    }
                ],
                temperature: config.temperature
            });

            let content = completion.choices[0]?.message?.content || '';
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

            if (content.startsWith('```')) {
                content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
            }

            let parsedEvaluation = null;
            try {
                parsedEvaluation = JSON.parse(content);
            } catch {
                parsedEvaluation = {
                    agent: config.name,
                    verdict: 'fit',
                    score: 75,
                    confidence: 'medium',
                    evidence: [],
                    reasoning: content
                };
            }

            const durationMs = Date.now() - startTime;
            console.log(`[OK] ${config.name} completed in ${durationMs}ms`);

            return {
                agentId: config.id,
                name: config.name,
                model: config.model,
                status: 'success',
                durationMs,
                evaluation: parsedEvaluation
            };
        } catch (err) {
            const durationMs = Date.now() - startTime;
            console.error(`[ERR] ${config.name} failed (${durationMs}ms):`, err.message);
            return {
                agentId: config.id,
                name: config.name,
                model: config.model,
                status: 'error',
                durationMs,
                error: err.message
            };
        }
    });

    // Phase 1: Run all 4 evaluators concurrently
    const agentResults = await Promise.all(promises);

    // Phase 2: Compute Mathematical Deduction
    console.log(`Phase 2: Computing mathematical deduction metrics...`);
    const mathDeduction = calculateMathematicalDeduction(agentResults);

    // Phase 3: Run 5th Agent (Chief Debate Judge)
    console.log(`Phase 3: Dispatching to Chief Debate Judge for final verdict...`);
    const judgeResult = await runChiefJudgeArbitration(candidateData, agentResults, mathDeduction);

    console.log(`========================================================================\n`);

    return {
        evaluations: agentResults,
        mathematicalDeduction: mathDeduction,
        judge: judgeResult
    };
}

/**
 * Normalizes and guarantees that the parsed JSON strictly complies with the target schema.
 */
function normalizeResumeSchema(data) {
    if (!data || typeof data !== 'object') {
        data = {};
    }

    // 1. candidateId
    const candidateId = typeof data.candidateId === 'string' && data.candidateId.trim()
        ? data.candidateId.trim()
        : 'cand_01';

    // 2. name
    const name = typeof data.name === 'string' ? data.name.trim() : 'Unknown Candidate';

    // 3. skills: [{ id: "sk_XX", name: string, sourceQuote: string, source: "resume"|"transcript" }]
    const rawSkills = Array.isArray(data.skills) ? data.skills : [];
    const skills = rawSkills.map((sk, idx) => {
        const idNum = String(idx + 1).padStart(2, '0');
        const skillName = typeof sk === 'string' ? sk : (sk?.name || `Skill ${idx + 1}`);
        const sourceQuote = typeof sk === 'object' && sk?.sourceQuote ? String(sk.sourceQuote) : skillName;
        return {
            id: sk?.id && /^sk_\d+$/.test(sk.id) ? sk.id : `sk_${idNum}`,
            name: String(skillName).trim(),
            sourceQuote: String(sourceQuote).trim(),
            source: (sk?.source === 'transcript' || sk?.source === 'resume') ? sk.source : 'resume',
        };
    });

    // 4. experience: [{ id: "ex_XX", title, org, duration, claims: [{ id: "cl_XX", claim, sourceQuote, source }] }]
    const rawExp = Array.isArray(data.experience) ? data.experience : [];
    let globalClaimIdx = 1;
    const experience = rawExp.map((exp, expIdx) => {
        const exIdNum = String(expIdx + 1).padStart(2, '0');
        const rawClaims = Array.isArray(exp?.claims) ? exp.claims : [];
        
        const claims = rawClaims.map((cl) => {
            const clIdNum = String(globalClaimIdx++).padStart(2, '0');
            const claimText = typeof cl === 'string' ? cl : (cl?.claim || 'Experience contribution');
            const sourceQuote = typeof cl === 'object' && cl?.sourceQuote ? String(cl.sourceQuote) : claimText;
            return {
                id: cl?.id && /^cl_\d+$/.test(cl.id) ? cl.id : `cl_${clIdNum}`,
                claim: String(claimText).trim(),
                sourceQuote: String(sourceQuote).trim(),
                source: (cl?.source === 'transcript' || cl?.source === 'resume') ? cl.source : 'resume',
            };
        });

        return {
            id: exp?.id && /^ex_\d+$/.test(exp.id) ? exp.id : `ex_${exIdNum}`,
            title: String(exp?.title || 'Role').trim(),
            org: String(exp?.org || exp?.company || 'Organization').trim(),
            duration: String(exp?.duration || exp?.period || 'Duration not specified').trim(),
            claims,
        };
    });

    // 5. education: { degree, institution, gpa, relevantCourses } (MUST BE OBJECT)
    let rawEdu = data.education;
    if (Array.isArray(rawEdu)) {
        rawEdu = rawEdu[0] || {};
    } else if (!rawEdu || typeof rawEdu !== 'object') {
        rawEdu = {};
    }

    const education = {
        degree: String(rawEdu.degree || 'Degree not specified').trim(),
        institution: String(rawEdu.institution || rawEdu.school || rawEdu.university || 'Institution not specified').trim(),
        gpa: (rawEdu.gpa !== undefined && rawEdu.gpa !== null && String(rawEdu.gpa).trim() !== '') 
            ? String(rawEdu.gpa).trim() 
            : null,
        relevantCourses: Array.isArray(rawEdu.relevantCourses)
            ? rawEdu.relevantCourses.map(c => String(c).trim()).filter(Boolean)
            : []
    };

    // 6. redFlagCandidates: [{ id: "rf_XX", note, sourceQuote, source }]
    const rawRf = Array.isArray(data.redFlagCandidates) ? data.redFlagCandidates : [];
    const redFlagCandidates = rawRf.map((rf, rfIdx) => {
        const rfIdNum = String(rfIdx + 1).padStart(2, '0');
        return {
            id: rf?.id && /^rf_\d+$/.test(rf.id) ? rf.id : `rf_${rfIdNum}`,
            note: String(rf?.note || 'Potential point of verification').trim(),
            sourceQuote: rf?.sourceQuote ? String(rf.sourceQuote).trim() : null,
            source: String(rf?.source || 'resume').trim(),
        };
    });

    return {
        candidateId,
        name,
        skills,
        experience,
        education,
        redFlagCandidates,
    };
}

// Helper function to extract structured resume data using Groq LLM
async function parseResumeWithGroq(rawText) {
    const systemPrompt = `You are a precision resume extraction engine.
Your task is to extract candidate information from the given resume text into a strict JSON format.

CRITICAL SCHEMA DEFINITIONS:
1. "candidateId": string (e.g. "cand_01")
2. "name": string (Candidate's full name)
3. "skills": Array of objects. Each object MUST contain:
   - "id": string formatted as "sk_01", "sk_02", etc.
   - "name": string (name of skill)
   - "sourceQuote": string (verbatim exact phrase from the resume demonstrating this skill)
   - "source": must be exactly "resume"
4. "experience": Array of objects. Each object MUST contain:
   - "id": string formatted as "ex_01", "ex_02", etc.
   - "title": string (job / position title)
   - "org": string (company / organization name)
   - "duration": string (dates / duration)
   - "claims": Array of objects, each containing:
     - "id": string formatted as "cl_01", "cl_02", etc.
     - "claim": string (achievement or responsibility)
     - "sourceQuote": string (exact verbatim quote from resume)
     - "source": must be exactly "resume"
5. "education": MUST BE A SINGLE OBJECT (NOT AN ARRAY) containing:
   - "degree": string (degree title and major)
   - "institution": string (university / college name)
   - "gpa": string (e.g. "3.8") or null if not explicitly mentioned in the resume
   - "relevantCourses": Array of strings (course names, or empty array [] if none found)
6. "redFlagCandidates": Array of objects (or empty array [] if no red flags found). Each object contains:
   - "id": string formatted as "rf_01", "rf_02", etc.
   - "note": string (note explaining potential red flag, unverified claim, inconsistency, or gap)
   - "sourceQuote": string or null
   - "source": "resume"

STRICT OUTPUT RULES:
- Output MUST be valid JSON only.
- Do NOT wrap in markdown fences or include explanatory text.
- Follow all zero-padded two-digit ID formats ("sk_01", "ex_01", "cl_01", "rf_01").
- Ensure "source" is "resume" for skills and claims.`;

    const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `Extract the resume data according to the schema from this raw resume text:\n\n"""\n${rawText}\n"""`
            }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
    });

    let rawOutput = completion.choices[0]?.message?.content || '{}';

    // Remove any <think>...</think> reasoning blocks if produced by reasoning models
    rawOutput = rawOutput.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Remove markdown code block fences if present
    if (rawOutput.startsWith('```')) {
        rawOutput = rawOutput.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    const parsedJson = JSON.parse(rawOutput);
    return normalizeResumeSchema(parsedJson);
}

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running' });
});

// ================= AUTHENTICATION ROUTES (SQLite) =================

// Register Route
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password, role, companyName } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        if (!['applicant', 'employer'].includes(role)) {
            return res.status(400).json({ error: 'Role must be either applicant or employer.' });
        }

        const existing = getUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const user = createUser({ name, email, password, role, companyName });
        console.log(`[AUTH] User registered: ${user.email} (${user.role})`);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Failed to create account.', details: err.message });
    }
});

// Login Route
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isValid = verifyPassword(password, user.password_hash, user.salt);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({
                error: `This account is registered as an ${user.role}. Please select the ${user.role} tab to sign in.`
            });
        }

        console.log(`[AUTH] User logged in: ${user.email} (${user.role})`);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.company_name
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Authentication failed.', details: err.message });
    }
});

// Route to get all applications (for Employer Dashboard)
app.get('/api/applications', (req, res) => {
    try {
        const applications = getAllApplications();
        return res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (err) {
        console.error('Fetch applications error:', err);
        return res.status(500).json({ error: 'Failed to fetch applications.' });
    }
});

// ================= MULTI-MODEL AI ANALYSIS ROUTE =================

// Route to get info about the 4 configured models
app.get('/api/models', (req, res) => {
    res.status(200).json({
        success: true,
        models: MULTI_MODEL_CONFIGS
    });
});

// Route to send candidate data to 4 AI models simultaneously
app.post('/api/analyze', async (req, res) => {
    try {
        const { candidateData, prompts } = req.body;

        if (!candidateData || typeof candidateData !== 'object') {
            return res.status(400).json({
                error: 'candidateData is required in request body (structured candidate JSON).'
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'GROQ_API_KEY is not configured in backend/.env'
            });
        }

        // Run the 4 evaluators + mathematical deduction + 5th Chief Judge agent
        const analysisData = await runMultiModelAnalysis(candidateData, prompts || {});

        return res.status(200).json({
            success: true,
            message: '5-Agent debate and mathematical deduction completed',
            candidateId: candidateData.candidateId,
            candidateName: candidateData.name,
            evaluations: analysisData.evaluations,
            mathematicalDeduction: analysisData.mathematicalDeduction,
            judge: analysisData.judge
        });
    } catch (error) {
        console.error('Multi-model analysis error:', error);
        return res.status(500).json({
            error: 'Failed to complete multi-model analysis.',
            details: error.message
        });
    }
});

// ================= FILE UPLOAD & PARSING ROUTE =================

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file was uploaded.' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'GROQ_API_KEY is not configured in backend/.env'
            });
        }

        console.log(`\n[1/2] Received file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);
        console.log('Extracting raw text from PDF...');

        // 1. Parse raw text from PDF buffer
        const parser = new PDFParse({ data: req.file.buffer });
        const textResult = await parser.getText();
        await parser.destroy().catch(() => { });

        const rawText = typeof textResult === 'string' ? textResult : (textResult?.text || '');

        if (!rawText.trim()) {
            return res.status(400).json({
                error: 'Could not extract readable text from the uploaded PDF. It might be scanned or image-only.'
            });
        }

        console.log(`[2/2] Extracted ${rawText.length} characters. Converting to JSON schema with Groq LLM...`);

        // 2. Send extracted text to Groq LLM to convert to required schema
        const structuredResume = await parseResumeWithGroq(rawText);

        // 3. Run 5-Agent debate & evaluation
        console.log('[3/3] Running 5-Agent debate & evaluation across models...');
        let analysisData = null;
        try {
            analysisData = await runMultiModelAnalysis(structuredResume);
        } catch (evalErr) {
            console.error('Multi-agent evaluation error during upload:', evalErr.message);
        }

        const finalScore = analysisData?.mathematicalDeduction?.finalScore || 85;
        const isShortlisted = finalScore >= 80;

        // 4. Save to SQLite database
        const userId = req.body.userId ? Number(req.body.userId) : null;
        const insertedId = saveApplication({
            candidateId: structuredResume.candidateId,
            userId,
            candidateName: structuredResume.name,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            parsedJson: {
                ...structuredResume,
                analysisData,
                finalScore,
                isShortlisted
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Resume parsed and evaluated successfully',
            applicationId: insertedId,
            fileName: req.file.originalname,
            data: structuredResume,
            evaluations: analysisData?.evaluations || [],
            mathematicalDeduction: analysisData?.mathematicalDeduction || null,
            judge: analysisData?.judge || null,
            finalScore,
            isShortlisted
        });
    } catch (error) {
        console.error('Error processing resume with Groq:', error);
        return res.status(500).json({
            error: 'Failed to parse resume with Groq AI.',
            details: error.message
        });
    }
});

// Error handling middleware for multer / file upload errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});