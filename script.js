// === KONFIGURASI FIREBASE ===
const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// === LOGIN GOOGLE ===
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loadManga();
    loadHistory(user.uid);
  } else {
    document.getElementById("mangaList").innerHTML = "";
    document.getElementById("historyList").innerHTML = "";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// === LOAD DATA MANGA ===
async function loadManga() {
  const res = await fetch("res/data/manga.json");
  const data = await res.json();

  const container = document.getElementById("mangaList");
  container.innerHTML = "";

  data.forEach(manga => {
    const div = document.createElement("div");
    div.className = "manga";
    div.innerHTML = `
      <img src="${manga.image}">
      <p>${manga.title}</p>
      <button onclick="saveHistory('${manga.title}', '${manga.image}')">Tonton</button>
    `;
    container.appendChild(div);
  });
}

// === SIMPAN HISTORY ===
async function saveHistory(title, image) {
  const user = auth.currentUser;
  if (!user) return alert("Login dulu!");

  await fetch("/api/saveHistory", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      uid: user.uid,
      title,
      image
    })
  });
  loadHistory(user.uid);
}

// === AMBIL HISTORY ===
async function loadHistory(uid) {
  const res = await fetch(`/api/getHistory?uid=${uid}`);
  const data = await res.json();

  const container = document.getElementById("historyList");
  container.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "manga";
    div.innerHTML = `
      <img src="${item.image}">
      <p>${item.title}</p>
      <button onclick="deleteHistory('${item.title}')">Hapus</button>
    `;
    container.appendChild(div);
  });
}

// === HAPUS HISTORY ===
async function deleteHistory(title) {
  const user = auth.currentUser;
  await fetch("/api/deleteHistory", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      uid: user.uid,
      title
    })
  });
  loadHistory(user.uid);
}