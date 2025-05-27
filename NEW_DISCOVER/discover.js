// Inicialización
let currentUser = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  loadTrendingHashtags();
  loadRecommendedPosts();
});

// Búsqueda
let searchTimeout;

document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(e.target.value), 500);
});

async function performSearch(query) {
  const searchTerm = query.trim().toLowerCase();
  if (!searchTerm) return;

  try {
    // Búsqueda en posts
    const postsQuery = db.collection('posts')
      .where('hashtags', 'array-contains', searchTerm)
      .orderBy('timestamp', 'desc')
      .limit(10);

    // Búsqueda en usuarios
    const usersQuery = db.collection('users')
      .where('keywords', 'array-contains', searchTerm)
      .orderBy('followersCount', 'desc')
      .limit(5);

    const [postsSnapshot, usersSnapshot] = await Promise.all([
      postsQuery.get(),
      usersQuery.get()
    ]);

    const results = [
      ...postsSnapshot.docs.map(d => ({...d.data(), type: 'post'})),
      ...usersSnapshot.docs.map(d => ({...d.data(), type: 'user'}))
    ];

    displayResults(results);
  } catch (error) {
    console.error('Error searching:', error);
  }
}

// Trending Hashtags
async function loadTrendingHashtags() {
  const hashtagsRef = db.collection('metadata').doc('trending');
  const doc = await hashtagsRef.get();
  
  if (doc.exists) {
    const hashtags = doc.data().hashtags;
    const track = document.getElementById('hashtagsTrack');
    
    track.innerHTML = hashtags.map(hashtag => `
      <button class="hashtag-button" onclick="searchHashtag('${hashtag}')">
        #${hashtag}
      </button>
    `).join('');
    
    // Duplicar para efecto de scroll infinito
    track.innerHTML += track.innerHTML;
  }
}

function searchHashtag(hashtag) {
  document.getElementById('searchInput').value = hashtag;
  performSearch(hashtag);
}

// Posts recomendados
async function loadRecommendedPosts() {
  if (!currentUser) return;

  const postsRef = db.collection('posts');
  const snapshot = await postsRef
    .where('userId', '==', currentUser.uid)
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();

  displayResults(snapshot.docs);
}

// Mostrar resultados
function displayResults(docs) {
  const grid = document.querySelector('.posts-grid');
  grid.innerHTML = docs.map(doc => {
    const data = doc.data();
    
    if(data.type === 'user') { // Ejemplo de documento de usuario
      return `
        <div class="user-card">
          <div class="user-header">
            <img src="${data.photoURL || 'avatar-placeholder.png'}" class="user-avatar" alt="${data.displayName}">
            <div class="user-info">
              <h3>${data.displayName}</h3>
              <p class="user-bio">${data.bio || ''}</p>
              <p class="user-stats">${data.followersCount || 0} seguidores</p>
            </div>
          </div>
          <button class="follow-button" onclick="followUser('${doc.id}')">Seguir</button>
        </div>
      `;
    }
    
    // Post normal
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

// Mantener funcionalidades del esqueleto
function toggleLanguage() {
  const btn = document.querySelector('.language-button');
  btn.textContent = btn.textContent === 'EN' ? 'ES' : 'EN';
}
