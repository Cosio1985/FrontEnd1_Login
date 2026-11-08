import './style.css';
import { login, obtenerPerfil, logout } from './auth.js';

// Referencias a los elementos del DOM en tu index.html
const sectionLogin = document.getElementById('section-login');
const sectionPerfil = document.getElementById('section-perfil');
const formLogin = document.getElementById('form-login');
const userInfo = document.getElementById('user-info');
const btnLogout = document.getElementById('btn-logout');

// Función para verificar si ya existe un token guardado y mostrar el perfil
async function verificarEstadoSesion() {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const perfil = await obtenerPerfil();
            userInfo.textContent = `Usuario autenticado: ${perfil.username || perfil.email || 'OK'}`;
            sectionLogin.classList.add('hidden');
            sectionPerfil.classList.remove('hidden');
        } catch (error) {
            console.error("Sesión inválida o expirada:", error.message);
            logout(); // Limpiamos si hay problemas
        }
    }
}

// Evento para procesar el formulario de inicio de sesión
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        try {
            await login(user, pass);
            await verificarEstadoSesion();
        } catch (error) {
            alert("Error al iniciar sesión: " + error.message);
        }
    });
}

// Evento para cerrar sesión
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        logout();
    });
}

// Comprobar la sesión automáticamente al cargar la página
verificarEstadoSesion();