# Contributing to SANDOW / AthleteAI

Thanks for helping improve the project. This is a hackathon prototype with an emphasis on
**honest model reporting**; please keep that principle intact.

## Development setup

```powershell
# Frontend
npm install
npm run check-types
npm run web

# Backend
cd face_work
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

## Pull request checklist

- [ ] The change is focused and described in the PR title.
- [ ] `npm run check-types` passes (frontend changes).
- [ ] Relevant Python validation scripts pass (backend/model changes).
- [ ] No secrets, `.env` files, model caches, databases, or generated logs are committed.
- [ ] Any new model includes provenance, preprocessing notes, and an evaluation script.
- [ ] The README / status docs are updated when feature coverage changes.
- [ ] No fabricated accuracy, latency, or "validated" claims are added.

## Model and data rules

- A pretrained backbone is **not** automatically a trained exercise/form model.
- If a model or checkpoint is unavailable, return `unavailable`/`uncertain`; never fall back to
  hard-coded angle rules or canned coaching for a learned task.
- Do not commit datasets or weights unless their license allows redistribution and the size is justified.
- Keep train/validation/test splits documented and, where possible, participant-disjoint.
- Report the evaluation set size; two clips are not a benchmark.

## Code style

- TypeScript: functional React components, shared theme tokens, typed API responses.
- Python: standard library + existing project conventions; keep inference functions out of UI code.
- Keep the FastAPI contract backwards compatible, or update `src/services/apiService.ts` in the same PR.

## Commit messages

Use short, imperative messages, e.g.:

```text
Add squat form validation report
Fix live frame reset on camera restart
Document pretrained model sources
```
