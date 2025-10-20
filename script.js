// script.js
const listEl = document.getElementById('list');
const historyPanel = document.getElementById('historyPanel');
const historyListEl = document.getElementById('historyList');
const btnViewHistory = document.getElementById('btnViewHistory');
const btnClearHistory = document.getElementById('btnClearHistory');
const btnClearLocal = document.getElementById('btnClearLocal');

const USE_SERVER = true; // set to false kalau mau pakai localStorage saja (non-server)

const HISTORY_KEY = 'manga_history_v1'; // localStorage key

async function fetchManga() {
  const res = await fetch('/dataManga.json');
  const json = await res.json();
  return json;
}

function renderManga(data) {
  listEl.innerHTML = '';
  Object.keys(data).forEach(id => {
    const m = data[id];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${m.image}" alt="${m.judul}" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'"/>
      <div class="title">${m.judul}</div>
      <div class="actions">
        <button class="btn-open">Buka</button>
        <button class="btn-save">Simpan</button>
      </div>
    `;
    const btnOpen = card.querySelector('.btn-open');
    const btnSave = card.querySelector('.btn-save');

    btnOpen.addEventListener('click', () => {
      // simulasi buka halaman baca
      alert('Membuka: ' + m.judul);
      // otomatis simpan ketika dibuka:
      saveHistoryItem({ id, judul: m.judul, image: m.image, time: new Date().toISOString() });
    });

    btnSave.addEventListener('click', () => {
      saveHistoryItem({ id, judul: m.judul, image: m.image, time: new Date().toISOString() });
    });

    listEl.appendChild(card);
  });
}

function loadLocalHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

function saveLocalHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

async function saveHistoryItem(item) {
  // add to local first
  const history = loadLocalHistory();
  // jika sudah ada same id, update time -> move to top
  const filtered = history.filter(h => h.id !== item.id);
  filtered.unshift(item);
  saveLocalHistory(filtered);
  renderHistoryList();

  if (!USE_SERVER) return;

  // kalau pakai server, kirim ke API untuk commit ke dataHistory.json
  try {
    await fetch('/api/saveHistory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item })
    });
    // optional: handle response
  } catch (err) {
    console.error('Gagal kirim ke server:', err);
  }
}

function renderHistoryList() {
  const history = loadLocalHistory();
  historyListEl.innerHTML = '';
  if (!history.length) {
    historyListEl.innerHTML = '<li>Tidak ada history.</li>';
    return;
  }
  history.forEach(h => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div>
        <div style="font-weight:600">${h.judul}</div>
        <div style="font-size:12px;color:#666">${new Date(h.time).toLocaleString()}</div>
      </div>
      <div>
        <button class="btn-delete">Hapus</button>
      </div>
    `;
    li.querySelector('.btn-delete').addEventListener('click', async () => {
      // remove local
      const newHist = loadLocalHistory().filter(x => x.id !== h.id);
      saveLocalHistory(newHist);
      renderHistoryList();

      if (!USE_SERVER) return;
      // request server to delete by id
      try {
        await fetch('/api/deleteHistory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: h.id })
        });
      } catch (err) {
        console.error('Gagal minta server hapus:', err);
      }
    });
    historyListEl.appendChild(li);
  });
}

// actions
btnViewHistory.addEventListener('click', () => {
  historyPanel.classList.toggle('hidden');
  renderHistoryList();
});

btnClearHistory.addEventListener('click', async () => {
  if (!confirm('Hapus semua history?')) return;
  saveLocalHistory([]);
  renderHistoryList();
  if (!USE_SERVER) return;
  try {
    await fetch('/api/deleteHistory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearAll: true })
    });
  } catch (err) {
    console.error(err);
  }
});

btnClearLocal.addEventListener('click', () => {
  if (!confirm('Hapus semua history di localStorage?')) return;
  saveLocalHistory([]);
  renderHistoryList();
});

// init
(async function init(){
  const data = await fetchManga();
  renderManga(data);
  renderHistoryList();
})();