# Guía: Inicialización y Ejecución del Proyecto Frontend con Vite

Esta guía detalla los pasos exactos para configurar tu entorno de desarrollo, inicializar el proyecto cliente con **Vite**, ubicar los archivos compartidos del repositorio de GitHub, y poner a prueba la autenticación interactuando con el servidor backend.

---

##  Paso 1: Configuración de Node.js con FNM (Fast Node Manager)

Para evitar problemas de permisos globales o incompatibilidades con herramientas modernas, utilizaremos **FNM** como administrador de versiones de Node.js en PowerShell.

1. Abre tu terminal **PowerShell** en Windows.
2. Instala FNM utilizando el gestor de paquetes de Windows (`winget`):
   ```powershell
   winget install Schniz.fnm
   ```
   *(Si la terminal te lo solicita al finalizar, cierra y vuelve a abrir PowerShell).*

3. Instala y activa la versión estable (LTS) de Node.js:
   ```powershell
   fnm install --lts
   fnm use --lts
   ```

4. **Solución a comandos no reconocidos (`npm` o `node`):**
   Si al abrir una nueva terminal la herramienta indica que no se reconoce el comando, inyecta las variables de entorno de FNM con el siguiente comando:
   ```powershell
   fnm env --shell powershell | Out-String | Invoke-Expression
   ```
   *(Tip permanente: Si deseas que esto sea automático, ejecuta `notepad $PROFILE`, pega esa misma línea, guarda y cierra).*

5. Verifica que la instalación sea exitosa comprobando las versiones:
   ```powershell
   node -v
   npm -v
   ```

---

## Paso 2: Creación del Proyecto con Vite

A diferencia de los asistentes interactivos tradicionales que solicitan nombres de paquetes, utilizaremos el comando optimizado para inicializar el proyecto directamente en la carpeta actual:

1. Crea una carpeta para tu proyecto frontend (ej. `frontend-cliente`) y navega dentro de ella en tu terminal:
   ```powershell
   mkdir frontend-cliente
   cd frontend-cliente
   ```

2. Inicializa Vite seleccionando plantillas nativas de JavaScript sin configuración adicional de nombres:
   ```powershell
   npm create vite@latest . -- --template vanilla
   ```

3. Instala las dependencias del proyecto:
   ```powershell
   npm install
   ```

---

##  Paso 3: Estructura y Ubicación de Archivos en el Repositorio

Los archivos compartidos del cliente deben ubicarse en la estructura del proyecto de la siguiente manera:

```text
📁 frontend-cliente/
├── 📁 node_modules/
├── 📁 src/
│   ├── 📄 api.js       <-- Centralizador de peticiones HTTP (fetch y tokens)
│   ├── 📄 auth.js      <-- Lógica de inicio de sesión y perfiles
│   ├── 📄 main.js      <-- Punto de entrada y control dinámico del DOM
│   └── 📄 style.css    <-- Estilos de la aplicación
├── 📄 index.html       <-- Interfaz visual base y contenedores de vistas
├── 📄 package.json
└── 📄 vite.config.js
```

> **Asegúrate de colocar cada archivo en su ruta correspondiente** dentro de la carpeta `src/` o en la raíz (`index.html`), reemplazando las plantillas por defecto que genera Vite.

---

##  Paso 4: Ejecución Conjunta (Frontend + Backend)

Para que la aplicación funcione correctamente, **debes tener ambos servidores encendidos de forma simultánea** en terminales independientes:

### 1. Servidor Backend (Django en Docker)
* Asegúrate de tener abierto **Docker Desktop**.
* Abre la terminal en la carpeta de tu backend y ejecuta:
  ```bash
  docker compose up --build
  ```
* El servidor backend quedará activo en: `http://127.0.0.1:8000/`

### 2. Servidor Frontend (Vite)
* Abre una nueva ventana de terminal en la carpeta de tu proyecto frontend (`frontend-cliente`).
* Ejecuta el servidor de desarrollo local:
  ```powershell
  npm run dev
  ```
* Vite te proporcionará un enlace local en la consola (por lo general **`http://localhost:5173`**). Haz clic en él o ábrelo en tu navegador web.

---

##  Paso 5: Prueba Integral del Login

1. Abre tu navegador web en la dirección de Vite (`http://localhost:5173`).
2. Visualizarás el formulario de acceso estructurado en el `index.html`.
3. Introduce las credenciales del usuario de prueba (o un usuario previamente registrado mediante Postman en la ruta `/api/registro/`).
4. Haz clic en **Entrar**. El script (`auth.js` y `main.js`) procesará la respuesta de la API mediante `fetch()`, almacenará el token de acceso en el `localStorage` y actualizará dinámicamente el DOM para mostrar el panel protegido sin necesidad de recargar la página.