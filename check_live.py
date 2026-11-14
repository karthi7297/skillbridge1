"""Live HTTP check: exercises the exact URLs the frontend api.ts calls.

Runs a real uvicorn server in a background thread so the checks go over
actual TCP + HTTP (not the ASGI TestClient transport).
"""
import json
import threading
import time

import requests
import uvicorn

from backend.app.main import app

BASE = 'http://localhost:8000'
FAILS = []

# Boot a real HTTP server for the duration of this script.
server = uvicorn.Server(uvicorn.Config(app, host='127.0.0.1', port=8000, log_level='error'))
thread = threading.Thread(target=server.run, daemon=True)
thread.start()

# Wait for readiness.
for _ in range(60):
    try:
        if requests.get(f'{BASE}/api/health', timeout=2).status_code == 200:
            break
    except Exception:
        pass
    time.sleep(0.5)
else:
    raise SystemExit('server did not become ready')


def check(name, cond, detail=''):
    if not cond:
        FAILS.append(f'{name}: {detail}')
    print(f'  [{"PASS" if cond else "FAIL"}] {name}' + (f' -> {detail}' if detail else ''))


def section(t):
    print(f'\n=== {t} ===')


section('Health (Header polls this every 30s)')
r = requests.get(f'{BASE}/api/health', timeout=10)
check('GET /api/health', r.status_code == 200, r.status_code)
print('      ', r.json())

section('Login (SigninPage)')
r = requests.post(f'{BASE}/api/login', params={'user_id': 'demo-user-alex'}, timeout=10)
check('POST /api/login', r.status_code == 200, r.status_code)
print('      ', r.json())

section('Demo users (SigninPage mock account list)')
r = requests.get(f'{BASE}/api/demo/users', timeout=10)
check('GET /api/demo/users', r.status_code == 200, r.status_code)
for u in r.json():
    print(f"      {u['user_id']:22} {u['name']:26} -> {u['goal_role_title']}")

section('CORS preflight (browser sends this before POST)')
r = requests.options(f'{BASE}/api/login',
                     headers={'Origin': 'http://localhost:5173',
                              'Access-Control-Request-Method': 'POST',
                              'Access-Control-Request-Headers': 'content-type'})
check('OPTIONS /api/login CORS', r.status_code == 200, r.status_code)
check('  allow-origin present', 'access-control-allow-origin' in {k.lower() for k in r.headers},
      r.headers.get('access-control-allow-origin'))

section('All api.ts endpoints (exact frontend URLs)')
uid = 'demo-user-alex'
calls = [
    ('getProfile',        'GET',    f'/api/profile?user_id={uid}',                 None),
    ('updateProfile',     'POST',   f'/api/profile?user_id={uid}',                 {'name': 'Alex Chen (Demo Student)'}),
    ('getCareers',        'GET',    '/api/careers',                               None),
    ('matchCareers',      'POST',   f'/api/careers/match?user_id={uid}',           None),
    ('analyzeSkillGaps',  'POST',   f'/api/career/analyze?user_id={uid}',          None),
    ('getRoadmap',        'GET',    f'/api/roadmap?user_id={uid}',                 None),
    ('getRoadmapVersions','GET',    f'/api/roadmap/versions?user_id={uid}',       None),
    ('generateRoadmap',   'POST',   f'/api/roadmap/generate?user_id={uid}',        None),
    ('startAssessment',   'POST',   f'/api/assessment/start?user_id={uid}&skill_name=Python&difficulty=Beginner', None),
    ('submitAssessment',  'POST',   f'/api/assessment/submit?user_id={uid}',       {'assessment_id': 'x', 'answers': {}}),
    ('changeGoal',        'POST',   f'/api/career/change-goal?user_id={uid}',      {'new_role_id': 'role-devops', 'reason': 'liveliness check'}),
    ('mentorChat',        'POST',   f'/api/mentor/chat?user_id={uid}',            {'message': 'Hello mentor'}),
    ('getAgentLogs',      'GET',    f'/api/agents/logs?user_id={uid}&limit=40',   None),
    ('getResources',      'GET',    '/api/resources',                             None),
    ('loadDemo',          'POST',   '/api/demo/load',                             None),
]

for name, method, path, body in calls:
    try:
        if method == 'GET':
            r = requests.get(f'{BASE}{path}', timeout=30)
        else:
            r = requests.post(f'{BASE}{path}', json=body, timeout=30)
        # submitAssessment needs a real assessment id
        if name == 'submitAssessment' and r.status_code >= 400:
            s = requests.post(f'{BASE}/api/assessment/start',
                              params={'user_id': uid, 'skill_name': 'Python'}, timeout=30)
            aid = s.json()['assessment_id']
            answers = {q['id']: 0 for q in s.json()['questions']}
            r = requests.post(f'{BASE}{path}',
                              params={'user_id': uid},
                              json={'assessment_id': aid, 'answers': answers}, timeout=30)
        check(f'{name:20} {method:5} {path.split("?")[0]}', r.status_code < 400,
              f'{r.status_code}')
    except Exception as e:
        check(f'{name:20} {method:5} {path.split("?")[0]}', False, str(e)[:60])

section('Update task (RoadmapPage PATCH)')
r = requests.get(f'{BASE}/api/roadmap?user_id={uid}', timeout=30)
if r.status_code == 200 and r.json().get('tasks'):
    tid = r.json()['tasks'][0]['id']
    r = requests.patch(f'{BASE}/api/roadmap/tasks/{tid}',
                       params={'user_id': uid}, json={'status': 'pending'}, timeout=30)
    check('PATCH /api/roadmap/tasks/{id}', r.status_code == 200, r.status_code)

print('\n' + '=' * 60)
if FAILS:
    print(f'FAILURES ({len(FAILS)}):')
    for f in FAILS:
        print('  -', f)
else:
    print('LIVE HTTP: ALL CHECKS PASSED')
print('=' * 60)
