// Configuración Firebase (debes completar con tus credenciales)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Funcionalidad general de la aplicación
function toggleLanguage() {
  const btn = document.querySelector('.language-button');
  btn.textContent = btn.textContent === 'EN' ? 'ES' : 'EN';
}

function navigate(page) {
  const urls = {
    home: '1pagin.html',
    discover: 'discover.html',
    myrole: 'myrole.html',
    profile: 'profile.html'
  };
  if (urls[page]) window.location.href = urls[page];
}

// Sistema de búsqueda
let searchTimeout;

document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(e.target.value), 500);
});

async function performSearch(query) {
  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) return;

  try {
    const postsRef = db.collection('posts');
    const snapshot = await postsRef
      .where('hashtags', 'array-contains', searchTerm)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    displayPosts(snapshot.docs);
  } catch (error) {
    console.error('Error searching posts:', error);
  }
}

function displayPosts(docs) {
  const grid = document.querySelector('.posts-grid');
  grid.innerHTML = docs.map(doc => {
    const data = doc.data();
    return `
      <div class="post-card">
        <h3>${data.title}</h3>
        <p>${data.content}</p>
        <div class="hashtags">
          ${data.hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
        </div>
      </div>
    `;
  }).join('');
}

// Carga inicial de datos
auth.onAuthStateChanged(user => {
  if (user) {
    loadTrendingHashtags();
    loadRecommendedPosts(user.uid);
  }
});

async function loadTrendingHashtags() {
  try {
    const doc = await db.collection('metadata').doc('trending').get();
    if (doc.exists) {
      const hashtags = doc.data().hashtags;
      const track = document.querySelector('.hashtags-track');
      track.innerHTML = [...hashtags, ...hashtags].map(tag => `
        <button class="hashtag-button" onclick="performSearch('${tag}')">
          #${tag}
        </button>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading hashtags:', error);
  }
}

async function loadRecommendedPosts(userId) {
  try {
    const snapshot = await db.collection('posts')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    displayPosts(snapshot.docs);
  } catch (error) {
    console.error('Error loading recommended posts:', error);
  }
}

// Gestión del estado activo en la navegación
document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', function() {
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    localStorage.setItem('activeButton', this.querySelector('.mobile-text').innerText);
  });
});

// Restaurar estado al cargar
window.addEventListener('load', () => {
  const activeButtonText = localStorage.getItem('activeButton');
  if (activeButtonText) {
    document.querySelectorAll('.mobile-text').forEach(text => {
      if (text.innerText === activeButtonText) {
        text.parentElement.classList.add('active');
      }
    });
  }
});

// Función para ver perfiles
function viewProfile(username) {
  window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
}

// Inicialización adicional necesaria
document.addEventListener('DOMContentLoaded', () => {
  // Aquí puedes añadir cualquier inicialización adicional necesaria
});