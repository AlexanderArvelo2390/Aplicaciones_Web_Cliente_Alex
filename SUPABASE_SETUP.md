# Configuración de Supabase - Guía de Corrección

## Problema: Error 400 al guardar productos

Si estás recibiendo error 400, sigue estos pasos:

### 1. Verificar la tabla en Supabase

Ve a: **Database** → **Tables** → **productos**

Verifica que existan estas columnas:

- `id` (BIGINT, Primary Key, auto-increment)
- `nombre` (VARCHAR, NOT NULL)
- `marca` (VARCHAR)
- `precio` (FLOAT, NOT NULL)
- `stock` (INTEGER, NOT NULL)
- `almacenamiento` (VARCHAR)
- `pantalla` (VARCHAR)
- `color` (VARCHAR)
- `imagen` (VARCHAR)
- `descripcion` (TEXT)
- `oferta` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP, auto)
- `updated_at` (TIMESTAMP, auto)

### 2. Habilitar Row Level Security (RLS)

Abre el **SQL Editor** en Supabase y ejecuta:

```sql
-- Habilitar RLS
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
DROP POLICY IF EXISTS "Permitir lectura pública" ON productos;
CREATE POLICY "Permitir lectura pública"
ON productos FOR SELECT
USING (true);

-- Permitir inserciones públicas
DROP POLICY IF EXISTS "Permitir inserciones públicas" ON productos;
CREATE POLICY "Permitir inserciones públicas"
ON productos FOR INSERT
WITH CHECK (true);

-- Permitir actualizaciones públicas
DROP POLICY IF EXISTS "Permitir actualizaciones públicas" ON productos;
CREATE POLICY "Permitir actualizaciones públicas"
ON productos FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir eliminaciones públicas
DROP POLICY IF EXISTS "Permitir eliminaciones públicas" ON productos;
CREATE POLICY "Permitir eliminaciones públicas"
ON productos FOR DELETE
USING (true);
```

### 3. Verificar en el navegador

Abre la consola (**F12**) y verás los errores detallados.

Si ves algo como: `"duplicate key value violates unique constraint"`, significa que hay datos duplicados.

Si ves: `"permission denied"`, necesitas ajustar las políticas RLS.

### 4. Prueba rápida

En la consola del navegador, ejecuta:

```javascript
// Probar conexión
fetch("https://zzpvzpoqaewzbcadsfol.supabase.co/rest/v1/productos?select=*", {
  headers: {
    apikey: "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",
  },
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

Si funciona, verás un array de productos (puede estar vacío).

### 5. Otras causas posibles

**Anon Key vs Service Role Key:**

- Estamos usando `sb_publishable_...` (anon key) ✓ Correcto para público
- Si necesitas service role, ve a **Settings** → **API** → **Service Role Key**

**CORS:**
Si ves error de CORS, ve a **Settings** → **API** → **Allowed Origins** y asegúrate que esté permitido tu dominio.

**Contenido nulo:**
Verifica que los campos no sean null. El script ya hace validación, pero si persiste, agrega valores por defecto.

---

Si el problema persiste, comparte el error exacto de la consola (F12).
