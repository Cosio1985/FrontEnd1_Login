#  Guía Práctica: Consumo de APIs Públicas (JSONPlaceholder) y Renderizado en Cards

Esta guía establece los pasos metodológicos y técnicos para conectar un cliente web desarrollado en **Vite** con una API REST pública (*JSONPlaceholder*), procesando la información de manera asíncrona y transformándola en componentes visuales interactivos en forma de tarjetas (*cards*).

---

## Objetivo de la Práctica
Desarrollar una interfaz web basada en JavaScript Vanilla (ES6+) y CSS Grid que realice peticiones `GET` asíncronas hacia un recurso público de **JSONPlaceholder**, gestione los estados de carga y errores, y renderice dinámicamente los datos en pantalla mediante plantillas de texto (*template literals*).

---

##  Paso 1: Elección del Recurso en JSONPlaceholder
La plataforma [JSONPlaceholder](https://jsonplaceholder.typicode.com/) ofrece diversos recursos de prueba de acceso libre. Para esta práctica, se puede seleccionar libremente cualquiera de las siguientes opciones:
* **Posts (Publicaciones):** Ideal para catálogos de texto, artículos o tarjetas informativas (`/posts`).
* **Users (Usuarios):** Excelente para perfiles, directorios o tarjetas de presentación (`/users`).
* **Albums / Photos:** Útil para galerías de imágenes o catálogos visuales (`/albums` o `/photos`).

*(Para los ejemplos de esta guía, se utilizará el endpoint de publicaciones: `https://jsonplaceholder.typicode.com/posts`).*

---

## Paso 2: Estructura HTML Base (`index.html`)
Actualiza el archivo principal del proyecto para incluir un encabezado descriptivo, un botón de actualización, un indicador de estado y un contenedor adaptable en forma de cuadrícula.

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Consumo de API Pública | Vite</title>
  </head>
  <body>
    <div id="app">
      <header class="topbar">
        <h1>Explorador de Datos Públicos</h1>
        <button id="btn-recargar" class="btn-primary">Actualizar Datos</button>
      </header>

      <main class="main-container">
        <!-- Indicador de estado / carga -->
        <p id="estado-carga" class="estado-mensaje"></p>

        <!-- Cuadrícula donde se inyectarán las Cards -->
        <section id="contenedor-cards" class="catalogo-grid"></section>
      </main>
    </div>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

##  Paso 3: Servicio de Petición Asíncrona (`src/apiService.js`)
Crea un módulo independiente encargado de comunicarse con el servidor externo utilizando `fetch()` y bloques de control de excepciones `try / catch`.

```javascript
const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Realiza una petición GET a un recurso específico de JSONPlaceholder.
 * @param {string} recurso - Nombre del endpoint (ej. 'posts', 'users')
 */
 export async function obtenerDatosAPI(recurso = 'posts') {
  try {
    const response = await fetch(`${BASE_URL}/${recurso}`);

    if (!response.ok) {
      throw new Error(`Error en la solicitud HTTP (Código ${response.status})`);
    }

    const datos = await response.json();
    return datos;
  } catch (error) {
    console.error('Fallo en la comunicación con la API:', error);
    throw error;
  }
}
```
*(Nota: Asegúrate de exportar correctamente la función como `export async function obtenerDatosAPI...`)*

---

##  Paso 4: Estilos CSS y Diseño Responsivo (`src/style.css`)
Define un sistema de rejilla adaptable mediante **CSS Grid** (`auto-fill` y `minmax`) y estilos limpios para las tarjetas.

```css
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  line-height: 1.5;
}

.topbar {
  background-color: #0f172a;
  color: #ffffff;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar h1 {
  font-size: 1.25rem;
}

.main-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

button {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.estado-mensaje {
  margin-bottom: 1.25rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* Cuadrícula responsiva para las Cards */
.catalogo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Diseño de cada Card */
.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.card-body {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
}
```

---

##  Paso 5: Orquestación y Renderizado en el DOM (`src/main.js`)
Configura el punto de entrada principal para invocar los datos asíncronos, procesar el arreglo mediante programación funcional (`.map()`) y proyectar las tarjetas en la interfaz.

```javascript
import './style.css';
import { obtenerDatosAPI } from './apiService.js';

const contenedorCards = document.getElementById('contenedor-cards');
const estadoCarga = document.getElementById('estado-carga');
const btnRecargar = document.getElementById('btn-recargar');

/**
 * Transforma un arreglo de objetos JSON en nodos HTML estructurados en tarjetas.
 */
function renderizarTarjetas(items) {
  if (!items || items.length === 0) {
    contenedorCards.innerHTML = '';
    estadoCarga.textContent = 'No se encontraron registros disponibles.';
    return;
  }

  estadoCarga.textContent = `Se cargaron ${items.length} elementos correctamente.`;

  // Mapeo funcional de objetos JSON a plantillas HTML
  const tarjetasHTML = items.map((item) => {
    return `
      <article class="info-card">
        <div>
          <h3 class="card-title">${item.title || item.name}</h3>
          <p class="card-body">${item.body || item.email || item.username}</p>
        </div>
        <div class="card-footer">
          <span>ID Reg. #${item.id}</span>
          <span>Ref. Usuario #${item.userId || item.id}</span>
        </div>
      </article>
    `;
  }).join('');

  contenedorCards.innerHTML = tarjetasHTML;
}

/**
 * Función principal para coordinar la carga de datos con manejo de estados.
 */
async function iniciarCarga() {
  estadoCarga.textContent = 'Conectando con la API pública y descargando datos...';
  contenedorCards.innerHTML = '';

  try {
    // Puedes cambiar 'posts' por 'users' o 'todos'
    const datos = await obtenerDatosAPI('posts');
    renderizarTarjetas(datos);
  } catch (error) {
    estadoCarga.textContent = 'Error al obtener la información. Verifique su conexión a internet.';
  }
}

// Evento de actualización manual
if (btnRecargar) {
  btnRecargar.addEventListener('click', () => {
    iniciarCarga();
  });
}

// Ejecución inicial al abrir la aplicación
iniciarCarga();
```

---

##  Paso 6: Ejecución y Verificación Local
1. Asegúrate de tener instalado Node.js y haber inicializado el proyecto con Vite (`npm create vite@latest . -- --template vanilla`).
2. Instala las dependencias necesarias (`npm install`).
3. Ejecuta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abre en tu navegador el enlace local proporcionado (por lo general `http://localhost:5173`) y comprueba cómo el cliente web consume la API pública, maneja la asincronía y dibuja las tarjetas en pantalla de manera fluida y responsiva.