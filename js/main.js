/**
 * Main JS for Painting Voting SPA - Supabase Cloud Version
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://vflhnomgfpjthiffpeke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw'
const supabase = createClient(supabaseUrl, supabaseKey)

let currentUser = null;
let currentToken = null;
let selectedOption = null;

const mockTokens = {
    // Re-incluimos el diccionario maestro para validación de tokens
    "3B029EDE": { "nombre": "Jose Vargas P.", "torre": "T1", "departamento": "101" },
    "63A3E249": { "nombre": "Carlos Lopez T.", "torre": "T1", "departamento": "102" },
    "DBB4A3CB": { "nombre": "Andres Vargas V.", "torre": "T1", "departamento": "103" },
    "0CD3BED3": { "nombre": "Elena Ramirez G.", "torre": "T1", "departamento": "104" },
    "93F1DCF0": { "nombre": "Maria Torres L.", "torre": "T1", "departamento": "201" },
    "E0290E75": { "nombre": "Luis Sanchez S.", "torre": "T1", "departamento": "202" },
    "F24212B4": { "nombre": "Miguel Garcia T.", "torre": "T1", "departamento": "203" },
    "2E998ED8": { "nombre": "Jose Sanchez S.", "torre": "T1", "departamento": "204" },
    "ACE935F6": { "nombre": "Isabel Ramirez G.", "torre": "T1", "departamento": "301" },
    "E4CE38F4": { "nombre": "Lucia Garcia R.", "torre": "T1", "departamento": "302" },
    "B90A0DA6": { "nombre": "Elena Martinez V.", "torre": "T1", "departamento": "303" },
    "FB178AB3": { "nombre": "Miguel Lopez R.", "torre": "T1", "departamento": "304" },
    "D6E2BA12": { "nombre": "Jorge Ramirez M.", "torre": "T1", "departamento": "401" },
    "B5A0894D": { "nombre": "Miguel Rodriguez P.", "torre": "T1", "departamento": "402" },
    "74BE906E": { "nombre": "Miguel Torres T.", "torre": "T1", "departamento": "403" },
    "11BBF012": { "nombre": "Isabel Sanchez P.", "torre": "T1", "departamento": "404" },
    "D7FDE8E7": { "nombre": "Lucia Lopez L.", "torre": "T1", "departamento": "501" },
    "6DB092CC": { "nombre": "Carlos Sanchez G.", "torre": "T1", "departamento": "502" },
    "B151AA37": { "nombre": "Jose Ramirez M.", "torre": "T1", "departamento": "503" },
    "3EE9C3B9": { "nombre": "Carmen Perez R.", "torre": "T1", "departamento": "504" },
    "C555BBC1": { "nombre": "Ana Perez M.", "torre": "T1", "departamento": "601" },
    "7CFBF77C": { "nombre": "Isabel Martinez G.", "torre": "T1", "departamento": "602" },
    "F9D32B0E": { "nombre": "Jose Sanchez T.", "torre": "T1", "departamento": "603" },
    "EE924F84": { "nombre": "Pedro Martinez S.", "torre": "T1", "departamento": "604" },
    "30B59F09": { "nombre": "Pedro Lopez V.", "torre": "T1", "departamento": "701" },
    "B1422E61": { "nombre": "Lucia Lopez R.", "torre": "T1", "departamento": "702" },
    "929D7C5A": { "nombre": "Pedro Torres L.", "torre": "T1", "departamento": "703" },
    "73EF9119": { "nombre": "Carlos Vargas R.", "torre": "T1", "departamento": "704" },
    "94E47F8C": { "nombre": "Ana Lopez V.", "torre": "T1", "departamento": "801" },
    "8BFB5EB0": { "nombre": "Lucia Garcia G.", "torre": "T1", "departamento": "802" },
    "5AD3617A": { "nombre": "Elena Ramirez L.", "torre": "T1", "departamento": "803" },
    "A82B58BA": { "nombre": "Pedro Vargas R.", "torre": "T1", "departamento": "804" },
    "3A0D5EA2": { "nombre": "Miguel Martinez R.", "torre": "T1", "departamento": "901" },
    "6C41E36D": { "nombre": "Luis Rodriguez R.", "torre": "T1", "departamento": "902" },
    "835186A4": { "nombre": "Carmen Sanchez T.", "torre": "T1", "departamento": "903" },
    "D094443E": { "nombre": "Pedro Martinez S.", "torre": "T1", "departamento": "904" },
    "C1AB99D1": { "nombre": "Isabel Lopez P.", "torre": "T1", "departamento": "1001" },
    "8D3C9AE6": { "nombre": "Elena Ramirez R.", "torre": "T1", "departamento": "1002" },
    "FF54DBE7": { "nombre": "Maria Perez S.", "torre": "T1", "departamento": "1003" },
    "4CD3BD06": { "nombre": "Lucia Sanchez T.", "torre": "T1", "departamento": "1004" },
    "C43ED5B1": { "nombre": "Jorge Vargas L.", "torre": "T1", "departamento": "1101" },
    "F36E7851": { "nombre": "Pedro Martinez R.", "torre": "T1", "departamento": "1102" },
    "C14827B8": { "nombre": "Maria Garcia M.", "torre": "T1", "departamento": "1103" },
    "7CB4B1E6": { "nombre": "Miguel Perez L.", "torre": "T1", "departamento": "1104" },
    "069E3D2E": { "nombre": "Andres Lopez R.", "torre": "T1", "departamento": "1201" },
    "B791DC3C": { "nombre": "Jose Torres M.", "torre": "T1", "departamento": "1202" },
    "6C99BC42": { "nombre": "Jorge Vargas T.", "torre": "T1", "departamento": "1203" },
    "77562DB9": { "nombre": "Carlos Sanchez R.", "torre": "T1", "departamento": "1204" },
    "4EA18405": { "nombre": "Carlos Rodriguez T.", "torre": "T1", "departamento": "1301" },
    "20C91D21": { "nombre": "Andres Perez V.", "torre": "T1", "departamento": "1302" },
    "EAA9AF2C": { "nombre": "Pedro Martinez V.", "torre": "T1", "departamento": "1303" },
    "94826423": { "nombre": "Maria Garcia P.", "torre": "T1", "departamento": "1304" },
    "58F12326": { "nombre": "Jose Garcia S.", "torre": "T1", "departamento": "1401" },
    "1F120BC9": { "nombre": "Maria Rodriguez S.", "torre": "T1", "departamento": "1402" },
    "7097D897": { "nombre": "Pedro Torres R.", "torre": "T1", "departamento": "1403" },
    "B1425F4D": { "nombre": "Andres Perez L.", "torre": "T1", "departamento": "1404" },
    "3A2CEA0D": { "nombre": "Carlos Sanchez G.", "torre": "T1", "departamento": "1501" },
    "69BFF48D": { "nombre": "Miguel Lopez P.", "torre": "T1", "departamento": "1502" },
    "7DE47FC0": { "nombre": "Andres Rodriguez T.", "torre": "T1", "departamento": "1503" },
    "EA87101C": { "nombre": "Lucia Ramirez P.", "torre": "T1", "departamento": "1504" },
    "A9A153B2": { "nombre": "Pedro Ramirez S.", "torre": "T1", "departamento": "1601" },
    "7C9F7B11": { "nombre": "Pedro Vargas R.", "torre": "T1", "departamento": "1602" },
    "DE4AEC7A": { "nombre": "Carlos Torres V.", "torre": "T1", "departamento": "1603" },
    "115B66AF": { "nombre": "Rosa Rodriguez L.", "torre": "T1", "departamento": "1604" },
    "8A875901": { "nombre": "Miguel Vargas M.", "torre": "T2", "departamento": "101" },
    "20E4B7E0": { "nombre": "Miguel Lopez L.", "torre": "T2", "departamento": "102" },
    "3D7FD85F": { "nombre": "Carlos Rodriguez M.", "torre": "T2", "departamento": "103" },
    "D570F5D4": { "nombre": "Pedro Rodriguez S.", "torre": "T2", "departamento": "104" },
    "7F7CD924": { "nombre": "Luis Ramirez R.", "torre": "T2", "departamento": "201" },
    "2267DF9C": { "nombre": "Miguel Lopez V.", "torre": "T2", "departamento": "202" },
    "27F8D032": { "nombre": "Ana Sanchez R.", "torre": "T2", "departamento": "203" },
    "A692177B": { "nombre": "Isabel Torres R.", "torre": "T2", "departamento": "204" },
    "BC150EED": { "nombre": "Lucia Perez L.", "torre": "T2", "departamento": "301" },
    "6E05EE78": { "nombre": "Rosa Vargas L.", "torre": "T2", "departamento": "302" },
    "9EA2B260": { "nombre": "Carmen Vargas R.", "torre": "T2", "departamento": "303" },
    "78165FD9": { "nombre": "Lucia Rodriguez M.", "torre": "T2", "departamento": "304" },
    "2F6D6252": { "nombre": "Elena Garcia L.", "torre": "T2", "departamento": "401" },
    "F8BA1CA3": { "nombre": "Lucia Martinez R.", "torre": "T2", "departamento": "402" },
    "5070D46B": { "nombre": "Ana Vargas P.", "torre": "T2", "departamento": "403" },
    "082AE384": { "nombre": "Lucia Torres G.", "torre": "T2", "departamento": "404" },
    "585E5463": { "nombre": "Lucia Martinez G.", "torre": "T2", "departamento": "501" },
    "1C148276": { "nombre": "Andres Garcia P.", "torre": "T2", "departamento": "502" },
    "F4198DEE": { "nombre": "Rosa Torres G.", "torre": "T2", "departamento": "503" },
    "A23524B0": { "nombre": "Jose Vargas V.", "torre": "T2", "departamento": "504" },
    "22104F76": { "nombre": "Carmen Vargas P.", "torre": "T2", "departamento": "601" },
    "65DAE808": { "nombre": "Rosa Ramirez S.", "torre": "T2", "departamento": "602" },
    "3A2B7884": { "nombre": "Ana Martinez S.", "torre": "T2", "departamento": "603" },
    "2770FEB5": { "nombre": "Andres Vargas P.", "torre": "T2", "departamento": "604" },
    "1AF4ACD4": { "nombre": "Rosa Rodriguez P.", "torre": "T2", "departamento": "701" },
    "ADA6E31B": { "nombre": "Jorge Martinez S.", "torre": "T2", "departamento": "702" },
    "35172E54": { "nombre": "Miguel Sanchez S.", "torre": "T2", "departamento": "703" },
    "B0909BE3": { "nombre": "Carlos Sanchez L.", "torre": "T2", "departamento": "704" },
    "366CEC8D": { "nombre": "Luis Vargas P.", "torre": "T2", "departamento": "801" },
    "29A5A2F7": { "nombre": "Carlos Martinez P.", "torre": "T2", "departamento": "802" },
    "1FC7C437": { "nombre": "Carmen Garcia R.", "torre": "T2", "departamento": "803" },
    "4EFBF602": { "nombre": "Maria Torres R.", "torre": "T2", "departamento": "804" },
    "52B2EAF7": { "nombre": "Carmen Martinez G.", "torre": "T2", "departamento": "901" },
    "DA30729C": { "nombre": "Ana Martinez S.", "torre": "T2", "departamento": "902" },
    "2B17E000": { "nombre": "Jose Rodriguez V.", "torre": "T2", "departamento": "903" },
    "0A1943FC": { "nombre": "Lucia Vargas M.", "torre": "T2", "departamento": "904" },
    "2C5E3B6B": { "nombre": "Isabel Vargas R.", "torre": "T2", "departamento": "1001" },
    "47BDEB41": { "nombre": "Maria Perez L.", "torre": "T2", "departamento": "1002" },
    "7B270E95": { "nombre": "Andres Torres V.", "torre": "T2", "departamento": "1003" },
    "0D519BD4": { "nombre": "Ana Rodriguez T.", "torre": "T2", "departamento": "1004" },
    "FFC464A7": { "nombre": "Carlos Lopez S.", "torre": "T2", "departamento": "1101" },
    "B742446B": { "nombre": "Pedro Rodriguez T.", "torre": "T2", "departamento": "1102" },
    "0359B3FB": { "nombre": "Rosa Garcia M.", "torre": "T2", "departamento": "1103" },
    "10883F32": { "nombre": "Jose Ramirez P.", "torre": "T2", "departamento": "1104" },
    "AA102EA1": { "nombre": "Maria Torres L.", "torre": "T2", "departamento": "1201" },
    "687659C2": { "nombre": "Andres Torres T.", "torre": "T2", "departamento": "1202" },
    "45A4CB2B": { "nombre": "Ana Torres V.", "torre": "T2", "departamento": "1203" },
    "78C6F4E3": { "nombre": "Jose Martinez G.", "torre": "T2", "departamento": "1204" },
    "C5F96B85": { "nombre": "Isabel Garcia R.", "torre": "T2", "departamento": "1301" },
    "B6B2D35D": { "nombre": "Lucia Sanchez T.", "torre": "T2", "departamento": "1302" },
    "3894E078": { "nombre": "Elena Rodriguez G.", "torre": "T2", "departamento": "1303" },
    "4F51EDD2": { "nombre": "Carmen Torres S.", "torre": "T2", "departamento": "1304" },
    "3D0E84D4": { "nombre": "Pedro Perez G.", "torre": "T2", "departamento": "1401" },
    "0F9B6DA5": { "nombre": "Lucia Rodriguez R.", "torre": "T2", "departamento": "1402" },
    "F2324D24": { "nombre": "Maria Rodriguez S.", "torre": "T2", "departamento": "1403" },
    "F27CBB35": { "nombre": "Maria Rodriguez G.", "torre": "T2", "departamento": "1404" },
    "0A3A402C": { "nombre": "Jorge Perez R.", "torre": "T2", "departamento": "1501" },
    "4F6336A7": { "nombre": "Elena Garcia R.", "torre": "T2", "departamento": "1502" },
    "9EF26327": { "nombre": "Rosa Ramirez V.", "torre": "T2", "departamento": "1503" },
    "65EE5A52": { "nombre": "Maria Torres M.", "torre": "T2", "departamento": "1504" },
    "DCE3EB3A": { "nombre": "Lucia Torres R.", "torre": "T2", "departamento": "1601" },
    "FFD0A8AE": { "nombre": "Isabel Ramirez V.", "torre": "T2", "departamento": "1602" },
    "9826EDDB": { "nombre": "Ana Garcia S.", "torre": "T2", "departamento": "1603" },
    "1DA346AB": { "nombre": "Lucia Rodriguez P.", "torre": "T2", "departamento": "1604" },
    "ADF0B6BC": { "nombre": "Maria Lopez R.", "torre": "T3", "departamento": "101" },
    "4C713CDD": { "nombre": "Lucia Vargas R.", "torre": "T3", "departamento": "102" },
    "2309AD67": { "nombre": "Carmen Ramirez P.", "torre": "T3", "departamento": "103" },
    "EF318EC8": { "nombre": "Lucia Rodriguez G.", "torre": "T3", "departamento": "104" },
    "C0B6B1E8": { "nombre": "Elena Lopez M.", "torre": "T3", "departamento": "201" },
    "D22A87D2": { "nombre": "Pedro Ramirez R.", "torre": "T3", "departamento": "202" },
    "D6814702": { "nombre": "Isabel Torres G.", "torre": "T3", "departamento": "203" },
    "24576A27": { "nombre": "Lucia Vargas S.", "torre": "T3", "departamento": "204" },
    "669D6825": { "nombre": "Isabel Lopez G.", "torre": "T3", "departamento": "301" },
    "BCB5E36D": { "nombre": "Carlos Martinez V.", "torre": "T3", "departamento": "302" },
    "25FE57D9": { "nombre": "Jose Ramirez S.", "torre": "T3", "departamento": "303" },
    "6CEFB5F1": { "nombre": "Andres Garcia G.", "torre": "T3", "departamento": "304" },
    "736508AC": { "nombre": "Pedro Garcia V.", "torre": "T3", "departamento": "401" },
    "934018BB": { "nombre": "Jorge Martinez V.", "torre": "T3", "departamento": "402" },
    "198DEBC1": { "nombre": "Elena Martinez R.", "torre": "T3", "departamento": "403" },
    "874BD85B": { "nombre": "Maria Torres S.", "torre": "T3", "departamento": "404" },
    "FBB25595": { "nombre": "Luis Lopez V.", "torre": "T3", "departamento": "501" },
    "F497D79D": { "nombre": "Carmen Vargas S.", "torre": "T3", "departamento": "502" },
    "75D8443B": { "nombre": "Carmen Perez S.", "torre": "T3", "departamento": "503" },
    "62E3BC42": { "nombre": "Miguel Torres T.", "torre": "T3", "departamento": "504" },
    "362C0B91": { "nombre": "Ana Perez L.", "torre": "T3", "departamento": "601" },
    "7146F174": { "nombre": "Lucia Rodriguez V.", "torre": "T3", "departamento": "602" },
    "79E1B73D": { "nombre": "Elena Vargas S.", "torre": "T3", "departamento": "603" },
    "7C2F2E4A": { "nombre": "Maria Sanchez V.", "torre": "T3", "departamento": "604" },
    "E904DD1E": { "nombre": "Maria Martinez G.", "torre": "T3", "departamento": "701" },
    "91E4C93F": { "nombre": "Andres Martinez L.", "torre": "T3", "departamento": "702" },
    "B427B9B4": { "nombre": "Andres Garcia G.", "torre": "T3", "departamento": "703" },
    "A33C9993": { "nombre": "Carlos Garcia T.", "torre": "T3", "departamento": "704" },
    "EEB34B94": { "nombre": "Jose Rodriguez T.", "torre": "T3", "departamento": "801" },
    "0F57C89F": { "nombre": "Maria Sanchez P.", "torre": "T3", "departamento": "802" },
    "66710777": { "nombre": "Maria Lopez G.", "torre": "T3", "departamento": "803" },
    "E47A7043": { "nombre": "Elena Sanchez T.", "torre": "T3", "departamento": "804" },
    "B4A7E001": { "nombre": "Carmen Rodriguez S.", "torre": "T3", "departamento": "901" },
    "69A45053": { "nombre": "Lucia Martinez L.", "torre": "T3", "departamento": "902" },
    "0A406CD9": { "nombre": "Miguel Rodriguez S.", "torre": "T3", "departamento": "903" },
    "40726FC0": { "nombre": "Maria Perez T.", "torre": "T3", "departamento": "904" },
    "15DF91EE": { "nombre": "Rosa Garcia V.", "torre": "T3", "departamento": "1001" },
    "0D766E40": { "nombre": "Miguel Vargas L.", "torre": "T3", "departamento": "1002" },
    "292C3D3E": { "nombre": "Isabel Lopez P.", "torre": "T3", "departamento": "1003" },
    "E7DC98B1": { "nombre": "Jose Sanchez P.", "torre": "T3", "departamento": "1004" },
    "DEFDB6AD": { "nombre": "Luis Garcia G.", "torre": "T3", "departamento": "1101" },
    "A3E9ABFA": { "nombre": "Ana Rodriguez M.", "torre": "T3", "departamento": "1102" },
    "B96BA0CA": { "nombre": "Ana Sanchez V.", "torre": "T3", "departamento": "1103" },
    "C3E7B27C": { "nombre": "Ana Rodriguez G.", "torre": "T3", "departamento": "1104" },
    "4671BD7D": { "nombre": "Maria Martinez R.", "torre": "T3", "departamento": "1201" },
    "DBA6E3F4": { "nombre": "Carmen Perez R.", "torre": "T3", "departamento": "1202" },
    "6FE76A8D": { "nombre": "Rosa Vargas R.", "torre": "T3", "departamento": "1203" },
    "9EF2E0D4": { "nombre": "Maria Lopez T.", "torre": "T3", "departamento": "1204" },
    "44C1D983": { "nombre": "Jose Rodriguez M.", "torre": "T3", "departamento": "1301" },
    "D0F1EB1E": { "nombre": "Ana Vargas S.", "torre": "T3", "departamento": "1302" },
    "D4A7B7E9": { "nombre": "Maria Vargas G.", "torre": "T3", "departamento": "1303" },
    "B0250E8C": { "nombre": "Rosa Torres P.", "torre": "T3", "departamento": "1304" },
    "A88EFD2E": { "nombre": "Pedro Ramirez P.", "torre": "T3", "departamento": "1401" },
    "D16E7F8F": { "nombre": "Andres Martinez L.", "torre": "T3", "departamento": "1402" },
    "8D2C3E52": { "nombre": "Isabel Sanchez L.", "torre": "T3", "departamento": "1403" },
    "0C99BD1A": { "nombre": "Jorge Sanchez M.", "torre": "T3", "departamento": "1404" },
    "934BD06C": { "nombre": "Andres Rodriguez L.", "torre": "T3", "departamento": "1501" },
    "85A9B4EB": { "nombre": "Miguel Torres T.", "torre": "T3", "departamento": "1502" },
    "D0294C7A": { "nombre": "Maria Rodriguez S.", "torre": "T3", "departamento": "1503" },
    "902DC9AE": { "nombre": "Elena Rodriguez R.", "torre": "T3", "departamento": "1504" },
    "A33D4C35": { "nombre": "Elena Lopez S.", "torre": "T3", "departamento": "1601" },
    "7463EF36": { "nombre": "Elena Garcia R.", "torre": "T3", "departamento": "1603" },
    "5E4E6437": { "nombre": "Miguel Vargas V.", "torre": "T3", "departamento": "1604" }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('SPA Initialized');
    checkUrlToken();
});

async function checkUrlToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        currentToken = token;
        await handleTokenValidation(token);
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
    const token = document.getElementById('token-input').value;
    if (!token) return alert('Por favor, ingresa tu llave para continuar.');
    currentToken = token;
    await handleTokenValidation(token);
}

async function handleTokenValidation(token) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Estamos validando tu llave con el registro maestro...</p>
            <p style="font-size: 0.9em; color: #666;">Tu privacidad es nuestra prioridad.</p>
        </div>
    `;

    try {
        async function validateToken(token) {
  try {
    const { data, error } = await supabase
        .from('directorio_final') // Asegúrate que este sea el nombre exacto en Supabase
        .select('*')
        .eq('token', token)
        .single();

    // 1. Verificamos si hubo un error de conexión o si no encontró el token
    if (error || !data) {
        alert('Esa llave no es válida. Revisa el código o contacta con administración.');
        renderLogin();
        return;
    }

    // 2. Si llegamos aquí, el vecino existe. Guardamos sus datos.
    currentUser = data;

    // 3. Verificamos si ya votó (usando la columna 'ya_voto' de tu tabla)
    if (data.ya_voto) {
        // Si ya votó, enviamos los datos y los detalles del voto para el recibo
        renderReceipt(data, { fecha: data.fecha_voto, hora: data.hora_voto, id: data.id_comprobante });
    } else {
        // Si no ha votado, bienvenida normal
        renderWelcome(data);
    }

} catch (e) {
    console.error("Error crítico:", e);
    alert('Tuvimos un problema al validar. Intenta de nuevo.');
    renderLogin();
}
    }
}

async function simulateBackendCall(token) {
    const data = mockTokens[token.trim().toUpperCase()];
    if (!data) return { success: false };

    try {
        const { data: voteData, error } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', data.torre)
            .eq('departamento', data.departamento)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (voteData) {
            return {
                success: true,
                data,
                alreadyVoted: true,
                voteDetails: {
                    opcion: voteData.opcion,
                    fecha: new Date(voteData.created_at).toLocaleDateString('es-ES'),
                    hora: new Date(voteData.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    id: voteData.receipt_id
                }
            };
        } else {
            return { success: true, data, alreadyVoted: false };
        }
    } catch (e) {
        console.error("Fallo de conexión con Supabase:", e);
        const localKey = `voto_${data.torre}_${data.departamento}`;
        const localVote = localStorage.getItem(localKey);
        if (localVote) {
            return { success: true, data, alreadyVoted: true, voteDetails: JSON.parse(localVote) };
        }
        throw e;
    }
}

function renderWelcome(vecino) {
    const main = document.getElementById('main-content');
    const towerNum = vecino.torre.replace('T', '').padStart(2, '0');
    main.innerHTML = `
        <section id="welcome-section">
            <div class="user-greeting">👋 ¡Hola, ${vecino.nombre}!</div>
            <h2>Tu voz importa</h2>
            <p>!Bienvenido vecino del <strong>Dpto. ${vecino.departamento}</strong> de la <strong>Torre ${towerNum}</strong> de la Res. Esmeralda! agradecemos su participación. al finalizar su votación se genera un ticket único de participación efectiva.</p>
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
            <p style="font-size: 0.9em; color: #666;">Validando unicidad por departamento.</p>
        </div>
    `;

    const response = await simulateVoteRegistration();
    if (response.success) {
        renderConfirmation();
    } else {
        renderError(response.message);
    }
}

async function simulateVoteRegistration() {
    try {
        const now = new Date();
        const receiptId = `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const votePayload = {
            torre: currentUser.torre,
            departamento: currentUser.departamento,
            opcion: selectedOption,
            receipt_id: receiptId,
            token_hash: currentToken
        };

        const { error } = await supabase.from('votos').insert([votePayload]);

        if (error) {
            if (error.code === '23505') {
                return { success: false, message: "Este departamento ya ha emitido su voto anteriormente. Bloqueo de duplicidad activado." };
            }
            throw error;
        }

        const voteData = {
            opcion: selectedOption,
            fecha: now.toLocaleDateString('es-ES'),
            hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            id: receiptId
        };
        localStorage.setItem(`voto_${currentUser.torre}_${currentUser.departamento}`, JSON.stringify(voteData));

        return { success: true, voteData };
    } catch (e) {
        console.error("Error al registrar voto:", e);
        return { success: false, message: "Error de conexión con la Urna Virtual. Intenta de nuevo." };
    }
}

function renderConfirmation() {
    const key = `voto_${currentUser.torre}_${currentUser.departamento}`;
    const voteData = JSON.parse(localStorage.getItem(key));
    renderReceipt(currentUser, voteData, true);
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
                <div class="receipt-item">
                    <span>Departamento:</span>
                    <strong>Dpto. ${vecino.departamento} Torre ${towerNum}</strong>
                </div>
                <div class="receipt-item">
                    <span>Opción elegida:</span>
                    <strong>${voteInfo.opcion}</strong>
                </div>
                <div class="receipt-item">
                    <span>Fecha:</span>
                    <strong>${voteInfo.fecha}</strong>
                </div>
                <div class="receipt-item">
                    <span>Hora:</span>
                    <strong>${voteInfo.hora}</strong>
                </div>
                <div class="receipt-item no-border">
                    <span>ID Comprobante:</span>
                    <strong style="font-family: monospace; color: #2980b9;">${voteInfo.id}</strong>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>¡Gracias por tu participación!</p>
                <p class="instruction">Puedes tomar una captura de pantalla como prueba de participación.</p>
                ${!isNew ? '<button class="btn-primary" style="margin-top:1.5rem;" onclick="location.href=\'index.html\'">Salir</button>' : ''}
            </div>
        </section>
    `;
}

function renderError(msg) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section id="error-section">
            <div class="error-icon">⚠</div>
            <h2 style="color: #e74c3c;">Participación ya registrada</h2>
            <p style="padding: 1rem; color: #555;">${msg}</p>
            <p style="font-size: 0.9em;">Si crees que esto es un error, por favor contacta a la oficina de administración.</p>
            <button class="btn-primary" style="margin-top:2rem;" onclick="location.reload()">Regresar al inicio</button>
        </section>
    `;
}


