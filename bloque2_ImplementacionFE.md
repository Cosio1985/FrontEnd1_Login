# FrontEnd: Integración del Catálogo de Productos y Filtros Visuales

## Bloque 2: Ruta de Implementación Paso a Paso (Sobre el Proyecto Base con Login JWT)

Esta guía detalla la secuencia de desarrollo para ampliar el cliente web construido en Vite durante la sesión anterior (donde se implementó `index.html`, `src/api.js`, `src/auth.js` y `src/main.js`), conectándolo con el endpoint relacional `GET /api/productos-catalogo/` del servidor backend.

> **Requisito previo:** Asegurar que el contenedor Docker o bien su servidor del backend se encuentre en ejecución (`http://127.0.0.1:8000`) y cuente con registros cargados en las tablas `Proveedor`, `Categoria` y `Producto`.

---

### Paso 1: Actualización de la Estructura HTML (`index.html`)

Dentro de la sección protegida (`#section-perfil`), se incorpora el panel de **filtros visuales** (búsqueda por ciudad, precio máximo y disponibilidad de stock) junto con el contenedor vacío donde JavaScript renderizará las tarjetas de productos.

Reemplazar el contenido de `index.html` con la siguiente estructura:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Catálogo de Productos | Vite + Django API</title>
  </head>
  <body>
    <div id="app">
      <!-- Barra superior de sesión -->
      <header class="topbar">
        <h1>Sistema de Inventario</h1>
        <div id="user-controls" class="hidden">
          <span id="user-info"></span>
          <button id="btn-logout" class="btn-secondary">Cerrar Sesión</button>
        </div>
      </header>

      <!-- Vista 1: Formulario de Acceso -->
      <main id="section-login" class="card-login">
        <h2>Iniciar Sesión</h2>
        <form id="form-login">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input type="text" id="username" placeholder="Ej. alumno1" required />
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn-primary">Entrar al Sistema</button>
        </form>
      </main>

      <!-- Vista 2: Panel Protegido y Catálogo de Productos -->
      <main id="section-perfil" class="hidden">
        <!-- Sección de Filtros Visuales -->
        <section class="filtros-panel">
          <h2>Catálogo de Productos</h2>
          <form id="form-filtros" class="filtros-form">
            <div class="filtro-item">
              <label for="filtro-ciudad">Ciudad del Proveedor</label>
              <input type="text" id="filtro-ciudad" placeholder="Ej. Tijuana, Monterrey..." />
            </div>

            <div class="filtro-item">
              <label for="filtro-precio">Precio Máximo ($)</label>
              <input type="number" id="filtro-precio" min="0" step="0.01" placeholder="Ej. 1000" />
            </div>

            <div class="filtro-item checkbox-item">
              <input type="checkbox" id="filtro-stock" />
              <label for="filtro-stock">Solo con stock disponible</label>
            </div>

            <div class="filtro-acciones">
              <button type="submit" class="btn-primary">Aplicar Filtros</button>
              <button type="button" id="btn-limpiar" class="btn-secondary">Limpiar</button>
            </div>
          </form>
        </section>

        <!-- Indicador de estado de carga / mensajes -->
        <p id="estado-catalogo" class="estado-mensaje"></p>

        <!-- Contenedor Grid para las Cards de Productos -->
        <section id="contenedor-productos" class="catalogo-grid"></section>
      </main>
    </div>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

### Paso 2: Creación del Módulo de Servicios de Productos (`src/productos.js`)

Siguiendo el principio de modularidad, se crea un archivo dedicado exclusivamente a construir los *Query Parameters* y consumir el endpoint protegido utilizando la función `peticionAPI` existente en `src/api.js`.

Crear el archivo `src/productos.js` con el siguiente código:

```javascript
import { peticionAPI } from './api.js';

/**
 * Consulta el catálogo de productos aplicando filtros opcionales en la URL.
 * @param {Object} filtros - Objeto con propiedades opcionales: ciudad, precio_max, con_stock
 */
export async function obtenerProductos(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.ciudad && filtros.ciudad.trim() !== '') {
    params.append('ciudad', filtros.ciudad.trim());
  }

  if (filtros.precio_max && filtros.precio_max !== '') {
    params.append('precio_max', filtros.precio_max);
  }

  if (filtros.con_stock) {
    params.append('con_stock', 'true');
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/productos-catalogo/?${queryString}`
    : '/productos-catalogo/';

  // El cuarto parámetro (true) indica que se debe enviar el Bearer Token
  const response = await peticionAPI(endpoint, 'GET', null, true);

  if (!response.ok) {
    throw new Error(`Error al consultar el catálogo (Código ${response.status})`);
  }

  return await response.json();
}
```

---

### Paso 3: Estilos Responsivos y Diseño de Tarjetas (`src/style.css`)

Se definen los estilos para el formulario de filtros y la cuadrícula de tarjetas (*cards*), incluyendo indicadores visuales para el stock disponible y etiquetas (*badges*) para las categorías.

Actualizar el archivo `src/style.css`:

```css
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --bg-page: #f1f5f9;
  --bg-card: #ffffff;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #cbd5e1;
  --success-bg: #dcfce7;
  --success-text: #166534;
  --danger-bg: #fee2e2;
  --danger-text: #991b1b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  line-height: 1.5;
}

.hidden {
  display: none !important;
}

/* Barra superior */
.topbar {
  background-color: #0f172a;
  color: #ffffff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topbar h1 {
  font-size: 1.25rem;
}

#user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Contenedor principal */
main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

/* Tarjeta de Login */
.card-login {
  max-width: 400px;
  background: var(--bg-card);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

input[type="text"],
input[type="password"],
input[type="number"] {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
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

.btn-secondary {
  background-color: #e2e8f0;
  color: var(--text-main);
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

/* Panel de Filtros */
.filtros-panel {
  background: var(--bg-card);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.filtros-panel h2 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.filtros-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1 1 200px;
}

.checkbox-item {
  flex-direction: row;
  align-items: center;
  padding-bottom: 0.6rem;
}

.filtro-acciones {
  display: flex;
  gap: 0.5rem;
}

.estado-mensaje {
  margin-bottom: 1rem;
  font-weight: 500;
  color: var(--text-muted);
}

/* Cuadrícula (Grid) de Cards */
.catalogo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 1.5rem;
}

/* Diseño Individual de cada Card */
.producto-card {
  background: var(--bg-card);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.card-precio {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.card-proveedor {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.card-categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.badge-categoria {
  background-color: #eff6ff;
  color: #1e40af;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
}

.card-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.stock-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
}

.stock-disponible {
  background-color: var(--success-bg);
  color: var(--success-text);
}

.stock-agotado {
  background-color: var(--danger-bg);
  color: var(--danger-text);
}
```

---

### Paso 4: Orquestación del DOM y Renderizado de Cards (`src/main.js`)

Finalmente, se actualiza `src/main.js` para que, una vez validada la sesión del usuario, se cargue automáticamente el catálogo inicial y se escuchen los eventos del formulario de filtros para actualizar las tarjetas en tiempo real.

Reemplazar el contenido de `src/main.js` con:

```javascript
import './style.css';
import { login, obtenerPerfil, logout } from './auth.js';
import { obtenerProductos } from './productos.js';

// Referencias a elementos del DOM
const sectionLogin = document.getElementById('section-login');
const sectionPerfil = document.getElementById('section-perfil');
const userControls = document.getElementById('user-controls');
const userInfo = document.getElementById('user-info');

const formLogin = document.getElementById('form-login');
const btnLogout = document.getElementById('btn-logout');

const formFiltros = document.getElementById('form-filtros');
const btnLimpiar = document.getElementById('btn-limpiar');
const contenedorProductos = document.getElementById('contenedor-productos');
const estadoCatalogo = document.getElementById('estado-catalogo');

/**
 * Transforma un arreglo de productos JSON en tarjetas HTML e inyecta el resultado en el DOM.
 */
function renderizarCatalogo(productos) {
  if (!productos || productos.length === 0) {
    contenedorProductos.innerHTML = '';
    estadoCatalogo.textContent = 'No se encontraron productos con los criterios seleccionados.';
    return;
  }

  estadoCatalogo.textContent = `Mostrando ${productos.length} producto(s)`;

  const tarjetasHTML = productos.map((prod) => {
    // Generar etiquetas para las categorías (ManyToMany)
    const categoriasHTML = prod.categorias && prod.categorias.length > 0
      ? prod.categorias.map((cat) => `<span class="badge-categoria">${cat}</span>`).join('')
      : '<span class="badge-categoria">Sin categoría</span>';

    // Definir estilo según disponibilidad de inventario
    const tieneStock = prod.stock > 0;
    const claseStock = tieneStock ? 'stock-disponible' : 'stock-agotado';
    const textoStock = tieneStock ? `${prod.stock} disponibles` : 'Agotado';

    return `
      <article class="producto-card">
        <div>
          <div class="card-header">
            <h3 class="card-title">${prod.nombre}</h3>
            <span class="card-precio">$${Number(prod.precio).toFixed(2)}</span>
          </div>
          <p class="card-proveedor">
            Proveedor: <strong>${prod.proveedor_nombre}</strong> (${prod.proveedor_ciudad})
          </p>
        </div>

        <div class="card-categorias">
          ${categoriasHTML}
        </div>

        <div class="card-footer">
          <span>ID #${prod.id}</span>
          <span class="stock-badge ${claseStock}">${textoStock}</span>
        </div>
      </article>
    `;
  }).join('');

  contenedorProductos.innerHTML = tarjetasHTML;
}

/**
 * Consulta la API de productos aplicando los filtros actuales de la interfaz.
 */
async function cargarProductos(filtros = {}) {
  estadoCatalogo.textContent = 'Cargando catálogo de productos...';
  contenedorProductos.innerHTML = '';

  try {
    const productos = await obtenerProductos(filtros);
    renderizarCatalogo(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    estadoCatalogo.textContent = 'Ocurrió un error al obtener los productos desde el servidor.';
  }
}

/**
 * Verifica si existe un token válido y alterna las vistas de la aplicación.
 */
async function verificarEstadoSesion() {
  const token = localStorage.getItem('access_token');

  if (token) {
    try {
      const perfil = await obtenerPerfil();
      userInfo.textContent = `Usuario: ${perfil.username || 'Activo'}`;

      sectionLogin.classList.add('hidden');
      sectionPerfil.classList.remove('hidden');
      userControls.classList.remove('hidden');

      // Cargar catálogo completo al iniciar sesión
      await cargarProductos();
    } catch (error) {
      console.error('Sesión inválida o expirada:', error.message);
      logout();
    }
  } else {
    sectionLogin.classList.remove('hidden');
    sectionPerfil.classList.add('hidden');
    userControls.classList.add('hidden');
  }
}

// Evento: Inicio de sesión
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    try {
      await login(user, pass);
      await verificarEstadoSesion();
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  });
}

// Evento: Cerrar sesión
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    logout();
  });
}

// Evento: Aplicar filtros visuales
if (formFiltros) {
  formFiltros.addEventListener('submit', async (e) => {
    e.preventDefault();

    const filtros = {
      ciudad: document.getElementById('filtro-ciudad').value,
      precio_max: document.getElementById('filtro-precio').value,
      con_stock: document.getElementById('filtro-stock').checked,
    };

    await cargarProductos(filtros);
  });
}

// Evento: Limpiar filtros y recargar todo el catálogo
if (btnLimpiar) {
  btnLimpiar.addEventListener('click', async () => {
    formFiltros.reset();
    await cargarProductos();
  });
}

// Inicialización al cargar la página
verificarEstadoSesion();
```

---

### Paso 5: Verificación Integral (Full-Stack)

1. Confirmar que el contenedor Docker o el servidor local del backend esté operando en `http://127.0.0.1:8000` y que el servidor Vite esté activo (`npm run dev` en `http://localhost:5173`).
2. Iniciar sesión con las credenciales registradas en la base de datos.
3. Verificar que al acceder al panel principal se desplieguen automáticamente todas las tarjetas de productos con su precio, proveedor, ciudad, etiquetas de categorías y estado de stock.
4. Poner a prueba las combinaciones de filtros visuales (por ejemplo: ingresar `Tijuana` en ciudad, `1000` en precio máximo y marcar la casilla de stock disponible) y confirmar que la cuadrícula se actualiza dinámicamente sin recargar el navegador.