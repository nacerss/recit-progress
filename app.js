async function fetchStatus(url) {
  const res = await fetch(url + '?_=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.json();
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    // Si iso est juste "2025-10-18", certains navigateurs gèrent mal → on tente un fallback
    if (isNaN(d)) {
      const parts = iso.split('-');
      if (parts.length === 3) return new Date(parts[0], parts[1]-1, parts[2]).toLocaleDateString('fr-FR');
      return iso;
    }
    return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function render(data) {
  // Progression
  const percent = Math.max(0, Math.min(100, Number(data.percent || 0)));
  document.getElementById('progress-fill').style.width = percent + '%';
  document.getElementById('percent').textContent = percent + '%';

  // Statut
  const current = data.current_task || '—';
  document.getElementById('current-task').textContent = current;
  const isActive = (data.is_active === true) || (data.current_task && data.current_task.trim() !== '');
  document.getElementById('status-dot').className = 'dot ' + (isActive ? 'dot--live' : 'dot--idle');

  // Dernière MAJ
  document.getElementById('last-update').textContent = 'Dernière mise à jour — ' + formatDate(data.last_update);

  // Jalons
  const list = document.getElementById('milestones');
  list.innerHTML = '';
  const ms = Array.isArray(data.milestones) ? data.milestones : [];

  if (ms.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucun jalon pour le moment.';
    list.appendChild(li);
  } else {
    ms.forEach(m => {
      const li = document.createElement('li');

      const check = document.createElement('span');
      check.className = 'check' + (m.done ? ' done' : '');
      check.textContent = m.done ? '✓' : '';

      const title = document.createElement(m.url ? 'a' : 'span');
      title.className = 'title';
      title.textContent = m.title || 'Jalon';
      if (m.url) {
        title.href = m.url;
        title.target = '_blank';
        title.rel = 'noopener'; // sécurité
      }

      const date = document.createElement('span');
      date.className = 'date';
      date.textContent = m.date ? formatDate(m.date) : '';

      li.appendChild(check);
      li.appendChild(title);
      li.appendChild(date);
      list.appendChild(li);
    });
  }

  // Notes
  document.getElementById('notes').textContent = data.notes || '—';

  // Détails (auto-lien email & URL)
  const details = document.getElementById('details');
  details.innerHTML = '';

  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const looksLikeMailto = s => typeof s === 'string' && s.toLowerCase().startsWith('mailto:');
  const isURL = s => /^https?:\/\//i.test(s);

  if (data.details && typeof data.details === 'object') {
    for (const [k, vRaw] of Object.entries(data.details)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${k} :`;
      p.appendChild(strong);
      p.append(' ');

      const v = String(vRaw || '').trim();

      if (isEmail(v)) {
        const a = document.createElement('a');
        a.href = `mailto:${v}`;
        a.textContent = v;
        p.appendChild(a);
      } else if (looksLikeMailto(v)) {
        const a = document.createElement('a');
        a.href = v;
        a.textContent = v.replace(/^mailto:/i, '');
        p.appendChild(a);
      } else if (isURL(v)) {
        const a = document.createElement('a');
        a.href = v;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = v;
        p.appendChild(a);
      } else {
        p.append(v);
      }

      details.appendChild(p);
    }
  }

  // Lien d’édition
  const edit = document.getElementById('edit-link');
  edit.href = data.edit_url || EDIT_URL_FALLBACK;
}

// Boucle d'auto-refresh + message d’erreur utilisateur
async function loop() {
  try {
    const data = await fetchStatus(STATUS_URL);
    render(data);
    // Si tu avais affiché un message d’erreur, on le nettoie
    const err = document.getElementById('error-banner');
    if (err) err.remove();
  } catch (e) {
    console.error('Erreur de chargement du statut:', e);

    // Affiche un bandeau d’erreur discret si absent
    if (!document.getElementById('error-banner')) {
      const banner = document.createElement('div');
      banner.id = 'error-banner';
      banner.style.cssText = 'margin:12px 0;padding:10px;border-radius:8px;background:#3b0d0d;color:#ffd9d9;border:1px solid #7a2a2a;';
      banner.textContent = "Impossible de charger l'avancement. Vérifie le fichier status.json ou réessaie.";
      const container = document.querySelector('main .container') || document.querySelector('main') || document.body;
      container.insertBefore(banner, container.firstChild);
    }
  } finally {
    setTimeout(loop, (typeof REFRESH_SECONDS !== 'undefined' ? REFRESH_SECONDS : 15) * 1000);
  }
}
loop();
