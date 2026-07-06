# 🚀 Guía Rápida - Sistema de Gestión de Usuarios

## Inicio en 5 Minutos

### Paso 1: Acceder al Panel Admin

1. Abre `login.html` en tu navegador
2. Inicia sesión con:
   - **Usuario**: `admin`
   - **Contraseña**: `1234`

### Paso 2: Ir a la Sección de Usuarios

En el panel admin, haz clic en **"Usuarios"** en el menú lateral

### Paso 3: Crear tu Primer Usuario

1. Haz clic en **"+ Nuevo Usuario"**
2. Completa el formulario:
   ```
   Nombre:    Juan
   Apellido:  Pérez
   DNI:       12345678
   Correo:    juan@ejemplo.com
   ```
3. Haz clic en **"Crear Usuario"**
4. ¡Verás una notificación verde de éxito! ✓

### Paso 4: Ver el Usuario en la Tabla

La tabla se actualizará automáticamente mostrando:

- Nombre: Juan
- Apellido: Pérez
- DNI: 12345678
- Correo: juan@ejemplo.com
- Botones: Editar | Eliminar

### Paso 5: Ver el Nombre en el Navbar

Cuando creas un usuario, aparecerá en el navbar con:

- Un icono de usuario
- El nombre de la persona
- Al hacer clic, un menú desplegable

## ✨ Características Principales

### ✅ Crear Usuarios

- Formulario modal profesional
- Validación de campos
- Guardado en Supabase

### ✅ Editar Usuarios

- Haz clic en "Editar" en la tabla
- Modifica los datos
- Guarda los cambios

### ✅ Eliminar Usuarios

- Haz clic en "Eliminar" en la tabla
- Confirma la acción
- Usuario se elimina automáticamente

### ✅ Buscar Usuarios

- Usa el campo de búsqueda
- Filtra por: nombre, apellido, DNI o correo
- Resultados en tiempo real

### ✅ Notificaciones

- ✓ Éxito (verde)
- ✗ Error (rojo)
- ⚠ Advertencia (amarillo)
- ℹ Información (azul)

## 🎯 Casos de Uso

### Caso 1: Crear usuario nuevo

```
1. Clic en "+ Nuevo Usuario"
2. Llenar formulario
3. Clic en "Crear Usuario"
4. Listo! ✓
```

### Caso 2: Editar usuario existente

```
1. Buscar usuario en tabla
2. Clic en "Editar"
3. Modificar datos
4. Clic en "Actualizar Usuario"
5. Listo! ✓
```

### Caso 3: Eliminar usuario

```
1. Buscar usuario en tabla
2. Clic en "Eliminar"
3. Confirmar eliminación
4. Listo! ✓
```

## 🔍 Validaciones

El sistema valida automáticamente:

- ✓ Campos no vacíos
- ✓ DNI solo números
- ✓ Correo con formato válido (@)
- ✓ No hay duplicados en Supabase

## 📱 Responsive

El sistema se adapta a:

- 💻 Computadoras
- 📱 Tablets
- 📲 Móviles

## 🎨 Estilos Profesionales

- Modal moderno con gradiente
- Tabla limpia y ordenada
- Botones intuitivos
- Notificaciones elegantes
- Colores corporativos

## ⌨️ Atajos y Tips

- **Buscar**: Empieza a escribir en el campo de búsqueda
- **Limpiar**: Deja el campo de búsqueda vacío para ver todos
- **Cerrar Modal**: Haz clic en la X o fuera del modal
- **Navegar**: Usa el menú lateral para cambiar secciones

## 🆘 Solucionar Problemas

| Problema                    | Solución                                    |
| --------------------------- | ------------------------------------------- |
| No carga la tabla           | Recarga la página                           |
| Error al crear usuario      | Revisa que todos los campos estén completos |
| DNI no se acepta            | Solo debe tener números                     |
| El usuario no aparece       | Espera a que se cargue la tabla             |
| Nombre no aparece en navbar | Cierra y abre el navegador                  |

## 📊 Estructura de Datos

```javascript
{
  id: 1,                          // Auto-generado
  nombre: "Juan",                 // Requerido
  apellido: "Pérez",              // Requerido
  dni: "12345678",                // Requerido, solo números
  correo: "juan@ejemplo.com",     // Requerido
  fecha_creacion: "2026-07-06"    // Auto-generado
}
```

## 🔐 Seguridad

✅ Validación frontend
✅ Encriptación en Supabase
✅ Control de acceso
✅ Datos seguros en localStorage

## 📞 Soporte

¿Necesitas ayuda? Consulta:

- Documentación completa: `USUARIOS_SETUP.md`
- Código fuente: `js/usuarios.js`
- Configuración: `js/config.js`

---

**¡Listo para empezar!** 🎉
