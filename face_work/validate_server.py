"""Exercise a real Streamlit session without mocking its runtime.
Camera permissions and webcam hardware still require a browser test.
"""
import asyncio
import json
from pathlib import Path
import websockets
from streamlit.proto.BackMsg_pb2 import BackMsg
from streamlit.proto.ForwardMsg_pb2 import ForwardMsg

async def check(query):
    errors,components,finished = [],[],False
    async with websockets.connect('ws://127.0.0.1:8502/_stcore/stream',
                                  subprotocols=['streamlit'],max_size=16*1024*1024) as socket:
        back = BackMsg()
        back.rerun_script.query_string = query
        await socket.send(back.SerializeToString())
        for _ in range(300):
            packet = await asyncio.wait_for(socket.recv(),timeout=45)
            message = ForwardMsg()
            message.ParseFromString(packet)
            if message.HasField('delta') and message.delta.HasField('new_element'):
                element = message.delta.new_element
                if element.HasField('exception'): errors.append(element.exception.message)
                if element.HasField('component_instance'): components.append(element.component_instance.component_name)
            if message.HasField('script_finished'):
                finished = True
                break
    return {'query':query,'finished':finished,'errors':errors,'components':components}

async def main():
    results = [await check(''),await check('input=camera')]
    Path('references/server-validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
    print(json.dumps(results,indent=2))
    assert all(r['finished'] and not r['errors'] for r in results)
    assert results[1]['components'],'Camera component was not rendered'

if __name__=='__main__': asyncio.run(main())
