// Widget de Asistente IA ARKAIOS
// Inyecta el HTML y maneja la lógica del chat

const AI_WIDGET_HTML = `
  <!-- Botón Flotante del Asistente IA -->
  <button class="ai-button" id="aiButton" title="Asistente ARKAIOS IA">
    🤖
  </button>

  <!-- Panel del Chat IA -->
  <div class="ai-panel" id="aiPanel">
    <div class="ai-header">
      <h3>🤖 Asistente ARKAIOS</h3>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span class="ai-status" id="aiStatus" data-status="pending">Conectando a Puter…</span>
        <button class="ai-open-puter" onclick="openPuterApp()" title="Abrir Puter para iniciar sesión">Abrir Puter</button>
      </div>
      <div class="ai-header-actions">
        <button class="ai-control" id="aiExpand" title="Maximizar/Restaurar chat">⤢</button>
        <button class="ai-close" id="aiClose" title="Cerrar">×</button>
      </div>
    </div>

    <div class="ai-actions">
      <button class="action-btn" onclick="quickAction('plantilla')">➕ Nueva Plantilla</button>
      <button class="action-btn" onclick="quickAction('ayuda')">❓ Ayuda</button>
      <button class="action-btn" onclick="quickAction('contenido')">✨ Generar Contenido</button>
      <button class="action-btn" onclick="quickAction('explicar')">📚 Explicar Plantilla</button>
    </div>

    <div class="ai-messages" id="aiMessages">
      <div class="message system">
        ¡Hola! Soy ARKAIOS, tu asistente conectado a Puter. Ahora cuentas con funciones de guardado automático y exportación a PDF. ¿En qué puedo ayudarte? 😊
      </div>
    </div>

    <div class="typing-indicator" id="typingIndicator">
      <span></span><span></span><span></span>
    </div>

    <div class="ai-input-area">
      <input type="text" class="ai-input" id="aiInput" placeholder="Escribe tu mensaje o pregunta..." onkeypress="handleKeyPress(event)">
      <button class="ai-send" id="aiSend" onclick="sendMessage()">📤 Enviar</button>
    </div>
  </div>
`;

function injectAIWidget() {
  const container = document.createElement('div');
  container.innerHTML = AI_WIDGET_HTML;
  document.body.appendChild(container);
  initAIChat();
}

function initAIChat() {
  const aiButton = document.getElementById('aiButton');
  const aiPanel = document.getElementById('aiPanel');
  const aiClose = document.getElementById('aiClose');
  const aiExpand = document.getElementById('aiExpand');
  const aiInput = document.getElementById('aiInput');
  const aiSend = document.getElementById('aiSend');
  const aiMessages = document.getElementById('aiMessages');
  const aiStatus = document.getElementById('aiStatus');

  if (!aiButton || !aiPanel) return;

  // Toggle panel
  aiButton.addEventListener('click', () => {
    aiPanel.classList.add('active');
    aiButton.style.display = 'none';
    checkPuterConnection();
  });

  aiClose.addEventListener('click', () => {
    aiPanel.classList.remove('active');
    aiButton.style.display = 'flex';
  });

  // Expandir/Contraer
  aiExpand.addEventListener('click', () => {
    aiPanel.classList.toggle('fullscreen');
    aiExpand.classList.toggle('toggled');
  });

  // Enviar mensaje
  window.sendMessage = async () => {
    const text = aiInput.value.trim();
    if (!text) return;

    // Mostrar mensaje usuario
    addMessage(text, 'user');
    aiInput.value = '';

    // Mostrar typing
    const typing = document.getElementById('typingIndicator');
    typing.classList.add('active');
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
      // Llamada a Puter.ai
      if (window.puter) {
        const response = await puter.ai.chat(text);
        typing.classList.remove('active');
        addMessage(response, 'assistant');
      } else {
        throw new Error('Puter.js no está cargado');
      }
    } catch (err) {
      typing.classList.remove('active');
      addMessage('Error al conectar con la IA: ' + err.message, 'system');
      console.error(err);
    }
  };

  window.handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Acciones rápidas
  window.quickAction = (type) => {
    let text = '';
    switch (type) {
      case 'plantilla': text = 'Quiero crear una nueva plantilla escolar. ¿Qué me sugieres?'; break;
      case 'ayuda': text = '¿Cómo uso este sistema de plantillas?'; break;
      case 'contenido': text = 'Genera contenido educativo para una infografía sobre el ciclo del agua.'; break;
      case 'explicar': text = 'Explícame cómo funciona la plantilla actual.'; break;
    }
    aiInput.value = text;
    sendMessage();
  };
}

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  const messages = document.getElementById('aiMessages');
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function checkPuterConnection() {
  const status = document.getElementById('aiStatus');
  if (window.puter) {
    try {
      // Intento simple de verificar auth
      if (puter.auth.isSignedIn()) {
        status.textContent = 'Conectado a Puter';
        status.dataset.status = 'ready';
      } else {
        status.textContent = 'Sesión no iniciada';
        status.dataset.status = 'pending';
      }
    } catch (e) {
      status.textContent = 'Puter listo (Anónimo)';
      status.dataset.status = 'ready';
    }
  } else {
    status.textContent = 'Error de conexión';
    status.dataset.status = 'error';
  }
}

function openPuterApp() {
  window.open('https://puter.com', '_blank');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAIWidget);
} else {
  injectAIWidget();
}
