async function simulateBackendCall(token) {
    try {
        // 1. Buscar el usuario en la tabla directorio_final
        const { data: userData, error: userError } = await supabase
            .from('directorio_final')
            .select('*')
            .eq('token', token.trim().toUpperCase())
            .single();

        if (userError || !userData) {
            console.log("Token no encontrado");
            return { success: false };
        }

        // IMPORTANTE: Guardamos 'depto' en la variable global para el voto posterior
        currentUser = {
            nombre: userData.nombre,
            torre: userData.torre,
            departamento: userData.depto // Usamos depto de Supabase y lo mapeamos a 'departamento'
        };

        // 2. Verificar si ya votó usando 'depto'
        const { data: voteData, error: voteError } = await supabase
            .from('votos')
            .select('*')
            .eq('torre', userData.torre)
            .eq('departamento', userData.depto) // Compara con la columna de la tabla votos
            .single();

        if (voteData) {
            return {
                success: true,
                data: currentUser,
                alreadyVoted: true,
                voteDetails: {
                    opcion: voteData.opcion,
                    fecha: new Date(voteData.created_at).toLocaleDateString('es-ES'),
                    hora: new Date(voteData.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    id: voteData.receipt_id
                }
            };
        } else {
            return { success: true, data: currentUser, alreadyVoted: false };
        }
    } catch (e) {
        console.error("Error en conexión:", e);
        throw e;
    }
}

async function simulateVoteRegistration() {
    try {
        const now = new Date();
        const receiptId = `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Aseguramos que se envíe 'departamento' a la tabla votos (que así se llama según tu estructura)
        const votePayload = {
            torre: currentUser.torre,
            departamento: currentUser.departamento, // Este ya trae el valor de 'depto'
            opcion: selectedOption,
            receipt_id: receiptId,
            token_hash: currentToken
        };

        const { error } = await supabase.from('votos').insert([votePayload]);

        if (error) {
            if (error.code === '23505') {
                return { success: false, message: "Este departamento ya ha votado." };
            }
            throw error;
        }

        const voteData = {
            opcion: selectedOption,
            fecha: now.toLocaleDateString('es-ES'),
            hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            id: receiptId
        };

        return { success: true, voteData };
    } catch (e) {
        console.error("Error al registrar voto:", e);
        return { success: false, message: "Error de conexión con la Urna." };
    }
}
