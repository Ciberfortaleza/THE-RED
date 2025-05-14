// script.js
// Configuración inicial de usuario
let currentUser = localStorage.getItem('currentUser') || '';
if (!currentUser) {
    currentUser = prompt('Por favor, ingresa tu nombre de usuario:');
    if (currentUser) {
        localStorage.setItem('currentUser', currentUser);
    } else {
        currentUser = 'Usuario';
    }
}

// Configuración de botones de navegación
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const buttonText = button.querySelector('.mobile-text')?.innerText;
        if (buttonText) {
            localStorage.setItem('activeButton', buttonText);
        }
    });
});

// Restaurar botón activo en la navegación
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

// Ocultar/mostrar header según scroll
let lastScrollTop = 0;
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        header.style.top = "-100px"; // Ocultar
    } else {
        header.style.top = "0"; // Mostrar
    }

    lastScrollTop = Math.max(0, scrollTop); // Prevenir valores negativos
});

// Manejo del popup
function openPopup() {
    document.getElementById("popup").style.display = "flex";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Cargar imagen de forma interactiva
const uploadArea = document.querySelector('.upload-area');
const fileInput = document.getElementById('image-upload');
const previewImage = document.getElementById('image-preview');

if (uploadArea && fileInput && previewImage) {
    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Crear y publicar un nuevo post
function submitPost() {
    const titulo = document.getElementById("titulo").value.trim();
    const ubicacion = document.getElementById("ubicacion").value.trim();
    const contacto = document.getElementById("contacto").value.trim();
    const sitio = document.getElementById("sitio").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const description = document.getElementById("description").value.trim();
    const imageSrc = previewImage?.src;

    if (!titulo || !contacto || !precio) {
        alert("Por favor, completa los campos obligatorios (Título, Contacto, Precio).");
        return;
    }

    const postHTML = `
        <div class="post visible">
            <div class="post-header">
                <img src="avatar.png" class="user-avatar" alt="Avatar del usuario" />
                <div class="user-info">
                    <p class="username">${currentUser}</p>
                    <p class="location">${ubicacion || 'Ubicación no especificada'}</p>
                </div>
            </div>
            ${imageSrc ? `<img src="${imageSrc}" class="post-image" alt="${titulo}"/>` : ''}
            <p class="product-description">${description}</p>
            <div class="product-details">
                <p class="product-price">${precio}</p>
                <div class="contact-info">
                    <a class="external-link" href="mailto:${contacto}">📧 ${contacto}</a>
                    ${sitio ? `<a class="external-link" href="${sitio}" target="_blank" rel="noopener noreferrer">🔗 Sitio Web</a>` : ''}
                </div>
            </div>
        </div>
    `;

    const wall = document.getElementById("scroll-wall");
    if (wall) {
        wall.insertAdjacentHTML('afterbegin', postHTML);
    }

    closePopup();

    // Limpiar formulario
    document.getElementById("popup").querySelectorAll("input, textarea").forEach(el => el.value = "");
    if (previewImage) {
        previewImage.src = "";
        previewImage.style.display = "none";
    }
}

// Cambiar idioma
function toggleLanguage() {
    const button = document.querySelector('.language-button');
    if (button) {
        button.textContent = button.textContent === 'EN' ? 'ES' : 'EN';
    }
}