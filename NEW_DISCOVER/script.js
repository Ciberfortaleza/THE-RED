// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration (provided by Canvas environment)
const firebaseConfig = {
    apiKey: "AIzaSyApU8UbfqfzBH1UPU3a1CQGf1p995Rf0y4",
    authDomain: "the-red-loggin.firebaseapp.com",
    projectId: "the-red-loggin",
    storageBucket: "the-red-loggin.firebasestorage.app",
    messagingSenderId: "40265573777",
    appId: "1:40265573777:web:1651cb4119969010ea2630",
    measurementId: "G-DPLC00RS2V"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Keep this for Firestore pathing

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId = null; // To store the authenticated user's ID

// Authenticate user anonymously or with custom token
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Authenticated with UID:", currentUserId);
        displayUserIdOnHeader(currentUserId); // Display user ID
        fetchAndDisplayUserPosts(currentUserId); // Fetch and display posts for this user
    } else {
        // If no user is signed in, try to sign in anonymously
        try {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Error during anonymous sign-in:", error);
            showCustomAlert("Error al iniciar sesión anónimamente.");
        }
    }
});

// Function to display user ID on the header
function displayUserIdOnHeader(userId) {
    const header = document.getElementById('mainHeader');
    let userIdDisplay = document.getElementById('userIdDisplay');
    if (!userIdDisplay) {
        userIdDisplay = document.createElement('div');
        userIdDisplay.id = 'userIdDisplay';
        userIdDisplay.classList.add('user-id-display');
        header.appendChild(userIdDisplay);
    }
    userIdDisplay.textContent = `User ID: ${userId.substring(0, 8)}...`; // Display truncated ID
}


// Toggle new post popup
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

// Toggle language
const languageBtn = document.getElementById('languageBtn');
languageBtn.addEventListener('click', () => {
    const isSpanish = languageBtn.innerHTML.includes('EN'); // Check current language to determine next
    
    if (isSpanish) {
        languageBtn.innerHTML = '<i class="fas fa-globe"></i> <span>ES</span>';
        document.querySelector('.btn-new-post').innerHTML = '<i class="fas fa-plus"></i> <span>Nuevo Post</span>';
        document.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.textContent = 'Ver más';
        });
    } else {
        languageBtn.innerHTML = '<i class="fas fa-globe"></i> <span>EN</span>';
        document.querySelector('.btn-new-post').innerHTML = '<i class="fas fa-plus"></i> <span>New Post</span>';
        document.querySelectorAll('.show-more-btn').forEach(btn => {
            btn.textContent = 'Show more';
        });
    }
    updatePopupLanguage(isSpanish);
    updateNavLanguage(isSpanish);
    // Re-render posts or no posts message after language change
    const noPostsMessage = postsContainer.querySelector('.no-posts-message');
    if (noPostsMessage) {
        // If a no-posts message is currently displayed, update its content
        displayNoPostsMessage(); 
    } else {
        // If posts are displayed, re-perform search to ensure correct language for new messages
        if (dynamicSearchTagsContainer.children.length > 0) {
            performSearch();
        } else {
            displayDefaultPosts(); 
        }
    }
});

// Toggle options menu
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

// Toggle text expansion
function toggleText(button) {
    const description = button.previousElementSibling;
    description.classList.toggle('collapsed');
    
    if (description.classList.contains('collapsed')) {
        button.textContent = languageBtn.innerHTML.includes('ES') ? 'Ver más' : 'Show more';
    } else {
        button.textContent = languageBtn.innerHTML.includes('ES') ? 'Ver menos' : 'Show less';
    }
}

// Chat functionality
function openChat(username) {
    const chatPopup = document.getElementById('chatPopup');
    const chatUsername = document.getElementById('chatUsername');
    const chatAvatar = document.getElementById('chatAvatar');
    const chatMessages = document.getElementById('chatMessages');
    
    // Set chat info
    chatUsername.textContent = '@' + username;
    
    // Set avatar based on username (simplified for this example)
    chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgdmlld0JveD0iMCAwIDQ1IDQ1Ij48Y2lyY2xlIGN4PSIyMi41IiBjeT0iMjIuNSIgcj0iMjIuNSIgZmlsbD0iIzVlMmE2OCIvPjxjaXJjbGUgY3g9IjE2IiBjeT09IjE3IiByPSI0IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iMjkiIGN5PSIxNyIgcj0iNCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNiAzMCBBOCg4IDAgMCAwIDI5IDMwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD09IjIiIGZpbGw9Im5vbmUiLz48L3N2Zz4='; // Default avatar
    if (username.includes('Artesanias')) {
        chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgdmlld0JveD0iMCAwIDQ1IDQ1Ij48Y2lyY2xlIGN4PSIyMi41IiBjeT0iMjIuNSIgcj0iMjIuNSIgZmlsbD0iIzVlMmE2OCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTciIHI9IjQiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyOSIgY3k9IjE3IiByPSI0IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE2IDMwIEE4IDggMCAwIDAgMjkgMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+';
    } else if (username.includes('Jenny')) {
        chatAvatar.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NSIgaGVpZ2h0PSI0NSIgdmlld0JveD0iMCAwIDQ1IDQ1Ij48Y2lyY2xlIGN4PSIyMi41IiBjeT0iMjIuNSIgcj0iMjIuNSIgZmlsbD0iI2YwNDM2ZSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTciIHI9IjQiIGZpbGw9IiNmZmYiLz48Y2lyY2xlIGN4PSIyOSIgY3k9IjE3IiByPSI0IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTE2IDMwIEE4IDggMCAwIDAgMjkgMzAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+';
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
};

// Handle Enter key in chat
document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize "Show more" buttons
document.querySelectorAll('.show-more-btn').forEach(button => {
    button.textContent = 'Show more';
});

// Update language for the new post popup
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

// Update language for the navigation buttons
function updateNavLanguage(isSpanish) {
  document.querySelector('#nav-home span').textContent = isSpanish ? 'INICIO' : 'HOME';
  document.querySelector('#nav-discover span').textContent = isSpanish ? 'DESCUBRIR' : 'DISCOVER';
  document.querySelector('#nav-myred span').textContent = isSpanish ? 'MI RED' : 'MY RED';
  document.querySelector('#nav-profile span').textContent = isSpanish ? 'PERFIL' : 'PROFILE';
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

// Validación de formulario mejorada
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const description = document.getElementById('postDescription').value.trim();
    const tags = Array.from(document.querySelectorAll('#tagsContainer .tag-chip')).map(tagChip => tagChip.textContent.replace('×', '').trim());
    const price = document.getElementById('postPrice').value;
    const location = document.getElementById('postLocation').value.trim();
    const contactEnabled = document.getElementById('contactToggle').checked; // Get the checked state
    const isSpanish = languageBtn.innerHTML.includes('ES');

    if (!currentUserId) {
        showCustomAlert(isSpanish ? "Error: Usuario no autenticado. Intenta recargar la página." : "Error: User not authenticated. Please try reloading the page.");
        return;
    }
    
    if (!description) {
        showCustomAlert(isSpanish ?
            'Por favor, escribe una descripción' :
            'Please enter a description');
        return;
    }

    // For now, use a placeholder image. Real image upload needs Firebase Storage.
    const imageUrl = 'https://placehold.co/600x400/8d4e9c/ffffff?text=New+Post'; 

    try {
        await addDoc(collection(db, `artifacts/${appId}/users/${currentUserId}/posts`), {
            userId: currentUserId,
            username: `@User_${currentUserId.substring(0, 5)}`, // Placeholder username
            postTime: serverTimestamp(), // Use server timestamp for consistent time
            imageSrc: imageUrl,
            description: description,
            tags: tags,
            price: price ? `$${parseFloat(price).toFixed(2)}` : null,
            location: location || null,
            contactUser: `user_${currentUserId.substring(0, 5)}`, // Placeholder contact user
            contactEnabled: contactEnabled // Save the contactEnabled state
        });
        
        showCustomAlert(isSpanish ?
            '¡Publicación creada con éxito!' :
            'Post created successfully!');
        
        // Resetear formulario
        document.getElementById('postForm').reset();
        document.getElementById('tagsContainer').innerHTML = '';
        document.getElementById('imagePreviews').innerHTML = '';
        document.getElementById('charCounter').textContent = '0/500';
        newPostPopup.style.display = 'none';

        // Posts will automatically re-render due to onSnapshot listener
    } catch (error) {
        console.error("Error adding document: ", error);
        showCustomAlert(isSpanish ? "Error al crear la publicación." : "Error creating post.");
    }
});

// Custom Alert Function (replaces window.alert)
function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.classList.add('custom-alert');
    alertBox.innerHTML = `
        <p>${message}</p>
        <button class="custom-alert-close">OK</button>
    `;
    document.body.appendChild(alertBox);

    alertBox.querySelector('.custom-alert-close').addEventListener('click', () => {
        alertBox.remove();
    });

    // Automatically remove after 3 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
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
// This event listener will be attached dynamically in renderPosts
function openImageViewer() {
    // Resetear transformaciones
    scale = 1;
    translateX = 0;
    translateY = 0;
    popupImage.style.transform = 'scale(1) translate(0px, 0px)';
    popupImage.style.cursor = 'zoom-in';
    
    // Cargar la imagen
    popupImage.src = this.src;
    
    // Mostrar el visor
    imageViewPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

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

    const oldScale = scale;
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    let newScale = Math.max(0.5, Math.min(3, oldScale + delta));

    // If scale is not changing, do nothing
    if (newScale === oldScale) return;

    // Get the bounding rectangle of the image to calculate mouse position relative to it
    const rect = this.getBoundingClientRect();

    // Calculate mouse position relative to the image's current top-left corner
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate the mouse position relative to the *center* of the image's current transformed state
    // (This is the point around which the scaling happens if transform-origin is center)
    const mouseRelCenterX = mouseX - (rect.width / 2);
    const mouseRelCenterY = mouseY - (rect.height / 2);

    // Calculate how much this relative mouse position would change due to scaling
    // (new_relative_pos - old_relative_pos)
    const scaleFactor = newScale / oldScale;
    const deltaX = mouseRelCenterX * (scaleFactor - 1);
    const deltaY = mouseRelCenterY * (scaleFactor - 1);

    // Adjust the translation to counteract this change, keeping the mouse point fixed
    translateX -= deltaX;
    translateY -= deltaY;

    // Update the scale
    scale = newScale;

    // Apply the new transform
    this.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    
    // Update cursor
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

// Get elements for dynamic search tags
const searchInput = document.getElementById('searchInput');
const dynamicSearchTagsContainer = document.getElementById('dynamicSearchTags');
const searchIcon = document.querySelector('.search-bar i.fa-search'); // Get the search icon
const postsContainer = document.querySelector('.posts-container'); // Get the posts container

// --- Post Data (Moved from HTML to JavaScript) ---
// This array will now be populated from Firestore
let allPosts = []; 

// Function to fetch and display posts for the current user from Firestore
function fetchAndDisplayUserPosts(userId) {
    if (!userId) {
        console.warn("No user ID available to fetch posts.");
        displayNoPostsMessage(); // Display message if no user logged in
        return;
    }

    const userPostsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/posts`);
    const q = query(userPostsCollectionRef); // You can add orderBy, limit etc. here

    onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                ...data,
                // Format timestamp if it exists
                postTime: data.postTime ? new Date(data.postTime.toDate()).toLocaleString() : 'Just now'
            });
        });
        allPosts = posts; // Update the global allPosts array
        displayDefaultPosts(); // Display all posts (which are now the user's posts)
    }, (error) => {
        console.error("Error fetching user posts: ", error);
        showCustomAlert(languageBtn.innerHTML.includes('ES') ? "Error al cargar tus publicaciones." : "Error loading your posts.");
    });
}


// Function to update the search icon's state (glow or not)
function updateSearchIconState() {
    if (dynamicSearchTagsContainer.children.length > 0) {
        searchIcon.classList.add('active-search');
    } else {
        searchIcon.classList.remove('active-search');
    }
}

// Function to add a dynamic tag
function addDynamicTag(text) {
    if (!text) return; // Don't add empty tags

    const tagChip = document.createElement('span');
    tagChip.classList.add('dynamic-search-tag'); // Use a new class for styling
    tagChip.innerHTML = `#${text.trim()}`;

    const removeBtn = document.createElement('i');
    removeBtn.classList.add('fas', 'fa-times-circle', 'remove-dynamic-tag'); // Font Awesome icon for close
    removeBtn.addEventListener('click', () => {
        tagChip.remove();
        updateSearchIconState(); // Update icon state after removing a tag
        searchInput.focus();
        // If all tags are removed, display default posts
        if (dynamicSearchTagsContainer.children.length === 0) {
            displayDefaultPosts();
        } else {
            performSearch(); // Re-perform search if tags remain
        }
    });

    tagChip.appendChild(removeBtn);
    dynamicSearchTagsContainer.appendChild(tagChip);
    updateSearchIconState(); // Update icon state after adding a tag
}

// Event listener for search input to create tags on spacebar or backspace
searchInput.addEventListener('keyup', (e) => {
    if (e.key === ' ' && searchInput.value.trim() !== '') {
        e.preventDefault(); // Stop the space from being added to the input
        const keyword = searchInput.value.trim();
        // Remove the last space if it was added by the browser before keyup
        const cleanedKeyword = keyword.endsWith(' ') ? keyword.slice(0, -1) : keyword;

        if (cleanedKeyword) {
            addDynamicTag(cleanedKeyword);
            searchInput.value = ''; // Clear input after creating tag
        }
    } else if (e.key === 'Backspace' && searchInput.value === '') {
        // If backspace is pressed and input is empty, remove the last tag
        const lastTag = dynamicSearchTagsContainer.lastElementChild;
        if (lastTag) {
            lastTag.remove();
            updateSearchIconState(); // Update icon state after removing a tag
            // If all tags are removed, display default posts
            if (dynamicSearchTagsContainer.children.length === 0) {
                displayDefaultPosts();
            } else {
                performSearch(); // Re-perform search if tags remain
            }
        }
    }
});

// Add new keypress listener for Enter, handling dynamic tags
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission behavior
        const currentInput = searchInput.value.trim();
        if (currentInput) {
            addDynamicTag(currentInput); // Add any remaining text as a tag
            searchInput.value = '';
        }

        // Trigger search when Enter is pressed
        performSearch();
    }
});

// Event listener for search icon click
searchIcon.addEventListener('click', () => {
    performSearch();
});

// Function to perform the search
function performSearch() {
    const allSearchTags = Array.from(dynamicSearchTagsContainer.children).map(tagElement => {
        return tagElement.textContent.replace('#', '').replace('×', '').trim().toLowerCase();
    });

    if (allSearchTags.length === 0) {
        showCustomAlert(languageBtn.innerHTML.includes('ES') ?
            "Por favor, ingresa palabras clave o selecciona etiquetas para buscar." :
            "Please enter keywords or select tags to search.");
        displayDefaultPosts(); // Show default posts if no tags to search
        return;
    }

    // Filter posts based on ALL selected tags (AND logic)
    const filteredPosts = allPosts.filter(post => {
        // Ensure post.tags is an array before mapping
        const postTagsLower = Array.isArray(post.tags) ? post.tags.map(tag => tag.toLowerCase()) : [];
        
        // Check if all search tags are present in the post's tags
        return allSearchTags.every(searchTag => postTagsLower.includes(searchTag));
    });

    if (filteredPosts.length > 0) {
        showCustomAlert(languageBtn.innerHTML.includes('ES') ?
            `Buscando posts con las tags: "${allSearchTags.join(', ')}"` :
            `Searching for posts with tags: "${allSearchTags.join(', ')}"`);
        renderPosts(filteredPosts, allSearchTags); // Pass search tags for highlighting
    } else {
        displayNoPostsMessage();
    }
}

// Function to render posts into the container
function renderPosts(postsToRender, searchTags = []) { // Add searchTags parameter
    postsContainer.innerHTML = ''; // Clear existing content

    if (postsToRender.length === 0) {
        displayNoPostsMessage();
        return;
    }

    postsToRender.forEach(post => {
        // Generate tags HTML, highlighting if they are in searchTags
        const postTagsHtml = Array.isArray(post.tags) ? post.tags.map(tag => {
            const isHighlighted = searchTags.includes(tag.toLowerCase());
            return `<span class="tag ${isHighlighted ? 'highlighted-tag' : ''}">#${tag}</span>`;
        }).join('') : ''; // Ensure tags are an array

        // Conditionally render the contact button
        const contactButtonHtml = post.contactEnabled ? 
            `<button class="contact-btn" onclick="openChat('${post.contactUser}')">Contact</button>` : 
            '';

        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <div class="post-image-container">
                <img src="${post.imageSrc}" alt="Post Image" class="post-image">
            </div>
            <div class="post-header">
                <img src="${post.userAvatar}" alt="User Avatar" class="user-avatar">
                <div class="user-info">
                    <div class="username">${post.username}</div>
                    <div class="post-time">${post.postTime}</div>
                </div>
                <button class="options-btn" onclick="toggleOptions(this)">⋯</button>
                <div class="options-menu">
                    <button><i class="fas fa-save"></i> Save</button>
                    <button><i class="fas fa-user"></i> View Profile</button>
                </div>
            </div>
            <div class="post-content">
                <div class="post-text">
                    <p class="post-description collapsed">
                        ${post.description}
                    </p>
                    <button class="show-more-btn" onclick="toggleText(this)">${languageBtn.innerHTML.includes('ES') ? 'Ver más' : 'Show more'}</button>
                    
                    <div class="post-tags">
                        ${postTagsHtml}
                    </div>
                    
                    ${post.price ? `<div class="post-price">${post.price}</div>` : ''}
                    ${post.location ? `<div class="post-location">
                        <i class="fas fa-map-marker-alt"></i> ${post.location}
                    </div>` : ''}
                    ${contactButtonHtml} </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });

    // Re-attach event listeners for "Show more" buttons on newly added posts
    document.querySelectorAll('.post .show-more-btn').forEach(button => {
        button.textContent = languageBtn.innerHTML.includes('ES') ? 'Ver más' : 'Show more';
    });
    // Re-attach event listeners for post images to open the image viewer
    document.querySelectorAll('.post-image').forEach(img => {
        img.removeEventListener('click', openImageViewer); // Remove old listener to prevent duplicates
        img.addEventListener('click', openImageViewer); // Add new listener
    });
}


// Function to display the "no posts found" message
function displayNoPostsMessage() {
    postsContainer.innerHTML = ''; // Clear existing posts
    const isSpanish = languageBtn.innerHTML.includes('ES');
    const message = document.createElement('div');
    message.classList.add('no-posts-message');
    message.innerHTML = `
        <i class="fas fa-box-open"></i> <p>${isSpanish ? 'No se encontraron posts con las etiquetas seleccionadas.' : 'No posts found with the selected tags.'}</p>
    `;
    postsContainer.appendChild(message);
}

// Function to display the default posts (when no search is active or search yields results)
function displayDefaultPosts() {
    renderPosts(allPosts); // Render all posts from the array without highlighting
}

// Tag button click functionality
document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', function() {
        const tag = this.textContent.replace('#', ''); // Get tag text without '#'
        addDynamicTag(tag); // Add the clicked tag to the dynamic search tags
        searchInput.focus(); // Focus the search input after adding
        performSearch(); // Perform search immediately after adding a tag
    });
});

// Initial state check for the search icon
updateSearchIconState();

// Initial display of default posts when the page loads (now handled by onAuthStateChanged)
// document.addEventListener('DOMContentLoaded', displayDefaultPosts);
