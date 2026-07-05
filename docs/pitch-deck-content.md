# Bushra — Pitch Deck Content & Narrative
**Hackathon 2026 · Alinma Bank**
*Last updated: June 27, 2026*

---

## Slide 1 — Title

**Eyebrow:** Hackathon 2026 · Alinma Bank

**Headline:** Bushra

**Subline:** Your Financial Manager, Not Just an Assistant

**Supporting line:** The first AI agent inside the Alinma app that executes banking tasks by voice — before you even think to ask.

**Badges:** Voice + Chat · Arabic-First · Agentic AI

> **Presenter note:** Don't explain Bushra yet. Let the name land. One sentence max, then move.

---

## Slide 2 — The Problem

**Eyebrow:** The Problem

**Headline:** Saudi customers are fully digital. Their bank isn't.

**Body — three tension points:**

**5 screens. 4 minutes.**
That's what it takes to transfer 250 SAR to Ahmed. Open app. Find transfers. Select beneficiary. Enter amount. Confirm OTP. Every single time. No shortcut. No memory.

**The bank never speaks first.**
Khalid ends every month with 1,200 SAR sitting idle — earning nothing. His bank knows this. It says nothing. It waits.

**Voice is everywhere. Except the bank.**
Saudi customers use Siri and Google Assistant daily. 90% are on mobile banking. Yet not one Saudi bank lets you complete a transaction by voice.

> **Presenter note:** Pause after each pain. Let judges feel it. These are real customers — Reem, Khalid, Saad — not personas.

---

## Slide 3 — The Solution

**Eyebrow:** The Solution

**Headline:** Bushra doesn't answer. She executes.

**One-liner:** An AI agent embedded inside the Alinma app. Understands Arabic. Resolves ambiguity. Confirms before acting. Completes the job.

**Three steps:**

1. **Speak or type** — "سددي فاتورة الكهرباء" — Bushra understands intent, extracts everything she needs, asks only what's missing.
2. **Review & confirm** — She surfaces a clear summary. Nothing moves without your explicit yes.
3. **Done in under 30 seconds** — Transaction executes. Receipt delivered in-app and read aloud. Reference number included.

**Chat demo:**

| | |
|---|---|
| User | سددي فاتورة الكهرباء |
| Bushra | وجدت فاتورة كهرباء بقيمة 186 ريال. السداد من حسابك الجاري المنتهي بـ 1234؟ |
| User | نعم |
| Bushra | ✅ تم السداد. رقم العملية: 458921 |

> **Presenter note:** This is the moment to demo live if you're doing it here. Otherwise let the chat speak.

---

## Slide 4 — The Product

**Eyebrow:** The Product

**Headline:** Six banking capabilities. One conversation.

**Left panel:** Prototype screenshot
*Caption: Bushra lives inside the Alinma app as a floating button. Tap once — or just speak.*

**Right panel — six capabilities:**

| | Capability | What it does |
|---|-----------|-------------|
| 1 | Account Inquiry | Balance, last transactions, search by merchant — read aloud |
| 2 | Money Transfer | To saved beneficiaries, Face ID confirmed, receipt delivered |
| 3 | Bill Payment | SADAD bills fetched by name, amount confirmed, executed |
| 4 | Card Management | Freeze, unfreeze, replace — one command, immediate |
| 5 | Digital Products | Travel card, financing intake — Bushra collects and initiates |
| ✦ | **Proactive Savings** | **Detects idle balances. Recommends Alinma savings programs. Acts before you ask.** |

> **Presenter note:** The first five show competence. The sixth — proactive savings — is why Bushra is a financial manager, not just an assistant. That's the differentiator. Spend time here.

---

## Slide 5 — Impact for Alinma Bank

**Eyebrow:** Why It Matters for Alinma Bank

**Headline:** A measurable return. From day one.

**Three impact blocks:**

**10×**
Faster task completion. 4 minutes → under 30 seconds. Every transfer, bill payment, and card action.

**+31.5%**
Average customer satisfaction lift reported by banks that deploy conversational AI. Alinma's app is already rated 4.8 — Bushra pushes it further.

**#1**
First bank in Saudi Arabia with a voice AI that completes transactions end-to-end. Al Rajhi's chatbot answers questions. Bushra executes. That gap is today's competitive window.

**Supporting data (small text on slide):**
- Alinma: 5.8M customers · +26% active users in 2024 · 86% digital onboarding
- Global AI banking ROI: $3.50 per $1 invested · Forrester: 210% ROI over 3 years
- SAMA mandate: all Saudi banks must adopt AI-driven customer service — Bushra is the answer

> **Presenter note:** Frame this as Alinma's business case, not the team's technology achievement. The judges are bank executives — speak their language.

---

## Slide 6 — Why Now

**Eyebrow:** Why Now

**Headline:** The market is ready. The mandate exists. No one has moved.

**Four stats:**

**79%**
of Saudi transactions are already cashless — exceeding the Vision 2030 target two years early. The infrastructure is there.

**5.8M**
Alinma Bank customers. +26% active users last year. +25% digital transactions. The audience is already in the app.

**$4.7B**
MENA AI in Finance market by 2032 — growing at 25% CAGR. The investment wave is coming to this region.

**0**
Saudi banks with a voice AI that executes transactions today. The window is open. Bushra closes it first for Alinma.

**Closing line on slide:**
Vision 2030 didn't just set a goal — SAMA mandated AI adoption in banking. Bushra is compliant, Arabic-first, and ready.

> **Presenter note:** The "0" stat is the punchline. Hold it a beat. Let it sit.

---

## Slide 7 — Technology

**Eyebrow:** How It's Built

**Headline:** An agent, not a chatbot.

**Key distinction (prominent on slide):**
> Any bank can deploy a chatbot that answers FAQs. Bushra uses Tool Use / Function Calling inside an LLM — she doesn't generate a response, she calls a banking action. That's the architectural difference between a FAQ bot and a financial agent.

**Six components:**

| Layer | Technology | Role |
|-------|-----------|------|
| 🎙️ ASR | Whisper API / Azure Speech | Saudi dialect Arabic → text, real-time |
| 🔊 TTS | ElevenLabs / OpenAI TTS | Natural Arabic voice output |
| 🧠 LLM | GPT-4o / Claude 3.5 Sonnet | Intent, entities, dialog management |
| ⚙️ Agent | Function Calling / Tool Use | Executes banking actions, not just text |
| 🔐 Security | Risk-based Face ID / OTP | No silent execution. Full audit log. |
| 📱 Mobile | Flutter / React Native | Alinma app simulation, demo-ready |

**Footer note:** Mock API layer for hackathon. Architecture is production-ready for real Alinma API integration.

> **Presenter note:** Keep this fast. The point is credibility — this is a real system, not a GPT wrapper with a banking skin. One sentence per component.

---

## Slide 8 — Team

**Eyebrow:** The Team

**Headline:** Four specialists. One focused build.

**Four members:**

**Abdulelah Alkesaiberi — Product**
Product strategy, PRD, roadmap, and stakeholder alignment. Defined the six MVP capabilities and the behavioral intelligence layer.

**Saud — Speech & Voice**
ASR pipeline, TTS integration, Saudi Arabic dialect tuning. The voice is Bushra's personality.

**Abdulkarim — LLM & AI**
NLU, agent framework, dialog management, prompt engineering. The brain behind Bushra's reasoning.

**Abdurahman — Mobile**
Demo shell, UI integration, mock API layer. What judges will see and touch.

**Closing line:**
Built at Alinma Bank Hackathon 2026. Deadline July 9. All six features functional and demonstrable.

> **Presenter note:** End with confidence — not "we hope" or "we plan to." State what you've built. Then stop talking.

---

## Narrative Arc

| Slide | Job it does |
|-------|------------|
| 1 — Title | Intrigue — who is Bushra? |
| 2 — Problem | Pain — make judges feel the friction |
| 3 — Solution | Relief — here's how it's solved |
| 4 — Product | Proof — here's what it does |
| 5 — Impact | Business case — here's what Alinma gains |
| 6 — Why Now | Timing — here's why this moment |
| 7 — Tech | Credibility — here's that it's real |
| 8 — Team | Trust — here's who built it |

---

## Key Numbers Reference (for any slide)

| Stat | Number | Use on |
|------|--------|--------|
| Alinma customers | 5.8M (March 2025) | Slides 5, 6 |
| Alinma active user growth | +26% in 2024 | Slide 5 |
| Alinma digital onboarding | 86% of new customers | Slide 5 |
| Alinma net income growth | +20.5% in 2024 | Slide 5 |
| Mobile banking penetration KSA | >90% of active customers | Slide 6 |
| Cashless transactions KSA | 79% in 2024 | Slide 6 |
| MENA AI in Finance (2032) | $4.7B at 25% CAGR | Slide 6 |
| MEA Conversational AI (2024) | $1.2B → $3.5B by 2030 | Slide 6 |
| AI banking ROI | $3.50 per $1 invested | Slide 5 |
| Forrester ROI | 210% over 3 years | Slide 5 |
| Customer satisfaction lift | +31.5% | Slide 5 |
| Wait time reduction | 94% (bank case study) | Slide 5 |
| Saudi fintech market (2025) | $2.1B | Slide 6 |
| Saudi fintech jobs target | 18,000 | Slide 6 |
| Saudi fintech startups | 210+ | Slide 6 |
| Competitors with voice AI execution | 0 | Slides 5, 6 |

---

## Sources

- [IMARC Group — Saudi Arabia Digital Banking Market](https://www.imarcgroup.com/saudi-arabia-digital-banking-market)
- [Credence Research — Middle East AI in Finance Market](https://www.credenceresearch.com/report/middle-east-artificial-intelligence-ai-in-finance-market)
- [Grand View Research — MEA Conversational AI Market](https://www.grandviewresearch.com/horizon/outlook/conversational-ai-market/mea)
- [Alinma Bank — 2024 Financial Results](https://www.alinma.com/en/about-the-bank/the-bank/news/2025/1/2024-financial-results)
- [Alinma Bank — Digital Transformation 2024](https://www.alinma.com/2024/air/digital.html)
- [Saudi Vision 2030 — FinTech Strategy](https://www.vision2030.gov.sa/en/explore/strategies/fintech-strategy)
- [Saudi Fintech Ecosystem Surpasses 2025 Goal Early](https://saudimarketresearchconsulting.com/insights/articles/saudi-fintech-digital-payment-growth-surpasses-2025-goal)
- [World Economic Forum — Middle Eastern Banks AI Makeover](https://www.weforum.org/stories/2025/02/middle-eastern-banks-are-set-for-an-ai-makeover/)
- [Forrester / Freshworks — AI Customer Service ROI](https://www.freshworks.com/How-AI-is-unlocking-ROI-in-customer-service/)
- [a16z — Voice AI Will Change How We Bank (Feb 2025)](https://a16z.com/newsletter/voice-ai-will-change-how-we-bank-february-2025-fintech-newsletter/)
