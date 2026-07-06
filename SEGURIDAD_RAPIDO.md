# ⚡ PASOS RÁPIDOS - SECURIZAR SUPABASE

Sigue estos 5 pasos AHORA para proteger tu tienda.

---

## ✅ PASO 1: Crear archivo `.env`

Crea un archivo llamado `.env` en la raíz de tu proyecto (mismo nivel que `index.html`):

```
VITE_SUPABASE_URL=https://zzpvzpoqaewzbcadsfol.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC
```

---

## ✅ PASO 2: Crear `.gitignore`

Crea un archivo llamado `.gitignore`:

```
.env
.env.local
node_modules/
```

---

## ✅ PASO 3: Hacer commit seguro

```bash
git add .gitignore .env.example
git commit -m "Agregar configuración segura de variables de entorno"
git push
```

**NUNCA hagas `git add .env` - solo `.env.example`**

---

## ✅ PASO 4: Habilitar RLS en Supabase

Ve a: https://app.supabase.com/project/YOUR_PROJECT/sql/new

Copia y ejecuta este SQL:

```sql
-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Política: Todos ven productos
DROP POLICY IF EXISTS "productos_read_all" ON public.productos;
CREATE POLICY "productos_read_all" ON public.productos
FOR SELECT USING (true);

-- Política: Solo admin edita productos
DROP POLICY IF EXISTS "productos_admin" ON public.productos;
CREATE POLICY "productos_admin" ON public.productos
FOR UPDATE USING (current_user_id = 'admin');
```

---

## ✅ PASO 5: Verificar que todo funciona

En la consola del navegador (F12):

```javascript
// Probar que los productos cargan
fetch("https://zzpvzpoqaewzbcadsfol.supabase.co/rest/v1/productos?select=*", {
  headers: {
    Authorization: "Bearer sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",
    apikey: "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",
  },
})
  .then((r) => r.json())
  .then((d) => console.log("✓ Productos cargados:", d.length));
```

---

## 🎯 RESULTADO

✅ Tus claves están protegidas en `.env`  
✅ Git no subirá archivos sensibles  
✅ Supabase controla quien accede a qué  
✅ Tu tienda está mucho más segura

---

## 📚 MÁS INFORMACIÓN

- **Guía completa**: Lee `SEGURIDAD_SUPABASE.md`
- **RLS Avanzado**: Lee `RLS_IMPLEMENTACION.md`
- **Variables de entorno**: Docs Supabase

---

**¡Haz esto ahora mismo!** 🔒
