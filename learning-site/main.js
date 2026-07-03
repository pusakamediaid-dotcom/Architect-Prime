const STORAGE_KEYS = {
  tasks: 'pusakaStudentHub.tasks',
  schedules: 'pusakaStudentHub.schedules',
  grades: 'pusakaStudentHub.grades',
  checklists: 'pusakaStudentHub.checklists',
  goals: 'pusakaStudentHub.goals',
  notes: 'pusakaStudentHub.notes',
};

const $ = (selector) => document.querySelector(selector);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const nowIso = () => new Date().toISOString();

const defaults = {
  tasks: [],
  schedules: [],
  grades: [],
  checklists: [],
  goals: [],
  notes: [],
};

const checklistTemplates = [
  { title: 'Checklist tugas makalah', items: ['Tentukan topik', 'Cari referensi', 'Buat outline', 'Tulis draft', 'Cek sitasi', 'Kirim sebelum deadline'] },
  { title: 'Checklist presentasi', items: ['Buat slide', 'Latihan bicara', 'Siapkan contoh', 'Cek file', 'Datang lebih awal'] },
  { title: 'Checklist ujian', items: ['Buat rangkuman', 'Latihan soal', 'Tidur cukup', 'Siapkan alat tulis', 'Datang tepat waktu'] },
  { title: 'Checklist skripsi/proyek akhir', items: ['Tentukan masalah', 'Buat proposal', 'Kumpulkan data', 'Analisis hasil', 'Revisi', 'Siapkan sidang'] },
];

const academicTemplates = [
  { title: 'Rencana belajar mingguan', text: 'Senin:\nSelasa:\nRabu:\nKamis:\nJumat:\nSabtu/Minggu:\nTarget minggu ini:\nEvaluasi:' },
  { title: 'Outline makalah', text: 'Judul:\nLatar belakang:\nRumusan masalah:\nPembahasan 1:\nPembahasan 2:\nKesimpulan:\nDaftar pustaka:' },
  { title: 'Checklist presentasi', text: '- Slide pembuka\n- Poin utama\n- Contoh/studi kasus\n- Kesimpulan\n- Latihan tanya jawab\n- Backup file' },
  { title: 'Catatan Cornell sederhana', text: 'Topik:\nTanggal:\n\nCatatan utama:\n\nKata kunci / pertanyaan:\n\nRingkasan 3 kalimat:' },
  { title: 'Rencana proyek kelompok', text: 'Nama proyek:\nAnggota:\nPembagian tugas:\nDeadline kecil:\nRisiko:\nProgress minggu ini:\nCatatan:' },
  { title: 'Target semester', text: 'Target IP/nilai:\nKebiasaan belajar:\nMata kuliah prioritas:\nDeadline penting:\nReward jika tercapai:' },
  { title: 'Evaluasi nilai', text: 'Mata kuliah:\nNilai saat ini:\nKomponen terlemah:\nRencana perbaikan:\nTarget akhir:' },
];

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[key])) ?? defaults[key];
  } catch {
    return defaults[key];
  }
}

function save(key, value) {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  renderAll();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function formatDate(value) {
  if (!value) return 'Tanpa deadline';
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function priorityLabel(value) {
  return { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' }[value] || 'Sedang';
}

function statusLabel(value) {
  return { todo: 'Belum', progress: 'Proses', done: 'Selesai' }[value] || value;
}

function renderStats() {
  const tasks = load('tasks');
  const schedules = load('schedules');
  const goals = load('goals');
  const activeTasks = tasks.filter((item) => item.status !== 'done').length;
  const done = tasks.filter((item) => item.status === 'done').length;
  const avgGoal = goals.length ? Math.round(goals.reduce((sum, item) => sum + Number(item.progress || 0), 0) / goals.length) : 0;
  $('#statTasks').textContent = activeTasks;
  $('#statDone').textContent = done;
  $('#statSchedules').textContent = schedules.length;
  $('#statGoals').textContent = `${avgGoal}%`;
}

function renderTasks() {
  const tasks = load('tasks').sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  $('#taskList').innerHTML = tasks.length ? tasks.map((task) => `
    <article class="item-card ${task.status === 'done' ? 'done' : ''}">
      <div>
        <span class="pill ${task.priority}">${priorityLabel(task.priority)}</span>
        <h3>${escapeHtml(task.title)}</h3>
        <p>${escapeHtml(task.course || 'Tanpa mata kuliah')} · ${formatDate(task.dueDate)} · Status: ${statusLabel(task.status)}</p>
      </div>
      <div class="item-actions">
        <button type="button" data-action="done-task" data-id="${task.id}">Selesai</button>
        <button type="button" data-action="delete-task" data-id="${task.id}">Hapus</button>
      </div>
    </article>`).join('') : emptyState('Belum ada tugas. Tambahkan tugas pertama Anda.');
}

function renderSchedules() {
  const schedules = load('schedules');
  $('#scheduleList').innerHTML = schedules.length ? schedules.map((item) => `
    <article class="item-card">
      <div><span class="pill neutral">${escapeHtml(item.day)}</span><h3>${escapeHtml(item.activity)}</h3><p>${escapeHtml(item.time || 'Waktu bebas')} · ${escapeHtml(item.note || 'Tanpa catatan')}</p></div>
      <div class="item-actions"><button type="button" data-action="delete-schedule" data-id="${item.id}">Hapus</button></div>
    </article>`).join('') : emptyState('Belum ada jadwal. Tambahkan jadwal belajar pertama Anda.');
}

function gradeLetter(score) {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

function renderGrades() {
  const grades = load('grades');
  $('#gradeList').innerHTML = grades.length ? grades.map((grade) => {
    const totalWeight = grade.components.reduce((sum, c) => sum + Number(c.weight), 0);
    const finalScore = grade.components.reduce((sum, c) => sum + (Number(c.weight) * Number(c.score) / 100), 0);
    const components = grade.components.map((c, index) => `<li>${escapeHtml(c.name)} — Bobot ${c.weight}% · Nilai ${c.score} <button type="button" data-action="delete-grade-component" data-id="${grade.id}" data-index="${index}">hapus</button></li>`).join('');
    return `<article class="item-card"><div><h3>${escapeHtml(grade.course)}</h3><p>Nilai akhir sementara: <strong>${finalScore.toFixed(2)}</strong> (${gradeLetter(finalScore)}) · Sisa bobot: ${100 - totalWeight}%</p><ul>${components}</ul></div><div class="item-actions"><button type="button" data-action="delete-grade" data-id="${grade.id}">Hapus</button></div></article>`;
  }).join('') : emptyState('Belum ada data nilai. Tambahkan komponen nilai pertama Anda.');
}

function renderChecklistTemplates() {
  $('#checklistTemplates').innerHTML = checklistTemplates.map((template, index) => `<button type="button" class="chip-button" data-action="use-checklist-template" data-index="${index}">${escapeHtml(template.title)}</button>`).join('');
}

function renderChecklists() {
  const checklists = load('checklists');
  $('#checklistList').innerHTML = checklists.length ? checklists.map((list) => {
    const items = list.items.map((item) => `<li><label><input type="checkbox" data-action="toggle-check-item" data-list-id="${list.id}" data-item-id="${item.id}" ${item.done ? 'checked' : ''}> <span>${escapeHtml(item.text)}</span></label><button type="button" data-action="delete-check-item" data-list-id="${list.id}" data-item-id="${item.id}">hapus</button></li>`).join('');
    return `<article class="item-card"><div><h3>${escapeHtml(list.title)}</h3><ul class="check-items">${items || '<li>Belum ada item.</li>'}</ul><form class="inline-form" data-action="add-check-item" data-list-id="${list.id}"><input aria-label="Item checklist baru" placeholder="Tambah item"><button type="submit">Tambah</button></form></div><div class="item-actions"><button type="button" data-action="delete-checklist" data-id="${list.id}">Hapus</button></div></article>`;
  }).join('') : emptyState('Belum ada checklist. Buat checklist atau pakai template.');
}

function renderGoals() {
  const goals = load('goals');
  $('#goalList').innerHTML = goals.length ? goals.map((goal) => `<article class="item-card"><div><h3>${escapeHtml(goal.title)}</h3><p>${formatDate(goal.deadline)} · ${escapeHtml(goal.status)}</p><div class="progress"><span style="width:${Number(goal.progress || 0)}%"></span></div><p>${Number(goal.progress || 0)}% selesai</p></div><div class="item-actions"><button type="button" data-action="delete-goal" data-id="${goal.id}">Hapus</button></div></article>`).join('') : emptyState('Belum ada target. Tambahkan target akademik pertama Anda.');
}

function renderNotes() {
  const notes = load('notes').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $('#noteList').innerHTML = notes.length ? notes.map((note) => `<article class="item-card"><div><span class="pill neutral">${escapeHtml(note.category || 'Umum')}</span><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.body)}</p><small>${new Date(note.createdAt).toLocaleString('id-ID')}</small></div><div class="item-actions"><button type="button" data-action="delete-note" data-id="${note.id}">Hapus</button></div></article>`).join('') : emptyState('Belum ada catatan. Simpan catatan kuliah atau ide belajar Anda.');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Template berhasil disalin.');
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    toast('Template berhasil disalin.');
  }
}

function renderTemplates() {
  $('#templateList').innerHTML = academicTemplates.map((template, index) => `<article class="template-card"><h3>${escapeHtml(template.title)}</h3><pre>${escapeHtml(template.text)}</pre><button type="button" class="button primary" data-action="copy-template" data-index="${index}">Salin Template</button></article>`).join('');
}

function renderAll() {
  renderStats();
  renderTasks();
  renderSchedules();
  renderGrades();
  renderChecklistTemplates();
  renderChecklists();
  renderGoals();
  renderNotes();
  renderTemplates();
}

$('#taskForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const tasks = load('tasks');
  tasks.push({ id: uid(), title: $('#taskTitle').value.trim(), course: $('#taskCourse').value.trim(), dueDate: $('#taskDue').value, priority: $('#taskPriority').value, status: $('#taskStatus').value, createdAt: nowIso() });
  save('tasks', tasks);
  event.target.reset();
  toast('Tugas disimpan.');
});

$('#scheduleForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const schedules = load('schedules');
  schedules.push({ id: uid(), day: $('#scheduleDay').value, time: $('#scheduleTime').value, activity: $('#scheduleActivity').value.trim(), note: $('#scheduleNote').value.trim() });
  save('schedules', schedules);
  event.target.reset();
  toast('Jadwal ditambahkan.');
});

$('#gradeForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const course = $('#gradeCourse').value.trim();
  const component = $('#gradeComponent').value.trim();
  const weight = Number($('#gradeWeight').value);
  const score = Number($('#gradeScore').value);
  const error = $('#gradeError');
  error.textContent = '';
  if (weight < 0 || weight > 100 || score < 0 || score > 100) {
    error.textContent = 'Bobot dan nilai harus berada di antara 0–100.';
    return;
  }
  const grades = load('grades');
  let grade = grades.find((item) => item.course.toLowerCase() === course.toLowerCase());
  if (!grade) {
    grade = { id: uid(), course, components: [] };
    grades.push(grade);
  }
  const totalWeight = grade.components.reduce((sum, item) => sum + Number(item.weight), 0);
  if (totalWeight + weight > 100) {
    error.textContent = 'Bobot nilai tidak boleh lebih dari 100%.';
    return;
  }
  grade.components.push({ name: component, weight, score });
  save('grades', grades);
  event.target.reset();
  toast('Komponen nilai ditambahkan.');
});

$('#checklistForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const checklists = load('checklists');
  checklists.push({ id: uid(), title: $('#checklistTitle').value.trim(), items: [] });
  save('checklists', checklists);
  event.target.reset();
  toast('Checklist dibuat.');
});

$('#goalForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const goals = load('goals');
  goals.push({ id: uid(), title: $('#goalTitle').value.trim(), deadline: $('#goalDeadline').value, progress: Math.min(100, Math.max(0, Number($('#goalProgress').value || 0))), status: $('#goalStatus').value });
  save('goals', goals);
  event.target.reset();
  toast('Target disimpan.');
});

$('#noteForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const notes = load('notes');
  notes.push({ id: uid(), title: $('#noteTitle').value.trim(), category: $('#noteCategory').value.trim(), body: $('#noteBody').value.trim(), createdAt: nowIso() });
  save('notes', notes);
  event.target.reset();
  toast('Catatan disimpan.');
});

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (action === 'done-task') save('tasks', load('tasks').map((item) => item.id === id ? { ...item, status: 'done' } : item));
  if (action === 'delete-task') save('tasks', load('tasks').filter((item) => item.id !== id));
  if (action === 'delete-schedule') save('schedules', load('schedules').filter((item) => item.id !== id));
  if (action === 'delete-grade') save('grades', load('grades').filter((item) => item.id !== id));
  if (action === 'delete-grade-component') {
    const grades = load('grades').map((grade) => grade.id === id ? { ...grade, components: grade.components.filter((_, index) => index !== Number(target.dataset.index)) } : grade).filter((grade) => grade.components.length);
    save('grades', grades);
  }
  if (action === 'use-checklist-template') {
    const template = checklistTemplates[Number(target.dataset.index)];
    const checklists = load('checklists');
    checklists.push({ id: uid(), title: template.title, items: template.items.map((text) => ({ id: uid(), text, done: false })) });
    save('checklists', checklists);
  }
  if (action === 'toggle-check-item') {
    save('checklists', load('checklists').map((list) => list.id === target.dataset.listId ? { ...list, items: list.items.map((item) => item.id === target.dataset.itemId ? { ...item, done: target.checked } : item) } : list));
  }
  if (action === 'delete-check-item') save('checklists', load('checklists').map((list) => list.id === target.dataset.listId ? { ...list, items: list.items.filter((item) => item.id !== target.dataset.itemId) } : list));
  if (action === 'delete-checklist') save('checklists', load('checklists').filter((item) => item.id !== id));
  if (action === 'delete-goal') save('goals', load('goals').filter((item) => item.id !== id));
  if (action === 'delete-note') save('notes', load('notes').filter((item) => item.id !== id));
  if (action === 'copy-template') copyText(academicTemplates[Number(target.dataset.index)].text);
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-action="add-check-item"]');
  if (!form) return;
  event.preventDefault();
  const input = form.querySelector('input');
  const text = input.value.trim();
  if (!text) return;
  save('checklists', load('checklists').map((list) => list.id === form.dataset.listId ? { ...list, items: [...list.items, { id: uid(), text, done: false }] } : list));
  input.value = '';
});

$('#exportData').addEventListener('click', () => {
  const data = Object.fromEntries(Object.keys(STORAGE_KEYS).map((key) => [key, load(key)]));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pusaka-student-hub-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast('Data diexport.');
});

$('#importData').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    for (const key of Object.keys(STORAGE_KEYS)) {
      if (!Array.isArray(data[key])) throw new Error(`Data ${key} tidak valid.`);
    }
    for (const key of Object.keys(STORAGE_KEYS)) localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data[key]));
    renderAll();
    toast('Data berhasil diimport.');
  } catch (error) {
    toast(`Import gagal: ${error.message}`);
  } finally {
    event.target.value = '';
  }
});

$('#resetData').addEventListener('click', () => {
  if (!confirm('Reset semua data lokal di browser ini?')) return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  renderAll();
  toast('Semua data lokal direset.');
});

renderAll();
