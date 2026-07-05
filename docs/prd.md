# Bushra — AI Banking Assistant Product Requirements Document (PRD)

**Product Name:** Bushra — AI Banking Assistant for Alinma Bank
**Date:** June 9, 2026
**PRD Title:** PRD for Bushra — AI Banking Assistant
**Author:** Abdulelah Alkesaiberi
**Status of PRD:** Draft

---

## Team

| Role | Name |
|------|------|
| Product Manager | Abdulelah Alkesaiberi |
| Speech & Voice (ASR / TTS) | Saud |
| LLM & Conversational AI | Abdulkarim |
| Mobile App (Demo & Integration) | Abdurahman |
| Approvers / Sign-Off | TBD |

---

## Overview

Saudi retail banking has entered a decisive inflection point: customers are fully digital, yet the experience still forces them through the same fragmented menus and multi-step forms that were designed for desktop browsers. Bushra is an AI-powered voice and chat banking assistant embedded inside the Alinma Bank mobile application — the first assistant in the Saudi banking market that does not just answer questions, but actively executes transactions, manages banking products, and anticipates financial needs before the customer articulates them.

What separates Bushra from conventional chatbots is its behavioral intelligence layer. By continuously analyzing transaction history, balance patterns, and spending behavior, Bushra identifies financial opportunities — such as idle recurring balances — and proactively recommends actionable transfers into Alinma's pre-defined savings programs. This transforms the assistant from a reactive service channel into a proactive financial companion, directly aligned with Alinma Bank's positioning as a customer-first digital bank and Saudi Vision 2030's goal of deepening financial inclusion and literacy across the Kingdom.

---

## Problem

*(User Researcher perspective)*

Alinma Bank customers today interact with one of Saudi Arabia's most capable digital banking apps — yet the experience still demands that the customer know where to go, what to tap, and how to navigate a hierarchy of menus to complete everyday tasks. A customer who says "حول 250 ريال لأحمد" (transfer 250 SAR to Ahmed) must instead open the app, find the transfer section, select the right beneficiary, enter the amount, confirm with OTP, and wait for a receipt. That same customer, if they want to pay their electricity bill, starts the journey all over again from a different menu.

The problem is not that banking apps are bad. The problem is that they were built for navigation, not for conversation. As a result:

- **Frequent tasks feel slow and effortful.** Customers who transfer money or pay bills weekly repeat the same journey every single time, with no shortcut and no memory.
- **Financial opportunities go unnoticed.** A customer who consistently leaves 1,000 SAR idle at month-end has no mechanism to know that Alinma offers a savings program that could generate a return on that amount — unless they seek it out proactively.
- **The bank is reactive by design.** Every interaction is customer-initiated. The app never surfaces a suggestion, a reminder, or a personalized prompt — it waits to be used.
- **Voice is unused despite being natural.** Saudi customers already interact with voice assistants daily, yet their bank has no voice interface. The gap between what feels natural in daily life and what the bank app offers is widening.

Bushra solves all four dimensions: it makes frequent tasks conversational and fast, surfaces savings opportunities proactively, and introduces a voice-first interaction model that meets customers where they already are.

---

## Objectives

- **Replace fragmented banking app journeys** with a single voice and chat interface that completes tasks end-to-end — balance check, transfers, bill payments, card management, and digital product applications — without manual navigation through menus.
- **Activate behavioral financial intelligence** by analyzing customer transaction history and balance patterns to proactively recommend and execute transfers into Alinma Bank pre-defined savings programs, with explicit customer consent.
- **Deliver a fully functional hackathon demo** that demonstrates production-grade capability — voice interaction, task execution, security confirmation, and behavioral intelligence — establishing Bushra as a credible production-ready blueprint for Alinma Bank.

---

## Constraints

- **One-month delivery window.** The hackathon demo deadline is July 9, 2026. All six MVP features must be functional and demonstrable within this timeline.
- **Mock data environment.** Bushra will operate on generated mock banking data (transactions, balances, beneficiaries, bills, products) for the hackathon. Real Alinma Bank API integration is out of scope for this phase.
- **Savings scope limited to Alinma pre-defined programs.** Behavioral recommendations are restricted to moving idle funds into Alinma savings accounts. Stock market investments, mutual funds, and third-party financial products are explicitly out of scope.

---

## Persona

*(User Researcher perspective)*

| Persona | Description |
|---------|-------------|
| **Key Persona — Everyday Alinma Customer** | A retail banking customer aged 25–45, fluent in Arabic, who uses the Alinma Bank app daily or weekly for transfers, bill payments, and balance checks. Tech-comfortable but time-poor. Prefers to complete tasks quickly without navigating menus. Uses voice interfaces in daily life (e.g., Siri, Google Assistant) but has never had a voice option in their bank. |
| **The Passive Saver** | A customer who consistently maintains a recurring idle balance at month-end — typically SAR 500–2,000 — without actively placing it in a savings product. Not financially passive by choice, but lacks a prompt or mechanism to act. Responds well to proactive suggestions when framed as simple one-tap decisions. |
| **The Frequent Transactor** | A customer who makes 3–6 transfers or bill payments per week. For them, banking app friction is a daily annoyance. They stand to gain the most from a voice-first interface that converts a 5-step journey into a 10-second conversation. |

---

## Use Cases

### Scenario 1 — Instant Voice Transfer

Reem opens the Alinma app and taps the Bushra button. She says: *"حولي 300 ريال لمحمد."* Bushra identifies the intent, retrieves Mohammed from her saved beneficiaries, displays a transaction summary on screen, reads it aloud, and asks for confirmation. Reem says *"نعم"*, authenticates with Face ID, and receives a voice confirmation with a reference number — all within 25 seconds.

### Scenario 2 — Proactive Savings Recommendation

At the start of the month, Bushra detects that Khalid has ended each of the last three months with approximately SAR 1,200 in his current account — idle and earning nothing. Bushra surfaces a prompt: *"لاحظت أنك تحتفظ بحوالي 1,200 ريال كل شهر دون استثمار. برنامج الادخار من الإنماء يمنحك 2% سنوياً. تريد أحوّل؟"* Khalid says yes, confirms with OTP, and the funds move to his Alinma savings account. No navigation. No research. One conversation.

### Scenario 3 — Bill Payment with Missing Information

Saad says: *"سددي فاتورة الكهرباء."* Bushra detects the intent but finds two active electricity accounts. She asks: *"عندك فاتورتين — الحساب الرئيسي والحساب الفرعي. أيهما؟"* Saad clarifies. Bushra fetches the outstanding bill (SAR 186), presents the summary, confirms with Face ID, and executes payment — handling the ambiguity gracefully rather than failing or defaulting silently.

---

## Features In MVP

### 1. Account & Transaction Inquiry

Bushra responds to natural voice or text queries about account balances and recent transactions. She reads the balance aloud using the customer's name, shows the last 5 transactions with merchant name, amount, and date, and offers to search by category or date range. Sensitive account numbers are masked in all voice output.

### 2. Secure Money Transfer

Bushra initiates a transfer to a saved beneficiary based on a voice command. She resolves ambiguity by asking for clarification if the beneficiary name is unclear or multiple matches exist. Before execution, she presents a full summary (beneficiary, amount, source account) and requires explicit confirmation. Authentication is performed via Face ID or OTP scaled to transaction risk level. A receipt with reference number is delivered in-app and read aloud.

### 3. Bill Payment

Bushra fetches pending recognized bills (SADAD-linked) and presents them for payment by voice. The customer can request payment by biller name. Bushra displays the bill amount, biller, and due date, confirms with the customer, authenticates, executes, and delivers a receipt. If the bill requires an account number the system doesn't hold, Bushra asks the customer to provide it.

### 4. Card Management

Bushra handles card freeze, unfreeze, and replacement requests by voice. For freeze/unfreeze, she confirms the action and its implications before executing. For replacement requests, she verifies identity, confirms the delivery address, and initiates the issuance request. Emergency freeze is executed with a single voice command followed by immediate confirmation — no extra steps.

### 5. Digital Products (Consultative)

Bushra handles inquiries and application initiation for Alinma digital products: travel card, personal financing, and sub-account opening. She explains general eligibility and terms in plain language, collects the basic required information through conversation, and either initiates the application within the app or sends the customer a direct deep-link to complete it. Full application processing is not executed in the demo — the focus is on intake and handoff.

### 6. Behavioral Savings Recommendation

Bushra monitors mock transaction and balance data to detect recurring idle balances at month-end. When a pattern is identified (e.g., SAR 800–1,500 sitting unused for 3+ consecutive months), Bushra proactively surfaces a savings recommendation tied to a specific Alinma savings program, including the applicable rate. With a single voice confirmation from the customer and OTP authentication, Bushra executes the transfer to the savings account. No stock market, mutual fund, or third-party product is ever suggested.

---

## Features Next Phase

### Proactive Bill Reminders

Bushra monitors upcoming bill due dates and sends a push notification with a voice prompt: *"فاتورة STC بكرة — تبي أسددها؟"* Deferred to Phase 2 as it requires notification infrastructure and background session capabilities beyond the hackathon demo scope.

### Spending Categorization & Monthly Summary

A monthly voice summary of spending by category (dining, utilities, transfers, etc.) with comparison to the prior month. Deferred because it requires NLP classification over transaction descriptions — a post-hackathon ML pipeline.

### Multi-Language Support (Arabic + English)

Support for English and mixed Arabic-English (code-switching) within the same session. The hackathon demo is Arabic-first. English can be layered in Phase 2 once the Arabic model is stable.

### Human Agent Handoff with Context Transfer

When Bushra cannot resolve a request or detects high-risk behavior, she transfers the customer to a live agent and passes full session context — intent, steps taken, account details — so the customer does not repeat themselves. The handoff trigger exists in MVP but context transfer to a live agent system is a Phase 2 integration.

### Investment Beyond Savings (Stocks, Funds)

Expansion of the behavioral recommendation engine to include Alinma investment products (mutual funds, portfolios). Deferred — requires regulatory alignment and a more sophisticated risk profiling layer.

---

## Design

Figma file: To be added — mockup of Bushra's chat/voice interface within the Alinma app shell. Expected by Week 2 of development (June 23, 2026).

---

## Technical Architecture

**Architecture blueprint (subject to team finalization):**

| Component | Role | Candidate Technology |
|-----------|------|---------------------|
| ASR | Convert customer voice to text (Arabic, Saudi dialect) | Whisper API (OpenAI) / Azure Speech |
| TTS | Convert Bushra's responses to natural Arabic voice | ElevenLabs / OpenAI TTS |
| LLM + NLU | Understand intent, manage dialog, extract entities | GPT-4o / Claude 3.5 Sonnet |
| Agent Framework | Execute actions via tool calls (not just responses) | Function Calling / Tool Use over LLM |
| API Orchestrator | Route confirmed requests to mock banking APIs | Custom middleware (mock layer) |
| Security & Risk | Confirmation enforcement, fraud signal detection | Rule-based in demo; expandable |
| Mobile Demo Shell | App interface hosting Bushra's voice/chat window | Flutter / React Native |

Full technical approach document: to be owned by Abdulkarim (LLM) and Saud (Speech) — due June 20, 2026.

---

## Success Metrics

- **End-to-end task completion in under 60 seconds** for a voice-initiated transfer, bill payment, or card action — from first utterance to receipt delivery including confirmation and authentication.
- **Intent understanding accuracy ≥ 85%** across all 6 service categories during demo conditions, measured against a pre-defined test set of 30+ voice commands in Arabic (including Saudi dialect variations).
- **Behavioral savings recommendation triggers and executes correctly** for at least 3 distinct mock customer profiles with varying idle balance patterns — demonstrating that the intelligence layer generalizes, not just responds to a single scripted scenario.

---

## Feature Timeline and Phasing

| Feature | Status | Target Date |
|---------|--------|-------------|
| Core infrastructure: ASR + TTS + LLM agent loop | Planned | June 20, 2026 |
| Account & Transaction Inquiry | Planned | June 23, 2026 |
| Secure Money Transfer | Planned | June 27, 2026 |
| Bill Payment | Planned | June 27, 2026 |
| Card Management | Planned | July 1, 2026 |
| Digital Products (Consultative) | Planned | July 1, 2026 |
| Behavioral Savings Recommendation | Planned | July 4, 2026 |
| Mock data generation + API layer | Planned | June 20, 2026 |
| Mobile demo shell (Alinma app simulation) | Planned | July 4, 2026 |
| End-to-end integration + demo rehearsal | Planned | July 7, 2026 |
| **Hackathon Demo Submission** | **Planned** | **July 9, 2026** |
