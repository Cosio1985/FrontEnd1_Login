# FrontEnd: Maquetado de Catálogos, Filtros Visuales y Consumo de APIs Relacionales

## Bloque 1: Mapa de Conceptos a Revisar (Lectura y Comprensión Técnica)

Este documento reúne los fundamentos teóricos necesarios para evolucionar un cliente web con autenticación JWT hacia una interfaz capaz de consultar, filtrar y renderizar catálogos de datos provenientes de una API REST relacional.

---

### 1. Construcción Dinámica de *Query Parameters* (`URLSearchParams`)
Cuando un servidor backend expone endpoints con filtros opcionales (como `precio_max`, `ciudad` o `con_stock`), el cliente web debe construir la URL de petición dinámicamente según la interacción del usuario en la interfaz.

* **Concatenación manual vs. `URLSearchParams`:** Concatenar cadenas con signos `?` y `&` manualmente suele provocar errores de sintaxis cuando algunos filtros quedan vacíos. La API nativa de JavaScript **`URLSearchParams`** gestiona automáticamente los separadores y la codificación de caracteres especiales (como espacios o acentos).
* **Flujo básico:**
  ```javascript
  const params = new URLSearchParams();
  if (ciudad) params.append('ciudad', ciudad);
  if (precioMax) params.append('precio_max', precioMax);

  // Genera automáticamente: "ciudad=Tijuana&precio_max=1000"
  const queryString = params.toString(); 
  const urlFinal = queryString ? `/productos-catalogo/?${queryString}` : '/productos-catalogo/';
  ```

---

### 2. Peticiones `GET` Autenticadas con Bearer Token
A diferencia de las rutas públicas, los endpoints protegidos en Django REST Framework exigen demostrar la identidad del usuario en cada solicitud HTTP.

* **Encabezado de Autorización:** El cliente debe recuperar el token almacenado en `localStorage` e incluirlo en la cabecera `Authorization` con el prefijo `Bearer ` seguido de un espacio.
* **Manejo de Respuestas y Expiración (Código `401`):** Toda petición asíncrona debe envolverse en bloques `try / catch`. Si el servidor responde con un estado `401 Unauthorized`, significa que el token expiró o es inválido, por lo que la aplicación debe limpiar el almacenamiento local y redirigir a la vista de inicio de sesión.

---

### 3. Maquetado de Catálogos con CSS Grid (`auto-fill` y `minmax`)
Para presentar colecciones de productos de forma profesional y adaptable a cualquier tamaño de pantalla sin depender de librerías externas, **CSS Grid** ofrece un patrón responsivo nativo de una sola línea:

```css
.catalogo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}
```
* **`repeat(auto-fill, ...)`:** Calcula automáticamente cuántas columnas caben en el ancho disponible del contenedor.
* **`minmax(260px, 1fr)`:** Garantiza que ninguna tarjeta (*card*) mida menos de `260px` de ancho, distribuyendo el espacio sobrante de manera equitativa (`1fr`).

---

### 4. Renderizado Declarativo en el DOM con `.map()` y *Template Literals*
Una vez recibida la respuesta JSON del servidor (un arreglo de objetos producto con sus relaciones anidadas), JavaScript transforma esos datos en nodos HTML:

1. **Iteración funcional (`.map()`):** Convierte cada objeto del arreglo JSON en una cadena de texto HTML que representa una tarjeta individual.
2. **Unión de cadenas (`.join('')`):** Combina todas las tarjetas generadas en un solo bloque de texto continuo, evitando las comas que JavaScript inserta por defecto al convertir arreglos a texto.
3. **Inyección única en el DOM:** Asignar el resultado final a `contenedor.innerHTML` actualiza la pantalla en una sola operación de renderizado, optimizando el rendimiento del navegador.
4. **Renderizado de arreglos internos:** Dado que cada producto incluye un arreglo de categorías (`["Electrónica", "Redes"]`), es necesario aplicar un `.map()` anidado para generar etiquetas visuales (*badges*) por cada categoría asociada.