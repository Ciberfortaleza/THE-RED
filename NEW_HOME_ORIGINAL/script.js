// script.js

// Guardar post en Firestore (dejado para el backend)
const db = firebase.firestore();
db.collection("posts").add({
  titulo,
  ubicacion,
  descripcion,
  precio,
  hashtags,
  mostrarContacto,
  contactoInfo,
  image: imagePreview,
  username: currentUser,
  timestamp: new Date()
}).then(docRef => {
  console.log("Post guardado con ID:", docRef.id);
}).catch(error => {
  console.error("Error al guardar el post:", error);
});

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

function submitPost() {
    const titulo = document.getElementById('titulo').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const descripcion = document.getElementById('description').value;
    const precio = document.getElementById('precio').value;
    const hashtags = document.getElementById('hashtags').value;
    const mostrarContacto = document.getElementById('mostrar-contacto').checked;
    const contactoInfo = document.getElementById('contacto-info').value;
    const imagePreview = document.getElementById('image-preview').src;

    if (!titulo || !precio || !imagePreview) {
        alert('Por favor completa los campos requeridos');
        return;
    }

    // Crear nuevo post
    const newPost = document.createElement('div');
    newPost.className = 'post-card';
    newPost.innerHTML = `
        <div class="post-image">
            <img src="${imagePreview}" alt="Imagen del producto">
        </div>
        <div class="post-info">
            <div class="user">
                <img class="avatar" src="perfil.jpg" alt="Foto de perfil">
                <div class="user-data">
                    <span class="username">@${currentUser}</span>
                    <span class="location">${ubicacion}</span>
                </div>
            </div>
            <p class="description">${descripcion}</p>
            <hr>
            <div class="price">$${precio} MXN</div>
            ${mostrarContacto ? `<a href="${contactoInfo}" class="contact">Contactar</a>` : ''}
            <div class="hashtags">${hashtags.split(' ').join(' ')}</div>
        </div>
    `;

    // Añadir evento de zoom a la imagen del post
    const postImage = newPost.querySelector(".post-image img");
    postImage.addEventListener("click", () => {
        openImagePopup(postImage.src);
    });

    // Insertar al principio del muro
    document.getElementById('scroll-wall').prepend(newPost);
    closePopup();
    resetForm();
}

function resetForm() {
    document.getElementById('titulo').value = '';
    document.getElementById('ubicacion').value = '';
    document.getElementById('description').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('hashtags').value = '';
    document.getElementById('contacto-info').value = '';
    document.getElementById('image-preview').src = '';
    document.getElementById('image-preview').style.display = 'none';
}

/*REDIRECCIONES DE LOS BOTONES DE NAVEGACIÓN*/

function navigate(page) {
  const urls = {
    home: '../NEW_HOME_ORIGINAL/index.html',
    discover: '../new_discover/index.html',
    myrole: '../new_myrole/index.html',
    profile: '../new_profile/index.html'
  };
  
  if (urls[page]) {
    window.location.href = urls[page];
  }
}

/*ZOOM Y INZOOM IMAGE POST FUNCION*/
let scale = 1;

function openImagePopup(imageSrc) {
  const popup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  popupImage.src = imageSrc;
  popup.style.display = "flex";
  scale = 1;
  popupImage.style.transform = `scale(${scale})`;
}

function closeImagePopup() {
  document.getElementById("imagePopup").style.display = "none";
}

document.getElementById("popupImage").addEventListener("wheel", function (e) {
  e.preventDefault();
  scale += e.deltaY * -0.001; // Zoom con scroll
  scale = Math.min(Math.max(.5, scale), 4); // límites
  this.style.transform = `scale(${scale})`;
});