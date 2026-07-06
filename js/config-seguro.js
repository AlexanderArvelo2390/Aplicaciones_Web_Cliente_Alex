// ==================== CONFIGURACIÓN SUPABASE SEGURA ====================
//
// IMPORTANTE: Para mayor seguridad, usa variables de entorno (.env)
// Las claves se cargan desde el archivo .env
//
// ¿Cómo funciona?
// 1. Crea archivo .env en la raíz del proyecto
// 2. Agrega tus valores de Supabase
// 3. Este archivo lee automáticamente de .env
//
// NOTA: Si NO tienes variables de entorno configuradas,
// usa los valores por defecto (menos seguro para producción)

// Obtener valores de variables de entorno o usar valores por defecto
const SUPABASE_CONFIG = {
  // URL de tu proyecto Supabase
  url:
    import.meta?.env?.VITE_SUPABASE_URL ||
    "https://zzpvzpoqaewzbcadsfol.supabase.co",

  // Clave anónima (pública) - Es segura si usas Row Level Security
  key:
    import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
    "sb_publishable_8IeQAHEHkj-pmIgpNLUJrA_MqeSn0DC",

  // Nombres de las tablas en Supabase
  table: "productos",
  table2: "compras",
  table3: "usuarios",
};

// Validar que la configuración esté lista
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
  console.warn("⚠️ Configuración de Supabase incompleta. Verifica .env");
}

console.log(
  "✓ Configuración Supabase cargada desde:",
  import.meta?.env?.MODE === "production" ? "Producción" : "Desarrollo",
);
