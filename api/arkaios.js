// api/arkaios.js
// Función serverless de Vercel para integración con ARKAIOS Gateway
// Conecta el Centro de Plantillas Educativas con ARKAIOS AI

export default async function handler(req, res) {
    // Validar método HTTP - solo POST permitido
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extraer parámetros del cuerpo de la petición
    const { messages, action = 'chat', agent_id = 'educational' } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    // Obtener token de autenticación desde variable de entorno
    const authToken = process.env.AIDA_AUTH_TOKEN;
    if (!authToken) {
        return res.status(500).json({
            error: 'Missing AIDA_AUTH_TOKEN environment variable',
            hint: 'Configure AIDA_AUTH_TOKEN in Vercel Dashboard'
        });
    }

    try {
        // Construir el prompt desde los mensajes
        // El último mensaje es la pregunta del usuario
        const userMessage = messages[messages.length - 1];
        const objective = userMessage?.content || '';

        // Construir contexto desde mensajes previos (historial)
        const previousMessages = messages.slice(0, -1);
        const systemMessages = previousMessages.filter(m => m.role === 'system');
        const conversationHistory = previousMessages.filter(m => m.role !== 'system');

        // Llamar al ARKAIOS Gateway
        console.log('Calling ARKAIOS Gateway with:', {
            agent_id,
            action,
            objective: objective.substring(0, 100) + '...'
        });

        const response = await fetch('https://arkaios-gateway-open.onrender.com/aida/gateway', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agent_id,
                action,
                params: {
                    objective,
                    context: {
                        system: systemMessages.map(m => m.content).join('\n'),
                        history: conversationHistory,
                        capabilities: ['edit', 'create', 'analyze', 'optimize'],
                        templates: [
                            'plantilla_escolar_carta_mx_autoajuste_y_areas_editables.html',
                            'generador-fotos-infantiles.html',
                            'plantilla-imagenes-v2.html',
                            'plantilla-cuadros-imagenes.html',
                            'plantilla_circulos_jack.html'
                        ]
                    }
                }
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('ARKAIOS Gateway error:', response.status, text);
            return res.status(response.status).json({
                error: 'ARKAIOS Gateway error',
                status: response.status,
                details: text
            });
        }

        const data = await response.json();
        console.log('ARKAIOS response received:', JSON.stringify(data).substring(0, 200));

        // Adaptar la respuesta al formato esperado por el cliente
        // ARKAIOS puede retornar en varios formatos según la configuración
        // Intentamos extraer el contenido de las rutas más comunes
        let content =
            data?.data?.text ||
            data?.result?.note ||
            data?.result?.text ||
            data?.text ||
            data?.reply ||
            data?.response ||
            data?.message;

        if (!content) {
            console.error('Could not extract content from ARKAIOS response:', data);
            return res.status(500).json({
                error: 'ARKAIOS no devolvió contenido válido',
                hint: 'Verifica el formato de respuesta del gateway',
                raw: data
            });
        }

        // Retornar en formato compatible con OpenAI (para facilitar integración con el cliente)
        return res.status(200).json({
            choices: [{
                message: {
                    role: 'assistant',
                    content: typeof content === 'string' ? content : JSON.stringify(content)
                },
                finish_reason: 'stop'
            }],
            model: 'arkaios-educational',
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            },
            created: Math.floor(Date.now() / 1000),
            id: `arkaios-${Date.now()}`
        });

    } catch (error) {
        console.error('Error calling ARKAIOS:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
