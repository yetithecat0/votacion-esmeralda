async function handleTokenValidation(token) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="loader-container">
            <div class="spinner"></div>
            <p>Validando tu identidad en la nube...</p>
        </div>
    `;

    try {
        // 1. BUSQUEDA REAL EN EL DIRECTORIO
        const { data: userData, error: userError } = await supabase
            .from('directorio_final')
            .select('*')
            .eq('token', token.trim().toUpperCase())
            .single();

        if (userError || !userData) {
            alert('Esa llave no es válida. Revisa el código o contacta con administración.');
            renderLogin();
            return;
        }

        // 2. MAPEO DE DATOS (Usando 'depto' como confirmaste)
        currentUser = {
            nombre: userData.nombre,
            torre: userData.torre,
            departamento: userData.depto 
        };

        // 3. VERIFICACIÓN DE VOTO EXISTENTE
        const { data: voteData } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', currentUser.torre)
            .eq('departamento', currentUser.departamento)
            .single();

        if (voteData) {
            // Si ya existe registro en la tabla 'votos', vamos al recibo
            renderReceipt(currentUser, {
                opcion: voteData.opcion,
                fecha: new Date(voteData.created_at).toLocaleDateString('es-ES'),
                hora: new Date(voteData.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                id: voteData.receipt_id
            });
        } else {
            // Si no hay voto, mostramos bienvenida
            renderWelcome(currentUser);
        }

    } catch (e) {
        console.error("Error de conexión:", e);
        alert('Tuvimos un problema al conectar con la base de datos.');
        renderLogin();
    }
}
