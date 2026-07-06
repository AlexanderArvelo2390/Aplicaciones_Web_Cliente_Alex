# 🚀 GUÍA COMPLETA DE INICIO - CellStore

## ¿QUÉ SE IMPLEMENTÓ?

### ✅ 1. **Sistema de Registro de Usuarios**

- Formulario en `login.html` con tabs: "Iniciar Sesión" y "Registrarse"
- Campos: Nombre, Apellido, DNI, Correo
- Validaciones automáticas
- Guardado en Supabase (tabla `usuarios`)
- Almacenamiento en localStorage

### ✅ 2. **Panel de Admin - Gestión de Usuarios**

- Sección en `admin.html` para ver todos los usuarios
- Crear, Editar, Eliminar usuarios
- Búsqueda en tiempo real
- Notificaciones visuales

### ✅ 3. **Navbar con Usuario Logueado**

- Muestra nombre del usuario registrado
- Menú desplegable con datos del usuario
- Opción de Cerrar Sesión

### ✅ 4. **Productos de Demostración**

- 52 productos de ejemplo cargados automáticamente
- Se muestran en `index.html` en dos secciones:
  - Productos Destacados
  - Ofertas Especiales

---

## 🎯 PASOS PARA PROBAR

### **PASO 1: VER LOS PRODUCTOS**

1. **Abre `index.html` en el navegador**
   - URL: `file:///d:/Alexander web/Aplicaciones Web Cliente/index.html`
   - O arrastra el archivo al navegador

2. **Debería ver:**
   ✓ Título "Bienvenido a CellStore"
   ✓ Imágenes hero
   ✓ Sección "Productos Destacados" con 52 iPhones/Samsung/etc
   ✓ Sección "Ofertas Especiales"
   ✓ Cada producto con imagen, nombre, precio y botón

3. **Si NO ves productos:**
   - Abre la consola: F12 → Consola
   - Busca errores (messages rojos)
   - Verifica que `seed-products.js` se cargó
   - Prueba en Chrome o Firefox

---

### **PASO 2: REGISTRAR UN NUEVO USUARIO**

1. **Haz clic en "Iniciar sesión" en el navbar**
   - O ve a `login.html`

2. **Ve a la pestaña "Registrarse"**
   - Haz clic en el botón "Registrarse"

3. **Llena el formulario:**

   ```
   Nombre:      Juan
   Apellido:    Pérez
   DNI:         12345678
   Correo:      juan@ejemplo.com
   ```

   - Marca "Acepto los términos"
   - Haz clic en "Crear Cuenta"

4. **Resultado esperado:**
   ✓ Mensaje: "¡Registro exitoso! Bienvenido a CellStore."
   ✓ Redirección a `index.html`
   ✓ **Ver tu nombre "Juan" en el navbar** (arriba a la derecha)

---

### **PASO 3: VER TU NOMBRE EN NAVBAR**

1. **Después de registrarte:**
   - En el navbar verás tu nombre con un ícono de usuario
   - Haz clic en tu nombre

2. **Debería aparecer:**
   ✓ Menú desplegable con tu nombre completo
   ✓ Tu correo
   ✓ Opción "Cerrar Sesión"

---

### **PASO 4: ADMINISTRADOR - VER USUARIOS REGISTRADOS**

1. **En `login.html`, inicia sesión como admin:**

   ```
   Usuario:    admin
   Contraseña: 1234
   ```

2. **Se abrirá `admin.html`**
   - En el menú lateral, haz clic en "Usuarios"

3. **Verás:**
   ✓ Tabla con todos los usuarios registrados
   ✓ Columnas: Nombre, Apellido, DNI, Correo
   ✓ Botones: Editar, Eliminar
   ✓ Botón: "+ Nuevo Usuario"

4. **Prueba crear un nuevo usuario:**
   - Haz clic en "+ Nuevo Usuario"
   - Llena el formulario modal
   - Verás notificación verde de éxito

5. **Prueba editar:**
   - Haz clic en "Editar" en cualquier fila
   - Cambia los datos
   - Verás notificación de actualización

---

## 📊 ESTRUCTURA DE DATOS

### **Tabla `usuarios` en Supabase:**

```
id:            (auto)
nombre:        "Juan"
apellido:      "Pérez"
dni:           "12345678"
correo:        "juan@ejemplo.com"
fecha_creacion: "2026-07-06" (auto)
```

### **localStorage (en el navegador):**

```javascript
cellstore_user = {
  nombre: "Juan",
  apellido: "Pérez",
  correo: "juan@ejemplo.com",
};
```

---

## 🔐 CREDENCIALES ADMIN

**Usuario:** `admin`  
**Contraseña:** `1234`

⚠️ Esto es DEMO. En producción cambiar estos valores.

---

## 🐛 SOLUCIONAR PROBLEMAS

| Problema                       | Solución                                              |
| ------------------------------ | ----------------------------------------------------- |
| No veo productos               | Abre consola (F12) y busca errores. Actualiza página. |
| Nombre no aparece en navbar    | Cierra el navegador completamente y reabre.           |
| Error al registrar             | Verifica que Supabase esté disponible en `config.js`  |
| El usuario no aparece en tabla | Espera 2-3 segundos, la tabla se carga async          |
| Botón "Registrarse" no existe  | Verifica que actualizaste `login.html` correctamente  |

---

## 📁 ARCHIVOS MODIFICADOS/CREADOS

### **MODIFICADOS:**

- `login.html` - Agregado formulario de registro
- `styles.css` - Estilos para tabs de registro/login
- `js/script.js` - Funciones handleRegister, showLoginForm, showRegisterForm
- `js/config.js` - Referencia a tabla `usuarios` en Supabase

### **CREADOS:**

- `js/usuarios.js` - Sistema completo de CRUD para usuarios
- `USUARIOS_SETUP.md` - Documentación técnica
- `USUARIOS_QUICKSTART.md` - Guía rápida
- `GUIA_INICIO_COMPLETO.md` - Este archivo

---

## ✨ CARACTERÍSTICAS

✅ **Registro sin complicaciones**

- Formulario simple y claro
- Validaciones en tiempo real
- Mensajes de error descriptivos

✅ **Admin profesional**

- Panel con gestor de usuarios
- Crear/Editar/Eliminar usuarios
- Búsqueda instantánea

✅ **Usuario visible**

- Nombre en navbar después de registrarse
- Menú desplegable con datos
- Opción de cerrar sesión

✅ **Persistencia de datos**

- Supabase para base de datos
- localStorage para sesión local
- Sincronización automática

✅ **Responsive Design**

- Funciona en móviles
- Funciona en tablets
- Funciona en computadoras

---

## 🎨 DISEÑO PROFESIONAL

✅ Colores corporativos (azul/gradiente)
✅ Animaciones suaves
✅ Notificaciones visuales
✅ Validaciones en vivo
✅ Interfaz intuitiva

---

## 📱 URLs PRINCIPALES

- **Inicio:** `index.html`
- **Productos:** `productos.html`
- **Login/Registro:** `login.html`
- **Admin:** `admin.html` (solo si inicia sesión como admin)
- **Carrito:** `carrito.html`
- **Contacto:** `contacto.html`

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Sistema de usuario implementado ← **ESTAMOS AQUÍ**
2. ⏳ Integración con pagos
3. ⏳ Historial de compras
4. ⏳ Wishlist
5. ⏳ Sistema de opiniones

---

## 💡 TIPS

- **Para ver errores:** Abre F12 → Consola en el navegador
- **Para limpiar datos:** En consola: `localStorage.clear()`
- **Para ver datos guardados:** En consola: `JSON.parse(localStorage.getItem('cellstore_user'))`

---

**¡Listo para empezar!** 🎉

Cualquier duda, consulta los archivos `USUARIOS_SETUP.md` o `USUARIOS_QUICKSTART.md`.
