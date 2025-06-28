// Slider de imágenes por sección
const sliders = {
  slider1: ["logo.jpg", "negocio2.jpg"],
  slider2: ["organizacion1.jpg", "organizacion2.jpg"],
  slider3: ["usuario1.jpg", "usuario2.jpg"],
  slider4: ["empresa1.jpg", "empresa2.jpg"]
};

for (let id in sliders) {
  const container = document.getElementById(id);
  sliders[id].forEach(imgName => {
    const img = document.createElement("img");
    img.src = `img/${imgName}`;
    container.appendChild(img);
  });
}

// Toggle de la barra lateral
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.style.display = sidebar.classList.contains("active") ? "block" : "none";
}

// Cerrar la barra si se hace clic en el fondo
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").style.display = "none";
}

// Cerrar la barra al hacer clic en un enlace (excepto modales)
document.querySelectorAll(".sidebar-menu a").forEach(link => {
  link.addEventListener("click", (e) => {
    const isModalLink = link.getAttribute("onclick");
    if (!isModalLink) {
      closeSidebar();
    }
  });
});

// Abrir modal con contenido animado
function openModal(id) {
  closeSidebar();
  document.getElementById(`modal-${id}`).style.display = "block";
}

// Cerrar modal
function closeModal(id) {
  document.getElementById(`modal-${id}`).style.display = "none";
}

// Cerrar modal al hacer clic fuera del contenido
window.onclick = function(event) {
  ["mission", "who"].forEach(id => {
    const modal = document.getElementById(`modal-${id}`);
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};


// AUTOSCROLL AUTOMÁTICO EN CADA SLIDER
function autoScrollSlider(sliderId) {
  const slider = document.getElementById(sliderId);
  let scrollAmount = 0;
  const scrollStep = 1; // velocidad
  const delay = 20; // frecuencia de desplazamiento en ms

  setInterval(() => {
    if (slider.scrollWidth - slider.clientWidth === slider.scrollLeft) {
      // Si llegó al final, vuelve al inicio
      slider.scrollLeft = 0;
      scrollAmount = 0;
    } else {
      slider.scrollLeft += scrollStep;
      scrollAmount += scrollStep;
    }
  }, delay);
}

// Activar autoscroll en todos los sliders
["slider1", "slider2", "slider3", "slider4"].forEach(id => autoScrollSlider(id));

// Mostrar popup de bienvenida automáticamente al cargar
window.onload = function() {
  document.getElementById("welcome-popup").style.display = "block";
};

// Cerrar el popup de bienvenida
function closeWelcomePopup() {
  document.getElementById("welcome-popup").style.display = "none";
}
