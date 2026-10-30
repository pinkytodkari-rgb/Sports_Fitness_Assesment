# ARCHITECTURE.md — SANDOW Sports Intelligence Platform

## 1. Principles
- Inspect and extend the existing repository. Current project is reported to be Streamlit (`app.py`, `test_app.py`, port 8501); verify this.
- Separate UI, application services, inference, persistence, and authorization.
- Reuse existing database/auth instead of creating competing systems.
- A pretrained backbone is not a complete trained exercise model.
- Never fabricate predictions or metrics when models/data are absent.

## 2. Logical architecture

```text
SANDOW UI (existing framework)
  Overview | Motion Lab | Athlete | Coach | Talent Discovery | Reports | Privacy
                              |
                    Application / Use Cases
          Run Assessment | Save Session | History | Goals
           Team Review | Talent Filters | Export | Consent
                  /                         \
                 /                           \
        Assessment Pipeline               Auth & Policy
        Video Decoder                     Identity / Roles
        Pose Extractor                    Athlete Ownership
        Normalizer / Windowing            Coach Assignments
        Model Adapter / Task Heads        Consent / Audit
        Rep Counter
        Feedback Engine
                 \                           /
                  \                         /
                    Domain Services
       Assessment | Progress | Athlete/Team | Talent Analytics
                    Reporting | Model Registry
                              |
                    Persistence Adapters
 Users/Roles | Profiles | Assignments | Consent | Sessions/Results
 Goals/Notes | Model Versions | Audit Events | Optional Media Refs
```

## 3. Suggested modules
Adapt to existing code; do not create duplicates if equivalent modules already exist.

```text
app.py
pages/
  01_Overview.py
  02_Motion_Lab.py
  03_My_Performance.py
  04_Coach_Center.py
  05_Talent_Discovery.py
  06_Reports_and_Models.py
  07_Settings_and_Privacy.py
src/
  config.py
  domain/schemas.py
  domain/permissions.py
  services/assessment_service.py
  services/athlete_service.py
  services/coach_service.py
  services/talent_service.py
  services/progress_service.py
  services/reporting_service.py
  services/consent_service.py
  pipeline/video_reader.py
  pipeline/pose_extractor.py
  pipeline/pose_normalizer.py
  pipeline/temporal_window.py
  pipeline/model_registry.py
  pipeline/model_adapter.py
  pipeline/task_heads.py
  pipeline/rep_counter.py
  pipeline/feedback_engine.py
  repositories/interfaces.py
  repositories/                 # extend existing DB adapter
  security/auth.py
  security/access_control.py
  security/audit.py
tests/
```

This is a target shape, not an instruction to generate every file at once.

## 4. Assessment pipeline
1. Validate upload or camera stream.
2. Decode frames with file/duration/frame limits.
3. Extract pose using a configured estimator.
4. Map keypoints to a canonical skeleton schema; preserve confidence and missing joints.
5. Create temporal windows with timestamps and frame-rate metadata.
6. Route only to a compatible model adapter.
7. Run task heads that are actually trained.
8. Estimate reps using a tested state machine or configured periodicity model.
9. Generate feedback only from supported outputs/rules.
10. Return a typed result; persist only after authorization and consent checks.

### Example canonical pose representation
```python
PoseSequence = {
    "schema_version": "1.0",
    "timestamps_ms": [],
    "joint_names": [],
    "coordinates": [],       # [frames, joints, coordinate_dims]
    "confidence": [],        # [frames, joints], when available
    "coordinate_system": "documented_image_or_world_space",
    "source_model": "pose-model-name-and-version"
}
```
Datasets can differ in joints, coordinate conventions, frame rates, and confidence meanings. Map explicitly. If a current adapter expects `(batch, 10, 51)`, validate that shape at the boundary—never silently reshape arbitrary inputs.

### Example result contract
```json
{
  "schema_version": "1.0",
  "session_id": "generated-id",
  "created_at": "ISO-8601",
  "exercise": {"label": null, "confidence": null, "status": "unavailable"},
  "form": {"label": "uncertain", "confidence": null, "supported_observations": []},
  "repetitions": {"count": null, "status": "unavailable", "method": null},
  "telemetry": {"inference_ms": null, "frames_processed": 0},
  "model_provenance": {
    "pose_model": null,
    "backbone": null,
    "checkpoint_version": null,
    "preprocessing_version": null
  },
  "limitations": []
}
```
This is a schema example, not live data. Fill fields only when actual pipelines produce them. Validate with Pydantic if already installed or appropriate.

## 5. Model strategy
- **Video models:** S3D, TimeSformer, VideoMAE need compatible frame preprocessing and task-specific heads. A pretrained checkpoint alone does not provide exercise labels, form errors, phase labels, or rep counts.
- **Pose/time-series models:** PatchTST may be used only with a compatible pose-sequence adapter and trained/validated task heads; it is not automatically a raw-video classifier.
- **Multi-task design:** shared representation + exercise head + form head + phase head where labels exist; separate rep-count postprocessor; evidence-based feedback mapping.
- “Non-standard” labels do not automatically identify specific error types. Phase labels may require annotation or a compatible labelled dataset.
- Keep S3D, TimeSformer, VideoMAE, and “Both” selectable only when each has a real compatible backend. Otherwise show status and prerequisites.
- Rep-count state machine should handle smoothing, hysteresis, cooldown, pauses, incomplete reps, noisy predictions, and missing keypoints. Test no count before a full cycle, one count per cycle, repeated frames, pause/resume, and low-confidence intervals.
- Record model/version, preprocessing, supported exercises/tasks, thresholds, evaluation, confidence, and latency when available.

## 6. Persistence
Inspect existing storage first. If none exists, a local SQLite repository may be appropriate for a local prototype; do not add it if another database is already authoritative.

Suggested entities:
- `User`: id, display name, identity reference, role, status, created_at.
- `AthleteProfile`: user_id, optional sport/team/district/state/age bracket, visibility.
- `CoachAssignment`: coach_id, athlete_id/team_id, status, timestamps.
- `ConsentRecord`: subject_id, purpose, scope, granted_at, revoked_at, policy_version.
- `AssessmentSession`: id, athlete_id, created_by, exercise_requested, status, duration, created_at.
- `AssessmentResult`: session_id, schema_version, outputs, telemetry, model provenance, limitations.
- `TrainingGoal`: athlete_id, creator, metric, target, due date, status.
- `CoachNote`: athlete_id, coach_id, session_id, note, timestamps.
- `ModelVersion`: model/version, artifact reference, preprocessing version, supported tasks, evaluation.
- `AuditEvent`: actor, action, target, timestamp, outcome, minimal metadata.

Avoid storing raw video by default. If media retention is needed, require consent, controlled storage, retention policy, and deletion handling.

## 7. Authorization and privacy
- Default-deny for sensitive resources.
- Athletes access their own records.
- Coaches access assigned athletes only, within sharing scope.
- Government/sports administrators access only approved programs/regions and permitted records; prefer aggregates.
- Platform-admin access to sensitive records is restricted and audited.
- Check permissions in service/repository queries and exports, not just UI.
- Check consent at time of sharing/export; honor revocation.
- Protect minors and precise location; do not publish individual results by default.
- Do not log secrets or unnecessary personal data. Keep `.env` out of source control.
- Streamlit session state is not authentication. Production requires real auth, HTTPS, secure sessions, backup, retention controls, and monitoring.

## 8. Talent analytics
Use real, permitted, sufficiently complete records. Show filters, sample size, missing data, date range, model version, and uncertainty. Make shortlist criteria explicit and reproducible. Do not create an opaque talent score or automated final decision. Exercise metrics alone are not a complete measure of athletic potential. Suppress small groups if identity could be inferred. Never invent official integrations or statistics.

## 9. Streamlit-specific guidance
- Cache model loading safely (`st.cache_resource` when suitable).
- Keep inference functions outside rendering blocks; avoid repeated inference on reruns.
- Use session state for UI state only, never as authorization.
- Show true pipeline readiness and clear progress/errors.
- Keep existing CSS/components if working; consolidate design tokens instead of stacking conflicting CSS.
- Release camera streams and temporary resources on stop/error.

## 10. Testing
**Unit:** pose validation/normalization, missing joints, rep counter, feedback mapping, result schema, JSON serialization, permissions, consent, unavailable-model behavior, aggregations, empty datasets.

**Integration:** upload → decode → pose → configured model → result; save → athlete history; assignment → coach review; unauthorized access denied; revoked consent blocks sharing/export; result → JSON export.

**Manual:** run `streamlit run app.py`; open `http://localhost:8501`; test valid/invalid video, missing weights, denied camera, unavailable camera, no sessions, low confidence, unauthorized role, revoked consent, and exports. Report only tests actually run.

## 11. Deployment boundaries
Build and verify locally first. Keep model weights, datasets, and caches out of the public web bundle and source control. Choose explicitly whether inference runs locally, in a secured inference service, or in a cloud worker. Do not send athlete video to external APIs without configuration, consent, and disclosure. Add resource limits, cleanup, and documented hardware/storage requirements.

## 12. Implementation order
1. Audit and baseline tests.
2. Stabilize Motion Lab and honest readiness states.
3. Add result schema and model registry.
4. Add persistence and provenance.
5. Add athlete profile/history/consent.
6. Add coach assignments/review.
7. Add restricted talent analytics and audit trail.
8. Add progress reports/export validation.
9. Run regression tests and document limitations.

Deliver in small verified stages, not one giant untested patch.
