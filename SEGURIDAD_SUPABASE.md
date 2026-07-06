# 🔒 GUÍA DE SEGURIDAD - CLAVES SUPABASE

## ⚠️ PROBLEMA ACTUAL

Tu archivo `js/config.js` tiene:

```javascript
const SUPABASE_CONFIG = {
  url: "https://zzpvzpoqaewzbcadsfol.supabase.co",
  key: "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC", // ❌ EXPUESTO
  table: "productos",
  table2: "compras",
  table3: "usuarios",
};
```

### 🔴 RIESGOS:

- ❌ Cualquiera puede ver tu clave en el código fuente (Inspector de navegador)
- ❌ Alguien puede usar tu clave para acceder a tu base de datos
- ❌ Pueden modificar/borrar todos tus datos
- ❌ Pueden gastar tu cuota de Supabase

---

## ✅ SOLUCIONES DE SEGURIDAD

### **OPCIÓN 1: Usar Variable de Entorno Local (Recomendado para Desarrollo)**

#### Paso 1: Crear archivo `.env` en la raíz del proyecto

```
# .env (NO subir a Git)
VITE_SUPABASE_URL=https://zzpvzpoqaewzbcadsfol.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC
```

#### Paso 2: Crear archivo `.env.local` (personal, no compartir)

```
# .env.local (PRIVADO - solo para ti)
VITE_SUPABASE_URL=https://tu-url.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-secreta
```

#### Paso 3: Actualizar `js/config.js`

```javascript
// ==================== CONFIGURACIÓN SUPABASE ====================

// Leer variables de entorno (si estás con Vite)
const SUPABASE_CONFIG = {
  url:
    import.meta.env.VITE_SUPABASE_URL ||
    "https://zzpvzpoqaewzbcadsfol.supabase.co",
  key:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",
  table: "productos",
  table2: "compras",
  table3: "usuarios",
};
```

#### Paso 4: Crear `.gitignore` para ignorar variables sensibles

```
# .gitignore
.env
.env.local
.env.*.local
node_modules/
```

---

### **OPCIÓN 2: Usar Row Level Security (RLS) en Supabase - MÁS SEGURO**

#### ¿Qué es RLS?

Row Level Security permite definir **quién puede acceder a qué datos** en la base de datos.

#### Implementar RLS:

##### **PASO 1: En Supabase Dashboard → SQL Editor**

```sql
-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES auth.users,
  role TEXT DEFAULT 'user',
  PRIMARY KEY (user_id)
);

-- 2. Habilitar RLS en tabla usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Política para usuarios: solo ver sus propios datos
CREATE POLICY "usuarios_own_data"
ON public.usuarios
FOR SELECT
USING (auth.uid() = (
  SELECT user_id FROM public.users WHERE email = usuarios.correo LIMIT 1
));

-- 4. Política para admin: ver todo
CREATE POLICY "admin_view_all"
ON public.usuarios
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin')
);

-- 5. Habilitar RLS en tabla productos
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 6. Política para leer productos (todos pueden)
CREATE POLICY "productos_read_all"
ON public.productos
FOR SELECT
USING (true);

-- 7. Política para editar productos (solo admin)
CREATE POLICY "productos_admin_edit"
ON public.productos
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin')
);
```

---

### **OPCIÓN 3: Usar Backend Seguro (API Node.js/Express)**

La forma MÁS segura es tener un servidor backend que maneje Supabase.

#### Estructura:

```
Frontend (Cliente)          Backend (Node.js)           Supabase
    ↓                           ↓                           ↓
Usuario                    API Segura              Base de Datos
[Frontend]  ────────→  [Express Server]  ────────→  [Supabase]
```

#### Archivo: `backend/server.js` (Node.js Express)

```javascript
// ⚠️ NUNCA expongas la clave secreta en el cliente
// Usa variables de entorno en el backend

require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Crear cliente Supabase con clave PRIVADA (en el backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY, // ⚠️ SOLO EN BACKEND
);

// ENDPOINT SEGURO: Obtener productos
app.get("/api/productos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("productos").select("*");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT SEGURO: Registrar usuario
app.post("/api/registrar", async (req, res) => {
  const { nombre, apellido, dni, correo } = req.body;

  try {
    // Backend verifica y guarda seguramente
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ nombre, apellido, dni, correo }]);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Servidor seguro en puerto 3000"));
```

#### En el cliente `js/config.js`:

```javascript
// El cliente SOLO se comunica con el backend
// No tiene acceso directo a Supabase

const API_URL = process.env.VITE_API_URL || "http://localhost:3000/api";

async function getProductos() {
  const response = await fetch(`${API_URL}/productos`);
  return await response.json();
}

async function registrarUsuario(userData) {
  const response = await fetch(`${API_URL}/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await response.json();
}
```

---

## 📋 COMPARACIÓN DE OPCIONES

| Opción                 | Seguridad  | Complejidad | Para Desarrollo | Para Producción |
| ---------------------- | ---------- | ----------- | --------------- | --------------- |
| **Var. Entorno**       | ⭐⭐       | Fácil       | ✅ Excelente    | ✅ Aceptable    |
| **RLS (Row Security)** | ⭐⭐⭐⭐   | Medio       | ✅ Bueno        | ✅ Excelente    |
| **Backend Seguro**     | ⭐⭐⭐⭐⭐ | Difícil     | ❌ Complejo     | ✅ Perfecto     |

---

## 🎯 RECOMENDACIÓN PARA TI

### Para **DESARROLLO** (Ahora):

Usa **Opción 1 + Opción 2**:

1. Variables de entorno en `.env`
2. Row Level Security en Supabase

### Para **PRODUCCIÓN** (Cuando entregues):

Usa **Opción 3**:

1. Crea un servidor Node.js/Express
2. Mueve todas las claves al backend
3. El cliente solo se comunica con tu servidor

---

## 🔑 TIPOS DE CLAVES SUPABASE

### **Clave Pública (Anónima)** - La que tienes ahora

```
sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC
```

- ✅ Puede usarse en cliente (menos riesgosa)
- ✅ Acceso limitado por RLS
- ✅ Está bien si usas Row Level Security

### **Clave Secreta (Service Role)**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- ❌ NUNCA en el cliente
- ✅ Solo en backend
- ⚠️ Acceso total a la base de datos

---

## 📋 CHECKLIST DE SEGURIDAD

- [ ] Crear archivo `.env` con variables
- [ ] Crear archivo `.env.local` para datos personales
- [ ] Agregar `.env` a `.gitignore`
- [ ] No hacer `git add` de archivos `.env`
- [ ] Habilitar Row Level Security en Supabase
- [ ] Crear políticas de seguridad (RLS)
- [ ] Hacer `git push` solo después de esto
- [ ] En producción: implementar servidor backend

---

## 🚀 PASOS INMEDIATOS

### 1. Crear `.env`

```bash
# Ejecuta esto en la terminal del proyecto:
echo "VITE_SUPABASE_URL=https://zzpvzpoqaewzbcadsfol.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC" >> .env
```

### 2. Crear `.gitignore`

```
.env
.env.local
node_modules/
```

### 3. Hacer commit

```bash
git add .env .gitignore
git commit -m "Agregar variables de entorno"
git push
```

### 4. Habilitar RLS en Supabase

- Ve a Supabase Dashboard
- SQL Editor → Copia el código SQL de arriba
- Ejecuta los comandos

---

## 🔐 CLAVES AÚN VISIBLES DESPUÉS

Si aún ves la clave pública en el inspector del navegador, **NO es un problema** si tienes RLS habilitado, porque:

✅ La clave pública sin RLS = acceso total  
✅ La clave pública CON RLS = acceso limitado  
✅ Las políticas de RLS protegen los datos

---

## 📚 MÁS RECURSOS

- **Docs Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **Docs Supabase ENV**: https://supabase.com/docs/guides/environment-variables
- **Best Practices**: https://supabase.com/docs/guides/api/security

---

## ❓ PREGUNTAS FRECUENTES

### ¿Mi clave está comprometida?

Si cometiste el código a GitHub público, sí. Ve a Supabase y regenera las claves.

### ¿Puedo dejar la clave pública a la vista?

SÍ, si usas Row Level Security. NO, sin RLS.

### ¿Necesito un backend para esta tienda?

Para desarrollo: NO  
Para producción: SÍ (recomendado)

### ¿Cómo regenero las claves en Supabase?

Supabase Dashboard → Settings → API → Regenerar claves

---

**¡Implementa esto ANTES de entregar el proyecto!** 🔒
