"""Bad input and default-upload integration, with actual pretrained inference."""
from pathlib import Path
import tempfile
import json
import cv2
import numpy as np
from model_counter import count_video
from video_analysis import analyse_video

def main():
    results = {}
    # A previously downloaded truncated file must never generate a success result.
    try:
        count_video('sample_videos/pushups.mp4')
        raise AssertionError('Truncated file was accepted')
    except ValueError as error:
        assert 'corrupt' in str(error).lower(),str(error)
        results['truncated_input'] = {'passed':True,'error':str(error)}
    with tempfile.TemporaryDirectory() as directory:
        short = Path(directory)/'short.mp4'
        writer = cv2.VideoWriter(str(short),cv2.VideoWriter_fourcc(*'mp4v'),15,(320,240))
        assert writer.isOpened()
        for _ in range(20): writer.write(np.zeros((240,320,3),np.uint8))
        writer.release()
        try:
            count_video(short)
            raise AssertionError('Too-short input was accepted')
        except ValueError as error:
            assert '64' in str(error)
            results['short_input'] = {'passed':True,'error':str(error)}
    report = analyse_video('sample_videos/pushups-repnet.mp4','S3D')
    assert report['recognition']['exercise']=='Push-ups'
    assert report['valid_reps'] is None and report['invalid_reps'] is None
    assert report['counting'] is not None
    report['counting'].pop('timeline')
    results['default_upload'] = report
    Path('references/input-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2),flush=True)

if __name__=='__main__': main()
