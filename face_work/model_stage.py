"""Compatibility entry point; both launch the same model-only app."""
from pathlib import Path
exec(compile((Path(__file__).resolve().parent/'app.py').read_text(encoding='utf-8'),'app.py','exec'))
