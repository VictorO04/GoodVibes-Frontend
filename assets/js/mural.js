// Variável global para guardar os dados na memória do navegador
let listaGlobalConfissoes = [];

document.addEventListener('DOMContentLoaded', () => {
    const gridMural = document.getElementById('muralGrid');
    const loadingMsg = document.getElementById('loading-msg');
    const API_URL = 'http://localhost:3000/confissoes'; 

    async function buscarConfissoes() {
        try {
            const resposta = await fetch(API_URL);
            if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
            
            const dados = await resposta.json();
            
            // Salva na variável global para usarmos no modal depois
            listaGlobalConfissoes = dados.confissoes || []; 
            
            renderizarCards(listaGlobalConfissoes);

        } catch (erro) {
            console.error(erro);
            loadingMsg.innerText = "Erro ao carregar mensagens.";
        }
    }

    function renderizarCards(lista) {
        loadingMsg.style.display = 'none';
        gridMural.innerHTML = ''; 

        // Adicionei o parametro 'index' no forEach
        lista.forEach((item, index) => {
            const tipo = item.tipoMensagem || 'Geral';
            const classeCategoria = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            
            // TRATAMENTO DE NOMES
            const nomeRemetente = item.remetente?.nome || item.remetente?.username || 'Anônimo';
            const nomeDestinatario = item.destinatario?.nome || item.destinatario?.username || 'Alguém';
            const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');

            // Adicionei onclick="abrirModal(${index})" no card
            const cardHTML = `
                <div class="card" onclick="abrirModal(${index})" style="cursor: pointer;">
                    <div class="card-header">
                        <span class="tag ${classeCategoria}">${tipo.toUpperCase()}</span>
                        <span class="data">${dataFormatada}</span>
                    </div>
                    <div class="card-body">
                        <p class="mensagem">"${item.mensagem}"</p>
                    </div>
                    <div class="card-footer">
                        <p><strong>De:</strong> ${nomeRemetente}</p>
                        <p><strong>Para:</strong> ${nomeDestinatario}</p>
                    </div>
                </div>
            `;
            gridMural.innerHTML += cardHTML;
        });
    }

    buscarConfissoes();
});

// --- FUNÇÕES DO MODAL (FORA DO DOMContentLoaded PARA O HTML ENXERGAR) ---

function abrirModal(index) {
    // Pega o item específico da lista global usando o index
    const item = listaGlobalConfissoes[index];
    if (!item) return;

    // Preenche os dados no HTML do Modal
    document.getElementById('modal-tipo').innerText = item.tipoMensagem || 'GERAL';
    document.getElementById('modal-id').innerText = `ID: #${item.id}`;
    document.getElementById('modal-mensagem').innerText = `"${item.mensagem}"`;
    
    // Formata a data completa com hora
    const dataObj = new Date(item.data);
    document.getElementById('modal-data').innerText = dataObj.toLocaleString('pt-BR');

    // Preenche nomes e dados técnicos
    const nomeRemetente = item.remetente?.nome || 'Anônimo';
    const nomeDestinatario = item.destinatario?.nome || 'Alguém';
    
    document.getElementById('modal-remetente').innerText = nomeRemetente;
    document.getElementById('modal-destinatario').innerText = nomeDestinatario;
    
    // Dados técnicos (Debug)
    document.getElementById('modal-remetente-id').innerText = item.remetenteId;
    document.getElementById('modal-destinatario-id').innerText = item.destinatarioId;

    // Mostra o Modal (muda display de 'none' para 'flex')
    document.getElementById('modalDetalhes').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalDetalhes').style.display = 'none';
}

// Fecha o modal se clicar fora da caixinha branca
window.onclick = function(event) {
    const modal = document.getElementById('modalDetalhes');
    if (event.target == modal) {
        fecharModal();
    }
}