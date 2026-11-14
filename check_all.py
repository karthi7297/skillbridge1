"""Comprehensive functionality check for SkillBridge AI backend."""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
FAILURES = []


def check(name, cond, detail=''):
    status = 'PASS' if cond else 'FAIL'
    if not cond:
        FAILURES.append(f'{name}: {detail}')
    print(f'  [{status}] {name}' + (f' -> {detail}' if detail else ''))


def section(title):
    print(f'\n=== {title} ===')


# ---------------------------------------------------------------- seed
section('0. Seed all mock learners')
from backend.app.database import SessionLocal
from backend.scripts.seed import seed_all_mock_learners
db = SessionLocal()
seeded = seed_all_mock_learners(db)
db.close()
check('mock learners seeded', len(seeded) >= 6, f'{len(seeded)} seeded: {seeded}')

# ---------------------------------------------------------------- health
section('1. Health')
r = client.get('/api/health')
check('health 200', r.status_code == 200, r.status_code)
h = r.json()
check('openrouter configured', h.get('openrouter_configured') is True, h.get('openrouter_configured'))
check('db type reported', h.get('database') in ('SQLite', 'PostgreSQL'), h.get('database'))

# ---------------------------------------------------------------- demo users
section('2. Demo users listing')
r = client.get('/api/demo/users')
check('demo users 200', r.status_code == 200, r.status_code)
users = r.json()
check('at least 6 mock users', len(users) >= 6, f'{len(users)} users')
for u in users:
    print(f"      {u['user_id']:22} {u['goal_role_title'] or '-':28} skills={u['skill_count']}")

# ---------------------------------------------------------------- login
section('3. Login for every mock learner')
for u in users:
    r = client.post('/api/login', params={'user_id': u['user_id']})
    ok = r.status_code == 200 and r.json().get('user_id') == u['user_id']
    check(f"login {u['user_id']}", ok, r.status_code)

r = client.post('/api/login', params={'email': users[0]['email']})
check('login by email', r.status_code == 200 and r.json().get('user_id') == users[0]['user_id'],
      r.status_code)

r = client.post('/api/login')
check('login with no args -> default demo', r.status_code == 200 and r.json().get('demo') is True,
      r.status_code)

# ---------------------------------------------------------------- per-learner journey
section('4. Full learner journey per mock learner')
for u in users:
    uid = u['user_id']
    print(f"    -- {u['name']} ({uid})")

    r = client.get('/api/profile', params={'user_id': uid})
    check('  profile', r.status_code == 200, r.status_code)

    r = client.get('/api/careers')
    check('  careers', r.status_code == 200 and len(r.json()) == 8, r.status_code)

    r = client.post('/api/careers/match', params={'user_id': uid})
    check('  career match', r.status_code == 200, r.status_code)

    r = client.post('/api/career/analyze', params={'user_id': uid})
    check('  skill gap analysis', r.status_code == 200, r.status_code)
    if r.status_code == 200:
        g = r.json()
        check('  readiness computed', isinstance(g.get('readiness_percent'), (int, float)),
              g.get('readiness_percent'))

    r = client.get('/api/roadmap', params={'user_id': uid})
    check('  roadmap', r.status_code == 200, r.status_code)
    if r.status_code == 200:
        rm = r.json()
        check('  roadmap has tasks', len(rm.get('tasks', [])) > 0, len(rm.get('tasks', [])))
        check('  roadmap has phases', len(rm.get('phases', [])) > 0, len(rm.get('phases', [])))

    r = client.get('/api/roadmap/versions', params={'user_id': uid})
    check('  roadmap versions', r.status_code == 200, r.status_code)

    r = client.get('/api/agents/logs', params={'user_id': uid, 'limit': 50})
    check('  agent logs', r.status_code == 200 and len(r.json()) > 0,
          f'{r.status_code} count={len(r.json()) if r.status_code == 200 else 0}')

    r = client.get('/api/resources')
    check('  resources', r.status_code == 200 and len(r.json()) > 0, r.status_code)

# ---------------------------------------------------------------- assessment
section('5. Assessment flow')
r = client.post('/api/assessment/start', params={'user_id': 'demo-user-alex', 'skill_name': 'Python'})
check('assessment start', r.status_code == 200, r.status_code)
if r.status_code == 200:
    a = r.json()
    check('  questions present', len(a.get('questions', [])) > 0, len(a.get('questions', [])))
    answers = {q['id']: 0 for q in a['questions']}
    r = client.post('/api/assessment/submit',
                    params={'user_id': 'demo-user-alex'},
                    json={'assessment_id': a['assessment_id'], 'answers': answers})
    check('  assessment submit', r.status_code == 200, r.status_code)
    if r.status_code == 200:
        res = r.json()
        check('  graded result', 'score' in res or 'correct' in res or 'passed' in res,
              list(res.keys())[:6])
        check('  adaptation triggered on low score', res.get('adaptation_triggered') is True,
              res.get('adaptation_triggered'))

# ---------------------------------------------------------------- goal switch
section('6. Goal switch (adaptive trigger 2)')
r = client.get('/api/careers')
roles = r.json()
target = next(x for x in roles if x['title'] == 'Data Engineer')
r = client.post('/api/career/change-goal',
                params={'user_id': 'demo-user-alex'},
                json={'new_role_id': target['id'], 'reason': 'Testing goal switch'})
check('goal change', r.status_code == 200, r.status_code)
if r.status_code == 200:
    g = r.json()
    check('  transferable skills preserved', len(g.get('transferable_skills', [])) > 0,
          g.get('transferable_skills'))
    check('  new roadmap version', g.get('new_roadmap_version', 0) >= 2, g.get('new_roadmap_version'))

# ---------------------------------------------------------------- mentor (LLM)
section('7. Mentor chat (OpenRouter)')
r = client.post('/api/mentor/chat',
                params={'user_id': 'demo-user-alex'},
                json={'message': 'What should I focus on next?'})
check('mentor chat', r.status_code == 200, r.status_code)
if r.status_code == 200:
    m = r.json()
    check('  reply non-empty', len(m.get('reply', '')) > 0, len(m.get('reply', '')))

# ---------------------------------------------------------------- task update
section('8. Task status update')
r = client.get('/api/roadmap', params={'user_id': 'mock-user-priya'})
if r.status_code == 200:
    tasks = r.json().get('tasks', [])
    if tasks:
        r = client.patch(f"/api/roadmap/tasks/{tasks[0]['id']}",
                         params={'user_id': 'mock-user-priya'},
                         json={'status': 'completed'})
        check('task update', r.status_code == 200, r.status_code)

print('\n' + '=' * 60)
if FAILURES:
    print(f'FAILURES ({len(FAILURES)}):')
    for f in FAILURES:
        print('  -', f)
else:
    print('ALL CHECKS PASSED')
print('=' * 60)
