// Elementos da interface
const selectFiltro = document.getElementById('selectFiltro');
const btnBuscar = document.getElementById('btnBuscar');
const btnGetAll = document.getElementById('btnGetAll');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

// Mensagem inicial
function iniciar() {
    containerMsg.innerHTML = 'Selecione o filtro ou clique em "Ver todas as confissões"...';
}

// Renderização com animação
function renderizarMensagens(dados) {
    containerMsg.innerHTML = '';

    if (!dados || dados.length === 0) {
        containerMsg.innerHTML = 'Nenhuma confissão encontrada.';
        return;
    }

    let lista = Array.isArray(dados) ? dados : [dados];

    lista.forEach((confissao) => {
        const card = document.createElement('div');
        card.className = 'post-it';

        // build friendly names when available
    const autor = (confissao.remetente && (confissao.remetente.nome || confissao.remetente.username)) ? (confissao.remetente.nome || confissao.remetente.username) : 'Anônimo';
    const destinatario = (confissao.destinatario && (confissao.destinatario.nome || confissao.destinatario.username)) ? (confissao.destinatario.nome || confissao.destinatario.username) : 'Comunidade';

        card.innerHTML = `
            <h3>${autor} <small style="font-weight:400;color:#666">→ ${destinatario}</small></h3>
            <p style="margin:.4rem 0 .6rem;font-size:.95rem;color:#222"><strong>Tipo:</strong> ${confissao.tipoMensagem || 'Não informado'}</p>
            <p style="background:rgba(255,255,255,0.6);padding:10px;border-radius:8px;min-height:48px">${confissao.mensagem || 'Sem mensagem'}</p>
        `;

        // animação suave na entrada
        card.style.opacity = 0;
        card.style.transform = "scale(0.97)";
        containerMsg.appendChild(card);

        setTimeout(() => {
            card.style.transition = "0.25s cubic-bezier(.2,.9,.3,1)";
            card.style.opacity = 1;
            card.style.transform = "scale(1)";
        }, 60);
    });
}

// BUSCA
async function executarBusca() {
    const termo = inputBuscar.value;
    const filtro = selectFiltro.value;

    if (termo.trim() === '') {
        containerMsg.innerHTML = 'Digite algo para pesquisar.';
        return;
    }

    containerMsg.innerHTML = 'Carregando...';

    const dados = await carregarMensagens(termo, filtro);
    renderizarMensagens(dados);
}

// BUSCAR POR ID OU TIPO
async function carregarMensagens(termo, filtro) {
    try {
        let url;

        if (filtro === 'id') {
            url = `http://localhost:3000/confissoes/${termo}`;
        } else {
            url = `http://localhost:3000/confissoes/tipo/${encodeURIComponent(termo)}`;
        }

        const res = await fetch(url);

        if (res.status === 404) return [];

        const resposta = await res.json();

        const chavesPossíveis = ['confissoes', 'confissao', 'data', 'dados'];
        for (let key of chavesPossíveis) {
            if (resposta[key]) return resposta[key];
        }

        if (resposta.id) return [resposta];

        return [];
    } catch (e) {
        containerMsg.innerHTML = `Erro: ${e.message}`;
        return [];
    }
}

btnBuscar.addEventListener('click', executarBusca);
inputBuscar.addEventListener('keyup', (e) => e.key === 'Enter' && executarBusca());

// 🔥🔥🔥 GET ALL — LISTAR TODAS AS CONFISSÕES
async function getAllPizzas() {
    containerMsg.innerHTML = 'Carregando todas as confissões...';

    try {
        const res = await fetch("http://localhost:3000/confissoes");

        if (!res.ok) throw new Error(`Erro ao puxar dados: ${res.status}`);

        const resposta = await res.json();

        let dados =
            resposta.confissoes ||
            resposta.data ||
            resposta.dados ||
            resposta;

        renderizarMensagens(dados);
    } catch (e) {
        containerMsg.innerHTML = `Erro ao carregar: ${e.message}`;
    }
}

btnGetAll.addEventListener('click', getAllPizzas);

iniciar();

// Toggle confissoes list collapse/expand
const btnToggleList = document.getElementById('btnToggleList');
const confissoesBox = document.querySelector('.confissoes-box');
if (btnToggleList && confissoesBox) {
    btnToggleList.addEventListener('click', () => {
        const collapsed = confissoesBox.classList.toggle('collapsed');
        btnToggleList.textContent = collapsed ? 'Mostrar lista' : 'Ocultar lista';
    });
}
