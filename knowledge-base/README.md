# Knowledge Base — Bushra — Inmaa Bank AI Assistant

This folder is the single source of truth for project context.
Every agent reads and references this folder before generating any document.

## Supported File Types

Drop any of the following into this folder — no conversion needed:

| Type | Examples |
|------|---------|
| **Documents** | `.docx`, `.doc`, `.xlsx`, `.pptx`, `.pdf` |
| **Images** | `.png`, `.jpg`, `.jpeg`, `.webp` — screenshots, diagrams, mockups |
| **Markdown** | `.md` — notes, decisions, quick context |
| **Any other** | Briefs, specs, emails exported as PDF, research papers |

## How Agents Use This Folder

When you run any document command, the agent is instructed to read everything in this folder first. For files it can open directly (markdown, images), it reads them. For Office files and PDFs, reference them by name in your conversation if you need the agent to incorporate specific content from them.

## Suggested Files to Add

| File | What to put in it |
|------|-------------------|
| `background.md` | Why Bushra was initiated, who requested it, strategic goals |
| `stakeholder-brief.pdf` | Requirements or brief received from Inmaa Bank |
| `technical-constraints.md` | Infrastructure limits, API access, voice engine, LLM provider |
| `user-personas.md` | Target customer profiles and banking behaviors |
| `app-flows.png` | Screenshots or diagrams of the current Inmaa Bank app |
| `compliance-notes.md` | Regulatory and data privacy requirements (SAMA, NCA, etc.) |
| `meeting-notes.md` | Quick summaries from key meetings |

## Tips

- **Filename clarity matters** — name files descriptively so agents understand what they contain
- **Images are read directly** — screenshots of specs, whiteboard photos, and mockups are all usable
- **No folder structure required** — flat works fine; add subfolders only if the volume warrants it
