# DSQUARE STUDIO — Export and editor QA checklist

This checklist records repeatable manual checks for the browser prototype. It is not a substitute for automated tests or real-device testing.

## Editor and preview
- [ ] Open a project and confirm its saved page and section content loads.
- [ ] Switch Desktop, Tablet and Mobile previews; confirm the canvas remains usable and scrollable.
- [ ] In Preview mode, single-click a text, heading, button or container to select it; double-click to edit; blur to save the change.
- [ ] Scroll vertically while Preview mode is open, including on a narrow/mobile viewport.
- [ ] Add, rename, duplicate and delete a non-home page; confirm the home page and final page cannot be deleted.
- [ ] Reorder sections with mouse drag, keyboard Alt+ArrowUp/Down, and the touch handle on a physical touchscreen.
- [ ] Reload the project and confirm autosaved changes persist; test undo and redo after edits.

## Export package
- [ ] Export a one-page site and confirm the ZIP contains index.html, styles.css, script.js and README.txt.
- [ ] Export a multi-page site and confirm every page has a distinct HTML file and navigation links point to the right files.
- [ ] Add the same uploaded image to multiple places; confirm the ZIP contains one copy and all references resolve.
- [ ] Add a section background image; confirm it is copied into assets/ and its CSS URL points to that local file.
- [ ] Confirm image alt text, SEO title/description, language and theme fonts appear in the exported pages/CSS.
- [ ] Confirm fade, slide and zoom animations have keyframes and reduced-motion disables animation.
- [ ] Confirm grid sections become one column at narrow viewport widths.
- [ ] Open index.html locally and inspect desktop and mobile layouts in a browser.
- [ ] Submit a contact form in preview/export; confirm it clearly behaves as a front-end demo and does not imply submissions are delivered.

## Known prototype limits
- Projects, editor documents and uploaded media are stored in the current browser's local storage.
- Contact forms do not deliver submissions until a secure form service is connected.
- The built-in AI draft and AI Edit commands are local helpers, not calls to a real AI model.
- Touch interactions require physical Android/iOS validation before production release.
- Export checks above are manual until a test runner and automated regression suite are introduced.


## Project and client data reliability
- [ ] Duplicate a project with a saved editor document; confirm the copy opens with the same content and its own project identity.
- [ ] Duplicate a project without a saved editor document; confirm the project still appears as a draft.
- [ ] Delete a project; confirm it disappears and its saved website document is removed.
- [ ] Delete the project currently open in the editor; confirm the app returns to My projects.
- [ ] Archive and restore a project; confirm its update date changes.
- [ ] Delete a client with linked projects; confirm those projects remain and show no assigned client.
- [ ] Simulate unavailable/full browser storage; confirm the dashboard shows a warning instead of crashing.


## Image accessibility and editor consistency
- [ ] Upload an image with a descriptive filename; confirm its alt text appears in the canvas and properties panel.
- [ ] Change the selected image description; confirm the media library and exported HTML use the updated value.
- [ ] Mark an image decorative; confirm exported HTML uses an empty alt attribute.
- [ ] Add, duplicate and reuse elements; confirm each new element remains independently editable across device-specific styles.
- [ ] Switch between pages while a component and mobile panel are selected; confirm stale selection and panels are cleared.

## Workspace backup and restore checks

- Download a workspace backup and confirm the JSON contains the format/version, projects, clients and saved editor documents.
- Restore a valid backup and confirm projects, clients and website drafts are available again.
- Try an unsupported version, malformed JSON, oversized file and a document for an unknown project; each should be rejected without changing the workspace.
- Confirm the restore prompt clearly warns that current local workspace data will be replaced.
- Simulate a browser storage write failure where possible; verify the previous projects, clients and saved documents are rolled back.
- Confirm the settings page explains that backups contain private workspace information and are stored locally by the browser.


## Editor accessibility and export safety
- [ ] Use Tab to focus canvas sections; confirm Enter/Space selects a section.
- [ ] Focus a movable section and use Alt+ArrowUp/Down; confirm header/footer remain fixed.
- [ ] Select a section from Layers after selecting one of its components; confirm the component selection clears.
- [ ] Add, duplicate and delete pages while mobile drawers are open; confirm stale drawers/selections close.
- [ ] Undo and redo multiple edits; confirm changes persist and timestamps/save status update.
- [ ] Try an unreadable image file; confirm a helpful error appears and the editor remains usable.
- [ ] Export links with HTTPS, mailto, tel, local page, JavaScript, data and unknown URI schemes; confirm only safe destinations survive.


## Section management and keyboard editing
- [ ] Duplicate a section; verify new section and component IDs are unique and edits do not affect the original.
- [ ] Duplicate a section with tablet/mobile overrides; verify all device styles remain independent.
- [ ] Hide a section; verify it disappears from preview/export but remains available in Layers and can be shown again.
- [ ] Focus a section other than the currently selected one and use Alt+ArrowUp/Down; verify the focused section moves.
- [ ] Verify move-up/down controls disable at the first and last movable section boundaries.
- [ ] Use Tab to focus heading, paragraph, button, image and container; Enter/Space selects each element and F2 starts text editing where supported.
- [ ] Duplicate two pages with slugs that normalize to the same filename (including case differences); verify exported HTML filenames remain unique.
- [ ] Link to a page with a query string and anchor fragment; verify the exported link points to the correct HTML file and preserves both.
