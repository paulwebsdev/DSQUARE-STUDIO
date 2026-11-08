# DSQUARE STUDIO

A private, AI-assisted website creation studio for building websites for clients.

## Product direction

DSQUARE STUDIO is intended to support **all kinds of websites** through an extensible system. The product will combine:

- Template-based website creation
- A visual drag-and-drop editor
- AI-assisted website generation
- Client and project management
- Responsive previews for desktop, tablet and mobile
- Website export and online publishing

## Design direction

- Premium black-and-gold visual identity
- Responsive interface designed for desktop and mobile use
- Hybrid editor: professional panels, focused canvas and guided workflows
- Private, single-owner access; public registration is not part of the plan

## Current status

**Phase 1 — Foundation:** project documentation and the first dashboard interface.

The dashboard at this stage is a frontend foundation, not a complete production service. Authentication, persistent storage, AI provider integration, export and publishing will be implemented in later phases.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md), and [docs/ROADMAP.md](docs/ROADMAP.md).

## Local development

```bash
npm install
npm run dev
```

## Important

Do not add API keys, passwords, private tokens, or other secrets to source files or commit history. Production secrets must be stored in secure environment variables or a suitable secrets manager.
