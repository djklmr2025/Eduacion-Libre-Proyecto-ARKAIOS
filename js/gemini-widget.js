/**
 * GEMINI-LAB FLOATING WIDGET - ARKAIOS Educativo
 * Chat IA embebido con catalogo dinamico de plantillas.
 */
(function () {
  'use strict';

  const GEMINI_URL = 'https://gemini-lab-nine.vercel.app/';
  const GEMINI_MODEL = 'gemini-2.0-flash';
  const GEMINI_KEY = 'AIzaSyDZTeHXVp4Rzd8tKerTMpbG_sND14xUHyY';
  const API_EP = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const TOOLS_EP = '/api/arkaios-tools';

  const FALLBACK_TEMPLATES = [
    { name: 'Carta MX - Indice + Texto', file: 'plantilla_escolar_carta_mx_autoajuste_y_areas_editables.html', section: 'Texto' },
    { name: 'Hoja Milimetrica', file: 'hoja_milimetrica_interactiva.html', section: 'Texto' },
    { name: 'Biografia Profesional', file: 'biografia_profesional.html', section: 'Texto' },
    { name: 'Fotos Infantiles 2.5x3 cm', file: 'generador-fotos-infantiles.html', section: 'Imagen' },
    { name: 'Buscador Google Imagenes', file: 'buscador-imagenes-educativo.html', section: 'Imagen' },
    { name: 'Pixabay Descarga Lote', file: 'pixabay-descargador-lote.html', section: 'Imagen' },
    { name: 'Circulos Jack Skellington', file: 'plantilla_circulos_jack.html', section: 'Imagen' },
    { name: 'Cuadros Imagenes v2', file: 'plantilla-cuadros-imagenes-v2.html', section: 'Imagen' },
    { name: 'Plantilla Imagenes v2', file: 'plantilla-imagenes-v2.html', section: 'Imagen' },
    { name: 'Generador IA Imagenes', file: 'generador-ia-imagenes.html', section: 'Imagen' },
    { name: 'Material Educativo Reutilizable', file: 'material-educativo-reutilizable.html', section: 'Biblioteca' },
    { name: 'Orquestador HTML+', file: 'orquestador-html-plus.html', section: 'Automatizacion IA' },
    { name: 'ELEMIA Panel', file: 'elemia-panel.html', section: 'Sistema' },
    { name: 'Portal Empresarial', file: 'portal-empresarial.html', section: 'Sistema' }
  ];

  const SYS_BASE = `Eres la IA asistente oficial de ARKAIOS - Sistema Educativo Profesional v3.0.
Tu nombre es Gemini ARKAIOS. Hablas en espanol, eres eficiente y muy preciso.

## CAPACIDADES TECNICAS
- Orientas al usuario hacia la plantilla correcta usando enlaces del proyecto.
- Explicas para que sirve cada plantilla y sugieres la mas adecuada segun la tarea.
- Todos los modulos pueden abrirse como paginas internas del proyecto.
- Si no puedes resolver algo aqui, sugiere abrir Gemini Lab completo: ${GEMINI_URL}

## INSTRUCCIONES DE COMPORTAMIENTO
- Respuestas cortas, directas y utiles.
- Si el usuario pide una plantilla, cita el nombre y la ruta.
- Si varias plantillas sirven, compara en una sola respuesta compacta.
- No inventes plantillas que no existan en el catalogo.
- Si detectas una pagina "detectada" pero no listada, aclara que existe en el repo aunque no este en el menu principal.`;

  let systemPrompt = `${SYS_BASE}\n\n## CATALOGO ACTUAL\n${renderCatalog(FALLBACK_TEMPLATES)}`;

  const CSS = `
#gw-orb{position:fixed;bottom:68px;right:16px;width:54px;height:54px;border-radius:50%;
  background:linear-gradient(135deg,#4f46e5,#7c3aed 55%,#2563eb);
  box-shadow:0 4px 20px rgba(79,70,229,.55);cursor:pointer;z-index:99998;
  display:flex;align-items:center;justify-content:center;
  border:2px solid rgba(255,255,255,.22);transition:transform .2s,box-shadow .2s;
  user-select:none;animation:gwP 3s ease-in-out infinite;}
#gw-orb:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(79,70,229,.8);}
@keyframes gwP{0%,100%{box-shadow:0 4px 20px rgba(79,70,229,.55);}50%{box-shadow:0 4px 32px rgba(124,58,237,.9);}}

#gw-panel{position:fixed;bottom:132px;right:16px;width:370px;height:560px;
  max-width:calc(100vw - 32px);max-height:calc(100vh - 160px);
  background:#0f0f1a;border-radius:16px;border:1px solid rgba(124,58,237,.4);
  box-shadow:0 16px 48px rgba(0,0,0,.65);z-index:99997;
  display:flex;flex-direction:column;overflow:hidden;
  transition:transform .25s cubic-bezier(.4,0,.2,1),opacity .25s;transform-origin:bottom right;}
#gw-panel.gwH{transform:scale(.85);opacity:0;pointer-events:none;}

#gw-hd{display:flex;align-items:center;justify-content:space-between;
  padding:11px 14px;background:linear-gradient(90deg,#4f46e5,#7c3aed);flex-shrink:0;}
.gwHL{display:flex;align-items:center;gap:8px;}
.gwT{font:700 13px/1 'Inter',sans-serif;color:#fff;letter-spacing:.4px;}
.gwS{font:400 10px/1 'Inter',sans-serif;color:rgba(255,255,255,.65);margin-top:3px;}
.gwBt{background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:8px;
  padding:4px 9px;cursor:pointer;font:500 11px 'Inter',sans-serif;
  display:flex;align-items:center;gap:4px;transition:background .15s;}
.gwBt:hover{background:rgba(255,255,255,.28);}
#gwHR{display:flex;gap:6px;}

#gw-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;
  scrollbar-width:thin;scrollbar-color:rgba(124,58,237,.3) transparent;}
#gw-msgs::-webkit-scrollbar{width:4px;}
#gw-msgs::-webkit-scrollbar-thumb{background:rgba(124,58,237,.3);border-radius:4px;}

.gwM{max-width:86%;padding:9px 12px;border-radius:12px;
  font:400 12.5px/1.55 'Inter',sans-serif;word-break:break-word;animation:gwFI .2s ease;}
@keyframes gwFI{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.gwM.bot{background:#1e1b4b;color:#c4b5fd;border-bottom-left-radius:4px;align-self:flex-start;}
.gwM.usr{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;
  border-bottom-right-radius:4px;align-self:flex-end;}
.gwM a{color:#a78bfa;}
.gwM code{background:rgba(124,58,237,.2);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:11px;}

.gwDot{display:flex;gap:4px;align-items:center;padding:10px 12px;
  background:#1e1b4b;border-radius:12px;border-bottom-left-radius:4px;align-self:flex-start;}
.gwDot span{width:7px;height:7px;border-radius:50%;background:#7c3aed;
  animation:gwD 1.2s ease-in-out infinite;}
.gwDot span:nth-child(2){animation-delay:.2s;}
.gwDot span:nth-child(3){animation-delay:.4s;}
@keyframes gwD{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}

#gw-ir{display:flex;gap:8px;padding:10px 12px;
  border-top:1px solid rgba(124,58,237,.2);flex-shrink:0;}
#gw-in{flex:1;background:#1a1a2e;border:1px solid rgba(124,58,237,.3);
  border-radius:10px;padding:8px 12px;color:#e2e8f0;
  font:400 12.5px 'Inter',sans-serif;resize:none;outline:none;
  transition:border-color .2s;min-height:38px;max-height:90px;}
#gw-in:focus{border-color:rgba(124,58,237,.75);}
#gw-in::placeholder{color:rgba(148,163,184,.45);}
#gw-sd{background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;
  border-radius:10px;padding:8px 13px;cursor:pointer;color:#fff;
  font-size:16px;transition:opacity .2s;flex-shrink:0;}
#gw-sd:hover{opacity:.85;}
#gw-sd:disabled{opacity:.4;cursor:not-allowed;}

#gw-tip{position:fixed;bottom:130px;right:16px;background:#1e1b4b;
  color:#c4b5fd;font:400 11px 'Inter',sans-serif;padding:6px 10px;
  border-radius:8px;pointer-events:none;opacity:0;transition:opacity .2s;
  white-space:nowrap;z-index:99996;border:1px solid rgba(124,58,237,.3);}
`;

  function renderCatalog(items) {
    return items.map((item) => {
      const listed = item.listed === false ? ' [detectada]' : '';
      return `- ${item.name} -> /${item.file} (${item.section || item.category || 'General'})${listed}`;
    }).join('\n');
  }

  function fmt(t) {
    return t
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  function bubble(text, role) {
    const d = document.createElement('div');
    d.className = `gwM ${role}`;
    d.innerHTML = fmt(text);
    return d;
  }

  async function refreshSystemPrompt() {
    try {
      const response = await fetch(TOOLS_EP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'list_templates' })
      });
      if (!response.ok) throw new Error('No se pudo cargar el catalogo');
      const data = await response.json();
      const templates = Array.isArray(data.templates) && data.templates.length
        ? data.templates
        : FALLBACK_TEMPLATES;
      systemPrompt = `${SYS_BASE}\n\n## CATALOGO ACTUAL\n${renderCatalog(templates)}`;
    } catch (error) {
      console.warn('[ARKAIOS] Widget usando catalogo fallback:', error.message);
    }
  }

  function build() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);

    const orb = document.createElement('div');
    orb.id = 'gw-orb';
    orb.title = 'Gemini IA - ARKAIOS';
    orb.innerHTML = `<svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.22)" stroke-width="1.5"/>
      <path d="M14 5.5l2.4 7.2H22l-5.5 4 2.1 6.5L14 19.5l-4.6 3.7 2.1-6.5L6 12.7h5.6L14 5.5z" fill="white"/>
    </svg>`;
    document.body.appendChild(orb);

    const tip = document.createElement('div');
    tip.id = 'gw-tip';
    tip.textContent = 'Gemini IA - ARKAIOS Educativo';
    document.body.appendChild(tip);

    const panel = document.createElement('div');
    panel.id = 'gw-panel';
    panel.classList.add('gwH');
    panel.innerHTML = `
      <div id="gw-hd">
        <div class="gwHL">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <path d="M14 4l2 6.5H23l-6 4.5 2.5 7L14 18l-5.5 4 2.5-7L5 10.5h7L14 4z" fill="white"/>
          </svg>
          <div><div class="gwT">Gemini IA · ARKAIOS</div><div class="gwS">Asistente educativo inteligente</div></div>
        </div>
        <div id="gwHR">
          <button class="gwBt" id="gw-ext">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
            Gemini Lab
          </button>
          <button class="gwBt" id="gw-cls">×</button>
        </div>
      </div>
      <div id="gw-msgs"></div>
      <div id="gw-ir">
        <textarea id="gw-in" rows="1" placeholder="Pregunta sobre ARKAIOS..."></textarea>
        <button id="gw-sd">➤</button>
      </div>`;
    document.body.appendChild(panel);

    const msgs = panel.querySelector('#gw-msgs');
    const inp = panel.querySelector('#gw-in');
    const btn = panel.querySelector('#gw-sd');
    let history = [];
    let busy = false;
    let opened = false;

    function welcome() {
      if (msgs.childElementCount) return;
      msgs.appendChild(bubble('Hola. Soy **Gemini ARKAIOS**.\n\nConozco las plantillas activas del repo educativo y puedo orientarte al modulo correcto. ¿Que necesitas crear?', 'bot'));
    }

    async function send(text) {
      if (busy || !text.trim()) return;
      busy = true;
      btn.disabled = true;
      msgs.appendChild(bubble(text, 'usr'));
      const dot = document.createElement('div');
      dot.className = 'gwDot';
      dot.innerHTML = '<span></span><span></span><span></span>';
      msgs.appendChild(dot);
      msgs.scrollTop = msgs.scrollHeight;
      history.push({ role: 'user', parts: [{ text }] });
      try {
        const r = await fetch(API_EP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: history,
            generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d && d.error && d.error.message ? d.error.message : 'Error API');
        const reply = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0]
          ? d.candidates[0].content.parts[0].text
          : '(sin respuesta)';
        history.push({ role: 'model', parts: [{ text: reply }] });
        dot.remove();
        msgs.appendChild(bubble(reply, 'bot'));
      } catch (e) {
        dot.remove();
        msgs.appendChild(bubble(`Error: ${e.message}\n\nAbre **Gemini Lab** con el boton de arriba para continuar.`, 'bot'));
      }
      msgs.scrollTop = msgs.scrollHeight;
      busy = false;
      btn.disabled = false;
      inp.focus();
    }

    orb.addEventListener('click', () => {
      opened = !opened;
      panel.classList.toggle('gwH', !opened);
      if (opened) {
        welcome();
        setTimeout(() => inp.focus(), 120);
      }
    });
    panel.querySelector('#gw-cls').addEventListener('click', () => {
      opened = false;
      panel.classList.add('gwH');
    });
    panel.querySelector('#gw-ext').addEventListener('click', () => window.open(GEMINI_URL, '_blank', 'noopener'));
    btn.addEventListener('click', () => {
      const t = inp.value.trim();
      if (t) {
        inp.value = '';
        send(t);
      }
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const t = inp.value.trim();
        if (t) {
          inp.value = '';
          send(t);
        }
      }
    });
    orb.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
    orb.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });

    refreshSystemPrompt();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', build)
    : build();
})();
