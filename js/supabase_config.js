/**
 * Supabase Configuration
 * Reemplaza los valores con tus credenciales reales de Supabase
 */

const SUPABASE_URL = "TU_SUPABASE_URL_AQUI";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";

// Inicialización del cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
