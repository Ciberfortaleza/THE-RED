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
// Abre el popup cuando se presiona el botón "Crear nuevo post"
function openPopup() {
    let popup = document.getElementById("popup");
    popup.style.display = "flex";
    popup.style.opacity = "1";
    popup.style.transform = "scale(1)"; // Hace que el popup aparezca con efecto suave
}

// Cierra el popup cuando el usuario presiona el botón de cierre
function closePopup() {
    let popup = document.getElementById("popup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.95)"; // Pequeña animación de salida
    setTimeout(() => {
        popup.style.display = "none";
    }, 300); // Retraso para animación de salida
}

// Detectar si el usuario hace clic fuera del popup para cerrarlo
window.onclick = function (event) {
    let popup = document.getElementById("popup");
    if (event.target === popup) {
        closePopup();
    }
};


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
