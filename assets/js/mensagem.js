// 1. Pegamos a referência do novo Select
const selectFiltro = document.getElementById('selectFiltro'); // <--- NOVO
const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

function iniciar() {
    containerMsg.innerHTML = '<p style="text-align:center; color:#666;">Selecione o filtro e digite para pesquisar...</p>';
}

function renderizarMensagens(dados) {
    containerMsg.innerHTML = '';

    // 1. Verificações se veio vazio
    if (!dados) {
        containerMsg.innerHTML = '<p>Erro ou nenhuma mensagem encontrada.</p>';
        return;
    }

    // 2. Garante que seja sempre uma lista
    let array;
    if (Array.isArray(dados)) {
        array = dados;
    } else {
        array = [dados];
    }

    if (array.length === 0) {
        containerMsg.innerHTML = '<p>Nenhum resultado encontrado para essa busca.</p>';
        return;
    }

    // 3. Cria os Post-its
    array.forEach((termo) => {
        const divPostIt = document.createElement('div');
        divPostIt.className = 'post-it';

        // Estilização simples direto aqui (ou use seu CSS)
        // Aqui mostramos: O ID, O Tipo e A MENSAGEM PRINCIPAL
        divPostIt.innerHTML = `
            <div style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 0.8em; color: #555;">
                <strong>#${termo.id}</strong> • <span style="text-transform: uppercase;">${termo.tipoMensagem || 'Confissão'}</span>
            </div>
            
            <p style="font-size: 1.1em; font-weight: bold; color: #000;">
                "${termo.mensagem}"
            </p>
        `;

        containerMsg.appendChild(divPostIt);
    });
}
async function executarBusca() {
    const termo = inputBuscar.value;
    
    // Pegamos o valor escolhido no dropdown ('tipo' ou 'id')
    const tipoFiltro = selectFiltro.value; 

    if (termo.trim() === '') {
        alert("Digite algo para buscar!");
        return;
    }

    containerMsg.innerHTML = '<p>Carregando...</p>';
    
    // Passamos o termo e o tipo de filtro para a função
    const msgs = await carregarMensagens(termo, tipoFiltro);
    renderizarMensagens(msgs);
}

// Atualizamos a função para receber o tipoFiltro
async function carregarMensagens(termo, tipoFiltro) {
    try {
        let url;

        // 1. Define a URL correta
        if (tipoFiltro === 'id') {
            url = `http://localhost:3000/confissoes/${termo}`;
            console.log(`--> Buscando ID: ${termo}`);
        } else {
            const termoCodificado = encodeURIComponent(termo);
            url = `http://localhost:3000/confissoes/tipo/${termoCodificado}`;
            console.log(`--> Buscando TIPO: ${termo}`);
        }

        const res = await fetch(url);
        
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        
        const respostaBackend = await res.json();
        console.log("--> O QUE O BACKEND RESPONDEU:", respostaBackend); // Olhe aqui no F12 se der erro

        // 2. O DESEMBRULHO (A correção mágica) 
        // Verifica onde os dados reais estão escondidos dentro do pacote

        // Caso 1: Estão dentro de "confissoes" (Plural - comum na busca por tipo)
        if (respostaBackend.confissoes) {
            return respostaBackend.confissoes;
        }

        // Caso 2: Estão dentro de "confissao" (Singular - comum na busca por ID)
        if (respostaBackend.confissao) {
            return respostaBackend.confissao;
        }

        // Caso 3: O backend usa nomes genéricos como "dados" ou "data"
        if (respostaBackend.dados) return respostaBackend.dados;
        if (respostaBackend.data) return respostaBackend.data;

        // Caso 4: O backend já mandou os dados direto (sem envelope)
        // Verificamos se tem um ID ou uma mensagem real
        if (respostaBackend.id || (respostaBackend.mensagem && respostaBackend.tipoMensagem)) {
             return respostaBackend;
        }

        // Se chegou aqui, retornamos null ou lista vazia para não exibir o envelope errado
        return null;

    } catch (e) {
        console.error("Erro:", e);
        return null;
    }
}

iniciar();