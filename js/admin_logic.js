/**
 * Admin Panel Logic - Mapa Visual de Torres (Versión Compacta con Resultados)
 */

const MASTER_ADMIN_KEY = "ADMIN_KEY_2026";
let dashboardData = {
    voted: new Set(),
    directory: {}, // Key: T1_101, Value: { phone, name }
    votesByOption: { "Azul Real": 0, "Beige Arena": 0, "Verde Esmeralda": 0 },
    statsPerTower: {
        T1: { total: 0, voted: 0 },
        T2: { total: 0, voted: 0 },
        T3: { total: 0, voted: 0 }
    },
    currentTower: 'T1'
};

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
        alert("Error cargando el mapa de torres. Verifique los archivos de datos.");
    }
}

async function loadData() {
    // Reset stats
    dashboardData.voted = new Set();
    dashboardData.votesByOption = { "Azul Real": 0, "Beige Arena": 0, "Verde Esmeralda": 0 };
    dashboardData.statsPerTower = {
        T1: { total: 0, voted: 0 },
        T2: { total: 0, voted: 0 },
        T3: { total: 0, voted: 0 }
    };

    // 1. Load directory (CSV) for phones and master unit list
    const csvRes = await fetch('../data/directorio.csv');
    const csvText = await csvRes.text();
    const rows = csvText.split('\n').slice(1);

    rows.forEach(row => {
        const parts = row.split(',');
        if (parts.length < 5) return;
        const [torre, piso, depto, tel, prop] = parts.map(p => p.trim());
        const key = `${torre}_${depto}`;

        dashboardData.directory[key] = {
            nombre: prop,
            telefono: tel
        };

        if (dashboardData.statsPerTower[torre]) {
            dashboardData.statsPerTower[torre].total++;
        }
    });

    // 2. Load votes from Supabase
    try {
        const { data: votes, error } = await supabase
            .from('votos')
            .select('*');

        if (error) throw error;

        votes.forEach(vote => {
            const unitKey = `${vote.torre}_${vote.departamento}`;
            dashboardData.voted.add(unitKey);

            if (dashboardData.statsPerTower[vote.torre]) {
                dashboardData.statsPerTower[vote.torre].voted++;
            }

            if (dashboardData.votesByOption.hasOwnProperty(vote.opcion)) {
                dashboardData.votesByOption[vote.opcion]++;
            }
        });
    } catch (e) {
        console.error("Error cargando votos desde Supabase:", e);
        // Fallback local por si acaso hay datos en localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('voto_')) {
                const unitKey = key.replace('voto_', '');
                dashboardData.voted.add(unitKey);
                const torre = unitKey.split('_')[0];
                if (dashboardData.statsPerTower[torre]) {
                    dashboardData.statsPerTower[torre].voted++;
                }
                const rawValue = localStorage.getItem(key);
                try {
                    const voteData = JSON.parse(rawValue);
                    if (dashboardData.votesByOption.hasOwnProperty(voteData.opcion)) {
                        dashboardData.votesByOption[voteData.opcion]++;
                    }
                } catch (e) { }
            }
        }
    }
}

function renderAllGrids() {
    ['T1', 'T2', 'T3'].forEach(t => renderTowerGrid(t));
}

function renderTowerGrid(towerId) {
    const grid = document.getElementById(`${towerId.toLowerCase()}-grid`);
    grid.innerHTML = '';

    // Floors 16 down to 1 (Visual: 16 at top, 1 at bottom)
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

            const waIcon = `
                <svg class="wa-icon" viewBox="0 0 24 24" width="16" height="16" fill="#10b981">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.109.004.258-.041.404.309.144.35.494 1.201.537 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.101-.177.211-.077.383.101.171.448.741.96 1.196.66.586 1.214.767 1.387.852.173.087.275.072.376-.043.101-.116.434-.506.549-.68.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.045.072.045.419-.1.824z"/>
                </svg>
            `;

            cell.innerHTML = `
                <span class="depto-num">${deptoId}</span>
                ${!hasVoted ? waIcon : ''}
                ${hasVoted ? '<span style="position:absolute; top:2px; right:4px; font-size:0.6rem; color:#10b981;">✓</span>' : ''}
            `;
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function openWhatsApp(phone, torre, depto) {
    if (!phone || phone === '---') {
        alert(`No hay teléfono registrado para el Dpto ${depto} de la Torre ${torre}.`);
        return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Estimado vecino aún no se ha registrado su voto sobre la elección de pintura. solicite su enlace de votación al número de administración. las votaciones culminan a las 16:00 hrs. de hoy Atte. la administración`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
}

function switchTower(towerId) {
    dashboardData.currentTower = towerId;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tower-container').forEach(c => c.classList.remove('active'));

    document.querySelector(`.tower-btn[onclick*="${towerId}"]`).classList.add('active');
    document.getElementById(`${towerId.toLowerCase()}-container`).classList.add('active');

    updateTowerPercentage();
}

function updateStats() {
    document.getElementById('total-votos').innerText = dashboardData.voted.size;
    const totalUnitsCount = Object.keys(dashboardData.directory).length || 192;
    document.getElementById('pending-count').innerText = totalUnitsCount - dashboardData.voted.size;
}

function updateTowerPercentage() {
    const t = dashboardData.currentTower;
    const stats = dashboardData.statsPerTower[t];
    const percentage = stats.total > 0 ? ((stats.voted / stats.total) * 100).toFixed(1) : 0;

    const label = document.getElementById('tower-perc-label');
    label.innerHTML = `Participación Torre ${t.replace('T', '')}: <strong>${percentage}%</strong>`;
}

function openResultsModal() {
    const modal = document.getElementById('results-modal');
    renderResultsBars();
    modal.style.display = 'block';
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
                <div class="bar-label">
                    <span>${option}</span>
                    <span>${count} (${perc}%)</span>
                </div>
                <div class="bar-outer">
                    <div class="bar-inner" style="width: ${perc}%; background-color: ${colors[option]}"></div>
                </div>
            </div>
        `;
    }
    document.getElementById('modal-total-votes').innerText = total;
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('results-modal');
    if (event.target == modal) {
        closeResultsModal();
    }
}

function downloadReport() {
    let csv = "\ufeffTorre,Departamento,Estado\n";
    for (let key in dashboardData.directory) {
        const parts = key.split('_');
        const status = dashboardData.voted.has(key) ? 'Votado' : 'Pendiente';
        csv += `${parts[0]},${parts[1]},${status}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_participacion.csv';
    a.click();
}