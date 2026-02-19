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
        <section id="login-section" style="text-align: center; padding: 2rem;">
            <div style="margin-bottom: 2rem;">
                <h2 style="color: #2c3e50; margin-bottom: 0.5rem;">Urna Virtual</h2>
                <p style="color: #64748b; font-size: 0.9rem;">Residencial Esmeralda</p>
            </div>
            
            <div class="card-login" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                <p style="margin-bottom: 1.5rem; font-weight: 500;">Ingresa tu código personal:</p>
                <input type="text" id="token-input" 
                       placeholder="Ej: E593FE78" 
                       style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1.1rem; text-align: center; margin-bottom: 1rem; text-transform: uppercase;">
                <button class="btn-primary" onclick="window.handleManualLogin()" style="width: 100%;">Acceder con mi Llave</button>
            </div>
            
            <p style="margin-top: 2rem; font-size: 0.8rem; color: #94a3b8;">Si no tienes tu llave, contacta a la administración.</p>
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
        <section id="voting-section" style="padding: 0.5rem;">
            <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Selección de Fachada</h2>
            <p style="font-size: 0.85rem; margin-bottom: 1rem;">Elige un color para la renovación:</p>
            
            <div class="options-container" style="display: flex; flex-direction: column; gap: 8px;">
                <div class="option-card" id="card-azul" onclick="window.selectOption('Azul Real', 'card-azul')" 
                     style="display: flex; align-items: center; padding: 8px; height: 60px;">
                    <div class="color-preview" style="background:#2980b9; width: 40px; height: 40px; border-radius: 8px; margin-right: 15px;"></div>
                    <h3 style="font-size: 1rem; margin: 0;">Azul Real</h3>
                </div>
                
                <div class="option-card" id="card-beige" onclick="window.selectOption('Beige Arena', 'card-beige')" 
                     style="display: flex; align-items: center; padding: 8px; height: 60px;">
                    <div class="color-preview" style="background:#f5f5dc; width: 40px; height: 40px; border-radius: 8px; margin-right: 15px; border:1px solid #ddd;"></div>
                    <h3 style="font-size: 1rem; margin: 0;">Beige Arena</h3>
                </div>
                
                <div class="option-card" id="card-esmeralda" onclick="window.selectOption('Verde Esmeralda', 'card-esmeralda')" 
                     style="display: flex; align-items: center; padding: 8px; height: 60px;">
                    <div class="color-preview" style="background:#27ae60; width: 40px; height: 40px; border-radius: 8px; margin-right: 15px;"></div>
                    <h3 style="font-size: 1rem; margin: 0;">Verde Esmeralda</h3>
                </div>
            </div>

            <div id="confirm-zone" style="margin-top: 1rem; display:none; text-align: center; border-top: 1px solid #eee; padding-top: 1rem;">
                <p id="selection-text" style="font-weight: bold; color: #2c3e50; font-size: 0.9rem; margin-bottom: 0.5rem;"></p>
                <button class="btn-confirm" onclick="window.processVote()" style="width: 100%; padding: 12px;">Confirmar mi Voto</button>
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



