// script.js
// Configura Firebase
 const firebaseConfig = {
            apiKey: "AIzaSyApU8UbfqfzBH1UPU3a1CQGf1p995Rf0y4",
            authDomain: "the-red-loggin.firebaseapp.com",
            projectId: "the-red-loggin",
            storageBucket: "the-red-loggin.firebasestorage.app",
            messagingSenderId: "40265573777",
            appId: "1:40265573777:web:1651cb4119969010ea2630",
            measurementId: "G-DPLC00RS2V"
        };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
let cropper = null;

// Configuración inicial de usuario
let currentUser = localStorage.getItem('currentUser') || '';
if (!currentUser) {
    currentUser = prompt('Por favor, ingresa tu nombre de usuario:');
    currentUser ? localStorage.setItem('currentUser', currentUser) : currentUser = 'Usuario';
}

// Configuración de navegación
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const buttonText = button.querySelector('.mobile-text')?.innerText;
        buttonText && localStorage.setItem('activeButton', buttonText);
    });
});

// Restaurar estado de navegación
window.addEventListener('load', () => {
    const activeButtonText = localStorage.getItem('activeButton');
    activeButtonText && document.querySelectorAll('.mobile-text').forEach(text => {
        text.innerText === activeButtonText && text.parentElement.classList.add('active');
    });
});

// Comportamiento del header con scroll
let lastScrollTop = 0;
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    header.style.top = scrollTop > lastScrollTop ? "-100px" : "0";
    lastScrollTop = Math.max(0, scrollTop);
});

// Manejo del popup
function openPopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "flex";
    setTimeout(() => {
        popup.style.opacity = "1";
        popup.style.transform = "scale(1)";
    }, 10);
}

function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.opacity = "0";
    popup.style.transform = "scale(0.95)";
    setTimeout(() => {
        popup.style.display = "none";
        cropper?.destroy();
        cropper = null;
    }, 300);
}

window.onclick = (event) => event.target === document.getElementById("popup") && closePopup();

// Definir variables globales para el input y la previsualización
let fileInput;
let previewImage;

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.querySelector('.upload-area');
    fileInput = document.getElementById('image-upload'); // Asignación global
    previewImage = document.getElementById('image-preview'); // Asignación global

    if (uploadArea && fileInput && previewImage) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                previewImage.style.display = 'block';
                
                if (cropper) cropper.destroy();
                
                cropper = new Cropper(previewImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    movable: true,
                    zoomable: true,
                });
            };
            reader.readAsDataURL(file);
        });
    }
});

// Función submitPost ahora accede a las variables globales
async function submitPost() {
    const file = fileInput.files[0];
}
// Publicar post
async function submitPost() {
    const user = firebase.auth().currentUser;
    if (!user) return alert("Debes iniciar sesión para publicar.");
    
    const file = fileInput.files[0];
    const ubicacion = document.getElementById('ubicacion').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = document.getElementById('precio').value;
    const contacto = document.getElementById('activar-contacto').checked;
    const etiquetas = document.getElementById('etiquetas').value;

    if (!cropper || !file) return alert("Debes subir y ajustar una imagen.");

    try {
        const canvas = cropper.getCroppedCanvas({
            width: 800,
            height: 800,
            fillColor: '#fff'
        });
        
        canvas.toBlob(async (blob) => {
            const storageRef = storage.ref(`posts/${user.uid}/${Date.now()}-${file.name}`);
            await storageRef.put(blob);
            
            const imageUrl = await storageRef.getDownloadURL();
            await db.collection("posts").add({
                uid: user.uid,
                nombre: user.displayName || "Anónimo",
                email: user.email,
                ubicacion,
                descripcion,
                precio: Number(precio),
                contacto,
                etiquetas,
                imagen: imageUrl,
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            });

            closePopup();
            alert("¡Post publicado exitosamente!");
            location.reload(); // Recargar para ver el nuevo post
        }, file.type);
        
    } catch (error) {
        console.error("Error al publicar:", error);
        alert("Hubo un error al publicar.");
    }
}

