// Firebase Configuration - Variables de Entorno
// Para producción, estas variables deben ser configuradas en el servidor
// y no expuestas en el código del cliente

// Configuración por defecto (desarrollo)
const defaultConfig = {
  apiKey: "AIzaSyApU8UbfqfzBH1UPU3a1CQGf1p995Rf0y4",
  authDomain: "the-red-loggin.firebaseapp.com",
  projectId: "the-red-loggin",
  storageBucket: "the-red-loggin.appspot.com",
  messagingSenderId: "40265573777",
  appId: "1:40265573777:web:1651cb4119969010ea2630"
};

// En producción, usar variables de entorno del servidor
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || defaultConfig;

// Función para obtener la configuración de Firebase
export function getFirebaseConfig() {
  return window.FIREBASE_CONFIG;
}

// Instrucciones para producción:
// 1. Crear archivo .env en el servidor con las variables:
//    FIREBASE_API_KEY=tu_api_key_aqui
//    FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
//    etc.
// 
// 2. Configurar el servidor para inyectar estas variables en window.FIREBASE_CONFIG
// 3. Nunca exponer las API keys en el código del cliente en producción
