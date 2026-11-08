# Site document schema (v1)

DSQUARE STUDIO stores a website as a serializable `SiteDocument`, not as hand-written page markup.

## Structure
- A site has versioned metadata, a shared theme and one or more pages.
- A page has a stable ID, name, URL slug, home-page flag and ordered sections.
- A section has a semantic kind, enabled state, styles and ordered components.
- Components have stable IDs, a kind, editable content, styles and visibility.
- IDs are stable across edits so selection, undo/redo and future collaboration can refer to the same node.

## Compatibility rules
1. Increment `schemaVersion` when a breaking document shape change is introduced.
2. Add migrations before loading older documents into a newer editor.
3. Keep the document provider-neutral; storage and hosting adapters live outside this schema.
4. Store only serializable data. Do not put React elements, functions, credentials or provider SDK objects in a site document.
5. Treat user-provided content as untrusted when rendering or exporting.

## Current status
Version 1 and a starter site/page factory are implemented. The canvas, selection model, component palette and property controls are the next editor milestones.
