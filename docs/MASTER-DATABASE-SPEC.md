# DSQUARE STUDIO — Master Database Specification

**Status:** Architecture blueprint — approved direction, not yet implemented  
**Version:** 1.0  
**Last updated:** 2026-11-11

## 1. Purpose and implementation boundary

This document defines the provider-neutral data model, relationships, API boundaries, security requirements, storage rules and migration strategy for the next DSQUARE STUDIO capabilities.

The selected feature scope is:

1. Dynamic CMS
2. Media Library
3. Global Components
4. Form Builder
5. E-commerce Engine
6. SEO Manager
7. Website Analytics
8. Integrations Centre
9. Reusable Design Library
10. Website Version Control

The Form Builder requires a secure destination for form submissions. This specification includes storing submissions and basic delivery status as supporting infrastructure; it does **not** silently add a separate submissions-management product/dashboard to the selected feature scope.

This is a design specification only. It does not mean a cloud database, authentication provider, object storage, API server or any of the ten features has been connected. The current GitHub Pages application remains a browser-local prototype. Provider selection remains deferred until the external platform being developed by the owner's contact is ready.

## 2. Architectural principles

- **Provider-neutral:** define interfaces and portable data contracts before choosing a database vendor.
- **Workspace isolation:** every private record is scoped to a workspace, directly or through a parent record.
- **One canonical site document:** Visual Editor and Code Studio operate on the same versioned `SiteDocument`; neither maintains a competing copy.
- **Structured plus flexible data:** use relational columns for identity, ownership, relationships, status and queryable values; use validated JSON for extensible schemas and editor documents.
- **Portable content:** site documents contain serializable data and asset references, never provider SDK objects, executable functions, credentials or large binary payloads.
- **Server-side authority:** authentication, permissions, payment verification, integration secrets and publishing credentials are enforced on the server.
- **Migrations first:** every persistent schema change is versioned and reversible where practical.
- **Incremental adoption:** preserve current browser-local projects and site documents during eventual cloud migration.

## 3. Entity relationship overview

```text
WORKSPACE
  ├── MEMBERS / USERS
  ├── CLIENTS
  │    └── PROJECTS
  │         └── SITES
  │              ├── SITE DOCUMENTS / PAGES
  │              ├── CMS COLLECTIONS ── CMS ENTRIES ── ENTRY VERSIONS
  │              ├── MEDIA ASSETS ── MEDIA FOLDERS
  │              ├── GLOBAL COMPONENTS
  │              ├── DESIGN LIBRARY ITEMS ── DESIGN VERSIONS
  │              ├── FORMS ── FORM FIELDS ── FORM SUBMISSIONS
  │              ├── PRODUCTS ── VARIANTS / CATEGORIES / INVENTORY
  │              │     └── ORDERS ── ORDER ITEMS ── PAYMENT EVENTS
  │              ├── SEO SETTINGS
  │              ├── ANALYTICS EVENTS / DAILY AGGREGATES
  │              ├── INTEGRATIONS ── SECRET REFERENCES / LOGS
  │              └── SITE VERSIONS ── RESTORE HISTORY
  └── AUDIT LOGS
```

A site belongs to a project; a project belongs to a workspace. Client association is optional so internal/demo projects can exist without a client. All child records must be authorised through their owning workspace and site.

## 4. Data conventions

Recommended portable SQL conventions (exact syntax is adapted by the selected provider):

- Primary keys: UUID.
- Timestamps: UTC, timezone-aware `created_at` and `updated_at`.
- Ownership: `workspace_id` on workspace-owned records; `site_id` on site-scoped records.
- Soft deletion: `deleted_at` only where recovery/audit requirements justify it; do not soft-delete payment or security facts to hide history.
- Status fields: constrained enumerations or validated strings with documented allowed values.
- JSON: use a JSON-capable column for schema definitions, settings and site documents; validate at the service boundary.
- Money: integer minor units plus ISO 4217 currency code; never floating-point arithmetic.
- Slugs: unique within their parent scope, with reserved route names checked by the service.
- Indexes: every foreign key, common filter, unique scoped slug and time-series query path.
- Concurrency: use an explicit revision/version number or ETag for mutable documents to prevent silent overwrite.

## 5. Core workspace and website tables

### `users`
- `id` UUID PK
- `email` normalized unique identity
- `display_name`
- `auth_subject` unique reference from the chosen authentication provider
- `status`, `created_at`, `updated_at`

Passwords are not stored in this application table. Authentication provider owns password hashing, MFA and credential recovery.

### `workspaces`
- `id` UUID PK
- `name`
- `owner_user_id` FK users
- `settings_json`
- `created_at`, `updated_at`

### `workspace_members`
- `id` UUID PK
- `workspace_id` FK workspaces
- `user_id` FK users
- `role` (owner, admin, editor, viewer; enable only roles actually supported)
- `created_at`
- Unique (`workspace_id`, `user_id`)

The first release can remain owner-only while this table provides a controlled future path to team access.

### `clients`
- `id` UUID PK
- `workspace_id` FK workspaces
- `name`, `email`, `phone`, `company`
- `notes` (access controlled)
- `created_at`, `updated_at`, optional `deleted_at`

### `projects`
- `id` UUID PK
- `workspace_id` FK workspaces
- `client_id` nullable FK clients
- `name`, `category`, `status`
- `created_at`, `updated_at`

### `sites`
- `id` UUID PK
- `workspace_id` FK workspaces
- `project_id` FK projects
- `name`, `primary_domain` nullable
- `status` (draft, ready, published, archived)
- `schema_version` integer
- `current_revision` integer
- `created_at`, `updated_at`

### `site_documents`
- `id` UUID PK
- `workspace_id`, `site_id` FK sites
- `document_json` validated serializable SiteDocument
- `revision` integer
- `created_by` FK users nullable
- `created_at`, `updated_at`
- Unique (`site_id`, `revision`)

The canonical current document is identified by the site's current revision. Implementations may keep a current-document row plus immutable snapshots, but must expose one consistent read/write contract to both editors.

### `site_pages`
A query/index projection of page metadata, not a competing page-content store:
- `id` UUID PK (stable page ID from the site document)
- `workspace_id`, `site_id` FK sites
- `name`, `slug`, `is_home`, `sort_order`, `status`
- `seo_settings_id` nullable FK seo_settings
- Unique (`site_id`, `slug`)

Page structure and section/component content remain in the canonical versioned site document unless a later measured requirement justifies a migration.

## 6. Dynamic CMS tables

### `cms_collections`
- `id` UUID PK, `workspace_id`, `site_id`
- `name`, `slug`, `description`
- `schema_json` validated field definitions
- `status`, `created_at`, `updated_at`
- Unique (`site_id`, `slug`)

### `cms_entries`
- `id` UUID PK, `workspace_id`, `site_id`, `collection_id`
- `title`, `slug`, `data_json`
- `status` (draft, published, archived)
- `published_at`, `created_at`, `updated_at`
- Unique (`collection_id`, `slug`)

### `cms_entry_versions`
- `id` UUID PK, `workspace_id`, `entry_id`
- `revision`, `data_json`, `created_by`, `created_at`
- Unique (`entry_id`, `revision`)

Field types must be explicitly validated (text, rich text, number, boolean, date/time, reference, asset, list, URL, etc.). Never execute arbitrary schema-provided code. Reference and asset fields store IDs, not embedded provider objects.

## 7. Media Library tables

### `media_folders`
- `id` UUID PK, `workspace_id`, `site_id`
- `parent_folder_id` nullable self-FK
- `name`, `created_at`, `updated_at`

### `media_assets`
- `id` UUID PK, `workspace_id`, `site_id`
- `folder_id` nullable FK media_folders
- `storage_key`, `storage_provider` adapter identifier
- `file_name`, `mime_type`, `size_bytes`
- `width`, `height`, `alt_text`, `metadata_json`
- `created_at`, `updated_at`, optional `deleted_at`

Binary data lives in private object storage, not database rows. Use signed, short-lived upload/download URLs, validate MIME type and file size server-side, scan where supported, and never trust the browser-supplied filename or content type. Keep legacy data-URL assets readable during migration; convert them to managed objects before production and update references safely.

## 8. Reusable components and design library

### `global_components`
- `id` UUID PK, `workspace_id`, `site_id`
- `name`, `component_type`, `document_json`
- `revision`, `created_at`, `updated_at`

### `design_library_items`
- `id` UUID PK, `workspace_id`
- `site_id` nullable (null means workspace-wide)
- `name`, `category`, `description`, `preview_asset_id` nullable FK media_assets
- `design_json`, `created_at`, `updated_at`

### `design_library_versions`
- `id` UUID PK, `workspace_id`, `design_item_id`
- `revision`, `design_json`, `created_at`

Reusable items must use the same supported component/section schema as the editor. Inserting a library item should create fresh node IDs so independent copies do not share accidental identity. Global components may be linked instances or detached copies; the editor must make that distinction visible.

## 9. Form Builder and submission storage

### `forms`
- `id` UUID PK, `workspace_id`, `site_id`
- `name`, `form_schema_json`, `success_message`
- `status`, `created_at`, `updated_at`

### `form_submissions`
- `id` UUID PK, `workspace_id`, `site_id`, `form_id`
- `payload_json` validated against the form schema
- `delivery_status`, `created_at`, `processed_at`
- Optional abuse controls: hashed/rate-limit key, spam score, retention expiry

Submission endpoints require server-side validation, rate limiting, spam protection and configurable retention. Do not log full submission payloads by default. Sensitive fields require stricter access and retention rules. Email/CRM delivery occurs through integration adapters. A separate submissions dashboard remains outside the currently selected ten-feature scope unless approved later.

## 10. E-commerce tables

### `product_categories`
- `id` UUID PK, `workspace_id`, `site_id`
- `name`, `slug`, `parent_id` nullable self-FK

### `products`
- `id` UUID PK, `workspace_id`, `site_id`
- `name`, `slug`, `description`, `status`
- `currency`, `price_minor`, `category_id` nullable
- `metadata_json`, `created_at`, `updated_at`

### `product_variants`
- `id` UUID PK, `workspace_id`, `product_id`
- `sku`, `options_json`, `price_minor` nullable
- `currency`, `active`

### `inventory`
- `id` UUID PK, `workspace_id`, `variant_id`
- `quantity_available`, `quantity_reserved`, `updated_at`

### `carts` and `cart_items`
- Cart: `id`, `workspace_id`, `site_id`, opaque session/customer reference, `currency`, timestamps.
- Item: `id`, `cart_id`, `product_variant_id`, `quantity`, price snapshot.

### `orders`
- `id` UUID PK, `workspace_id`, `site_id`
- `order_number`, `status`, `currency`, `subtotal_minor`, `tax_minor`, `shipping_minor`, `total_minor`
- `customer_json` (minimum required personal data)
- `payment_status`, `created_at`, `updated_at`

### `order_items`
- `id` UUID PK, `order_id`
- `product_id` nullable, `variant_id` nullable
- `name_snapshot`, `sku_snapshot`, `quantity`, `unit_price_minor`, `line_total_minor`

### `payment_events`
- `id` UUID PK, `workspace_id`, `order_id`
- `provider`, `provider_event_id`, `event_type`, `status`, `verified_at`, `created_at`
- Unique (`provider`, `provider_event_id`)

Prices and item descriptions are snapshotted at order time. Payment webhooks must be signature-verified and idempotent. Never store PAN/card numbers, CVV or raw payment credentials. Refunds, taxes, shipping, fulfilment and inventory reservation rules must be explicit before enabling live checkout.

## 11. SEO tables

### `seo_settings`
- `id` UUID PK, `workspace_id`, `site_id`
- `page_id` nullable (null can represent site defaults)
- `title`, `description`, `canonical_url`
- `robots_json`, `open_graph_json`, `social_image_asset_id` nullable FK media_assets
- `updated_at`

Enforce one settings record per site default or page scope. Sitemap and robots output must be generated from published routes, not draft content.

## 12. Analytics tables

### `analytics_events`
- `id` UUID PK, `workspace_id`, `site_id`
- `event_name`, `occurred_at`, `page_path`
- `anonymous_visitor_id` pseudonymous identifier
- `session_id` nullable, `properties_json` allowlisted
- `consent_state`, `source`

### `analytics_daily`
- `id` UUID PK, `workspace_id`, `site_id`
- `date`, `metric_name`, `dimension_key`, `value`
- Unique on site/date/metric/dimension.

Define data minimisation, consent and retention before collection. Avoid collecting sensitive form contents, full IP addresses or unnecessary device fingerprints. Aggregation and deletion jobs should be designed for expected event volume; high-volume analytics may later use a dedicated analytics store behind the same service contract.

## 13. Integrations tables

### `integrations`
- `id` UUID PK, `workspace_id`, `site_id` nullable
- `provider_key`, `display_name`, `status`, `config_json`
- `connected_by`, `created_at`, `updated_at`

### `integration_secret_refs`
- `id` UUID PK, `integration_id`
- `secret_manager_key` opaque reference only
- `created_at`, `rotated_at`

### `integration_logs`
- `id` UUID PK, `workspace_id`, `integration_id`
- `event_type`, `status`, `redacted_summary`, `created_at`

OAuth tokens, API keys and webhook secrets belong in a server-side secret manager or equivalent secure vault. The database stores only a reference. Never return secrets to the browser after connection. Support disconnect, revocation, rotation and redacted diagnostics.

## 14. Website version control

### `site_versions`
- `id` UUID PK, `workspace_id`, `site_id`
- `revision`, `schema_version`, `document_snapshot`
- `label`, `created_by`, `created_at`
- Unique (`site_id`, `revision`)

### `restore_history`
- `id` UUID PK, `workspace_id`, `site_id`
- `source_version_id`, `result_revision`, `restored_by`, `created_at`

Restoring a version creates a **new current revision** from the chosen snapshot; it does not erase later history. Define snapshot frequency, retention limits and storage compression based on real usage. Do not store secrets in snapshots.

## 15. Audit and operational tables

### `audit_logs`
- `id` UUID PK, `workspace_id`, `actor_user_id` nullable
- `action`, `resource_type`, `resource_id`
- `metadata_json` allowlisted and redacted
- `created_at`

Record security-sensitive actions such as sign-in events (without credentials), permission changes, integration connect/disconnect, publishing, order/payment state changes and version restores. Audit logs must not contain passwords, tokens, card data or full form payloads.

## 16. API contracts

The following are logical service routes, not existing endpoints. The implementation may use REST, RPC or another transport, but the same contracts and authorization rules apply.

| Service | Example operations |
|---|---|
| Auth | sign in, sign out, refresh session, get current user |
| Workspaces | get workspace, list members, update settings |
| Clients / Projects | create, list, update, archive |
| Sites | create site, load current document, update settings |
| Site documents | read revision, save with expected revision, create snapshot |
| CMS | create collection, validate schema, query entries, publish entry |
| Media | request upload, finalize upload, list assets, move/delete asset |
| Components | save component, update component, insert into document |
| Design library | save item, search items, create fresh instance |
| Forms | create form, validate schema, accept submission |
| E-commerce | list products, update inventory, create checkout, query orders |
| SEO | read/update site or page metadata, generate sitemap |
| Analytics | ingest allowlisted event, query aggregate metrics |
| Integrations | connect, disconnect, rotate, test connection |
| Versions | list snapshots, create snapshot, restore snapshot |

### Canonical site-document save contract

Request:
```json
{
  "siteId": "uuid",
  "expectedRevision": 12,
  "schemaVersion": 1,
  "document": { "/* validated SiteDocument */": true }
}
```

Successful response:
```json
{
  "siteId": "uuid",
  "revision": 13,
  "savedAt": "2026-11-11T00:00:00Z"
}
```

If the expected revision is stale, return a conflict response with the latest revision metadata; do not silently overwrite another save. The editor should offer reload/compare/retry behavior.

### Standard API behavior

- Use consistent error objects with stable machine-readable codes.
- Validate all input on the server, even if the UI also validates.
- Apply pagination and bounded query sizes.
- Use idempotency keys for checkout, payment webhook handling and other retryable mutations.
- Use optimistic concurrency for documents and versioned resources.
- Avoid exposing internal database errors or secret values.
- Enforce rate limits on authentication, public forms, uploads and checkout endpoints.

## 17. Authorization and tenant isolation

- Resolve the authenticated user on the server for every private request.
- Check workspace membership and role before reading or changing a record.
- Verify the full ownership chain for nested resources (for example submission → form → site → workspace).
- Never trust a client-supplied `workspace_id`, `site_id`, role or owner ID without verifying it against authenticated membership.
- Apply row-level security where supported, with server-side service checks as a second boundary.
- Public website rendering may read only explicitly published, public-safe fields.
- Public form submission and checkout endpoints must expose narrowly scoped operations, never general database access.
- Use least-privilege service credentials and separate public/server secrets.
- Test cross-workspace access denial for every resource family.

## 18. File and asset lifecycle

1. Client requests an upload intent from the authenticated API.
2. Server checks workspace/site permission, allowed file type and size.
3. Server issues a short-lived signed upload URL for a generated storage key.
4. Client uploads directly to object storage.
5. Server verifies object metadata and finalizes a media record.
6. Site documents and CMS entries reference the media asset ID.
7. Deletion checks references and uses safe archival/retention before physical removal.
8. Export resolves asset IDs and packages portable files with rewritten relative paths.

## 19. Migration and compatibility plan

1. Keep the current `SiteDocument` schema version and add explicit document migration functions before changing its shape.
2. Define a provider-neutral repository interface for projects, clients, site documents and assets.
3. Keep the existing IndexedDB/localStorage adapter working as the prototype and fallback during development.
4. Add a cloud adapter only after the external platform's authentication, database and storage contracts are known.
5. Build an opt-in migration/import path that validates browser backup JSON, maps stable IDs, uploads assets and reports failures.
6. Do not delete browser-local data until cloud writes and read-back verification succeed and the owner confirms migration.
7. Use expand/migrate/contract database migrations: add compatible fields/tables, backfill, switch reads/writes, then remove obsolete structures only after verification.
8. Test migration against copies of real project backups and older schema versions.

## 20. Backup, recovery and observability

- Establish automated database backups and object-storage recovery/versioning with documented retention.
- Test restoration, not merely backup creation.
- Define recovery point and recovery time objectives before production launch.
- Monitor API errors, latency, queue failures, storage failures, webhook retries and backup jobs.
- Use correlation IDs for requests while keeping logs free of secrets and sensitive payloads.
- Provide a data export path for workspace projects, site documents and owned media.
- Document deletion and retention behavior for clients, submissions, orders and analytics.

## 21. Testing acceptance criteria

Before production activation, verify:

- A user cannot access another workspace's projects, sites, media, CMS entries, forms, orders, analytics or versions.
- Visual Editor and Code Studio load and save the same canonical document.
- Stale document saves are rejected without data loss.
- Old site documents migrate without losing pages, sections, components or assets.
- Upload validation rejects disallowed types and oversized files.
- Deleted or moved media does not silently break published sites.
- CMS schema validation rejects invalid field values and unsafe content.
- Public form endpoints resist spam and rate abuse.
- Payment webhooks are signature-verified and idempotent.
- Integration secrets never appear in browser responses, site documents, exports or logs.
- Version restore creates a new revision and preserves prior history.
- Backup restore is exercised successfully.
- Production build, automated tests, accessibility review and security review pass.

## 22. Decisions still intentionally open

These cannot be finalised responsibly until the external platform and operational requirements are known:

- Database provider and exact SQL dialect.
- Authentication provider and session implementation.
- Object storage provider, region and retention settings.
- API hosting/runtime and deployment environment.
- Payment providers, supported currencies and country-specific checkout requirements.
- Email/CRM/analytics integration providers.
- Analytics consent model and event retention.
- Backup retention and recovery objectives.
- Team roles and whether multi-user access is enabled in the first cloud release.

Do not invent provider credentials, add a vendor SDK or deploy a cloud integration before these decisions are confirmed.

## 23. Recommended delivery sequence

**Foundation**
1. Confirm external platform contracts and provider capabilities.
2. Implement authentication and workspace authorization.
3. Implement projects, sites, canonical site-document persistence and migrations.
4. Implement managed media storage and browser-local migration.

**Selected features**
5. Dynamic CMS.
6. Global Components and Reusable Design Library.
7. Form Builder and secure submission endpoint.
8. E-commerce Engine, including verified payment lifecycle.
9. SEO Manager.
10. Integrations Centre.
11. Website Analytics.
12. Website Version Control (snapshot primitives should be introduced with canonical document persistence, with the full UI delivered in this phase).

The feature delivery order may be adjusted after provider capabilities and dependencies are confirmed, but security, canonical document persistence and migration safety must precede production feature activation.

## 24. Current implementation status

As of this specification:
- The existing application has browser-local project/client/site persistence.
- The v1 serializable site document is implemented.
- The Visual Editor, Code Studio, template library and ZIP export are frontend capabilities.
- The existing media library is browser-local and must move to managed storage before production.
- Cloud database, production authentication, server-side APIs, secure form handling, live payments, analytics ingestion, secret management and production version storage are not yet implemented in the current `main` branch.

This status section must be updated as features are implemented and verified.
