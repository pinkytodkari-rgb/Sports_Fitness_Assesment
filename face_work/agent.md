# AGENT.md — SANDOW Sports Intelligence Platform

## Mission
Extend the existing SANDOW project into an end-to-end sports-assessment platform for athletes, coaches, and authorized sports/government administrators. The current app is reported to be a Streamlit app (`app.py`, `test_app.py`, localhost:8501) with a Sandow v2 Electric Orange & Obsidian UI, upload/live camera, pose landmarks, repetition estimates, posture observations, model information, and JSON export. Verify each claim in the repository before relying on it.

## Mandatory rules
1. Inspect the repository, dependencies, `app.py`, tests, data folders, model-loading logic, and current architecture before editing.
2. Preserve working functionality. Do not rewrite the whole app or switch frameworks unless the repository gives a strong reason. Extend the current stack.
3. Do not create fake athletes, assessments, leaderboards, model outputs, accuracy numbers, government statistics, or integrations. Empty states are better than fabricated content.
4. A pretrained backbone is not a trained exercise-understanding system. Show only the tasks, exercises, checkpoints, and outputs that are actually configured and trained.
5. If a model is missing or a task head is untrained, mark the feature “Not configured” or “Unavailable”; do not return plausible-looking predictions.
6. Use authentication and server-side authorization for sensitive records. Enforce role and consent checks in the data/service layer, not just by hiding UI elements.
7. Ask for consent before sharing athlete records with coaches or administrators. Minimize video retention and protect minors’ identities and precise location.
8. Talent discovery is decision support, not automatic selection/rejection. Display criteria and uncertainty and require human review.
9. Run existing tests and add focused tests. Never claim tests passed unless they were run.
10. Keep secrets out of source control. Use environment variables and `.env.example` placeholders.
11. Every interactive control must work or be visibly disabled with a reason.
12. At completion, report changed files, actual test results, exact run command, working/partial/unavailable features, and remaining setup requirements.

## Product pillars — build all six incrementally
1. **AI Motion Lab:** video upload/live camera, exercise selection, pose overlay, rep estimate, form status when supported, evidence-based feedback, confidence/uncertainty, latency, and model provenance.
2. **Athlete Performance Passport:** athlete profile, session history, progress charts, goals, personal records, downloadable reports, and consent controls.
3. **Coach Command Center:** assigned roster, session review, comparisons, goals, notes, and follow-up actions. Coaches see assigned athletes only.
4. **Sports Talent Discovery & Government Insights:** authorized filters by sport, district/state, age bracket where appropriate, and verified metrics; aggregate analytics, transparent criteria, and human-reviewed shortlists.
5. **Unified Exercise Intelligence:** common preprocessing for compatible pose/video inputs, task heads only when trained labels exist, a separate repetition counter, and a feedback layer.
6. **Evidence & Progress Intelligence:** session timelines, actual metrics, model/version provenance, trends, JSON/CSV/PDF exports where implemented, and auditability.

## Design direction
Reference: https://dribbble.com/shots/25670369-sandow-v2-AI-Fitness-Nutrition-App-Physical-Assessment-UIUX
Adapt the Sandow visual language to sports assessment:
- Obsidian `#090A0D` / `#101217`
- Electric orange `#FF5500` / `#FF7700`
- Warm amber `#FFAA00`
- Strong hierarchy, restrained glow, polished charts, consistent spacing, responsive cards, readable labels, accessible contrast and focus states.
- “AI VISION ACTIVE” must reflect real pipeline readiness, not be a decorative always-on status.
- Do not copy a generic nutrition app wholesale; prioritize camera assessment, movement evidence, and sports workflows.
- Avoid fake numbers, filler cards, excessive glow, and nonfunctional controls.

## Required workflow
### Phase 0: Audit
Inspect project tree, current UI, tests, dependencies, model weights, preprocessing, data contracts, persistence, and permissions. Run baseline tests. Do not delete datasets, checkpoints, caches, or user files.

### Phase 1: Stabilize Motion Lab
Validate uploads; handle malformed/large videos; show processing status; manage camera permission and stream cleanup; avoid repeated expensive inference on UI reruns; align pose overlays with frames; label reps as estimates unless evaluated; preserve provenance and validate JSON exports.

### Phase 2: Navigation
Add/organize Overview, Motion Lab, Athlete Performance, Coach Center, Talent Discovery (authorized only), Reports & Models, Settings/Privacy. Backend authorization must protect records even if users manually navigate to a page.

### Phase 3: Identity and storage
Reuse the existing database/authentication if present. Otherwise choose a simple documented persistence layer suitable for the current deployment, with migrations/schema versioning. Define users, roles, athlete profiles, coach assignments, consent, assessment sessions/results, goals, model versions, and audit events. Avoid storing raw video by default.

### Phase 4: End-to-end vertical slices
Implement each pillar with real data, validation, loading/empty/error/success states, permissions, and tests. Prefer one working end-to-end flow over six static mock screens.

### Phase 5: Validation
Test missing weights, camera denied, camera unavailable, malformed input, no sessions, low confidence, unauthorized access, revoked consent, and export. Check responsive behavior and regression tests.

## Model integrity
Separate video decoding, pose extraction, normalization, temporal windowing, inference, rep counting, feedback, and persistence. Cache heavyweight models safely. Record model/version, preprocessing version, supported tasks, confidence, thresholds, and latency where available. Never infer detailed form errors from generic keypoints without validated rules or labels. S3D, TimeSformer, VideoMAE, and “Both” must only be selectable when each has a real compatible pipeline. A pose/time-series backbone such as PatchTST requires a compatible adapter and trained task heads; it is not automatically a video classifier. Use “uncertain” for occlusion, missing keypoints, poor view, or low confidence.

## Definition of done
A feature is complete only when its UI connects to a real data path, input is validated, permissions are enforced, error/empty states work, tests pass, and limitations are documented.

## Final implementation report
1. What was present vs actually added.
2. Main files changed.
3. Each pillar status: functional / partial / not configured.
4. Exact tests and observed results.
5. Exact start command and URL.
6. Model/data prerequisites and limitations.
7. Security/privacy decisions requiring owner approval.

Start with the repository audit. Do not rewrite from scratch.
