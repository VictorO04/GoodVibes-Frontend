// --- CONFIGURAÇÃO ---
const API_URL = 'http://localhost:3000/confissoes';

// Variável Global
let todasMensagens = [];

// Elementos
const listaMensagensContainer = document.getElementById('msg');
const selectFiltro = document.getElementById('selectFiltro');
const inputBuscar = document.getElementById('inputBuscar');
const btnBuscar = document.getElementById('btnBuscar');

// Helper: Avatar no Header
function carregarAvatarHeader() {
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        const avatarURL = localStorage.getItem('usuarioAvatarURL');
        if (avatarURL) headerAvatar.src = avatarURL;
    }
}

// Helper: Formatar Data
function formatarData(dataRaw) {
    const data = new Date(dataRaw);
    if (isNaN(data)) return '--/--/----';
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
}

// ===================================================
// LÓGICA DO MODAL
// ===================================================
function abrirModal(item) {
    if (!item) return;

    let nomeRemetente = item.autor ? (item.autor.anonimo ? 'Anônimo 🕵️' : item.autor.nomeUsuario) : (item.remetente?.nome || 'Anônimo');
    let nomeDestinatario = item.destinatario ? item.destinatario.nomeUsuario : (item.destinatario?.nome || 'Geral');

    document.getElementById('modal-tipo').innerText = (item.tipo || 'Geral').toUpperCase();
    document.getElementById('modal-id').innerText = `ID: #${item.id || item._id}`;
    document.getElementById('modal-mensagem').innerText = `"${item.mensagem || item.texto}"`;
    document.getElementById('modal-data').innerText = formatarData(item.createdAt || item.data);
    document.getElementById('modal-remetente').innerText = nomeRemetente;
    document.getElementById('modal-destinatario').innerText = nomeDestinatario;

    const modal = document.getElementById('modalDetalhes');
    if(modal) modal.style.display = 'flex';
}

window.fecharModal = function() {
    const modal = document.getElementById('modalDetalhes');
    if(modal) modal.style.display = 'none';
};

// ===================================================
// RENDERIZAÇÃO (GERA OS CARDS)
// ===================================================
function renderizarMensagens(lista) {
    if (!listaMensagensContainer) return;
    listaMensagensContainer.innerHTML = ''; 

    if (lista.length === 0) {
        listaMensagensContainer.innerHTML = '<div class="aviso-vazio">🔍 Nenhuma mensagem encontrada.</div>';
        return;
    }

    lista.forEach(item => {
        const tipo = item.tipoMensagem || item.tipo || 'Geral';
        // Cria classe para cor da tag (ex: tag-romantica)
        const classeTipo = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        
        let nomeRemetente = item.autor ? (item.autor.anonimo ? 'Anônimo' : item.autor.nomeUsuario) : 'Anônimo';
        let nomeDestinatario = item.destinatario ? item.destinatario.nomeUsuario : 'Geral';

        const card = document.createElement('div');
        card.className = 'card-mensagem glass-effect'; // Adiciona classe glass
        
        // Passa o objeto inteiro para o modal
        card.onclick = () => abrirModal(item);

        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${classeTipo}">${tipo.toUpperCase()}</span>
                <span class="card-id">#${item.id || item._id}</span>
            </div>
            <div class="card-body">
                <p>"${item.mensagem || item.texto}"</p>
            </div>
            <div class="card-footer">
                <div class="user-info">
                    <span class="user-from">👤 ${nomeRemetente}</span>
                    <span class="user-to">❤️ ${nomeDestinatario}</span>
                </div>
            </div>
        `;
        
        listaMensagensContainer.appendChild(card);
    });
}

// ===================================================
// BUSCA (CORRIGIDA)
// ===================================================
function realizarBusca() {
    const filtro = selectFiltro.value; 
    const termo = inputBuscar.value.trim().toLowerCase();

    if (!termo) {
        renderizarMensagens(todasMensagens);
        return;
    }

    const resultados = todasMensagens.filter(item => {
        const termoString = String(termo);

        // BUSCA POR TIPO
        if (filtro === 'tipo') {
            const itemTipo = String(item.tipo || item.tipoMensagem || '').toLowerCase();
            return itemTipo.includes(termoString);
        } 
        
        // BUSCA POR ID DA MENSAGEM (ESTRITA)
        // Isso corrige o problema de aparecer o 66 quando busca 67
        else if (filtro === 'id') {
            const idMsg = String(item.id || item._id || '');
            return idMsg === termoString; 
        }
        
        return false;
    });
    
    renderizarMensagens(resultados);
}

// ===================================================
// CARREGAMENTO E INICIALIZAÇÃO
// ===================================================
async function carregarTodasMensagens() {
    listaMensagensContainer.innerHTML = '<p style="color:white; text-align:center">Carregando...</p>';
    try {
        const res = await fetch(API_URL);
        const dados = await res.json();
        
        let lista = [];
        if(Array.isArray(dados)) lista = dados;
        else if(dados.confissoes) lista = dados.confissoes;
        else if(dados.data) lista = dados.data;

        todasMensagens = lista.sort((a, b) => (b.id || 0) - (a.id || 0));
        renderizarMensagens(todasMensagens);
    } catch (error) {
        console.error(error);
        listaMensagensContainer.innerHTML = '<p style="color:white; text-align:center">Erro ao conectar.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarAvatarHeader(); 
    carregarTodasMensagens(); 

    if (btnBuscar) btnBuscar.addEventListener('click', realizarBusca);
    if (inputBuscar) inputBuscar.addEventListener('keypress', (e) => { if (e.key === 'Enter') realizarBusca(); });

    const modal = document.getElementById('modalDetalhes');
    if (modal) window.onclick = (e) => { if (e.target == modal) fecharModal(); }
});