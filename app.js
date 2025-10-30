async function fetchStatus(url) {
  const res = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}
function formatDate(iso) {
  if (!iso) return '—';
  try { const d = new Date(iso); return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
}
function render(data) {
  const percent = Math.max(0, Math.min(100, Number(data.percent || 0)));
  document.getElementById('progress-fill').style.width = percent + '%';
  document.getElementById('percent').textContent = percent + '%';
  const current = data.current_task || '—';
  document.getElementById('current-task').textContent = current;
  const isActive = (data.is_active === true) || (data.current_task && data.current_task.trim() !== '');
  document.getElementById('status-dot').className = 'dot ' + (isActive ? 'dot--live' : 'dot--idle');
  document.getElementById('last-update').textContent = 'Dernière mise à jour — ' + formatDate(data.last_update);
  const list = document.getElementById('milestones');
  list.innerHTML = '';
  const ms = Array.isArray(data.milestones) ? data.milestones : [];
  ms.forEach(m => {
    const li = document.createElement('li');
    const check = document.createElement('span'); check.className = 'check' + (m.done ? ' done' : ''); check.textContent = m.done ? '✓' : '';
    const title = document.createElement('span'); title.className = 'title'; title.textContent = m.title || 'Jalon';
    const date = document.createElement('span'); date.className = 'date'; date.textContent = m.date ? new Date(m.date).toLocaleDateString('fr-FR') : '';
    li.appendChild(check); li.appendChild(title); li.appendChild(date);
    list.appendChild(li);
  });
  document.getElementById('notes').textContent = data.notes || '—';
  const details = document.getElementById('details'); details.innerHTML = '';
  if (data.details && typeof data.details === 'object') {
    for (const [k, v] of Object.entries(data.details)) {
      const p = document.createElement('p'); p.innerHTML = '<strong>' + k + ':</strong> ' + String(v); details.appendChild(p);
    }
  }
  // Lien d'édition (si fourni dans le JSON sinon fallback)
  const edit = document.getElementById('edit-link'); edit.href = data.edit_url || EDIT_URL_FALLBACK;
}

// Boucle d'auto-refresh
async function loop() {
  try { const data = await fetchStatus(STATUS_URL); render(data); }
  catch (e) { console.error('Erreur de chargement du statut:', e); }
  finally { setTimeout(loop, (typeof REFRESH_SECONDS !== 'undefined' ? REFRESH_SECONDS : 15) * 1000); }
}
loop();
