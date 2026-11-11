# Platform adapter contracts

The TypeScript contracts in `src/platform/contracts.ts` define the provider-neutral boundary for authentication, canonical site-document persistence, object storage and integration-secret storage.

## Current adapter

`src/platform/localSiteRepository.ts` wraps the existing IndexedDB/localStorage site persistence. It is explicitly a prototype adapter:
- It has no cloud sync or authentication.
- It has no workspace authorization or multi-device concurrency.
- It reports a null revision.
- It refuses revision-guarded saves rather than claiming conflict protection it cannot provide.

## Rules for future adapters

1. Implement the contracts in a trusted server-backed layer where credentials and authorization can be enforced.
2. Never place provider SDK objects or secrets in `SiteDocument`.
3. Verify workspace and site ownership on every server request; browser-supplied IDs are not proof of access.
4. Implement optimistic concurrency in the cloud repository using the expected revision.
5. Keep object-storage upload intent creation and finalization server-authorized.
6. Store integration credentials in a server-side secret vault; expose only opaque references.
7. Keep UI components dependent on service contracts rather than importing vendor SDKs.
8. Add contract tests for every provider adapter before switching production traffic.

These contracts are foundations, not a live backend. The database/auth/storage provider remains intentionally undecided pending the external platform.
