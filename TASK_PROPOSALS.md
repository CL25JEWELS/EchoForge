# Codebase Task Proposals

## 1) Typo fix task
**Task:** Standardize `HIHAT` naming to `HI_HAT` (or `HI_HAT` display label) across types and generated default sounds.

**Why this looks like a typo issue:** The musical term is typically written as “hi-hat”, but the enum and IDs use the compressed token `HIHAT`/`hihat`, which is easy to misread and can leak inconsistent naming into APIs and UI labels.

**Scope hints:** `src/types/audio.types.ts`, `src/core/sound-packs/SoundPackManager.ts`, and any UI that renders category labels.

---

## 2) Bug fix task
**Task:** Fix API client handling for `204 No Content` responses in `ApiService.request`.

**Why this is a bug:** `request()` always calls `response.json()`. Several endpoints are modeled as `Promise<void>` and API docs specify `204 No Content` for delete operations, which causes JSON parsing errors on successful empty responses.

**Scope hints:** Update `src/services/api/ApiService.ts` to return `undefined` for 204/empty-body responses; add regression tests.

---

## 3) Code comment/documentation discrepancy task
**Task:** Align architecture/delivery docs with implemented API surface.

**Why this is a discrepancy:** Docs claim authentication methods (register/login) are implemented in the API client and present broad “25+ endpoints”, but `ApiService.ts` does not currently expose register/login methods.

**Scope hints:** Reconcile statements in `ARCHITECTURE.md` and `DELIVERY_SUMMARY.md` with `src/services/api/ApiService.ts` (either implement missing methods or update docs to “specified/planned”).

---

## 4) Test improvement task
**Task:** Add focused tests for `ApiService` request behavior on error bodies and no-content responses.

**Why this improves tests:** Current tests do not cover this critical edge case. Add tests that verify:
- 204 response does not throw on `Promise<void>` methods.
- Non-JSON error bodies still produce useful errors.
- Header merge behavior remains correct when custom headers are provided.

**Scope hints:** Add `src/services/api/__tests__/ApiService.test.ts` with mocked `fetch`.
