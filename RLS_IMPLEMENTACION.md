# 🔐 IMPLEMENTAR ROW LEVEL SECURITY (RLS) EN SUPABASE

Row Level Security permite que Supabase controle **quién accede a qué datos** automáticamente.

## 📋 TABLA DE CONTENIDOS

1. ¿Qué es RLS?
2. Cómo habilitarlo
3. Políticas para tu tienda
4. Pruebas de seguridad

---

## 1️⃣ ¿QUÉ ES ROW LEVEL SECURITY?

**RLS** = Reglas en la base de datos que dicen:

- ✅ Este usuario puede VER estos datos
- ✅ Este usuario puede EDITAR estos datos
- ❌ Este usuario NO puede VER estos datos
- ❌ Este usuario NO puede ELIMINAR estos datos

### Ejemplo:

```
Usuario: juan@ejemplo.com
├─ VER: Sus propios datos de usuario ✓
├─ VER: Cualquier producto de la tienda ✓
├─ EDITAR: Otros usuarios ✗
└─ EDITAR: Productos ✗

Admin: admin@cellstore.com
├─ VER: Todos los usuarios ✓
├─ VER: Todos los productos ✓
├─ EDITAR: Cualquier usuario ✓
└─ EDITAR: Cualquier producto ✓
```

---

## 2️⃣ HABILITAR RLS - PASOS

### Paso 1: Ir a Supabase Dashboard

- URL: https://app.supabase.com
- Selecciona tu proyecto
- Ve a **SQL Editor**

### Paso 2: Ejecutar script de seguridad

Copia y ejecuta este SQL en el SQL Editor:

```sql
-- ==================== CONFIGURACIÓN DE SEGURIDAD ====================

-- 1. TABLA DE USUARIOS (Tus clientes registrados)
-- Asegúrate de que existe
CREATE TABLE IF NOT EXISTS public.usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE ROLES (Quién es admin, quién es usuario)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user', -- 'user' o 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE PRODUCTOS (No necesita seguridad estricta, todos ven)
-- Asegúrate de que existe
CREATE TABLE IF NOT EXISTS public.productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  marca TEXT,
  precio NUMERIC NOT NULL,
  stock INTEGER DEFAULT 0,
  almacenamiento TEXT,
  pantalla TEXT,
  color TEXT,
  imagen TEXT,
  descripcion TEXT,
  oferta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== HABILITAR RLS ====================

-- Habilitar RLS en tabla USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla PRODUCTOS
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tabla USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA USUARIOS ====================

-- POLÍTICA 1: Todos pueden VER la tabla usuarios (lectura pública)
DROP POLICY IF EXISTS "usuarios_read_all" ON public.usuarios;
CREATE POLICY "usuarios_read_all"
ON public.usuarios
FOR SELECT
USING (true); -- Todos pueden ver

-- POLÍTICA 2: Solo insertar si eres el que se registra
DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_insert_own"
ON public.usuarios
FOR INSERT
WITH CHECK (auth.email() = correo); -- Solo con tu correo

-- POLÍTICA 3: Solo admin puede actualizar/eliminar
DROP POLICY IF EXISTS "usuarios_admin_modify" ON public.usuarios;
CREATE POLICY "usuarios_admin_modify"
ON public.usuarios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "usuarios_admin_delete" ON public.usuarios;
CREATE POLICY "usuarios_admin_delete"
ON public.usuarios
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

-- ==================== POLÍTICAS PARA PRODUCTOS ====================

-- POLÍTICA 1: Todos pueden VER productos
DROP POLICY IF EXISTS "productos_read_all" ON public.productos;
CREATE POLICY "productos_read_all"
ON public.productos
FOR SELECT
USING (true); -- Todos ven todos los productos

-- POLÍTICA 2: Solo admin puede CREAR productos
DROP POLICY IF EXISTS "productos_admin_insert" ON public.productos;
CREATE POLICY "productos_admin_insert"
ON public.productos
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

-- POLÍTICA 3: Solo admin puede EDITAR productos
DROP POLICY IF EXISTS "productos_admin_update" ON public.productos;
CREATE POLICY "productos_admin_update"
ON public.productos
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

-- POLÍTICA 4: Solo admin puede ELIMINAR productos
DROP POLICY IF EXISTS "productos_admin_delete" ON public.productos;
CREATE POLICY "productos_admin_delete"
ON public.productos
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

-- ==================== POLÍTICAS PARA ROLES ====================

-- Solo admin puede ver roles
DROP POLICY IF EXISTS "roles_admin_read" ON public.user_roles;
CREATE POLICY "roles_admin_read"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE email = auth.email() AND role = 'admin'
  )
);

-- ==================== MENSAJES DE CONFIRMACIÓN ====================
SELECT 'RLS configurado correctamente' AS resultado;
```

### Paso 3: Crear admin inicial

```sql
-- Insertar tu usuario como admin
INSERT INTO public.user_roles (email, role)
VALUES ('admin@cellstore.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verificar
SELECT * FROM public.user_roles;
```

---

## 3️⃣ RESULTADO DESPUÉS DE RLS

### Con RLS habilitado:

```
USUARIO NORMAL (juan@ejemplo.com)
├─ VER todos los productos ✓
├─ VER lista de usuarios (pública) ✓
├─ CREAR producto ✗ (solo admin)
├─ EDITAR producto ✗ (solo admin)
└─ ELIMINAR usuario ✗ (solo admin)

ADMIN (admin@cellstore.com)
├─ VER todos los productos ✓
├─ VER todos los usuarios ✓
├─ CREAR producto ✓
├─ EDITAR producto ✓
└─ ELIMINAR usuario ✓
```

---

## 4️⃣ VERIFICAR QUE RLS ESTÁ ACTIVO

### En Supabase Dashboard:

1. Ve a **Authentications → Policies**
2. Deberías ver las políticas creadas ✓

### Visualmente en la tabla:

1. Ve a **SQL Editor**
2. Ejecuta:

```sql
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname = 'public';
```

3. Cada tabla debe tener un 🔒 al lado (indicador de RLS)

---

## 5️⃣ PRUEBAS DE SEGURIDAD

### Prueba 1: Usuario normal intenta crear producto

```javascript
// En la consola del navegador como usuario normal:
async function testInsert() {
  const { data, error } = await supabase
    .from("productos")
    .insert([{ nombre: "Test", precio: 100 }]);

  console.log("Error esperado:", error); // Debe mostrar error de permisos
}
```

### Prueba 2: Admin crea producto (funciona)

```javascript
// Como admin:
async function adminInsert() {
  const { data, error } = await supabase
    .from("productos")
    .insert([{ nombre: "iPhone X", precio: 999 }]);

  console.log("Producto creado:", data);
}
```

---

## 6️⃣ FLUJO SEGURO DE TU TIENDA

```
Usuario abre index.html
    ↓
Script ejecuta: getProductsFromSupabase()
    ├─ Supabase verifica: ¿Puede este usuario VER productos?
    ├─ Política: "productos_read_all" = SÍ
    └─ Devuelve todos los productos ✓
    ↓
Usuario va a admin.html
    ├─ Intenta editar producto
    ├─ Supabase verifica: ¿Es admin?
    ├─ Política: "productos_admin_update"
    ├─ Si NO es admin: Error ✗
    └─ Si es admin: Permite editar ✓
```

---

## 🚨 CUIDADO: SIN RLS ES INSEGURO

```javascript
// ❌ SIN RLS - Cualquiera puede hacer CUALQUIER cosa
const { data, error } = await supabase.from("productos").delete().eq("id", 1); // ¡Podría borrar TODOS los productos!

// ✅ CON RLS - Supabase bloquea automáticamente
const { data, error } = await supabase.from("productos").delete().eq("id", 1); // Error: "permission denied" si no eres admin
```

---

## 📝 CHECKLIST

- [ ] Copiar el SQL del Paso 2
- [ ] Ejecutarlo en SQL Editor de Supabase
- [ ] Agregar admin: `INSERT INTO user_roles ...`
- [ ] Verificar que aparecen 🔒 en las tablas
- [ ] Probar que funciona normalmente (lectura)
- [ ] Probar que se bloquean ediciones (sin ser admin)
- [ ] Probar como admin (debe funcionar todo)

---

## 🎓 RESULTADO FINAL

Con RLS + Variables de entorno:

✅ Claves no expuestas en código  
✅ Usuarios no pueden modificar datos que no es suyo  
✅ Solo admin puede editar productos  
✅ Todos pueden ver productos (tienda abierta)  
✅ Seguridad en la base de datos, no solo en el cliente

---

## ❓ PROBLEMAS COMUNES

**"Nada funciona después de habilitar RLS"**
→ Tienes RLS pero no autenticación Supabase. Necesitas usar `supabase.auth.signUp()`

**"No puedo crear productos como admin"**
→ No estás en la tabla `user_roles` como admin. Ejecuta:

```sql
INSERT INTO user_roles (email, role) VALUES ('tu-email@gmail.com', 'admin');
```

**"RLS bloquea todo, ni lectura funciona"**
→ Revisar la política de SELECT. Debe ser `USING (true)` para lectura pública.

---

**¡Implementa esto ANTES de entregar!** 🔒
