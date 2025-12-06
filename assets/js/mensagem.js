// --- CONFIGURAÇÃO ---
const CONFIG = {
    API_URL: 'http://localhost:3000',
    ANIMATION_DELAY: 100 // ms entre cada card
};

// --- ELEMENTOS ---
const selectFiltro = document.getElementById('selectFiltro');
const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

// --- HELPERS ---
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    // Força o padrão brasileiro dia/mês/ano hora:minuto
    if (isNaN(d)) return dateStr;
    return d.toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
}

// --- CORE ---
function iniciar() {
    if (!containerMsg) return;
    containerMsg.innerHTML = '<div class="empty-state">Selecione o filtro e digite para pesquisar...</div>';
}

function renderizarMensagens(dados) {
    if (!containerMsg) return;
    containerMsg.innerHTML = '';

    if (!dados || (Array.isArray(dados) && dados.length === 0)) {
        containerMsg.innerHTML = '<div class="empty-state"><p>🔍 Nenhum resultado encontrado.</p></div>';
        return;
    }

    const lista = Array.isArray(dados) ? dados : [dados];

    lista.forEach((item, i) => {
        const card = document.createElement('article');
        card.className = 'post-it';

        // Tratamento de dados para o Card
        const id = item.id || item._id || 'N/A';
        const tipo = item.tipoMensagem || item.tipo || 'Confissão';
        const texto = item.mensagem || item.descricao || item.texto || '';
        const dataRaw = item.createdAt || item.data || item.date || '';
        
        // --- 🆕 DADOS EXTRAS PARA O CLIQUE ---
        // Tenta pegar autor/destinatário, se não tiver, coloca 'Não informado'
        const autor = item.autor || item.remetente || 'Anônimo'; 
        const destinatario = item.destinatario || 'Geral';
        const curso = item.curso || '';
        const dataFormatada = formatDate(dataRaw);

        card.innerHTML = `
            <header class="post-header">
                <div class="post-left">
                    <span class="post-type">${escapeHtml(tipo)}</span>
                    <span class="post-id">#${escapeHtml(id)}</span>
                </div>
            </header>
            <div class="post-body">
                <p class="post-text">${escapeHtml(texto)}</p>
            </div>
            <footer class="post-meta">
                <span class="post-date">${escapeHtml(dataFormatada)}</span>
            </footer>
        `;

        // --- 👇 AQUI ESTÁ A MUDANÇA NO ALERTA 👇 ---
        card.addEventListener('click', () => {
            // Montamos um texto com quebras de linha (\n) para ficar organizado
            const detalhes = `
📋 DETALHES DA CONFISSÃO #${id}
--------------------------------
📅 Data: ${dataFormatada}
🏷️ Tipo: ${tipo}
👤 De: ${autor} ${curso ? '('+curso+')' : ''}
💌 Para: ${destinatario}
--------------------------------
💬 MENSAGEM:
"${texto}"
            `;
            
            alert(detalhes);
        });
        // ----------------------------------------------

        // Animação e inserção no DOM
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        
        containerMsg.appendChild(card);

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50 + (i * CONFIG.ANIMATION_DELAY)); 
    });
}

// --- BUSCA ---
async function executarBusca() {
    if (!inputBuscar || !containerMsg) return;
    const termo = inputBuscar.value.trim();
    const tipoFiltro = selectFiltro?.value || 'tipo';

    if (termo === '') {
        containerMsg.innerHTML = '<p>Por favor, digite um termo de pesquisa.</p>';
        return;
    }

    containerMsg.innerHTML = '<div class="loading">Carregando mensagens...</div>';
    btnBuscar.disabled = true;
    
    try {
        const msgs = await carregarMensagens(termo, tipoFiltro);
        renderizarMensagens(msgs);
    } finally {
        btnBuscar.disabled = false;
    }
}

async function carregarMensagens(termo, tipoFiltro) {
    try {
        let endpoint = (tipoFiltro === 'id') 
            ? `/confissoes/${encodeURIComponent(termo)}`
            : `/confissoes/tipo/${encodeURIComponent(termo)}`;
            
        const url = `${CONFIG.API_URL}${endpoint}`;
        console.log(`--> Buscando: ${url}`);

        const res = await fetch(url);
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

        const body = await res.json();
        
        const validKeys = ['confissoes', 'confissao', 'dados', 'data'];
        for (let k of validKeys) {
            if (body[k]) return body[k];
        }
        if (body.id || body._id) return [body];
        if (Array.isArray(body)) return body;

        return [];
    } catch (e) {
        console.error('Erro na requisição:', e);
        if (containerMsg) containerMsg.innerHTML = `<div class="error">🛑 Erro ao carregar dados: ${e.message}</div>`;
        return [];
    }
}

// --- EVENTOS ---
if (btnBuscar) btnBuscar.addEventListener('click', executarBusca);
if (inputBuscar) inputBuscar.addEventListener('keyup', (e) => { 
    if (e.key === 'Enter') executarBusca(); 
});

iniciar();