# Autonomous Prompt — Fully Integrate the AITT Frontend with the Live Backend

> Paste everything below the line into a fresh Claude Code session opened at the repo root
> `Downloads/AITTsoroban (2)/AITTsoroban`. It is written to run **autonomously**: finish the whole
> integration end-to-end, verify it against a real running backend again and again, and do **not** stop
> for per-step sign-off. The backend is already production-grade and its tests are green; your job is to
> make the React app actually talk to it.

---

## Role

You are a senior full-stack integration engineer (React + TypeScript on the front, Node/Express + Soroban
on the back). You own wiring the AITT compliance-certification **frontend** (`frontend-aitt/`, a Vite/React
SPA that currently runs entirely on mock data) to the **real backend** (`backend/`, an Express/MongoDB API
that wraps a live Stellar/Soroban contract). When you are done, every screen shows real data from the API,
real auth works, and every write hits the backend.

## Mission (the one sentence)

Replace the frontend's mock data layer with a real, typed API client against the backend's `/api/v1`
surface — real JWT auth, real documents/reviews/certificates/proposals/governance — and prove the whole
stack works end-to-end by running the backend and driving every role's critical path, repeatedly, until it
is clean.

## Autonomy contract — READ THIS FIRST

- **Work end-to-end without stopping for approval.** No "should I proceed?", no pausing between screens,
  no waiting for a punch-list. Keep going until the entire app is integrated and verified.
- **Decide and document, don't ask.** On any choice (token storage, error UX, how to handle a screen with
  no backend endpoint), pick the most defensible option, implement it, and record what/why in a running
  `INTEGRATION_NOTES.md`. Only surface a question if you are genuinely blocked by something you cannot
  determine or safely default — and keep making progress on everything else meanwhile.
- **The bar is "a real user can log in and use every feature against the live backend,"** not "it compiles."
- **Do not break or modify the backend.** It is already green (296 unit tests, 20/20 live-chain). You may
  read its code and docs to integrate correctly; you may run it locally; you must not change its behaviour.
  If you find a genuine backend bug that blocks integration, document it in `INTEGRATION_NOTES.md` and work
  around it on the frontend — do not silently patch the backend.
- **Every screen you migrate, you verify** by actually loading it against a running backend. "I wired the
  hook" is not done; "I saw real data render and the write succeed" is done.

## Context you are inheriting (verify against the code — trust the code, not this summary)

**Frontend stack (`frontend-aitt/`):** Vite 5, React 19, TypeScript, **TanStack Query** (`@tanstack/react-query`,
already installed), **TanStack Router**, **zustand**, react-hook-form, Tailwind + shadcn/Radix UI, **sonner**
for toasts. Scripts: `npm run dev`, `npm run build`, `npm run typecheck`. **No axios** — use `fetch`. No test
runner is configured yet.

**There are TWO mock layers — know the difference:**
1. **`src/mock/store.ts`** (zustand, seeded from `src/mock/seed.ts`) — the **real product**: companies,
   sub-admins, documents, reviews, proposals, governance, signerWallets, alerts, templates, frameworks.
   This is what the governance/compliance pages use (Registry, MyDocuments, SubmitDocument, ReviewQueue,
   DocumentReview, Certificate, all `Admin*` pages, `Governance*`, `Proposal*`, Templates). **This is your
   integration target.** Its `types.ts` shapes are the canonical shapes.
2. **`src/hooks/useActor.ts` + `src/hooks/useQueries.ts`** — a **leftover Internet Computer (ICP) demo actor**
   returning hardcoded data for features that **have no backend**: cybersecurity scoring, AI-risk analysis,
   SDK secrets, the "AI Act / Cybersecurity assistant" chat (pages: `Cybersecurity*`, `AIRiskMinimization`,
   `LLMChat`, parts of `ComplianceDashboard`). **These are out of the backend's scope.** Decide explicitly
   (and document): hide/route-guard them, leave them clearly labelled as demo, or remove them. Do **not**
   pretend to wire them to endpoints that don't exist, and do **not** break their build.

**🎁 The single most important fact:** the backend was **built to emit the frontend's exact `mock/types.ts`
shapes** (`backend/docs/API.md`: *"Responses match `frontend-aitt/src/mock/types.ts` (DocItem / Company /
SubAdmin)"*). So this is a **wiring** job, not a reshape job — map endpoint → existing type, keep the store's
action names, and page components should barely change.

**Auth today is fake:** `src/context/RoleContext.tsx` is a "View as" switcher (`public | company | sub_admin
| admin`, persisted in localStorage) with **no real login**. `SignInPage`/`RegisterPage` exist but don't call
an API. You will replace this with real JWT auth while keeping the role model.

## Backend API surface (what you integrate against — read `backend/docs/API.md` + `openapi.yaml` for detail)

- **Base:** `/api/v1`. **Envelope:** every response is `{ success, data, message? }`; lists add
  `pagination: { currentPage, totalPages, total, limit }`. Your client unwraps this centrally.
- **Auth (JWT, Bearer):** `POST /auth/login`, `POST /auth/refresh`, `POST /auth/register` (**super_admin
  only** — normal signup is company self-register), `POST /auth/exchange-key`. Login is rate-limited + has
  account lockout. Bootstrap the first admin via `node src/migrations/seed-admin.js` (SEED_ADMIN_* env).
- **Role mapping (frontend ↔ backend):** `admin`↔`super_admin`, `company`↔`company_admin`,
  `sub_admin`↔`sub_admin`, `public`↔unauthenticated. Role-home routes: `public`→`/`, `company`→`/company`,
  `sub_admin`→`/expert`, `admin`→`/admin`.
- **Companies:** `POST /companies/register` (public → pending + custodial wallet + company_admin login),
  `POST /companies/:id/approve` (admin → whitelists → active), `GET /companies`(+`/:id`,`/with-users`),
  `DELETE /companies/:id`.
- **Sub-admins:** `POST /sub-admins` (admin invite), `POST /sub-admins/:id/activate` (admin → on-chain
  add_sub_admin), `GET /sub-admins`, `DELETE /sub-admins/:id`.
- **Documents:** `POST /documents` (multipart `file` + `subject` [+ `filename`]; re-hashed server-side;
  company must be approved), `GET /documents` (role-scoped + paginated), `GET /documents/:id`,
  `POST /documents/:id/review` (`{ decision, complianceScore 0–100, comment }`),
  `POST /documents/:id/issue` (`{ expiryAt? }`), `GET /documents/:id/verify` · `GET /documents/verify/:hash`
  (public), `GET /documents/:id/file` (role-scoped download).
- **Proposals:** `POST /proposals` (`{ type, title, description?, targetRef?, payload? }`),
  `GET /proposals`(+`/:id`), `POST /proposals/:id/sign`, `POST /proposals/:id/reject`.
- **Governance:** `GET /governance` → `{ required (N), total (M), signerWallets }`; `PUT /governance`
  (`{ required, total? }`, 1 ≤ N ≤ M).
- **Frameworks:** `GET /frameworks`(+`/:id`) — **READ-ONLY** (writes go only through `framework_update`
  proposals). **Templates:** GET/list/`:id/download` (any auth) + admin CRUD. **Alerts:** GET/POST/resolve.
  **Notifications:** `GET /notifications` (+`unread` count), `POST /:id/read`, `POST /read-all`.
- **Ops:** `GET /health` (liveness), `GET /ready` (readiness). `/admin/*` jobs + audit (admin).

## Product rules you must honour in the UI (from the contract/backend design — get these right)

- **Create ≠ sign.** A proposal is created with **0 approvals**; the proposer (if a sub-admin) must also
  sign. Reflect this in the UI (don't show a freshly-created proposal as "1 signature").
- **Auto-execute at threshold.** When the Nth signature lands, the proposal executes on-chain automatically;
  `signers` come back from the chain's `approvals[]`. Show executed state from the server, don't guess it.
- **N-of-M multi-sig** (configurable). Show `required`/`total` and progress honestly.
- **Frameworks are governance-controlled**, not directly editable — the old "add/edit/remove framework"
  buttons become **"Propose framework update"** (a `framework_update` proposal).
- **Issue is review-gated**: only after the latest review is Approved / Approved-with-recommendations.
- **Submit is whitelist-gated**: a company must be approved before it can submit documents.
- **Reviewers must be active sub-admins**; a plain admin without a sub-admin profile can't review.
- **Compliance score is 0–100** (headline deliverable), 4 review decisions (approved / approved_with_
  recommendations / requires_changes / rejected).

## The work (close all of it)

### A. API client & config
1. `src/api/client.ts` — a typed `fetch` wrapper: base URL from `import.meta.env.VITE_API_BASE_URL`,
   attaches `Authorization: Bearer`, unwraps the `{ success, data }` envelope, throws a normalized
   `ApiError` (status + backend `message`), and on `401` transparently tries `POST /auth/refresh` once then
   retries (or logs out). Configure a Vite dev proxy (`/api → http://localhost:4000`) to avoid CORS.
2. `.env.example` + `.env.development` for the frontend documenting `VITE_API_BASE_URL` and a
   `VITE_USE_MOCK` flag (see G).

### B. Real auth
3. Replace fake auth with real: `SignInPage` → `POST /auth/login`; company signup → `POST /companies/register`;
   store access token in memory + refresh handling; derive the real `Role` from the authenticated user and
   feed `RoleContext` from it (keep the `Role` type + role-home routes). Add route guards so each area
   requires the right role; redirect to sign-in when unauthenticated. Keep the "View as" switcher only as a
   **dev-only** aid behind `VITE_USE_MOCK`, never in the real-auth path.

### C. Replace the store with real hooks (the bulk of the work)
4. Build a set of TanStack Query hooks under `src/hooks/api/` that **mirror the existing `mock/store.ts`
   action names** (e.g. `useCompanies`/`useAddCompany`/`useApproveCompany`, `useDocuments`/`useSubmitDocument`/
   `useReviewDocument`/`useIssueCertificate`/`useRevokeDocument`, `useProposals`/`useCreateProposal`/
   `useSignProposal`/`useRejectProposal`, `useGovernance`/`useSetGovernance`, `useSubAdmins`, `useFrameworks`,
   `useTemplates`, `useAlerts`, `useNotifications`). Each returns the **same `mock/types.ts` shapes** the
   pages already consume, so page edits are minimal. Wire proper `queryKey` invalidation on every mutation.
5. Migrate every governance/compliance page from the zustand store to these hooks, screen by screen, adding
   real **loading / empty / error** states (use the existing shared components + `sonner` toasts).

### D. Files, governance, and the tricky flows
6. Document **upload** (multipart, compute/display the file hash), **download** (`GET /:id/file` as a blob),
   and **public verify** (`/verify/:hash`) with a shareable verify screen.
7. Governance end-to-end: create proposal, sign (with the create≠sign + auto-execute + N-of-M semantics
   above), reject, and the framework-update-via-proposal flow. Governance settings screen calls `PUT
   /governance` with the 1 ≤ N ≤ M rule surfaced.
8. Notifications + alerts wired to their endpoints (unread badge, mark-read).

### E. Legacy ICP pages
9. Make an explicit, documented call on the ICP demo pages (cybersecurity / AI-risk / LLM / AI-Act) that
   have no backend: route-guard or hide them by default (behind a flag), or clearly label them "demo". Keep
   the build green. Do not wire them to nonexistent endpoints.

### F. Polish & correctness
10. TypeScript: `npm run typecheck` clean. `npm run build` clean. No `any`-slinging at the API boundary —
    the client is typed to `mock/types.ts`. No secrets or tokens in logs. No console errors in normal use.

### G. Keep a mock fallback
11. Preserve a working **`VITE_USE_MOCK=true`** path (the current store) so the app still runs with no
    backend for design/offline work. Real mode (`VITE_USE_MOCK=false`, default) uses the API client. One
    switch, both paths compile and run.

## Verification discipline — "test it again and again"

You must prove it against a **real running backend**, repeatedly — not just typecheck.

1. **Stand up the full stack locally.** Run the backend in the hermetic dev config (`SOROBAN_ADAPTER=stub`
   is fine and needs no chain), seed a super_admin (`node src/migrations/seed-admin.js`), `npm start`, and
   confirm `GET /health` = 200 and `GET /ready` = 200. Point the frontend at it via `VITE_API_BASE_URL`.
2. **Drive every role's critical path against that backend, and repeat after every batch of changes:**
   - **admin:** log in → approve a company → invite + activate a sub-admin → review queue → issue a
     certificate → create + sign a proposal to threshold → see it auto-execute → adjust governance.
   - **company:** self-register → log in → submit a document (file upload) → see status update → view/
     download the issued certificate.
   - **sub_admin:** log in → see review queue → submit a review with a 0–100 score → sign a proposal.
   - **public:** verify a document by hash with no auth.
   For each: real data renders, the write succeeds, the list refetches, no console errors.
3. **`npm run typecheck` and `npm run build` must be green** — run them after every significant change and
   again at the end.
4. **Add a smoke test if feasible** (a Playwright script, or at minimum a scripted full-stack login+CRUD
   smoke) and run it 2–3× to catch flakiness. If you add Playwright, keep it lightweight and documented.
5. **Final pass against the REAL backend** (`SOROBAN_ADAPTER=real`, the validated contract) for at least the
   read + verify paths, to confirm the client handles real chain-backed data. Note anything that only works
   against the stub.
6. Keep a tally in your final report: which flows you drove, per role, and their result.

## Guardrails / do-NOT

- Do **not** modify the backend to make the frontend easier; integrate against it as-is.
- Do **not** hardcode API URLs, tokens, or secrets in source — everything via `import.meta.env`.
- Do **not** store the JWT somewhere XSS-trivially exfiltratable without saying so; document your token-
  storage choice and its trade-off.
- Do **not** leave a screen half-wired (some real, some mock) without a `// TODO(integration):` and a note
  in `INTEGRATION_NOTES.md`.
- Do **not** delete the mock layer — it's the `VITE_USE_MOCK` fallback.

## Definition of done (all must be true)

- [ ] Real login/logout/refresh works; role derived from the API; route guards enforce it.
- [ ] Every governance/compliance page renders **real backend data** and every write hits the API and
      refetches, with loading/empty/error states.
- [ ] Document upload, download, and public verify all work against a running backend.
- [ ] Governance flows honour create≠sign, auto-execute, N-of-M, and framework-via-proposal.
- [ ] Legacy ICP pages handled with an explicit, documented decision; build stays green.
- [ ] `npm run typecheck` and `npm run build` both clean; no console errors on the happy paths.
- [ ] `VITE_USE_MOCK` fallback still runs with no backend.
- [ ] You drove all four roles' critical paths against a live backend (evidence in the report), and any
      smoke test passes ≥2× with no flakes.

## Deliverable

When (and only when) every box is checked, give me one **final report**: what you wired (grouped A–G), the
key decisions (token storage, legacy-page handling, any backend quirks you worked around), the per-role
flows you drove and their results, typecheck/build status, and any genuinely backend-owned or infra-owned
item left as a clearly-marked TODO with a clean seam — but nothing on the frontend left half-done.

Now begin. Don't wait for me — wire the whole app, run it against the backend, and hand me a working
end-to-end product.
