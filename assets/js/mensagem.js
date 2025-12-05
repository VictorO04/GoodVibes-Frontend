// Referências dos elementos de controle
const selectFiltro = document.getElementById('selectFiltro');
const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

// Funções de Inicialização e Renderização
function iniciar() {
    containerMsg.innerHTML = 'Selecione o filtro e digite para pesquisar...';
}

function renderizarMensagens(dados) {
    containerMsg.innerHTML = '';  // Limpa qualquer mensagem anterior

    if (!dados || dados.length === 0) {
        containerMsg.innerHTML = 'Nenhum resultado encontrado.';
        return;
    }

    let array = Array.isArray(dados) ? dados : [dados];  // Garante que o retorno seja sempre um array

    array.forEach((termo) => {
        const divPostIt = document.createElement('div');
        divPostIt.className = 'post-it';
        divPostIt.innerHTML = `*#${termo.id || 'N/A'}* • ${termo.tipoMensagem || 'Confissão'}
            "${termo.mensagem || 'Mensagem não disponível'}"`;
        containerMsg.appendChild(divPostIt);
    });
}

// Funções de Busca
async function executarBusca() {
    const termo = inputBuscar.value;
    const tipoFiltro = selectFiltro.value;

    if (termo.trim() === '') {
        containerMsg.innerHTML = 'Por favor, digite um termo de pesquisa.';
        return;
    }

    containerMsg.innerHTML = 'Carregando...';  // Exibe mensagem de carregamento
    const msgs = await carregarMensagens(termo, tipoFiltro);
    renderizarMensagens(msgs);
}

async function carregarMensagens(termo, tipoFiltro) {
    try {
        let url;

        if (tipoFiltro === 'id') {
            url = `http://localhost:3000/confissoes/${termo}`;
            console.log(`--> Buscando ID: ${termo}`);
        } else {
            const termoCodificado = encodeURIComponent(termo);
            url = `http://localhost:3000/confissoes/tipo/${termoCodificado}`;
            console.log(`--> Buscando TIPO: ${termo}`);
        }

        const res = await fetch(url);

        if (res.status === 404) return [];  // Caso não encontre, retorna um array vazio

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Erro HTTP ${res.status}:`, errorText);
            throw new Error(`Erro de Servidor: Status ${res.status}`);
        }

        const respostaBackend = await res.json();
        console.log("--> O QUE O BACKEND RESPONDEU:", respostaBackend);

        // Verifica as chaves de resposta possíveis
        const validKeys = ['confissoes', 'confissao', 'dados', 'data'];
        for (let key of validKeys) {
            if (respostaBackend[key]) {
                return respostaBackend[key];
            }
        }

        // Caso o backend envie um objeto único, retorna ele como um array
        if (respostaBackend.id) {
            return [respostaBackend]; 
        }

        return [];  // Retorna um array vazio caso nada válido seja encontrado

    } catch (e) {
        console.error("Erro na requisição:", e);
        containerMsg.innerHTML = `🛑 Erro ao carregar dados. Detalhes: ${e.message}`;
        return [];  // Retorna um array vazio em caso de erro
    }
}

// Vincula a função executarBusca ao clique do botão
if (!btnBuscar) throw new Error("Elemento 'btnBuscar' não encontrado. Verifique o ID no HTML.");
btnBuscar.addEventListener('click', executarBusca);

// Permite buscar ao pressionar "Enter" no campo de input
if (!inputBuscar) throw new Error("Elemento 'inputBuscar' não encontrado. Verifique o ID no HTML.");
inputBuscar.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        executarBusca();
    }
});

// Inicia a mensagem de boas-vindas
iniciar();
