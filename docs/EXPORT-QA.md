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
