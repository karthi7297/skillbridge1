// app.js — frontend logic, wired to backend API
const $ = s => document.querySelector(s);
const api = (p, body) => fetch(p, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined).then(r => r.json());

// ---------- navigation ----------
document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  n.classList.add('active');
  document.getElementById(n.dataset.s).classList.add('active');
  document.querySelector('.main').scrollTop = 0;
}));

// ---------- shared state ----------
let analysisData = null;

// ---------- dashboard ----------
function radar(skills) {
  const cx = 160, cy = 100, R = 70;
  const n = skills.length;
  const pt = (i, frac) => {
    const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
    return `${cx + Math.cos(ang) * R * frac},${cy + Math.sin(ang) * R * frac}`;
  };
  const poly = (key) => skills.map((s, i) => pt(i, Math.min((s[key] ?? s.level ?? 0) / 5, 1)).split(',').map(Number)).map(p => p.join(',')).join(' ');
  const labels = skills.map((s, i) => {
    const [x, y] = pt(i, 1.22).split(',');
    return `<text x="${x}" y="${y}" text-anchor="middle">${s.name}</text>`;
  }).join('');
  const ring2 = [1, .75, .5, .25].map(f =>
    `<polygon points="${skills.map((_, i) => pt(i, f)).join(' ')}" fill="none" stroke="#2a2f3f"/>`).join('');
  const req = skills.map((s, i) => pt(i, Math.min(s.required_level / 5, 1))).join(' ');
  const me = skills.map((s, i) => pt(i, Math.min((s.level || 0) / 5, 1))).join(' ');
  $('#radar').innerHTML = `${ring2}<polygon points="${req}" fill="none" stroke="#4cc3ff" stroke-width="1.5"/>
    <polygon points="${me}" fill="rgba(124,108,255,.3)" stroke="#7c6cff" stroke-width="2"/>${labels}`;
}

function skillBars(skills, mount) {
  mount.innerHTML = skills.map(s => {
    const pct = Math.min((s.level || 0) / s.required_level * 100, 100);
    const color = (s.level || 0) >= s.required_level ? 'var(--green)' : (s.level || 0) > 0 ? 'var(--amber)' : 'var(--red)';
    const badge = (s.level || 0) >= s.required_level ? '<span class="badge ok">Met ✓</span>'
      : (s.level || 0) > 0 ? `<span class="badge prog">L${s.level}/${s.required_level}</span>`
      : `<span class="badge gap">Gap −${s.required_level}</span>`;
    return `<div class="skill-row"><span>${s.name}</span>${badge}</div><div class="bar"><div style="width:${pct}%;background:${color}"></div></div>`;
  }).join('');
}

async function loadDashboard() {
  const p = await api('/api/progress');
  analysisData = p;
  const prof = await api('/api/profile');
  $('#welcome').textContent = `Welcome back, ${prof.user.name} 👋`;
  $('#dashSub').textContent = `Target: ${prof.role.title} · readiness ${p.readiness}%`;
  $('#userName').textContent = prof.user.name;
  $('#userGoal').textContent = `Goal: ${prof.role.title}`;
  $('#avatar').textContent = prof.user.name[0].toUpperCase();
  $('#stMaster').textContent = `${p.mastered} / ${p.total}`;
  $('#stRoad').textContent = p.roadmap + '%';
  $('#stQuiz').textContent = p.avgQuiz == null ? '—' : p.avgQuiz + '%';
  $('#ringNum').textContent = p.readiness + '%';
  $('#ringVal').style.strokeDashoffset = 345 - 345 * p.readiness / 100;
  radar(p.skills);
  skillBars(p.skills, $('#dashSkills'));
}

// ---------- onboarding ----------
async function loadOnboarding() {
  const prof = await api('/api/profile');
  const roles = await api('/api/roles');
  $('#goalSelect').innerHTML = roles.map(r => `<option value="${r.id}" ${r.id === prof.user.goal_role_id ? 'selected' : ''}>🎯 ${r.title}</option>`).join('');
  skillBars(prof.skills, $('#onboardSkills'));
}

$('#btnGoal').addEventListener('click', async () => {
  const sel = $('#goalSelect');
  const title = sel.options[sel.selectedIndex].text.replace('🎯 ', '');
  $('#goalNote').textContent = 'Agents re-planning…';
  const out = await api('/api/goal', { goal: title });
  $('#goalNote').innerHTML = `✅ Roadmap regenerated (was v${out.previous_version || '—'}). Transferable skills kept: <b>${out.kept.join(', ') || 'none'}</b>.`;
  await loadDashboard(); await loadRoadmap(); await loadAgents(); await loadOnboarding();
});

$('#onboardSend').addEventListener('click', async () => {
  const input = $('#onboardInput');
  const text = input.value.trim();
  if (!text) return;
  const chat = $('#onboarding .chat');
  chat.insertAdjacentHTML('beforeend', `<div class="msg user">${text}</div>`);
  input.value = '';
  chat.insertAdjacentHTML('beforeend', '<div class="msg bot" id="onbWait">Profile Agent working…</div>');
  const out = await api('/api/chat', { message: text });
  $('#onbWait')?.remove();
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot">${out.reply}</div>`);
  await loadOnboarding(); await loadDashboard();
});

// ---------- skill gap ----------
async function loadGap() {
  const a = await api('/api/analysis');
  $('#gapSub').textContent = `Skill Analyst Agent · ${a.role.title} requirement matrix · readiness ${a.readiness}%`;
  $('#gapBody').innerHTML = a.skills.map(s => {
    const st = (s.level || 0) >= s.required_level ? '<span class="badge ok">Met ✓</span>'
      : (s.level || 0) > 0 ? `<span class="badge prog">Gap −${s.required_level - s.level}</span>`
      : `<span class="badge gap">Gap −${s.required_level}</span>`;
    return `<tr><td>${s.name}</td><td>${s.level || 0}</td><td>${s.required_level}</td><td>${st}</td></tr>`;
  }).join('');
  $('#strengths').textContent = a.met.map(s => s.name).join(', ') || 'None yet — you will build them!';
  $('#gapsTxt').textContent = a.gaps.map(g => `${g.name} (−${g.gap})`).join(', ') || 'No gaps — you are ready!';
}

// ---------- roadmap ----------
async function loadRoadmap() {
  const rm = await api('/api/roadmap');
  if (!rm) { $('#rmSub').textContent = 'No roadmap yet — generate one.'; $('#roadmapBody').innerHTML = ''; return; }
  $('#rmSub').textContent = `Roadmap Planner Agent · v${rm.version} · ${rm.reason} · ${rm.progress}% complete`;
  const ph = Object.entries(rm.phases);
  $('#roadmapBody').innerHTML = ph.map(([name, tasks]) => {
    const allDone = tasks.every(t => t.done);
    const badge = allDone ? '<span class="badge ok">Completed</span>'
      : `<span class="badge prog">In progress · ${Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%</span>`;
    return `<div class="phase ${allDone ? 'done' : ''}"><div class="phead"><b>${name}</b>${badge}</div>` +
      tasks.map(t => `<div class="task"><input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}>
        <span>${t.done ? '✅ ' : ''}${t.title} · <span class="muted">${t.skill_name || ''}</span>
        ${t.resource_url ? `· <a href="${t.resource_url}" target="_blank">🔗 ${t.resource_type || 'resource'}</a>` : ''}</span></div>`).join('') + '</div>';
  }).join('');
  $('#roadmapBody').querySelectorAll('.task input').forEach(c => c.addEventListener('change', async e => {
    await api(`/api/tasks/${e.target.dataset.id}/toggle`);
    await loadRoadmap(); await loadDashboard();
  }));
}

$('#btnGenRoad').addEventListener('click', async () => {
  $('#btnGenRoad').textContent = 'Planner Agent working…';
  await api('/api/roadmap/generate', { reason: 'Manual generation' });
  $('#btnGenRoad').textContent = '⚡ Generate / Regenerate Roadmap';
  await loadRoadmap(); await loadDashboard();
});

// ---------- quiz ----------
$('#roadmap .nav-item');
async function loadQuizSkillChips() {
  // quiz lives on its own screen; provide skill picker
  const a = await api('/api/analysis');
  $('#quizBody').innerHTML = `<h3>Pick a skill to assess</h3><div class="chips" id="quizChips">
    ${a.skills.map(s => `<span class="chip" data-skill="${s.name}">${s.name}</span>`).join('')}</div><div id="quizArea"></div>`;
  $('#quizChips').querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => startQuiz(c.dataset.skill)));
}
async function startQuiz(skill) {
  const q = await api('/api/quiz', { skill });
  let answers = [];
  $('#quizArea').innerHTML = `<h3>${skill} — ${q.questions.length} questions</h3>` + q.questions.map((qq, qi) =>
    `<div style="margin:14px 0"><b style="font-size:13px">${qi + 1}. ${qq.q}</b><div style="margin-top:8px">` +
    qq.a.map((opt, oi) => `<button class="q-opt" data-q="${qi}" data-o="${oi}">${opt}</button>`).join('') + '</div></div>'
  ).join('') + `<button class="btn" id="quizSubmit">Submit</button> <span class="muted" id="quizHint">Score ≥ 60% raises mastery · below triggers re-plan</span>`;
  $('#quizArea').querySelectorAll('.q-opt').forEach(b => b.addEventListener('click', () => {
    const qi = +b.dataset.q;
    answers[qi] = +b.dataset.o;
    b.parentElement.querySelectorAll('.q-opt').forEach(x => x.classList.remove('sel', 'correct', 'wrong'));
    b.classList.add('sel');
  }));
  $('#quizSubmit').addEventListener('click', async () => {
    if (answers.filter(a => a != null).length < q.questions.length) { $('#quizHint').textContent = '⚠️ Answer all questions first'; return; }
    $('#quizSubmit').textContent = 'Evaluator grading…';
    const res = await api('/api/quiz', { skill, answers, questions: q.questions });
    q.questions.forEach((qq, qi) => {
      const btns = $('#quizArea').querySelectorAll(`[data-q="${qi}"]`);
      btns[qq.correct].classList.add('correct');
      if (answers[qi] !== qq.correct) btns[answers[qi]].classList.add('wrong');
    });
    $('#quizHint').innerHTML = res.pct >= 60
      ? `<span class="badge ok">Scored ${res.pct}% — mastery raised!</span>`
      : `<span class="badge gap">Scored ${res.pct}% — remedial task added & roadmap re-planned</span>`;
    $('#quizSubmit').textContent = 'Submit';
    await loadAgents(); await loadDashboard(); await loadRoadmap();
  });
}

// ---------- resources ----------
async function loadResources(filter) {
  const rows = await api('/api/resources' + (filter ? `?skill=${encodeURIComponent(filter)}` : ''));
  $('#resFilters').innerHTML = ['All', 'JavaScript', 'React', 'Node.js', 'CSS', 'SQL', 'Python'].map(f =>
    `<span class="chip ${((filter || 'All') === f) ? 'sel' : ''}" data-f="${f}">${f}</span>`).join('');
  $('#resFilters').querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => loadResources(c.dataset.f === 'All' ? null : c.dataset.f)));
  $('#resGrid').innerHTML = rows.map(r => `<div class="card"><h3>${r.title}</h3>
    <p class="muted">${{Video: '🎥', Interactive: '🛠️', Docs: '📄', Project: '🧩'}[r.type] || '📘'} ${r.type} · ${r.duration} · ${r.difficulty}</p>
    <p class="muted" style="margin-top:6px">Skill: <b>${r.skill_name}</b></p>
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <span class="badge info">${r.why}</span><a class="btn ghost" style="text-decoration:none" href="${r.url}" target="_blank">Open →</a></div></div>`).join('');
}

// ---------- mentor ----------
async function loadChat() {
  const msgs = await api('/api/chat');
  if (msgs.length) $('#mentorChat').innerHTML = msgs.map(m => `<div class="msg ${m.role}">${m.text}</div>`).join('');
}
async function sendMentor(text) {
  if (!text?.trim()) return;
  const chat = $('#mentorChat');
  chat.insertAdjacentHTML('beforeend', `<div class="msg user">${text}</div>`);
  chat.insertAdjacentHTML('beforeend', '<div class="msg bot" id="mentorWait">Mentor thinking…</div>');
  chat.scrollTop = 1e9;
  const out = await api('/api/chat', { message: text });
  $('#mentorWait')?.remove();
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot">${out.reply}</div>`);
  await loadAgents();
}
$('#mentorSend').addEventListener('click', () => { sendMentor($('#mentorInput').value); $('#mentorInput').value = ''; });
$('#mentorInput').addEventListener('keydown', e => { if (e.key === 'Enter') { sendMentor(e.target.value); e.target.value = ''; } });
document.querySelectorAll('#mentor .chip').forEach(c => c.addEventListener('click', () => sendMentor(c.dataset.q)));

// ---------- agent feed ----------
async function loadAgents() {
  const logs = await api('/api/agents');
  $('#agentLog').innerHTML = logs.map(l =>
    `<div class="log-item"><span class="agent-tag a-${l.agent.split(' ')[0]}">${l.agent}</span><span>${l.message}</span><span class="time">${(l.created_at || '').slice(11, 19)}</span></div>`).join('');
}

// ---------- reset demo ----------
$('#resetDemo').addEventListener('click', async () => {
  await api('/api/demo/reset', {});
  await Promise.all([loadDashboard(), loadOnboarding(), loadGap(), loadRoadmap(), loadAgents(), loadChat(), loadQuizSkillChips(), loadResources()]);
});

// ---------- boot ----------
(async () => {
  // first run: auto-generate roadmap so the app is never empty
  const rm = await api('/api/roadmap');
  if (!rm) await api('/api/roadmap/generate', { reason: 'Initial roadmap from skill gap analysis' });
  await Promise.all([loadDashboard(), loadOnboarding(), loadGap(), loadRoadmap(), loadAgents(), loadChat(), loadQuizSkillChips(), loadResources()]);
})();
