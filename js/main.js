import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://vflhnomgfpjthiffpeke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw'
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null;
let currentToken = null;
let selectedOption = null;

// Vincular funciones al objeto window para que los botones del HTML puedan verlas
window.handleManualLogin = handleManualLogin;
window.renderVoting = renderVoting;
window.selectOption = selectOption;
window.processVote = processVote;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de Votación Inicializado');
    checkUrlToken();
});

async function checkUrlToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        currentToken = token.trim().toUpperCase();
        await handleTokenValidation(currentToken);
    } else {
        renderLogin();
    }
}

function renderLogin() {
    const main = document.getElementById('main-content');
    if(!main) return;
    main.innerHTML = `
        <section id="login-section">
            <h2 style="font-size: 1.2rem; color: #2c3e50;">Bienvenido a tu Espacio de Decisión</h2>
            <p>Por favor, ingresa tu código personal para acceder a la urna virtual.</p>
            <input type="text" id="token-input" placeholder="Ej: 2B6EF592">
            <button class="btn-primary" onclick="window.handleManualLogin()">Acceder con mi Llave</button>
        </section>
    `;
}

async function handleManualLogin() {
    const input = document.getElementById('token-input');
    if (!input || !input.value) return alert('Por favor, ingresa tu llave.');
    currentToken = input.value.trim().toUpperCase();
    await handleTokenValidation(currentToken);
}

async function handleTokenValidation(token) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Validando tu identidad en la nube...</p>
        </div>
    `;

    try {
        // Consulta a la tabla de vecinos
        const { data: vecino, error: errorVecino } = await supabase
            .from('directorio_final') 
            .select('*')
            .eq('token', token)
            .single();

        if (errorVecino || !vecino) {
            alert('Llave no reconocida. Por favor, verifica tu código.');
            renderLogin();
            return;
        }

        currentUser = vecino;

        // Verificar si ya existe un voto para este departamento
        const { data: votoExistente } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', currentUser.torre)
            .eq('departamento', currentUser.departamento)
            .single();

        if (votoExistente) {
            renderReceipt(currentUser, {
                opcion: votoExistente.opcion,
                fecha: new Date(votoExistente.created_at).toLocaleDateString(),
                hora: new Date(votoExistente.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                id: votoExistente.receipt_id
            });
        } else {
            renderWelcome(currentUser);
        }
    } catch (e) {
        console.error(e);
        alert('Error de conexión. Intenta de nuevo.');
        renderLogin();
    }
}

// ... (El resto de funciones: renderWelcome, renderVoting, selectOption, processVote, renderReceipt, renderError se mantienen igual que la versión anterior pero asegúrate de usar window.nombreFuncion si se llaman desde un onclick)
