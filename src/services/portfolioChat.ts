import { PERSONAL, SKILLS } from '../data/content'
import { HIRE_ME } from '../data/recruiter'
import { CASE_STUDIES } from '../data/caseStudies'

/**
 * "Ask my Portfolio" — chat service.
 *
 * BACKEND HOOK: set VITE_PORTFOLIO_CHAT_URL to your Python webhook. It will
 * receive `POST { system, messages }` (OpenAI-style roles) and must answer
 * `{ reply: string }`. Until then, `mockReply` answers common questions locally
 * from the same facts that feed SYSTEM_PROMPT.
 */
export type ChatRole = 'user' | 'assistant'
export interface ChatMessage { role: ChatRole; content: string }

const CHAT_URL = import.meta.env.VITE_PORTFOLIO_CHAT_URL

/** CV briefing for the model. Built from the site's data files so it never drifts from the pages. */
export const SYSTEM_PROMPT = `You are "Ask my Portfolio", an assistant on the portfolio website of ${PERSONAL.name}.
Answer questions from recruiters and visitors about him, in the language they write in.
Only use the facts below. If something is not covered, say you don't know and suggest emailing him.
Never claim to be him. Keep answers short and friendly (2-4 sentences).

## Profile
- ${PERSONAL.subtitle}
- Based in: ${HIRE_ME.location}
- Looking for: ${HIRE_ME.roles.join(', ')}
- Visa status: ${HIRE_ME.visa} — do not speculate about it.
- Languages: ${HIRE_ME.languages.join(', ')}
- Motto: "${PERSONAL.slogan}"

## Journey
- 2019: BA in International Relations, Dagon University (Myanmar)
- 2020-2022: MPT & KDDI joint operations (Myanmar)
- 2022: moved to Japan; WELL Japanese Language School
- 2023: passed JLPT N3, JFT-Basic A2 and the Care Worker Evaluation Tests
- 2024: caregiver at Hirashima Hospital (Shojinkai Medical Corporation)
- 2025-: BSc Computer Science, University of Central Lancashire (UK), with Strategy First International College;
  NCC Education Level 4 Diploma in Computing; IBM AI Developer Professional certificate (in progress)

## Skills
${SKILLS.map((s) => `- ${s.name}`).join('\n')}
- Also: C#/.NET, React, TypeScript, Three.js, Flask, Google Gemini API, LINE Messaging API

## Projects (case studies on the site)
${CASE_STUDIES.map((c) => `- ${c.name} — ${c.copy.en.summary} Stack: ${c.stack.join(', ')}. Page: /projects/${c.slug}`).join('\n')}

## Contact
- Email: ${PERSONAL.email}
- LinkedIn: ${HIRE_ME.linkedin}`

/** Send the conversation to the backend, or fall back to the local mock. */
export async function sendPortfolioMessage(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  if (!CHAT_URL) return mockReply(messages[messages.length - 1]?.content ?? '')

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: SYSTEM_PROMPT, messages }),
    signal,
  })
  if (!res.ok) throw new Error(`Chat API ${res.status}`)
  const data: { reply?: string } = await res.json()
  return data.reply?.trim() || 'Sorry, I could not come up with an answer.'
}

// ── Local mock (no network) ───────────────────────────────────────────────────
const RULES: { test: RegExp; answer: () => string }[] = [
  { test: /\b(c#|c sharp|\.net|dotnet|asp)/i,
    answer: () => 'Yes — C# and .NET are core skills. He builds full-stack apps with C#/.NET back ends and React front ends; this portfolio’s own API is ASP.NET.' },
  { test: /visa|residence|work permit|sponsor/i,
    answer: () => `His visa status is ${HIRE_ME.visa.toLowerCase()} — please email ${PERSONAL.email} and he’ll share the details.` },
  { test: /japanese|jlpt|nihongo|speak/i,
    answer: () => `He speaks ${HIRE_ME.languages.join(', ')}. He passed JLPT N3 and has worked in Japanese workplaces since 2022.` },
  { test: /study|degree|university|education|bsc|ncc/i,
    answer: () => 'He is studying for a BSc in Computer Science with the University of Central Lancashire (UK) through Strategy First International College, alongside NCC Education’s Level 4 Diploma in Computing. He also holds a BA in International Relations.' },
  { test: /where|location|based|live|relocat|remote/i,
    answer: () => `He is looking for roles in ${HIRE_ME.location}.` },
  { test: /role|position|job|looking|hire|available|intern/i,
    answer: () => `He is open to: ${HIRE_ME.roles.join(', ')}.` },
  { test: /\bai\b|agentic|llm|gemini|machine learning|ml\b/i,
    answer: () => 'He works hands-on with agentic AI and LLM APIs — for example a multilingual Gemini assistant on LINE (see /projects/ai-line-bot) — and is completing the IBM AI Developer Professional certificate.' },
  { test: /react|frontend|front-end|typescript|javascript|web/i,
    answer: () => 'Yes — React with TypeScript, Vite and Tailwind CSS. He has shipped bilingual production sites for clients; see /projects/may-dar-we and /projects/sein-pan.' },
  { test: /python|flask|automation|script/i,
    answer: () => 'Yes — Python for automation and back ends, including a Flask webhook server for his AI LINE bot and scripts that automate hospital paperwork.' },
  { test: /project|portfolio|built|work|case stud/i,
    answer: () => `Highlights: ${CASE_STUDIES.map((c) => c.name).join(', ')}. Each has a case study under /projects.` },
  { test: /care|caregiv|kaigo|hospital|background/i,
    answer: () => 'Before tech he worked as a caregiver at Hirashima Hospital in Japan — experience that shaped how he builds for real people. He moved into software through his CS degree.' },
  { test: /contact|email|reach|linkedin|cv|resume/i,
    answer: () => `Email ${PERSONAL.email} or connect on LinkedIn: ${HIRE_ME.linkedin}. His CV is available on request.` },
]

function mockReply(question: string): Promise<string> {
  const rule = RULES.find((r) => r.test.test(question))
  const reply = rule
    ? rule.answer()
    : `I don’t have that detail yet — you can ask him directly at ${PERSONAL.email}.`
  // small delay so the typing indicator reads naturally
  return new Promise((resolve) => setTimeout(() => resolve(reply), 450))
}
