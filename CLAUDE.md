# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Bushra — Inmaa Bank AI Assistant

**Description:** An AI assistant that helps Inmaa Bank customers interact with the app via voice or chat to perform banking activities including money transfers, investments, invoices, and more.
**Status:** Active POC — primary stakeholder is Inmaa (Alinma) Bank.

This repo is a **deliverables workspace**, not a traditional code project. Work here produces product documents (PRD, pitch decks, briefs) and a self-contained HTML prototype. There is no build system, package manager, or test suite — treat "the codebase" as the knowledge base plus the prototype HTML.

---

## Knowledge Base — read before generating anything

All shared project context lives in `knowledge-base/`. **Before generating any document, read every file in `knowledge-base/` to load context.** If something is unclear, check the knowledge base first, then ask — do not assume.

The knowledge base accepts mixed file types directly (no conversion):

| Type | Notes |
|------|-------|
| `.md` images | Read directly |
| `.docx`, `.pdf`, `.pptx`, `.xlsx` | Reference by name; ask user to point to specific sections if needed |

The current KB includes `BRD_Noura_Alinma_Hackathon_v0.3.pdf` (business requirements) and `README.md` (conventions for the KB itself).

To add knowledge, drop any file into `knowledge-base/` with a descriptive name (e.g. `stakeholder-decisions.md`, `compliance-notes.md`).

---

## Document deliverables

| Output | Folder | Notes |
|--------|--------|-------|
| Word (.docx) | `docs/` | Keep the markdown source next to the export |
| PowerPoint (.pptx) | `slides/` | Keep the markdown source next to the export |
| Markdown source | same folder as export | e.g. `docs/prd.md` sits with `docs/Bushra-PRD.docx` |

Existing deliverables to be aware of: `docs/prd.md` + `Bushra-PRD.docx/.pdf`, `docs/pitch-deck-content.md`, and the Arabic hackathon deck at the repo root (`عرض فريق بشرى ـ هكاثون امد ٢٠٢٦.pptx/.pdf`). When updating a deliverable, edit the markdown source and re-export — do not edit the binary formats directly.

---

## HTML Prototype

Two standalone HTML files demo the assistant UI:

- `Bushra - Alinma Bank Prototype.html` (root copy)
- `Bushra AI assistant prototype/Bushra - Alinma Bank Prototype.html` (working folder with screenshots, uploads, and `support.js`)

`support.js` is a **generated** file — the banner reads `GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with cd dc-runtime && bun run build`. The `dc-runtime` source is not in this repo, so treat `support.js` as read-only. To view the prototype, open the HTML file directly in a browser (no server needed).

---

## Product scope (informs document tone and feature choices)

- **Core capabilities:** money transfers (local + international), investments/portfolio, invoices, account inquiries, general banking navigation
- **Channels:** voice (natural language) and chat — both must be supported
- **Constraints:** banking regulations and data privacy (SAMA/NCA context lives in the KB)
- **Language:** deliverables are commonly bilingual (Arabic + English). When writing Arabic UX/microcopy, use the `ux-araby` skill.
