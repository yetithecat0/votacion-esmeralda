import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://vflhnomgfpjthiffpeke.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbGhub21nZnBqdGhpZmZwZWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTQyNTEsImV4cCI6MjA4NzA5MDI1MX0.oofZFScNH5kh4KGkDa48ugdH82p4z_glbX_yJi2T9mw'
const supabase = createClient(supabaseUrl, supabaseKey)

const MASTER_ADMIN_KEY = "ADMIN_KEY_2026";
let dashboardData = {
    voted: new Set(),
    directory: {}, // Guardaremos aquí los datos de Supabase
    votesByOption: { "Azul Real": 0, "Beige Arena": 0, "Verde Esmeralda": 0 },
    statsPerTower: {
        T1: { total: 0, voted: 0 },
        T2: { total: 0, voted: 0 },
        T3: { total: 0, voted: 0 }
    },
    currentTower: 'T1'
};

// Exponer funciones al HTML
window.validateAdmin = validateAdmin;
window.switchTower = switchTower;
window.openResultsModal = openResultsModal;
window.closeResultsModal = closeResultsModal;
window.downloadReport = downloadReport;

async function validateAdmin() {
    const input = document.getElementById('admin-token').value;
    if (input === MASTER_ADMIN_KEY) {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        await initDashboard();
    } else {
        alert('Llave incorrecta.');
    }
}

async function initDashboard() {
    try {
        await loadData();
        renderAllGrids();
        updateStats();
        updateTowerPercentage();
    } catch (e) {
        console.error(e);
        alert("Error cargando el dashboard.");
    }
}

async function loadData() {
    // 1. Cargar Directorio desde Supabase (Tabla: directorio_final)
    // Asegúrate de que en esta tabla existan las columnas: torre, depto, nombre, telefono
    const { data: directorio, error: errDir } = await supabase
        .from('directorio_final')
        .select('*');

    if (errDir) throw errDir;

    // Reiniciamos el directorio para evitar duplicados al refrescar
    dashboardData.directory = {};

    directorio.forEach(row => {
        const key = `${row.torre}_${row.depto}`;
        
        // Convertimos el teléfono a String por si en Supabase viene como número
        // Si la columna se llama diferente a 'telefono', cámbiala aquí
        const telString = row.telefono ? String(row.telefono) : '---';

        dashboardData.directory[key] = {
            nombre: row.nombre,
            telefono: telString
        };
        
        if (dashboardData.statsPerTower[row.torre]) {
            dashboardData.statsPerTower[row.torre].total++;
        }
    });

    // 2. Cargar Votos (Se mantiene igual)
    const { data: votos, error: errVotos } = await supabase
        .from('votos')
        .select('*');

    if (errVotos) throw errVotos;

    votos.forEach(vote => {
        const unitKey = `${vote.torre}_${vote.departamento}`;
        dashboardData.voted.add(unitKey);
        if (dashboardData.statsPerTower[vote.torre]) {
            dashboardData.statsPerTower[vote.torre].voted++;
        }
        if (dashboardData.votesByOption.hasOwnProperty(vote.opcion)) {
            dashboardData.votesByOption[vote.opcion]++;
        }
    });
}

function renderAllGrids() {
    ['T1', 'T2', 'T3'].forEach(t => renderTowerGrid(t));
}

function renderTowerGrid(towerId) {
    const grid = document.getElementById(`${towerId.toLowerCase()}-grid`);
    if(!grid) return;
    grid.innerHTML = '';

    for (let floor = 16; floor >= 1; floor--) {
        const row = document.createElement('div');
        row.className = 'floor-row';

        const label = document.createElement('div');
        label.className = 'floor-label';
        label.innerText = `Piso ${floor}`;
        row.appendChild(label);

        for (let dNum = 1; dNum <= 4; dNum++) {
            const deptoId = (floor * 100) + dNum;
            const unitKey = `${towerId}_${deptoId}`;
            const info = dashboardData.directory[unitKey];
            const hasVoted = dashboardData.voted.has(unitKey);

            const cell = document.createElement('div');
            cell.className = `depto-cell ${hasVoted ? 'voted' : 'pending'}`;

            if (!hasVoted) {
                cell.onclick = () => openWhatsApp(info ? info.telefono : '', towerId, deptoId);
            }

            cell.innerHTML = `
                <span class="depto-num">${deptoId}</span>
                ${hasVoted ? '<span class="check-mark">✓</span>' : ''}
            `;
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function openWhatsApp(phone, torre, depto) {
    // Validamos que el teléfono exista y sea útil
    if (!phone || phone === '---' || phone === 'null' || phone === 'undefined') {
        alert(`No hay un número válido registrado para el Dpto ${depto} de la Torre ${torre}.`);
        return;
    }

    // Forzamos que sea String antes de usar .replace() para evitar el error
    const phoneStr = String(phone);
    const cleanPhone = phoneStr.replace(/\D/g, '');

    if (cleanPhone.length < 7) {
        alert("El número registrado parece estar incompleto.");
        return;
    }

    const message = encodeURIComponent(`Estimado vecino del ${depto} (Torre ${torre}), aún no se registra su voto sobre la elección de pintura. Las votaciones cierran hoy a las 16:00 hrs. Atte. La Administración`);
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
}

function updateStats() {
    document.getElementById('total-votos').innerText = dashboardData.voted.size;
    const totalUnits = Object.keys(dashboardData.directory).length;
    document.getElementById('pending-count').innerText = totalUnits - dashboardData.voted.size;
}

function updateTowerPercentage() {
    const t = dashboardData.currentTower;
    const stats = dashboardData.statsPerTower[t];
    const percentage = stats && stats.total > 0 ? ((stats.voted / stats.total) * 100).toFixed(1) : 0;
    const label = document.getElementById('tower-perc-label');
    if(label) label.innerHTML = `Participación Torre ${t.replace('T', '')}: <strong>${percentage}%</strong>`;
}

function switchTower(towerId) {
    dashboardData.currentTower = towerId;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tower-container').forEach(c => c.classList.remove('active'));
    
    // Buscar botón por texto si no tiene ID exacto
    const buttons = document.querySelectorAll('.tower-btn');
    buttons.forEach(b => { if(b.innerText.includes(towerId.replace('T',''))) b.classList.add('active') });
    
    const container = document.getElementById(`${towerId.toLowerCase()}-container`);
    if(container) container.classList.add('active');
    updateTowerPercentage();
}

function openResultsModal() {
    document.getElementById('results-modal').style.display = 'block';
    renderResultsBars();
}

function closeResultsModal() {
    document.getElementById('results-modal').style.display = 'none';
}

function renderResultsBars() {
    const container = document.getElementById('results-bars');
    const colors = { "Azul Real": "#2980b9", "Beige Arena": "#d4c5a1", "Verde Esmeralda": "#27ae60" };
    const total = dashboardData.voted.size;

    container.innerHTML = '';
    for (const [option, count] of Object.entries(dashboardData.votesByOption)) {
        const perc = total > 0 ? (count / total * 100).toFixed(1) : 0;
        container.innerHTML += `
            <div class="bar-container">
                <div class="bar-label"><span>${option}</span> <span>${count} (${perc}%)</span></div>
                <div class="bar-outer"><div class="bar-inner" style="width: ${perc}%; background-color: ${colors[option]}"></div></div>
            </div>`;
    }
}

function downloadReport() {
    let csv = "\ufeffTorre,Departamento,Estado\n";
    for (let key in dashboardData.directory) {
        const [t, d] = key.split('_');
        const status = dashboardData.voted.has(key) ? 'Votado' : 'Pendiente';
        csv += `${t},${d},${status}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'reporte_votos_esmeralda.csv';
    a.click();
}

