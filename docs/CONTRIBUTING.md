# Contributing

Thank you for helping maintain the AGM website. This repo is a production static site — keep changes small, scoped, and testable.

## Workflow

1. Pull latest `main`.
2. Create a branch: `fix/mobile-fleet-spacing` or `feat/contact-form-copy`.
3. Make focused edits; match existing naming and file layout.
4. Test locally (`npm start`) at **375px**, **768px**, and **1280px** widths.
5. Bump `?v=` cache params for any changed CSS/JS referenced from HTML.
6. Open a PR against `main` using the PR template.
7. After merge, Hostinger deploys automatically.

## Commit messages

Use imperative, present tense. One logical change per commit when possible.

```
Fix mobile homepage scroll so sections below hero are reachable.

Tighten mobile section spacing and remove full-viewport gaps.
```

## Code conventions

- **Mobile-only** → rules inside `@media (max-width: 768px)` in `agm-*-mobile.*` files.
- **Desktop-only** → `@media (min-width: 769px)` in `agm-hero-desktop.css`.
- **Do not** put `#hero` rules in `agm-mobile.css` (hero has its own files).
- Prefer `!important` only when overriding island CSS loaded later in the DOM.
- Use existing CSS variables: `--agm-safe-*`, `--agm-appbar-h`, `--agm-hero-h`.

## Pull request expectations

- [ ] Tested locally on homepage and affected pages
- [ ] Cache version bumped for changed assets
- [ ] Mobile and desktop both checked (if homepage)
- [ ] No unrelated refactors or drive-by formatting
- [ ] No secrets, large accidental binaries, or debug tooling committed

## Reporting issues

Use GitHub Issues with the **Bug report** or **Feature request** template. Include:

- URL / page
- Device & browser
- Screenshot or screen recording if layout-related
- Expected vs actual behavior
