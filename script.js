// === KONFIGURASI FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyD20Efj4YUjq5yqsP1oLRo8apdYmJxDwJ0",
  authDomain: "mangawebapp-43750.firebaseapp.com",
  projectId: "mangawebapp-43750",
  storageBucket: "mangawebapp-43750.appspot.com", // ✅ perbaikan penting
  messagingSenderId: "883744625809",
  appId: "1:883744625809:web:647003fe305e780b185b30",
  measurementId: "G-RNJSSC22QQ"
};
firebase.initializeApp(firebaseConfig);

// === REFERENSI AUTH ===
const auth = firebase.auth();

// === ELEMEN DOM ===
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const mangaList = document.getElementById("mangaList");
const historyList = document.getElementById("historyList");

// === LOGIN GOOGLE ===
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      console.log("✅ Login sukses:", result.user.displayName);
      alert("Selamat datang, " + result.user.displayName + "!");
    })
    .catch(err => {
      console.error("❌ Error login:", err.message);
      alert("Login gagal: " + err.message);
    });
});

// === LOGOUT ===
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    alert("Kamu telah logout");
  });
});

// === DETEKSI STATUS LOGIN ===
auth.onAuthStateChanged(user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loadManga();
    loadHistory(user.uid);
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    mangaList.innerHTML = "";
    historyList.innerHTML = "";
  }
});

// === LOAD DATA MANGA ===
async function loadManga() {
  try {
    const res = await fetch("res/data/manga.json");
    const data = await res.json();

    mangaList.innerHTML = "";
    data.forEach(manga => {
      const div = document.createElement("div");
      div.className = "manga";
      div.innerHTML = `
        <img src="${manga.image}">
        <p>${manga.title}</p>
        <button onclick="saveHistory('${manga.title}', '${manga.image}')">Tonton</button>
      `;
      mangaList.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal load manga:", err);
  }
}

// === SIMPAN HISTORY ===
async function saveHistory(title, image) {
  const user = auth.currentUser;
  if (!user) return alert("Login dulu!");

  await fetch("/api/saveHistory", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ uid: user.uid, title, image })
  });

  loadHistory(user.uid);
}

// === AMBIL HISTORY ===
async function loadHistory(uid) {
  try {
    const res = await fetch(`/api/getHistory?uid=${uid}`);
    const data = await res.json();

    historyList.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "manga";
      div.innerHTML = `
        <img src="${item.image}">
        <p>${item.title}</p>
        <button onclick="deleteHistory('${item.title}')">Hapus</button>
      `;
      historyList.appendChild(div);
    });
  } catch (err) {
    console.error("Gagal ambil history:", err);
  }
}

// === HAPUS HISTORY ===
async function deleteHistory(title) {
  const user = auth.currentUser;
  if (!user) return;
  
  await fetch("/api/deleteHistory", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ uid: user.uid, title })
  });

  loadHistory(user.uid);
      }  }
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
