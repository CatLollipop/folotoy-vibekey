"""只用合成stdin、临时0700邮箱，不调用open、不启动Codex、不读取私人会话。"""
import json, os, pathlib, subprocess, tempfile, unittest, uuid

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / 'codex-hook.py'

class CodexHookTest(unittest.TestCase):
    def test_current_hook_payload_body_and_stable_identity(self):
        with tempfile.TemporaryDirectory() as directory:
            env = dict(os.environ, VIBEKEY_BRIDGE_ROOT=directory, VIBEKEY_HOOK_NO_OPEN='1')
            session, turn = str(uuid.uuid4()), 'synthetic-turn'
            for _ in range(2):
                result = subprocess.run(['/usr/bin/python3', str(SCRIPT), '--event', 'done'],
                    input=json.dumps({'hook_event_name':'Stop','session_id':session,'turn_id':turn,
                                      'last_assistant_message':'专用合成正文🙂。','api_key':'must-never-copy'}),
                    text=True, capture_output=True, env=env)
                self.assertEqual(result.returncode,0); self.assertEqual(result.stdout,''); self.assertEqual(result.stderr,'')
            files = list((pathlib.Path(directory)/'events').glob('*.json'))
            self.assertEqual(len(files),2)
            envelopes = [json.loads(p.read_text()) for p in files]
            self.assertEqual(envelopes[0]['event']['eventID'], envelopes[1]['event']['eventID'])
            self.assertEqual(envelopes[0]['event']['instanceID'], envelopes[1]['event']['instanceID'])
            self.assertEqual(envelopes[0]['event']['sessionID'],session)
            self.assertEqual(envelopes[0]['reply']['text'],'专用合成正文🙂。')
            self.assertEqual(envelopes[0]['reply']['messageID'],envelopes[1]['reply']['messageID'])
            self.assertNotIn('must-never-copy',json.dumps(envelopes))
            self.assertTrue(all(p.stat().st_mode & 0o777 == 0o600 for p in files))

if __name__ == '__main__': unittest.main()
