# DSQUARE STUDIO

A private, browser-based website creation studio for building websites for clients.

## Product direction

DSQUARE STUDIO is designed to support many website categories through an extensible template and site-document architecture. The workspace includes:

- A template library with 21 categories and 10 named starter options per category (210 options).
- A visual editor with editable sections and components, responsive device modes, media tools, page management and preview.
- A local AI-builder brief flow that creates an editable starter draft. It does **not** currently call a real AI model.
- Client and project management.
- Website ZIP export with HTML, CSS, JavaScript, packaged images and a manifest.
- Workspace JSON backup and restore.

## Design direction

- Premium black-and-gold visual identity.
- Responsive interface designed for desktop and mobile.
- Hybrid editor with professional panels, a focused canvas and guided workflows.
- Private, single-owner studio direction; public registration is not part of the product plan.

## Current implementation status

This is an actively developed **frontend prototype**, deployed through GitHub Pages. Project records, client records and editable website documents are stored in the current browser's local storage. They are not cloud-synced, and clearing browser site data can remove them. Use Settings to download a workspace backup regularly.

Website ZIP export packages the current design, but production forms, payments, databases, bookings, hosting integrations and other connected services still require separate implementation. Direct online publishing is not yet connected.

The AI-builder and AI Edit interfaces currently use local draft/command logic. A real AI provider requires a secure server-side backend; API keys must never be placed in this frontend repository.

Owner-only authentication is a product requirement, but secure server-side authentication is not yet implemented. Do not treat the public GitHub Pages prototype as a secured private production workspace.

See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md), and [docs/AI-PROVIDER-ADAPTER.md](docs/AI-PROVIDER-ADAPTER.md).

## Local development

```bash
npm install
npm run dev
npm run build
```

## Security

Never commit API keys, passwords, private tokens, client records or other secrets. Production secrets must be stored server-side in secure environment variables or a suitable secrets manager.
