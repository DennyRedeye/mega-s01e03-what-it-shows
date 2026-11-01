# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 delivery

The signed review is in
`src/routes/kb/incidents/4471-review/+page.svx`. Its rendered counterpart is
`docs/kb/incidents/4471-review/index.html`. The original report and tenant exports and
accepted decision 0001 are unchanged. The older incident page remains the desk's historical
account; use the review for the evidence-backed split.

The public tickets are [parser (374 reports)](https://github.com/DennyRedeye/mega-s01e03-what-it-shows/issues/3),
[form hint (33 reports)](https://github.com/DennyRedeye/mega-s01e03-what-it-shows/issues/1),
and [timing investigation (5 reports)](https://github.com/DennyRedeye/mega-s01e03-what-it-shows/issues/2).
These counts describe the export, not the live support desk.

### Run and rebuild

Use Node.js 24 or newer:

```sh
npm ci
npm test
npm run check
BASE_PATH=/mega-s01e03-what-it-shows npm run build
```

The build compiles the actual Svelte and mdsvex components and prerenders their tables,
report-ID lists, and computed desk reference. Commit `docs` alongside the source. GitHub
Pages can serve `main`'s `/docs` folder without a separate hosting account.

For local development, run `npm run dev`. To inspect the published-path build locally, run
`BASE_PATH=/mega-s01e03-what-it-shows npm run preview`.
