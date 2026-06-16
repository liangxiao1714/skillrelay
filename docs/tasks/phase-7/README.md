# Phase 7: Multi-Source Discovery (URL + GitHub Import)

- Status: done
- Phase: 7
- Owner: unassigned
- Depends on: Phase 6
- Related specs: docs/roadmap.md, docs/acceptance.md
- Created: 2026-06-16
- Last updated: 2026-06-16

## Goal

Enable `skillrelay import` to fetch skills directly from raw HTTP/HTTPS URLs and from GitHub repositories, without requiring a local file clone first.

## Scope

### In scope

- `skillrelay import https://…` — fetch skill Markdown from any HTTP/HTTPS URL
- `skillrelay import github:<owner>/<repo>/<path>[@ref]` — resolve to `raw.githubusercontent.com` and fetch
- `fetchText(url)` — low-level HTTP helper using Node 18+ built-in `fetch`; guards content-type and response size
- `resolveGithubUri(uri)` — parses `github:` scheme with optional `@ref` for branch/tag/SHA
- `parseSkillUrl(url)` — fetch + parse front-matter into `ParsedSkillMd`
- `update` command extended to re-fetch skills with `url` or `github` origin type
- Unit tests with mocked `fetch` (vitest `vi.stubGlobal`)
- Integration test for full `importSkill` with a mock HTTP response
- E2E test using a real local HTTP server (Node `http.createServer`)

### Out of scope

- Local directory watching / source registration (deferred)
- Source-level search federation (deferred)
- SkillHub source integration (deferred)
- Authentication for private GitHub repositories
- Rate-limit handling

## Execution items

- [x] `src/core/import/fetch.ts` — `fetchText(url)` with content-type + size guard
- [x] `src/core/import/sources/github.ts` — `resolveGithubUri`, `parseGithubSkill`
- [x] `src/core/import/sources/url.ts` — `parseSkillUrl`
- [x] `src/core/import/detect.ts` — extended `SourceType` with `"url"` and `"github"`; `detectSourceType` routes these before filesystem stat
- [x] `src/core/import/build-record.ts` — `originTypeFromSourceType` handles `"url"` and `"github"`
- [x] `src/core/import/index.ts` — `importSkill` routes `"url"` / `"github"` detect results
- [x] `src/cli/commands/import.ts` — updated description and usage examples
- [x] `src/cli/commands/update.ts` — extended to re-fetch URL/GitHub origin skills
- [x] Unit tests: `fetch.test.ts`, `sources-github.test.ts`, `sources-url.test.ts`
- [x] Integration test: `tests/integration/import-url-flow.test.ts`
- [x] E2E test: `tests/e2e/import-url.e2e.test.ts`
- [x] Docs: README (en + zh-CN), CHANGELOG, roadmap (en + zh-CN), acceptance report (en + zh-CN), tasks index

## Acceptance criteria

- [x] `skillrelay import https://host/skill.md` fetches and imports the skill
- [x] `skillrelay import github:owner/repo/path/skill.md` resolves to raw URL and imports
- [x] `github:owner/repo/skill.md@v1.2.0` resolves with the correct `@v1.2.0` ref
- [x] Invalid `github:` URIs (missing slash, empty segments) produce a clear error message
- [x] `--dry-run` works for URL and GitHub imports
- [x] `skillrelay update` re-fetches skills with `url` or `github` origin
- [x] All 357 tests pass; lint 0 findings; typecheck 0 errors

## Test items

- [x] `tests/unit/core/import/fetch.test.ts` — fetchText success, 404 error, network error, content-type guard
- [x] `tests/unit/core/import/sources-github.test.ts` — resolveGithubUri parsing, ref variants, error cases
- [x] `tests/unit/core/import/sources-url.test.ts` — parseSkillUrl success, 404 propagation, YAML parse error
- [x] `tests/unit/core/import/import.test.ts` — detectSourceType recognizes `github:` and `https://` prefixes
- [x] `tests/integration/import-url-flow.test.ts` — full importSkill with mocked fetch response
- [x] `tests/e2e/import-url.e2e.test.ts` — real HTTP server + CLI subprocess; github: error cases

## Risks / Notes

- Uses Node 18+ `globalThis.fetch`. If running under Node 16, `fetchText` will throw with a clear message. The `package.json#engines` already requires `>=20`.
- The GitHub raw URL pattern is `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`. The default ref when none is specified is `main`.
- Content-type guard rejects responses that claim `application/json` or `text/html` to prevent accidentally importing API error pages.
- Max response size guard (default 1 MB) prevents large downloads from blocking the CLI.

## References

- [`src/core/import/fetch.ts`](../../src/core/import/fetch.ts)
- [`src/core/import/sources/github.ts`](../../src/core/import/sources/github.ts)
- [`src/core/import/sources/url.ts`](../../src/core/import/sources/url.ts)
- [docs/roadmap.md](../roadmap.md)
- [docs/acceptance.md](../acceptance.md)
