"""Training/registry contracts, not evidence of new exercise-model accuracy."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import torch
import numpy as np
from safetensors.torch import save_file
from form_registry import registered_head,directory,EXERCISES
from form_assessment import assess_form,configured_models,REVISION
from train_form_head import load_manifest,subject_split

class TrainingTests(unittest.TestCase):
    def test_subject_split_has_no_person_leakage(self):
        rows = [{'subject_id':str(i),'label':label} for i in range(4) for label in ('correct','incorrect')]
        train,valid = subject_split(rows)
        self.assertFalse({r['subject_id'] for r in train}&{r['subject_id'] for r in valid})
        self.assertEqual({r['label'] for r in valid},{'correct','incorrect'})

    def test_single_subject_and_unbalanced_data_rejected(self):
        with self.assertRaises(ValueError): subject_split([{'subject_id':'one','label':'correct'}])
        with self.assertRaises(ValueError): subject_split([{'subject_id':str(i),'label':'correct'} for i in range(4)])

    def test_duplicate_content_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for i in range(2): (root/f'{i}.mp4').write_bytes(b'same-video-fixture')
            rows = [{'exercise':'Squats','video':f'{i}.mp4','label':'correct','label_source':'human',
                     'subject_id':str(i),'source_url':'unit-test-fixture'} for i in range(2)]
            manifest = root/'manifest.jsonl'
            manifest.write_text('\n'.join(json.dumps(r) for r in rows),encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'Duplicate'): load_manifest(manifest,'Squats')

    def test_rule_generated_labels_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            manifest = Path(directory)/'manifest.jsonl'
            manifest.write_text(json.dumps({'exercise':'Squats','label':'correct','label_source':'angle_rule'}),encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'human'): load_manifest(manifest,'Squats')

    def test_local_head_can_route_each_exercise(self):
        with tempfile.TemporaryDirectory() as root, patch('form_registry.ROOT',Path(root)), \
                patch('form_assessment.extract_embedding',return_value=torch.zeros(768)):
            for exercise in EXERCISES:
                path = directory(exercise)
                path.mkdir()
                metadata = {'exercise':exercise,'format':'vit-linear-form-v1','labels':['correct','incorrect'],
                            'deployment_status':'approved_experimental',
                            'label_source':'human','backbone_revision':REVISION,
                            'validation':{'subject_disjoint':True}}
                (path/'metadata.json').write_text(json.dumps(metadata),encoding='utf-8')
                # Artificial weights exist only in isolated test directories.
                save_file({'weight':torch.zeros(2,768),'bias':torch.zeros(2),
                           'mean':torch.zeros(768),'scale':torch.ones(768)},str(path/'head.safetensors'))
                self.assertIsNotNone(registered_head(exercise))
                self.assertIn(exercise,configured_models())
                result = assess_form([np.zeros((16,16,3),np.uint8)],exercise)
                self.assertEqual(result['label'],'Uncertain')
                self.assertEqual(result['observation_scope'],'whole sampled window')

    def test_unreviewed_candidate_is_not_served(self):
        with tempfile.TemporaryDirectory() as root, patch('form_registry.ROOT',Path(root)):
            path = directory('Squats'); path.mkdir()
            (path/'head.safetensors').write_bytes(b'not-read')
            (path/'metadata.json').write_text(json.dumps({
                'exercise':'Squats','format':'vit-linear-form-v1',
                'labels':['correct','incorrect'],'label_source':'coach_feedback',
                'deployment_status':'candidate_not_validated',
                'validation':{'session_disjoint':True}}),encoding='utf-8')
            self.assertIsNone(registered_head('Squats'))

    def test_mislabeled_model_metadata_rejected(self):
        with tempfile.TemporaryDirectory() as root, patch('form_registry.ROOT',Path(root)):
            path = directory('Squats'); path.mkdir()
            (path/'head.safetensors').write_bytes(b'not-read')
            (path/'metadata.json').write_text(json.dumps({'exercise':'Push-ups'}),encoding='utf-8')
            self.assertIsNone(registered_head('Squats'))

if __name__=='__main__': unittest.main()
