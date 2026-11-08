import { peticionAPI } from './api.js';

export async function login(username, password) {
    const res = await peticionAPI('/token/', 'POST', { username, password });
    if (!res.ok) throw new Error('Credenciales incorrectas');
    
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data;
}

export async function obtenerPerfil() {
    const res = await peticionAPI('/perfil/', 'GET', null, true);
    if (!res.ok) throw new Error('No se pudo obtener el perfil');
    return await res.json();
}

export function logout() {
    localStorage.removeItem('access_token');
    window.location.reload();
}