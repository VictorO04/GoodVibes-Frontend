// Handler para o botão "Publicar" e lógica da página escrita.html

const btnPublicar = document.getElementById('btnPublicar');
const campoEscrita = document.getElementById('campo-escrita');
const pubStatus = document.getElementById('pubStatus');
const saveRemetenteBtn = document.getElementById('saveRemetenteBtn');

// --- 1. FUNÇÃO DE PUBLICAR ---
async function publicarMensagem(){
    if(!campoEscrita) return;
    const texto = campoEscrita.value.trim();
    const remetenteId = document.getElementById('remetenteId')?.value?.trim();
    const destinatarioId = document.getElementById('destinatarioId')?.value?.trim();
    const tipo = (document.getElementById('tipoMensagem')?.value || '').toString().trim();

    // Validações
    if(!texto){
        pubStatus.textContent = 'Digite uma mensagem antes de publicar.';
        pubStatus.style.color = '#b33';
        return;
    }
    if(!remetenteId || !destinatarioId){
        pubStatus.textContent = 'Informe seu ID e o ID do destinatário.';
        pubStatus.style.color = '#b33';
        return;
    }

    // Feedback visual
    btnPublicar.disabled = true;
    btnPublicar.textContent = 'Publicando...';
    pubStatus.textContent = '';

    try{
        const allowedTypes = ['romantica','amizade','motivacional','comedia','reflexiva'];
        const tipoNormalizado = tipo.toLowerCase();
        
        if(!allowedTypes.includes(tipoNormalizado)){
            pubStatus.textContent = 'Tipo inválido.';
            pubStatus.style.color = '#b33';
            btnPublicar.disabled = false;
            btnPublicar.textContent = 'Publicar';
            return;
        }

        const payload = {
            tipoMensagem: tipoNormalizado,
            mensagem: texto,
            remetenteId: parseInt(remetenteId),
            destinatarioId: parseInt(destinatarioId)
        };

        // Envio para o Backend
        const res = await fetch('http://localhost:3000/confissoes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const body = await res.text();
        let parsed;
        try{ parsed = JSON.parse(body); }catch(e){ parsed = body }

        if(!res.ok){
            let msg = '';
            if(parsed && typeof parsed === 'object' && parsed.mensagem) msg = parsed.mensagem;
            else msg = JSON.stringify(parsed);
            throw new Error(msg || `HTTP ${res.status}`);
        }

        // Sucesso
        pubStatus.style.color = '#177a5b';
        pubStatus.textContent = 'Mensagem publicada com sucesso!';
        
        // Limpar campo
        campoEscrita.value = '';

        // Renderizar a mensagem criada
        try{
            const created = parsed && typeof parsed === 'object' ? parsed : null;
            if(created) renderCreatedMessage(created);
        }catch(e){}

    }catch(err){
        console.error('Erro:', err);
        pubStatus.style.color = '#b33';
        pubStatus.textContent = 'Erro: ' + (err.message || 'Falha na rede');
    }finally{
        btnPublicar.disabled = false;
        btnPublicar.textContent = 'Publicar';
    }
}

// Adiciona o evento ao botão
if(btnPublicar) btnPublicar.addEventListener('click', publicarMensagem);

// --- 2. LÓGICA DE SALVAR ID (LocalStorage) ---
if(saveRemetenteBtn){
    saveRemetenteBtn.addEventListener('click', ()=>{
        const remet = document.getElementById('remetenteId')?.value?.trim();
        if(remet){
            localStorage.setItem('gv_userId', remet);
            pubStatus.style.color = '#177a5b';
            pubStatus.textContent = 'ID salvo.';
            setTimeout(()=>{ pubStatus.textContent = '' }, 2000);
        }
    });
}

// Carregar ID ao abrir a página
try{
    const saved = localStorage.getItem('gv_userId');
    if(saved){
        const inp = document.getElementById('remetenteId');
        if(inp && !inp.value) inp.value = saved;
    }
}catch(e){}

// Atalho Ctrl+Enter para publicar
if(campoEscrita){
    campoEscrita.addEventListener('keydown', (e)=>{
        if((e.ctrlKey || e.metaKey) && e.key === 'Enter') publicarMensagem();
    });
}

// --- 3. LÓGICA DO BOTÃO "OCULTAR INSPIRAÇÕES" ---
const togglePanelBtn = document.getElementById('togglePanel');
const painel = document.querySelector('aside.panel');
const gridContainer = document.querySelector('.write-grid'); // Seleciona o grid principal

if(togglePanelBtn && painel){
    togglePanelBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        
        // Alterna classe no painel (some)
        painel.classList.toggle('collapsed');
        
        // Alterna classe no grid (expande editor)
        if(gridContainer) gridContainer.classList.toggle('one-column');

        // Muda texto do botão
        const isHidden = painel.classList.contains('collapsed');
        togglePanelBtn.textContent = isHidden ? 'Mostrar Inspirações' : 'Ocultar Inspirações';
    });
}

// --- 4. RENDERIZAR MENSAGEM CRIADA ---
function renderCreatedMessage(confissao){
    const container = document.getElementById('ultimaMensagem');
    if(!container) return;

    // Se o painel estiver oculto, reabre ele para o usuário ver a mensagem nova
    if(painel && painel.classList.contains('collapsed')){
        painel.classList.remove('collapsed');
        if(gridContainer) gridContainer.classList.remove('one-column');
        togglePanelBtn.textContent = 'Ocultar Inspirações';
    }

    const autor = (confissao.remetente && (confissao.remetente.nome || confissao.remetente.username)) || confissao.remetenteId || 'Você';
    const destinatario = (confissao.destinatario && (confissao.destinatario.nome || confissao.destinatario.username)) || confissao.destinatarioId || 'Alguém';

    const card = document.createElement('div');
    card.className = 'post-it'; // Usa a classe CSS com animação
    card.style.animation = 'fadeIn 0.5s ease-out';

    card.innerHTML = `
        <div style="margin-bottom: 8px;">
            <span class="created-header">Mensagem Criada!</span>
        </div>
        <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">
            <strong>De:</strong> ${escapeHtml(autor)} <br>
            <strong>Para:</strong> ${escapeHtml(destinatario)}
        </div>
        <div class="created-body" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee;">
            ${escapeHtml(confissao.mensagem)}
        </div>
        <div style="font-size: 0.75rem; color: #999; margin-top: 10px; text-align: right;">
            Tipo: ${escapeHtml(confissao.tipoMensagem)}
        </div>
    `;

    container.style.display = 'block';
    container.innerHTML = ''; // Limpa anterior
    container.appendChild(card);
    
    // Scroll suave até a mensagem
    try{ container.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){}
}

function escapeHtml(str){
    if(!str) return '';
    return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]; });
}
// Função de Carregamento Global (para o avatar)
function carregarAvatarHeader() {
    const headerAvatar = document.getElementById('headerAvatar'); 
    if (!headerAvatar) return;

    const avatarURL = localStorage.getItem('usuarioAvatarURL');
    
    // Se encontrou a URL salva, usa ela. Senão, usa o SRC padrão do HTML.
    if (avatarURL) {
        headerAvatar.src = avatarURL;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. CARREGA AVATAR
    carregarAvatarHeader(); 

    // Elementos do formulário
    const remetenteIdInput = document.getElementById('remetenteId');
    const saveRemetenteBtn = document.getElementById('saveRemetenteBtn');
    const destinatarioIdInput = document.getElementById('destinatarioId');
    const tipoMensagemSelect = document.getElementById('tipoMensagem');
    const campoEscrita = document.getElementById('campo-escrita');
    const btnPublicar = document.getElementById('btnPublicar');
    const pubStatus = document.getElementById('pubStatus');
    const togglePanelBtn = document.getElementById('togglePanel');
    const inspiracaoPanel = document.querySelector('.panel');

    const API_URL = 'http://localhost:3000/confissoes'; // Ajuste conforme sua API

    // ===================================================
    // LÓGICA DE SALVAR/CARREGAR ID DO REMETENTE
    // ===================================================

    // Carregar ID salvo
    const savedRemetenteId = localStorage.getItem('remetenteIdSalvo');
    if (savedRemetenteId) {
        remetenteIdInput.value = savedRemetenteId;
    }

    // Ação de salvar ID
    saveRemetenteBtn.addEventListener('click', () => {
        const id = remetenteIdInput.value.trim();
        if (id) {
            localStorage.setItem('remetenteIdSalvo', id);
            pubStatus.innerText = 'ID Salvo! ✅';
            setTimeout(() => pubStatus.innerText = '', 3000);
        } else {
            pubStatus.innerText = 'Insira um ID válido.';
        }
    });
    
    // ===================================================
    // LÓGICA DE PUBLICAÇÃO
    // ===================================================
    
    btnPublicar.addEventListener('click', async () => {
        const mensagem = campoEscrita.value.trim();
        const remetenteId = remetenteIdInput.value.trim();
        const destinatarioId = destinatarioIdInput.value.trim();
        const tipoMensagem = tipoMensagemSelect.value;

        if (!mensagem || !remetenteId) {
            pubStatus.innerText = 'Preencha a mensagem e seu ID de remetente.';
            return;
        }

        pubStatus.innerText = 'Publicando... ⏳';
        btnPublicar.disabled = true;

        // Construção dos dados a serem enviados (ajuste os nomes das chaves conforme sua API)
        const payload = {
            // O ID do usuário que está escrevendo
            autorId: parseInt(remetenteId), 
            // O ID do usuário que irá receber (pode ser null/undefined se for para o mural geral)
            destinatarioId: destinatarioId ? parseInt(destinatarioId) : null,
            tipo: tipoMensagem,
            mensagem: mensagem,
            // Outros campos como 'anonimo: true' se necessário
        };

        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.message || `Erro de Servidor: ${resposta.status}`);
            }

            // Sucesso!
            pubStatus.innerText = 'Publicado com sucesso! 🎉';
            campoEscrita.value = ''; // Limpa o campo
            
        } catch (erro) {
            console.error('Erro na publicação:', erro);
            pubStatus.innerText = `Falha na publicação: ${erro.message}`;
            
        } finally {
            btnPublicar.disabled = false;
            setTimeout(() => pubStatus.innerText = '', 5000);
        }
    });

    // ===================================================
    // LÓGICA DO PAINEL DE INSPIRAÇÕES
    // ===================================================

    // Alternar visibilidade do painel lateral
    togglePanelBtn.addEventListener('click', () => {
        const isHidden = inspiracaoPanel.classList.toggle('hidden');
        if (isHidden) {
            togglePanelBtn.innerText = 'Mostrar Inspirações';
        } else {
            togglePanelBtn.innerText = 'Ocultar Inspirações';
        }
    });
    
    // Adiciona uma classe inicial se você quer que ele comece escondido
    // inspiracaoPanel.classList.add('hidden'); // Descomente se quiser começar escondido

});