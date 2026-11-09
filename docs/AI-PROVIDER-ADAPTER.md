# DSQUARE STUDIO — AI Provider Adapter Contract

## Purpose

Connect a real AI model to the website-generation workflow without tying the studio to one vendor. The browser must never call a model provider with a secret key. All provider requests belong on a trusted server.

## Request flow

1. The authenticated studio owner submits a website brief.
2. The browser sends the brief and permitted project context to the studio backend.
3. The backend authenticates and authorizes the owner, validates input size and allowed options, and applies rate limits.
4. A provider adapter sends a structured generation request using server-held credentials.
5. The backend validates the model response against the versioned `SiteDocument` schema, sanitizes content and rejects unsupported component kinds or unsafe URLs.
6. The validated document is returned to the editor and saved through the selected persistence adapter.

## Provider-neutral interface

The server-side adapter should expose a contract conceptually equivalent to:

```ts
type GenerateSiteInput = {
  brief: string
  brandName?: string
  category: string
  designDirection: string
  requestedPages: string[]
  existingDocument?: SiteDocument
}

type GenerateSiteResult = {
  document: SiteDocument
  warnings: string[]
  provider: string
  model: string
}

interface AiWebsiteProvider {
  generateSite(input: GenerateSiteInput): Promise<GenerateSiteResult>
  reviseSite(input: {
    instruction: string
    document: SiteDocument
    selectedPageId?: string
    selectedSectionId?: string
  }): Promise<GenerateSiteResult>
}
```

This is a design contract, not a browser-side implementation. Import `SiteDocument` from the shared schema package or a server-safe shared module.

## Security requirements

- Keep API keys and provider credentials in server-side environment secrets or a managed secret store only.
- Never commit credentials, embed them in Vite environment variables, or return them to the browser.
- Require authenticated owner authorization on every generation and revision request.
- Validate brief length, category, requested page count, response size and schema version.
- Treat generated text and URLs as untrusted input; sanitize at render/export boundaries.
- Apply request timeouts, rate limits, usage limits and cost monitoring.
- Do not allow model output to execute scripts, inject arbitrary HTML or choose server-side tools.
- Log request identifiers and operational metadata, not secrets or unnecessary client data.

## Validation and failure handling

- Validate the full document before it reaches the editor.
- Enforce unique page, section and component IDs; ensure exactly one home page; ensure unique non-home slugs.
- Enforce supported component kinds and safe style values.
- On provider timeout or invalid output, preserve the existing project and show a recoverable error.
- Keep a provider-independent test suite using a mock adapter.

## Provider selection

No vendor is selected yet. Keep this adapter contract provider-neutral until the backend/hosting platform decision is ready. The current browser draft generator remains a clearly labelled local prototype and must not be represented as a real model call.
