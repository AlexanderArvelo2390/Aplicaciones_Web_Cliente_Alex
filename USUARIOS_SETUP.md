# Sistema de Gestión de Usuarios - CellStore

## 📋 Descripción General

Sistema completo de gestión de usuarios con:

- ✅ Creación de nuevos usuarios
- ✅ Edición de usuarios existentes
- ✅ Eliminación de usuarios
- ✅ Búsqueda y filtrado
- ✅ Visualización del nombre en navbar
- ✅ Mensajes de notificación profesionales
- ✅ Diseño responsivo

## 🔧 Estructura Técnica

### Base de Datos

- **Tabla**: `usuarios`
- **URL Supabase**: `https://zzpvzpoqaewzbcadsfol.supabase.co/rest/v1/usuarios`
- **Campos**:
  - `id` (auto-generado)
  - `nombre` (texto, requerido)
  - `apellido` (texto, requerido)
  - `dni` (texto, requerido)
  - `correo` (email, requerido)
  - `fecha_creacion` (timestamp)

### Archivos Principales

- `admin.html` - Panel de administración con sección de usuarios
- `js/usuarios.js` - Lógica completa CRUD de usuarios
- `js/config.js` - Configuración de Supabase
- `js/script.js` - Funciones globales y navbar
- `styles.css` - Estilos del sistema

## 📱 Cómo Usar

### 1. Acceder al Panel de Usuarios

1. Ir a `login.html`
2. Ingresar credenciales de admin:
   - Usuario: `admin`
   - Contraseña: `1234`
3. Hacer clic en "Usuarios" en el menú lateral

### 2. Crear un Usuario

1. Hacer clic en el botón "+ Nuevo Usuario"
2. Completar el formulario:
   - **Nombre**: Nombre del usuario (ej: Juan)
   - **Apellido**: Apellido (ej: Pérez)
   - **DNI**: Número sin puntos (ej: 12345678)
   - **Correo**: Email válido (ej: juan@ejemplo.com)
3. Hacer clic en "Crear Usuario"
4. Se mostrará una notificación de éxito

### 3. Editar un Usuario

1. Buscar el usuario en la tabla
2. Hacer clic en el botón "Editar" (icono de lápiz)
3. Modificar los datos en el modal
4. Hacer clic en "Actualizar Usuario"
5. Se mostrará una notificación de actualización

### 4. Eliminar un Usuario

1. Buscar el usuario en la tabla
2. Hacer clic en el botón "Eliminar" (icono de papelera)
3. Confirmar la eliminación
4. Se mostrará una notificación de éxito

### 5. Buscar Usuarios

1. Usar el campo de búsqueda en la parte superior de la tabla
2. Escribir nombre, apellido, DNI o correo
3. La tabla se filtrará automáticamente

## 🎨 Interfaz de Usuario

### Modal de Usuarios

- **Diseño**: Moderno con gradiente de color
- **Campos**: Formulario de 2 columnas
- **Validaciones**:
  - Campos requeridos
  - DNI solo números
  - Correo debe contener @

### Tabla de Usuarios

- **Columnas**: Nombre, Apellido, DNI, Correo, Acciones
- **Acciones**: Editar y Eliminar
- **Búsqueda**: En tiempo real
- **Responsive**: Se adapta a dispositivos móviles

### Notificaciones

- **Éxito** (verde): Usuario creado/actualizado/eliminado
- **Error** (rojo): Problemas en la operación
- **Advertencia** (amarillo): Validaciones
- **Información** (azul): Mensajes generales

## 🔒 Seguridad

### Validaciones Frontend

```javascript
✓ Campos no vacíos
✓ DNI solo números
✓ Correo con formato válido
```

### Datos Sensibles

- Los datos de usuario se guardan en Supabase
- No se guardan contraseñas
- El localStorage solo guarda el usuario actual logueado

## 🌐 Navbar con Nombre de Usuario

Cuando se crea un usuario, su nombre aparece en el navbar con:

- **Icono de usuario**
- **Nombre completo**
- **Menú desplegable** al hacer clic
  - Muestra: nombre, apellido y correo
  - Opción de "Cerrar Sesión"

## 📊 Flujo de Datos

```
Admin crea usuario en formulario
        ↓
Frontend valida datos
        ↓
Se envía a Supabase (tabla usuarios)
        ↓
Se guarda en localStorage
        ↓
Se muestra notificación
        ↓
Se recarga la tabla
        ↓
Nombre aparece en navbar
```

## 🐛 Solución de Problemas

### "Error al cargar usuarios"

- Verificar conexión a internet
- Verificar que Supabase esté accesible
- Revisar la API key en config.js

### "No se puede crear usuario"

- Verificar que todos los campos estén completos
- DNI debe ser solo números
- Correo debe tener @ válido

### "Usuario no aparece en navbar"

- Verificar que localStorage esté habilitado
- Recargar la página
- Limpiar caché del navegador

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias:

- Email: info@cellstore.com
- Tel: 123-456-7890

---

**Última actualización**: 2026-07-06  
**Versión**: 1.0.0
