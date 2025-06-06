// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApU8UbfqfzBH1UPU3a1CQGf1p995Rf0y4",
  authDomain: "the-red-loggin.firebaseapp.com",
  databaseURL: "https://the-red-loggin-default-rtdb.firebaseio.com",
  projectId: "the-red-loggin",
  storageBucket: "the-red-loggin.appspot.com",
  messagingSenderId: "40265573777",
  appId: "1:40265573777:web:1651cb411996010ea2630",
  measurementId: "G-DPLC00RS2V"
};
const appId = "the-red-loggin";

let app, db, auth, storage, userId = null;
let isAuthReady = false;

window.onload = async () => {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                console.log("Autenticado como:", userId);
                isAuthReady = true;
                // Cargar publicaciones una vez que la autenticación esté lista
                loadPosts();
            } else {
                console.log("Ningún usuario autenticado, iniciando sesión anónimamente...");
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error de autenticación anónima de Firebase:", error);
                    showCustomAlert("Error de autenticación: " + error.message, 'error');
                }
            }
        });
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        showCustomAlert("Error al inicializar Firebase: " + error.message, 'error');
    }
    // Call function to set active nav link after everything else is loaded
    setActiveNavLink();
};

// --- Toggle new post popup ---
const newPostBtn = document.getElementById('newPostBtn');
const mobilePostBtn = document.getElementById('mobilePostBtn');
const newPostPopup = document.getElementById('newPostPopup');
const closePopup = document.getElementById('closePopup');

newPostBtn.addEventListener('click', () => {
    newPostPopup.style.display = 'flex';
});

mobilePostBtn.addEventListener('click', () => {
    newPostPopup.style.display = 'flex';
});

closePopup.addEventListener('click', () => {
    newPostPopup.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === newPostPopup) {
        newPostPopup.style.display = 'none';
    }
});

// --- Toggle language ---
const languageBtn = document.getElementById('languageBtn');
languageBtn.addEventListener('click', () => {
    const isSpanish = languageBtn.innerHTML.includes('EN'); // Si incluye EN, cambiará a ES

    if (isSpanish) {
        languageBtn.innerHTML = '<i class="fas fa-globe"></i> <span>ES</span>';
        document.querySelector('.btn-new-post span').textContent = 'Nuevo Post';
        document.querySelector('.popup-title').textContent = 'Crear Nuevo Post';
    } else {
        languageBtn.innerHTML = '<i class="fas fa-globe"></i> <span>EN</span>';
        document.querySelector('.btn-new-post span').textContent = 'New Post';
        document.querySelector('.popup-title').textContent = 'Create New Post';
    }
    updatePopupLanguage(isSpanish);
    updateNavLanguage(isSpanish);
    // Re-render posts to update "Ver más/Show more" button text
    displayPosts(currentPage);
});

// --- Toggle options menu ---
function toggleOptions(button) {
    const menu = button.nextElementSibling;
    const allMenus = document.querySelectorAll('.options-menu');
    
    // Close all other menus
    allMenus.forEach(m => {
        if (m !== menu) m.style.display = 'none';
    });
    
    // Toggle current menu
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Close options menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.matches('.options-btn')) {
        document.querySelectorAll('.options-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Hide header on scroll down
let lastScrollTop = 0;
const header = document.getElementById('mainHeader');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 50) {
        // Scroll down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scroll up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// --- Delegación de eventos para el botón "Ver más" ---
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('show-more-btn')) {
        const button = e.target;
        const description = button.previousElementSibling;
        description.classList.toggle('collapsed');
        
        const isSpanish = languageBtn.innerHTML.includes('ES');
        if (description.classList.contains('collapsed')) {
            button.textContent = isSpanish ? 'Ver más' : 'Show more';
        } else {
            button.textContent = isSpanish ? 'Ver menos' : 'Show less';
        }
    }
});


// Chat functionality (no changes needed)
function openChat(username) {
    const chatPopup = document.getElementById('chatPopup');
    const chatUsername = document.getElementById('chatUsername');
    const chatAvatar = document.getElementById('chatAvatar');
    const chatMessages = document.getElementById('chatMessages');
    
    // Set chat info
    chatUsername.textContent = '@' + username;
    
    // Set avatar based on username
    if (username === 'sarah_design') {
        chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzVlMmE2OCIvPjxjaXJjbGUgY3g9IjE0IiBjeT09IjE1IiByPSIzLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjE1IiByPSIzLjUiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTQgMjYgQTYgNiAwIDAgMCAyNiAyNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
    } else if (username === 'tech_guru') {
        chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2YwNDM2ZSIvPjxjaXJjbGUgY3g9IjE0IiBjeT09IjE1IiByPSIzLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjE1IiByPSIzLjUiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTQgMjYgQTYgNiAwIDAgMCAyNiAyNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
    } else {
        chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzVlMmE2OCIvPjxjaXJjbGUgY3g9IjE0IiBjeT09IjE1IiByPSIzLjUiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyNiIgY3k9IjE3IiByPSI0LjUiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTQuNDEgMjcuMjdBMi45OSAyLjk5IDAgMCAwIDI0LjU5IDI3LjI3IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=='; // Default avatar if not specified
    }
    
    // Clear existing messages
    chatMessages.innerHTML = '';
    
    // Add sample messages
    addMessage('Hola! Estoy interesado en tu publicación.', username, true);
    addMessage('¡Hola! Gracias por tu interés. ¿En qué puedo ayudarte?', username, false);
    
    // Show chat
    chatPopup.style.display = 'flex';
}

function closeChat() {
    document.getElementById('chatPopup').style.display = 'none';
}

function addMessage(text, username, received) {
    const chatMessages = document.getElementById('chatMessages');
    const message = document.createElement('div');
    message.classList.add('message');
    message.classList.add(received ? 'received' : 'sent');
    message.textContent = text;
    chatMessages.appendChild(message);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const username = document.getElementById('chatUsername').textContent.substring(1);
    
    if (input.value.trim() !== '') {
        addMessage(input.value, username, false);
        input.value = '';
        
        // Simulate reply after a delay
        setTimeout(() => {
            addMessage('Gracias por tu mensaje. Te responderé lo antes posible.', username, true);
        }, 1000);
    }
}

// Handle Enter key in chat
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Toggle language con soporte completo
const updatePopupLanguage = (isSpanish) => {
    document.getElementById('popupTitle').textContent = isSpanish ?
        'Crear Nueva Publicación' : 'Create New Post';
    
    document.getElementById('postDescription').placeholder = isSpanish ?
        'Comparte tus pensamientos...' : 'Share your thoughts...';
    
    document.querySelector('.toggle-label').innerHTML = isSpanish ?
        '<i class="fas fa-comments"></i> Habilitar botón de contacto' :
        '<i class="fas fa-comments"></i> Enable Contact Button';
    
    document.querySelector('.submit-btn').innerHTML = isSpanish ?
        '<i class="fas fa-paper-plane"></i> Publicar ahora' :
        '<i class="fas fa-paper-plane"></i> Post Now';
    
    document.getElementById('postTags').placeholder = isSpanish ?
        'Escribe y presiona Enter para agregar etiquetas' :
        'Type and press Enter to add tags';
    
    document.getElementById('postPrice').placeholder = isSpanish ?
        '0.00' : '0.00';
    
    document.getElementById('postLocation').placeholder = isSpanish ?
        'Ciudad, País' : 'City, Country';
    
    document.querySelector('.upload-area p').textContent = isSpanish ?
        'Arrastra imágenes o haz clic para buscar' :
        'Drag & drop images or click to browse';
};

function updateNavLanguage(isSpanish) {
  document.querySelector('#nav-home span').textContent = isSpanish ? 'INICIO' : 'HOME';
  document.querySelector('#nav-discover span').textContent = isSpanish ? 'DESCUBRIR' : 'DISCOVER';
  document.querySelector('#nav-myred span').textContent = isSpanish ? 'MI RED' : 'MY RED';
  document.querySelector('#nav-profile span').textContent = isSpanish ? 'PERFIL' : 'PROFILE';

  // Update pagination button text
  document.getElementById('prevPageBtn').innerHTML = isSpanish ? '<i class="fas fa-chevron-left"></i> Anterior' : '<i class="fas fa-chevron-left"></i> Previous';
  document.getElementById('nextPageBtn').innerHTML = isSpanish ? 'Siguiente <i class="fas fa-chevron-right"></i>' : 'Next <i class="fas fa-chevron-right"></i>';
}

// Gestión de etiquetas (tags)
document.getElementById('postTags').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tagInput = document.getElementById('postTags');
        const tagValue = tagInput.value.trim();
        
        if (tagValue) {
            const tagChip = document.createElement('div');
            tagChip.className = 'tag-chip';
            tagChip.innerHTML = `
                ${tagValue}
                <span class="remove-tag"><i class="fas fa-times"></i></span>
            `;
            
            tagChip.querySelector('.remove-tag').addEventListener('click', () => {
                tagChip.remove();
            });
            
            document.getElementById('tagsContainer').appendChild(tagChip);
            tagInput.value = '';
        }
    }
});

// Previsualización múltiple de imágenes
document.getElementById('postImage').addEventListener('change', (e) => {
    const previewsContainer = document.getElementById('imagePreviews');
    previewsContainer.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            previewItem.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <button class="remove-preview"><i class="fas fa-times"></i></button>
            `;
            
            previewItem.querySelector('.remove-preview').addEventListener('click', () => {
                previewItem.remove();
            });
            
            previewsContainer.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    });
});

// Drag & drop para imágenes
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--light-red)';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--light-purple)';
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--light-purple)';
    
    if (e.dataTransfer.files.length) {
        document.getElementById('postImage').files = e.dataTransfer.files;
        const event = new Event('change');
        document.getElementById('postImage').dispatchEvent(event);
    }
});

// Contador de caracteres
document.getElementById('postDescription').addEventListener('input', (e) => {
    const charCount = e.target.value.length;
    document.getElementById('charCounter').textContent =
        `${charCount}/500`;
});

// --- Función para subir imagen a Firebase Storage ---
async function uploadImage(file) {
    if (!file) return null;
    // Ruta de almacenamiento: artifacts/{appId}/public/data/post_images/{userId}/{timestamp}_filename
    const storageRef = ref(storage, `artifacts/${appId}/public/data/post_images/${userId}/${Date.now()}_${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error al subir imagen:", error);
        showCustomAlert("Error al subir imagen: " + error.message, 'error');
        return null;
    }
}

// --- Validación y envío de formulario mejorada con Firebase ---
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!isAuthReady) {
        showCustomAlert("Autenticando usuario, por favor intente de nuevo en un momento.", 'info');
        return;
    }

    const description = document.getElementById('postDescription').value.trim();
    const tagsContainer = document.getElementById('tagsContainer');
    // Limpiar el texto 'remove' que se añade a los tags
    const tags = Array.from(tagsContainer.children).map(chip => chip.textContent.replace('remove', '').trim());
    const price = parseFloat(document.getElementById('postPrice').value) || 0;
    const location = document.getElementById('postLocation').value.trim();
    const contactEnabled = document.getElementById('contactToggle').checked;
    const postImageInput = document.getElementById('postImage');
    const files = postImageInput.files;

    const isSpanish = languageBtn.innerHTML.includes('ES');

    if (!description) {
        showCustomAlert(isSpanish ? 'Por favor, escribe una descripción.' : 'Please enter a description.', 'error');
        return;
    }

    showLoadingIndicator(true); // Mostrar indicador de carga

    try {
        let imageUrls = [];
        if (files.length > 0) {
            for (const file of Array.from(files)) {
                const url = await uploadImage(file);
                if (url) {
                    imageUrls.push(url);
                }
            }
        }

        const postData = {
            userId: userId, // ID del usuario que crea la publicación
            description: description,
            tags: tags,
            price: price,
            location: location,
            contactEnabled: contactEnabled,
            imageUrls: imageUrls,
            timestamp: serverTimestamp() // Marca de tiempo del servidor
        };

        // Guardar la publicación en Firestore
        // Colección: artifacts/{appId}/public/data/posts
        await addDoc(collection(db, `artifacts/${appId}/public/data/posts`), postData);

        showCustomAlert(isSpanish ? '¡Publicación creada con éxito!' : 'Post created successfully!', 'success');
        
        // Resetear formulario
        document.getElementById('postForm').reset();
        document.getElementById('tagsContainer').innerHTML = '';
        document.getElementById('imagePreviews').innerHTML = '';
        document.getElementById('charCounter').textContent = '0/500';
        newPostPopup.style.display = 'none';

    } catch (error) {
        console.error("Error al crear la publicación:", error);
        showCustomAlert(isSpanish ? 'Error al crear la publicación: ' + error.message : 'Error creating post: ' + error.message, 'error');
    } finally {
        showLoadingIndicator(false); // Ocultar indicador de carga
    }
});

// --- Función para cargar publicaciones desde Firestore ---
function loadPosts() {
    if (!db || !isAuthReady) {
        console.log("Firestore o autenticación no están listos para cargar publicaciones.");
        return;
    }

    const q = query(collection(db, `artifacts/${appId}/public/data/posts`));

    // Escuchar cambios en tiempo real
    onSnapshot(q, (snapshot) => {
        allPosts = []; // Resetear la lista de publicaciones
        snapshot.forEach((doc) => {
            allPosts.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar publicaciones por timestamp descendente en el cliente
        allPosts.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp ? b.timestamp.toDate().getTime() : 0;
            return timeB - timeA;
        });

        // Mostrar la primera página de publicaciones
        displayPosts(currentPage);
    }, (error) => {
        console.error("Error al obtener publicaciones:", error);
        showCustomAlert("Error al cargar publicaciones: " + error.message, 'error');
    });
}

// --- Función para mostrar publicaciones de la página actual ---
function displayPosts(pageNumber) {
    const postsContainer = document.getElementById('postsContainer');
    const staticSponsoredPosts = Array.from(postsContainer.children).filter(child => child.classList.contains('sponsored-post'));
    
    // Limpiar publicaciones dinámicas existentes
    Array.from(postsContainer.children).forEach(child => {
        if (!child.classList.contains('sponsored-post')) {
            child.remove();
        }
    });

    const startIndex = (pageNumber - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToDisplay = allPosts.slice(startIndex, endIndex);

    if (postsToDisplay.length === 0 && staticSponsoredPosts.length === 0) {
        const noPostsMessage = document.createElement('p');
        noPostsMessage.classList.add('no-posts-message');
        const isSpanish = languageBtn.innerHTML.includes('ES');
        noPostsMessage.textContent = isSpanish ? 'No hay publicaciones aún. ¡Sé el primero en crear una!' : 'No posts yet. Be the first to create one!';
        postsContainer.appendChild(noPostsMessage);
    } else {
        // Insertar publicaciones dinámicas después de las patrocinadas
        postsToDisplay.forEach((post) => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.dataset.id = post.id; // Almacenar el ID del post

            const imageUrl = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : 'https://placehold.co/600x400/7d3490/ffffff?text=No+Image';
            const displayPrice = post.price > 0 ? `<div class="post-price">\$${post.price.toFixed(2)}</div>` : '';
            const displayLocation = post.location ? `
                <div class="post-location">
                    <i class="fas fa-map-marker-alt"></i> ${post.location}
                </div>
            ` : '';
            const contactButton = post.contactEnabled ? `<button class="contact-btn" onclick="openChat('${post.userId}')">Contactar</button>` : '';
            const postTime = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Justo ahora'; // Convertir timestamp

            postElement.innerHTML = `
                <div class="post-main-flex-container">
                    <div class="post-image-container">
                        <img src="${imageUrl}" alt="Post Image" class="post-image">
                    </div>
                    
                    <div class="post-info-section">
                        <div class="post-header">
                            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgdmlld0JveD0iMCAwIDQ1IDQ1Ij48Y2lyY2xlIGN4PSIyMi41IiBjeT09IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiM1NTZiZjciLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE3IiByPSI0IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMjkiIGN5PSIxNyIgcj0iNCIgZmlsbD0iI2ZmZiIvPjxwYXRoPjxtYXNrIGlkPSJhIj48Y2lyY2xlIGN4PSIyMi41IiBjeT0iMjIuNSIgcj0iMjIuNSIgZmlsbD0iI2ZmZiIvPjwvbWFzaz4KPHBhdGggZD0iTTE2IDMwIEE4IDggMCAwIDAgMjkgMzAiIHN0cm9rZT0iI2ZmYiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBtYXNrPSJ1cmwoI2EpIi8+CjwvcGF0aD4KPC9zdmc+" alt="User Avatar" class="user-avatar">
                            <div class="user-info">
                                <div class="username">@${post.userId}</div>
                                <div class="post-time">${postTime}</div>
                            </div>
                            <button class="options-btn" onclick="toggleOptions(this)">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div class="options-menu">
                                <button><i class="fas fa-share-alt"></i> ${languageBtn.innerHTML.includes('ES') ? 'Compartir' : 'Share'}</button>
                                <button><i class="fas fa-bookmark"></i> ${languageBtn.innerHTML.includes('ES') ? 'Guardar' : 'Save'}</button>
                                <button><i class="fas fa-flag"></i> ${languageBtn.innerHTML.includes('ES') ? 'Reportar' : 'Report'}</button>
                            </div>
                        </div>
                        <div class="post-content">
                            <div class="post-text">
                                <p class="post-description collapsed">${post.description}</p>
                                <button class="show-more-btn">${languageBtn.innerHTML.includes('ES') ? 'Ver más' : 'Show more'}</button>
                                
                                <div class="post-tags">
                                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                                </div>
                                
                                ${displayPrice}
                                ${displayLocation}
                                ${contactButton}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }
    updatePaginationControls();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
}

// --- Funciones de paginación ---
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbersContainer = document.getElementById('pageNumbers');

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayPosts(currentPage);
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPosts(currentPage);
    }
});

function updatePaginationControls() {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    pageNumbersContainer.innerHTML = '';
    if (totalPages > 0) {
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-number-btn');
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayPosts(currentPage);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }
    }
}

// --- Redirecciones de navegación ---
document.getElementById('nav-myred').addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir la redirección por defecto
    const isSpanish = languageBtn.innerHTML.includes('ES');
    showCustomAlert(isSpanish ? 'La sección "Mi Red" está en construcción.' : '"My Red" section is under construction.', 'info');
});

document.getElementById('nav-profile').addEventListener('click', (e) => {
    e.preventDefault(); // Prevenir la redirección por defecto
    const isSpanish = languageBtn.innerHTML.includes('ES');
    showCustomAlert(isSpanish ? 'La sección de "Perfil" está en construcción.' : '"Profile" section is under construction.', 'info');
});

// --- Función para establecer el enlace de navegación activo ---
function setActiveNavLink() {
    const currentPathname = window.location.pathname; // Obtener solo la ruta del URL
    const navLinks = document.querySelectorAll('.nav-btn');

    navLinks.forEach(link => {
        link.classList.remove('active'); // Eliminar la clase activa de todos los enlaces
        const linkHref = link.getAttribute('href');

        if (linkHref) {
            // Resolver rutas relativas a rutas absolutas para una comparación precisa
            const absoluteLinkPathname = new URL(linkHref, window.location.origin).pathname;
            
            // Comparar la ruta actual con la ruta absoluta del enlace
            if (currentPathname === absoluteLinkPathname) {
                link.classList.add('active');
            }
        }
    });
}


// Variables para el visor de imágenes
let scale = 1;
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;

// Elementos del DOM
const imageViewPopup = document.getElementById('imageViewPopup');
const popupImage = document.getElementById('popupImage');
const closeImageBtn = document.getElementById('closeImageBtn');
const imageContainer = document.querySelector('.image-container');

// Abrir el visor al hacer clic en una imagen de post
// Se usará delegación de eventos para manejar imágenes cargadas dinámicamente
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('post-image')) {
        // Resetear transformaciones
        scale = 1;
        translateX = 0;
        translateY = 0;
        popupImage.style.transform = 'scale(1) translate(0px, 0px)';
        popupImage.style.cursor = 'zoom-in';
        
        // Cargar la imagen
        popupImage.src = e.target.src;
        
        // Mostrar el visor
        imageViewPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

// Cerrar el visor
closeImageBtn.addEventListener('click', closeImageView);
imageViewPopup.addEventListener('click', function(e) {
    if (e.target === imageViewPopup) closeImageView();
});

function closeImageView() {
    imageViewPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Zoom con rueda del ratón
popupImage.addEventListener('wheel', function(e) {
    e.preventDefault();
    
    // Calcular el factor de zoom
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + delta));
    
    // Coordenadas del ratón relativas a la imagen
    const rect = this.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // Calcular nueva traslación para mantener el punto bajo el ratón
    const scaleChange = newScale / scale;
    translateX = offsetX - scaleChange * (offsetX - translateX);
    translateY = offsetY - scaleChange * (offsetY - translateY);
    
    // Aplicar transformaciones
    scale = newScale;
    this.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    
    // Cambiar cursor según el nivel de zoom
    this.style.cursor = scale === 1 ? 'zoom-in' : 'grab';
});

// Movimiento con el mouse
popupImage.addEventListener('mousedown', function(e) {
    if (scale === 1) return;
    
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    this.style.cursor = 'grabbing';
});

popupImage.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    this.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
});

popupImage.addEventListener('mouseup', function() {
    isDragging = false;
    this.style.cursor = scale === 1 ? 'zoom-in' : 'grab';
});

popupImage.addEventListener('mouseleave', function() {
    isDragging = false;
    this.style.cursor = scale === 1 ? 'zoom-in' : 'grab';
});

// Cambiar cursor al entrar
popupImage.addEventListener('mouseenter', function() {
    this.style.cursor = scale === 1 ? 'zoom-in' : 'grab';
});

// Cerrar con la tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageViewPopup.classList.contains('active')) {
        closeImageView();
    }
});
