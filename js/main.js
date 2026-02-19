/**
 * Main JS - Sistema de Votación Residencial Esmeralda
 * Conexión directa con Supabase
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Configuración de Supabase
const supabaseUrl = 'https://vflhnomgfpjthiffpeke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw'
const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Variables de Estado
let currentUser = null;
let currentToken = null;
let selectedOption = null;

// 3. EXPOSICIÓN GLOBAL (Para que los botones onclick del HTML funcionen)
window.handleManualLogin = handleManualLogin;
window.renderVoting = renderVoting;
window.selectOption = selectOption;
window.processVote = processVote;

// 4. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Votación Esmeralda: Sistema Listo');
    checkUrlToken();
});

// 5. Lógica de Acceso y Validación
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

// 1. Asegúrate de que esta línea esté al inicio con las otras globales
window.handleManualLogin = handleManualLogin;

// 2. Función de Login Manual Actualizada
async function handleManualLogin() {
    const input = document.getElementById('token-input');
    if (!input || !input.value.trim()) {
        alert('Por favor, ingresa tu llave personal.');
        return;
    }
    
    // Limpiamos el token: quitamos espacios y convertimos a mayúsculas
    currentToken = input.value.trim().toUpperCase();
    
    console.log("Intentando acceso manual con token:", currentToken);
    
    // Llamamos a la validación real de Supabase
    await handleTokenValidation(currentToken);
}

// 3. Ajuste extra en handleTokenValidation (Para mayor estabilidad)
async function handleTokenValidation(token) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Validando tu identidad en la nube...</p>
        </div>
    `;

    try {
        // Usamos el token que llega por parámetro (sea de URL o de Input)
        const { data: userData, error: userError } = await supabase
            .from('directorio_final')
            .select('*')
            .eq('token', token) 
            .single();

        if (userError || !userData) {
            alert('Llave no reconocida. Por favor, verifica tu código.');
            renderLogin(); // Si falla, lo regresa al inicio para reintentar
            return;
        }

        // Si lo encuentra, guardamos el token globalmente por si no venía de URL
        currentToken = token;

        currentUser = {
            nombre: userData.nombre,
            torre: userData.torre,
            departamento: userData.depto 
        };

        // Verificación de voto existente (Se mantiene igual)
        const { data: voteData } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', currentUser.torre)
            .eq('departamento', currentUser.departamento)
            .single();

        if (voteData) {
            renderReceipt(currentUser, {
                opcion: voteData.opcion,
                fecha: new Date(voteData.created_at).toLocaleDateString('es-ES'),
                hora: new Date(voteData.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                id: voteData.receipt_id
            });
        } else {
            renderWelcome(currentUser);
        }
    } catch (e) {
        console.error("Error crítico:", e);
        alert('Hubo un problema de conexión.');
        renderLogin();
    }
}

// 6. Funciones de Interfaz (Renderizado)
function renderWelcome(vecino) {
    const main = document.getElementById('main-content');
    const towerNum = vecino.torre.replace('T', '').padStart(2, '0');
    main.innerHTML = `
        <section id="welcome-section">
            <div class="user-greeting">👋 ¡Hola, ${vecino.nombre}!</div>
            <h2>Tu voz importa</h2>
            <p>Bienvenido vecino del <strong>Dpto. ${vecino.departamento}</strong> de la <strong>Torre ${towerNum}</strong>. Al finalizar se generará tu comprobante oficial.</p>
            <button class="btn-primary" onclick="window.renderVoting()">Comenzar Votación</button>
        </section>
    `;
}

function renderVoting() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section id="voting-section">
            <h2>Selección de Fachada</h2>
            <p>Elige el color para la renovación:</p>
            <div class="options-container">
                <div class="option-card" id="card-azul" onclick="window.selectOption('Azul Real', 'card-azul')">
                    <div class="color-preview" style="background:#2980b9"></div>
                    <h3>Azul Real</h3>
                </div>
                <div class="option-card" id="card-beige" onclick="window.selectOption('Beige Arena', 'card-beige')">
                    <div class="color-preview" style="background:#f5f5dc; border:1px solid #ddd;"></div>
                    <h3>Beige Arena</h3>
                </div>
                <div class="option-card" id="card-esmeralda" onclick="window.selectOption('Verde Esmeralda', 'card-esmeralda')">
                    <div class="color-preview" style="background:#27ae60"></div>
                    <h3>Verde Esmeralda</h3>
                </div>
            </div>
            <div id="confirm-zone" style="margin-top: 2rem; display:none;">
                <p id="selection-text" style="font-weight: bold; color: #2c3e50;"></p>
                <button class="btn-confirm" onclick="window.processVote()">Confirmar mi Voto</button>
            </div>
        </section>
    `;
}

function selectOption(option, cardId) {
    selectedOption = option;
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(cardId).classList.add('selected');
    document.getElementById('selection-text').innerText = `Has seleccionado: ${option}`;
    document.getElementById('confirm-zone').style.display = 'block';
}

// 7. Registro de Voto Real
async function processVote() {
    const main = document.getElementById('main-content');
    main.innerHTML = `<div class="loader-container"><div class="spinner green"></div><p>Guardando tu voto en la base de datos...</p></div>`;

    try {
        const receiptId = `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const { error } = await supabase.from('votos').insert([{
            torre: currentUser.torre,
            departamento: currentUser.departamento,
            opcion: selectedOption,
            receipt_id: receiptId,
            token_hash: currentToken
        }]);

        if (error) {
            if (error.code === '23505') throw new Error("Ya has votado.");
            throw error;
        }

        renderReceipt(currentUser, {
            opcion: selectedOption,
            fecha: new Date().toLocaleDateString('es-ES'),
            hora: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}),
            id: receiptId
        }, true);

    } catch (e) {
        renderError(e.message || "Error al guardar el voto.");
    }
}

function renderReceipt(vecino, voteInfo, isNew = false) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section id="receipt-section">
            <div class="receipt-header">
                ${isNew ? '<h2 style="color: #27ae60;">¡Voto Registrado!</h2>' : '<h2>Comprobante de Voto</h2>'}
                <p>Residencial Esmeralda</p>
            </div>
            <div class="receipt-body">
                <p><strong>Depto:</strong> ${vecino.departamento} - ${vecino.torre}</p>
                <p><strong>Opción:</strong> ${voteInfo.opcion}</p>
                <p><strong>ID:</strong> ${voteInfo.id}</p>
            </div>
            <button class="btn-primary" onclick="location.reload()">Salir</button>
        </section>
    `;
}

function renderError(msg) {
    const main = document.getElementById('main-content');
    main.innerHTML = `<section id="error-section"><h2>Error</h2><p>${msg}</p><button class="btn-primary" onclick="location.reload()">Reintentar</button></section>`;
}

