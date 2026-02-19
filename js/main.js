/**
 * Main JS for Painting Voting SPA - Supabase Cloud Version
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Configuración de Supabase
const supabaseUrl = 'https://vflhnomgfpjthiffpeke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw'
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null;
let currentToken = null;
let selectedOption = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('SPA Initialized');
    checkUrlToken();
});

// Hacer funciones disponibles globalmente para los onclick de los botones
window.handleManualLogin = handleManualLogin;
window.renderVoting = renderVoting;
window.selectOption = selectOption;
window.processVote = processVote;

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
    main.innerHTML = `
        <section id="login-section">
            <h2 style="font-size: 1.2rem; color: #2c3e50;">Bienvenido a tu Espacio de Decisión</h2>
            <p>Por favor, ingresa tu código personal para acceder a la urna virtual.</p>
            <input type="text" id="token-input" placeholder="Ej: 2B6EF592">
            <button class="btn-primary" onclick="handleManualLogin()">Acceder con mi Llave</button>
        </section>
    `;
}

async function handleManualLogin() {
    const tokenInput = document.getElementById('token-input').value;
    if (!tokenInput) return alert('Por favor, ingresa tu llave para continuar.');
    currentToken = tokenInput.trim().toUpperCase();
    await handleTokenValidation(currentToken);
}

async function handleTokenValidation(token) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Estamos validando tu llave con el registro maestro...</p>
        </div>
    `;

    try {
        // CONSULTA REAL A SUPABASE
        const { data, error } = await supabase
            .from('directorio_final') 
            .select('*')
            .eq('token', token)
            .single();

        if (error || !data) {
            alert('Esa llave no es válida. Revisa el código o contacta con administración.');
            renderLogin();
            return;
        }

        currentUser = data;

        // VERIFICAR SI YA VOTÓ (Buscamos en la tabla de votos)
        const { data: voteData, error: voteError } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', currentUser.torre)
            .eq('departamento', currentUser.departamento)
            .single();

        if (voteData) {
            // Si ya existe un voto, mostramos el comprobante
            renderReceipt(currentUser, {
                opcion: voteData.opcion,
                fecha: new Date(voteData.created_at).toLocaleDateString('es-ES'),
                hora: new Date(voteData.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                id: voteData.receipt_id
            });
        } else {
            // Si no ha votado, bienvenida
            renderWelcome(currentUser);
        }

    } catch (e) {
        console.error("Error crítico:", e);
        alert('Tuvimos un problema al validar. Intenta de nuevo.');
        renderLogin();
    }
}

function renderWelcome(vecino) {
    const main = document.getElementById('main-content');
    const towerNum = vecino.torre.replace('T', '').padStart(2, '0');
    main.innerHTML = `
        <section id="welcome-section">
            <div class="user-greeting">👋 ¡Hola, ${vecino.nombre}!</div>
            <h2>Tu voz importa</h2>
            <p>¡Bienvenido vecino del <strong>Dpto. ${vecino.departamento}</strong> de la <strong>Torre ${towerNum}</strong> de la Res. Esmeralda! Agradecemos su participación. Al finalizar su votación se genera un ticket único de participación efectiva.</p>
            <button class="btn-primary" onclick="renderVoting()">Comenzar Votación</button>
        </section>
    `;
}

function renderVoting() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section id="voting-section">
            <h2>Selección de Fachada</h2>
            <p>Elige el color que prefieras para nuestra renovación:</p>
            <div class="options-container">
                <div class="option-card" id="card-azul" onclick="selectOption('Azul Real', 'card-azul')">
                    <div class="color-preview" style="background:#2980b9"></div>
                    <h3>Azul Real</h3>
                    <p>Elegancia y serenidad.</p>
                </div>
                <div class="option-card" id="card-beige" onclick="selectOption('Beige Arena', 'card-beige')">
                    <div class="color-preview" style="background:#f5f5dc; border:1px solid #ddd;"></div>
                    <h3>Beige Arena</h3>
                    <p>Luminosidad y calidez.</p>
                </div>
                <div class="option-card" id="card-esmeralda" onclick="selectOption('Verde Esmeralda', 'card-esmeralda')">
                    <div class="color-preview" style="background:#27ae60"></div>
                    <h3>Verde Esmeralda</h3>
                    <p>Naturaleza y modernidad.</p>
                </div>
            </div>
            <div id="confirm-zone" style="margin-top: 2rem; display:none;">
                <p id="selection-text" style="font-weight: bold; color: #2c3e50;"></p>
                <button class="btn-confirm" onclick="processVote()">Confirmar mi Voto</button>
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

async function processVote() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner green"></div>
            <p>Depositando tu voto en La Urna de forma segura...</p>
        </div>
    `;

    try {
        const now = new Date();
        const receiptId = `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const votePayload = {
            torre: currentUser.torre,
            departamento: currentUser.departamento,
            opcion: selectedOption,
            receipt_id: receiptId,
            token_hash: currentToken // Guardamos el token usado
        };

        const { error } = await supabase.from('votos').insert([votePayload]);

        if (error) {
            if (error.code === '23505') {
                renderError("Este departamento ya ha emitido su voto anteriormente.");
            } else {
                throw error;
            }
            return;
        }

        const voteInfo = {
            opcion: selectedOption,
            fecha: now.toLocaleDateString('es-ES'),
            hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            id: receiptId
        };

        renderReceipt(currentUser, voteInfo, true);

    } catch (e) {
        console.error("Error al registrar voto:", e);
        renderError("Error de conexión con la Urna Virtual. Intenta de nuevo.");
    }
}

function renderReceipt(vecino, voteInfo, isNew = false) {
    const main = document.getElementById('main-content');
    const towerNum = vecino.torre.replace('T', '').padStart(2, '0');
    main.innerHTML = `
        <section id="receipt-section">
            <div class="receipt-header">
                ${isNew ? '<div class="success-icon">✓</div><h2 style="color: #27ae60; margin-bottom: 1rem;">¡Voto Registrado!</h2>' : ''}
                <h3>Residencial Esmeralda</h3>
                <p>Votación de Pintura 2026</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-item"><span>Departamento:</span> <strong>Dpto. ${vecino.departamento} Torre ${towerNum}</strong></div>
                <div class="receipt-item"><span>Opción elegida:</span> <strong>${voteInfo.opcion}</strong></div>
                <div class="receipt-item"><span>Fecha:</span> <strong>${voteInfo.fecha}</strong></div>
                <div class="receipt-item"><span>Hora:</span> <strong>${voteInfo.hora}</strong></div>
                <div class="receipt-item no-border"><span>ID Comprobante:</span> <strong style="font-family: monospace; color: #2980b9;">${voteInfo.id}</strong></div>
            </div>
            <div class="receipt-footer">
                <p>¡Gracias por tu participación!</p>
                <p class="instruction">Puedes tomar una captura de pantalla como prueba de participación.</p>
                <button class="btn-primary" style="margin-top:1.5rem;" onclick="location.href='index.html'">Salir</button>
            </div>
        </section>
    `;
}

function renderError(msg) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section id="error-section">
            <div class="error-icon">⚠</div>
            <h2 style="color: #e74c3c;">Atención</h2>
            <p style="padding: 1rem; color: #555;">${msg}</p>
            <button class="btn-primary" style="margin-top:2rem;" onclick="location.reload()">Regresar al inicio</button>
        </section>
    `;
}
