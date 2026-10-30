# FEATURES.md — SANDOW Sports Intelligence Platform

## Vision
A sports-performance platform that converts supported exercise video/pose data into understandable evidence for athletes, coaches, and authorized sports administrators. It is not a medical diagnostic system or an automatic athlete-selection authority.

## Status labels
Use **Implemented**, **Partial**, **Not configured**, **Unavailable**, and **Estimated** accurately. Never call a model validated or accurate unless it has been evaluated on documented held-out data.

# Six core features

## 1. AI Motion Lab
**Flow:** select supported exercise → choose video upload or live camera → validate input → process frames → display original video and pose overlay → show supported outputs → review timeline/feedback → save or export if authorized.

**Show when genuinely available:** exercise and confidence; estimated reps and counting method; form status (Correct/Incorrect/Uncertain); supported observations; inference latency; frames processed; active model/checkpoint/preprocessing version; limitations.

**Requirements:** validate extension, size, duration, decodeability; handle no person, multiple people, occlusion, low light, camera denial/unavailable; allow stop/restart; clean up streams and temporary files; show low confidence as uncertain. A skeleton overlay alone is not proof of correct form. Never fabricate results if a model is unavailable. Do not store raw video by default.

**Acceptance:** upload/camera have loading, success, partial, empty, and error states. JSON exports reflect actual outputs and pass schema validation.

## 2. Athlete Performance Passport
- Profile with optional sport/team/district/state/age bracket only when needed and appropriately consented.
- Assessment history by date and exercise.
- Progress charts for actual metrics: repetitions, form outcomes, confidence, latency, if available.
- Personal records with definitions, goals, milestones, and downloadable reports.
- Consent/sharing controls and a clear data export/deletion request flow.
- Empty state invites the athlete to run the first assessment; no invented history.
- Compare like-for-like sessions and disclose model-version changes.
- Do not present rep count or model confidence as a complete measure of athletic ability.

## 3. Coach Command Center
- Assigned athlete roster only.
- Athlete profile and sharing/consent status.
- Session review, date/exercise filters, comparisons, progress trends.
- Training goals, coach-entered notes, follow-up actions, and human-review flags.
- Export only permitted records.
- Keep coach notes distinct from AI feedback. Coaches cannot silently edit model results or browse unrelated athletes.
- Revoke access when assignments/consent end, subject to lawful retention obligations.

## 4. Sports Talent Discovery & Government Insights
- For authorized sports department, district, federation, academy, or program administrators.
- Aggregate counts and verified metrics; filters by sport, district/state, age bracket where appropriate, date range, and documented criteria.
- Map only when location data is accurate, available, and safe to expose.
- Explainable candidate shortlist: show criteria, metric contributions, sample size, missing data, confidence, data freshness, and model version.
- Require human review before decisions. Do not use opaque “AI talent scores” or automatically select/reject athletes.
- Do not expose identifiable minor athletes or precise locations by default; suppress small groups where re-identification is possible.
- Never invent government data, athlete counts, official partnerships, or integrations.

## 5. Unified Exercise Intelligence
Pipeline:
1. Video/frame or pose-sequence input.
2. Pose extraction with model/version.
3. Canonical keypoint mapping, normalization, missing-joint/confidence handling.
4. Temporal windowing with timestamps/frame rate.
5. Compatible shared backbone/adapter.
6. Exercise/form/phase heads only where appropriate labels and trained weights exist.
7. Separate repetition counter/state machine or validated periodicity model.
8. Feedback engine that maps supported outputs to specific cues.
9. Evaluation, provenance, and optional persistence.

**Dataset governance:** record source/license, labels, participant split, preprocessing version, sample count, tensor shape, and limitations. Do not assume “non-standard” means a specific error across datasets. Split by participant/video when possible to reduce leakage. Keep train/validation/test separate.

**Evaluation:** exercise/form precision, recall, F1 and confusion matrix; repetition-count MAE; phase metrics; latency; uncertainty/calibration where feasible. Never show unmeasured benchmark claims.

**Acceptance:** every exercise has a support status; unsupported exercises return a helpful explanation; tensor shapes are validated; rep counting has transition tests; model metadata is visible.

## 6. Evidence & Progress Intelligence
- Repetition curve and movement timeline when the active counter provides them.
- Sampled posture observations only when genuinely computed.
- Confidence/uncertainty, processing time, frame sampling, model provenance, preprocessing version.
- Clearly distinguish model output, deterministic rule output, and coach notes.
- JSON export; CSV/PDF only if implemented reliably. Include session ID/time, exercise, real outputs, model/version, and limitations. Exclude secrets and unnecessary personal data.
- Compare trends without claiming causation. Explain model changes that affect comparisons; show “not enough data” rather than synthetic curves.
- Every export checks permissions and logs sensitive actions.

# Role matrix

| Capability | Athlete | Coach | Sports/Government Admin | Platform Admin |
|---|---|---|---|---|
| Run assessment | Own sessions | If enabled | If enabled | Testing/support only, audited |
| View history | Own | Assigned athletes | Approved scope only | Restricted operational access |
| Team roster | Own team info | Assigned roster | Authorized program scope | Not a routine product use |
| Goals/notes | Own goals | Assigned athletes | Only explicit workflow | No routine editing |
| Aggregate analytics | Personal | Assigned team | Approved scope | Operational metrics |
| Search identifiable athletes | Own profile | Assigned roster | Lawful approved scope | Restricted/audited |
| Export report | Own | Assigned/permitted | Authorized purpose only | Restricted/audited |
| Manage users/roles | No | No | No | Yes, audited |

Enforce permissions in services and data queries—not only navigation.

# Required UX states
Loading; first-use empty; no search results; partial data; permission denied; model unavailable; database/network error; successful save/export; low confidence; expired/revoked consent.

# Design tokens
- Obsidian: `#090A0D`, `#101217`
- Electric orange: `#FF5500`, `#FF7700`
- Amber: `#FFAA00`
Use orange for primary actions/active states, neutral tones for most content, accessible contrast, readable chart labels, keyboard focus, reduced-motion support, and responsive mobile layouts. Mobile should prioritize camera/upload and latest results; desktop can use sidebar navigation and richer analytics. Never fill empty states with fake numbers.

# Suggested build order
1. Stabilize current Motion Lab.
2. Add typed result schema and persistence.
3. Add athlete profile/history/consent.
4. Add coach assignment and review.
5. Add authorized aggregate talent analytics.
6. Add model registry, support statuses, and provenance.
7. Add trends, reports, exports, audit logs, and polish.
