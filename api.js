const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function peticionAPI(endpoint, method = 'GET', data = null, requiereAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiereAuth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401 && requiereAuth) {
        localStorage.removeItem('access_token');
        window.location.reload();
        throw new Error('Sesión expirada');
    }

    return response;
}