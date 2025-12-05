// Elementos da interface
const selectFiltro = document.getElementById('selectFiltro');
const btnBuscar = document.getElementById('btnBuscar');
const btnGetAll = document.getElementById('btnGetAll');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

// Mensagem inicial
function iniciar() {
    containerMsg.innerHTML = 'Selecione o filtro ou clique em "Ver todas as Pizzas"...';
}

// Renderização com animação
function renderizarMensagens(dados) {
    containerMsg.innerHTML = '';

    if (!dados || dados.length === 0) {
        containerMsg.innerHTML = 'Nenhuma pizza encontrada.';
        return;
    }

    let lista = Array.isArray(dados) ? dados : [dados];

    lista.forEach((pizza) => {
        const card = document.createElement('div');
        card.className = 'post-it';

        card.innerHTML = `
            <h3>🍕 Pizza #${pizza.id}</h3>
            <p><strong>Tipo:</strong> ${pizza.tipoMensagem || 'Não informado'}</p>
            <p><strong>Descrição:</strong> ${pizza.mensagem || 'Sem descrição'}</p>
            <p><strong>Autor:</strong> ${pizza.remetente?.nome || 'Desconhecido'}</p>
            <p><strong>Destinatário:</strong> ${pizza.destinatario?.nome || 'Anonimo'}</p>
        `;

        // animação suave na entrada
        card.style.opacity = 0;
        card.style.transform = "scale(0.9)";
        containerMsg.appendChild(card);

        setTimeout(() => {
            card.style.transition = "0.3s";
            card.style.opacity = 1;
            card.style.transform = "scale(1)";
        }, 80);
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
    containerMsg.innerHTML = 'Carregando todas as pizzas...';

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
