/**
 * Supabase Configuration
 * Reemplaza los valores con tus credenciales reales de Supabase
 */

const SUPABASE_URL = "https://vflhnomgfpjthiffpeke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw";

// Inicialización del cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

