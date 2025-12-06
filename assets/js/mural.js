// Variável global para guardar os dados na memória do navegador
let listaGlobalConfissoes = [];

document.addEventListener('DOMContentLoaded', () => {
    const gridMural = document.getElementById('muralGrid'); // Certifique-se que no HTML o ID é este, ou 'userConfissoes'
    const loadingMsg = document.getElementById('loading-msg'); // Se existir elemento de loading
    
    // Ajuste a URL conforme sua necessidade
    const API_URL = 'http://localhost:3000/confissoes'; 

    async function buscarConfissoes() {
        try {
            const resposta = await fetch(API_URL);
            if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
            
            const dados = await resposta.json();
            
            // Verifica se a API retornou um array direto ou um objeto { confissoes: [] }
            if (Array.isArray(dados)) {
                listaGlobalConfissoes = dados;
            } else {
                listaGlobalConfissoes = dados.confissoes || dados.data || [];
            }
            
            renderizarCards(listaGlobalConfissoes);

        } catch (erro) {
            console.error(erro);
            if(loadingMsg) loadingMsg.innerText = "Erro ao carregar mensagens.";
        }
    }

    function renderizarCards(lista) {
        if(loadingMsg) loadingMsg.style.display = 'none';
        
        // Se o grid não existir (pode ser outra página), para por aqui
        if(!gridMural) return;

        gridMural.innerHTML = ''; 

        if (lista.length === 0) {
            gridMural.innerHTML = '<p style="color:white; width:100%; text-align:center;">Nenhuma confissão encontrada.</p>';
            return;
        }

        lista.forEach((item, index) => {
            const tipo = item.tipoMensagem || item.tipo || 'Geral';
            // Cria uma classe CSS baseada no tipo (ex: "confissao", "elogio")
            const classeCategoria = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            
            // --- LÓGICA DE NOMES (Compatível com Tabela Usuario) ---
            let nomeRemetente = 'Anônimo';
            let nomeDestinatario = 'Geral';

            // 1. Tenta pegar do objeto 'autor' (Prisma)
            if (item.autor) {
                if (item.autor.anonimo === true) {
                    nomeRemetente = 'Anônimo 🕵️';
                } else {
                    nomeRemetente = item.autor.nomeUsuario || 'Anônimo';
                }
            } 
            // 2. Fallback para 'remetente' (caso sua API use esse nome)
            else if (item.remetente) {
                nomeRemetente = item.remetente.nome || item.remetente.username || 'Anônimo';
            }

            // 3. Tenta pegar do objeto 'destinatario'
            if (item.destinatario) {
                nomeDestinatario = item.destinatario.nomeUsuario || 'Geral';
            }
            // -------------------------------------------------------

            const dataObj = new Date(item.createdAt || item.data);
            const dataFormatada = isNaN(dataObj) ? 'Data inválida' : dataObj.toLocaleDateString('pt-BR');

            // Renderiza o HTML do Card
            // Note o onclick chamando a função global com o índice
            const cardHTML = `
                <div class="card" onclick="abrirModal(${index})" style="cursor: pointer;">
                    <div class="card-header">
                        <span class="tag ${classeCategoria}">${tipo.toUpperCase()}</span>
                        <span class="data">${dataFormatada}</span>
                    </div>
                    <div class="card-body">
                        <p class="mensagem">"${item.mensagem || item.texto}"</p>
                    </div>
                    <div class="card-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px; margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85em;">
                            <span style="color: #d35400;">👤 ${nomeRemetente}</span>
                            <span style="color: #8e44ad;">💌 ${nomeDestinatario}</span>
                        </div>
                    </div>
                </div>
            `;
            gridMural.innerHTML += cardHTML;
        });
    }

    buscarConfissoes();
});

// --- FUNÇÕES DO MODAL (GLOBAIS) ---

function abrirModal(index) {
    const item = listaGlobalConfissoes[index];
    if (!item) return;

    // --- REPETE A LÓGICA DE NOMES PARA O MODAL ---
    let nomeRemetente = 'Anônimo';
    let nomeDestinatario = 'Geral';

    if (item.autor) {
        if (item.autor.anonimo === true) nomeRemetente = 'Anônimo 🕵️';
        else nomeRemetente = item.autor.nomeUsuario || 'Anônimo';
    } else if (item.remetente) {
        nomeRemetente = item.remetente.nome || 'Anônimo';
    }

    if (item.destinatario) {
        nomeDestinatario = item.destinatario.nomeUsuario || 'Geral';
    }
    // ---------------------------------------------

    // Preenche os dados no HTML do Modal (Verifique se os IDs existem no seu HTML)
    const elTipo = document.getElementById('modal-tipo');
    if(elTipo) elTipo.innerText = item.tipoMensagem || item.tipo || 'GERAL';

    const elId = document.getElementById('modal-id');
    const itemId = item.id || item._id;
    if(elId) elId.innerText = `ID: #${itemId}`;

    const elMsg = document.getElementById('modal-mensagem');
    if(elMsg) elMsg.innerText = `"${item.mensagem || item.texto}"`;
    
    const elData = document.getElementById('modal-data');
    if(elData) {
        const d = new Date(item.createdAt || item.data);
        elData.innerText = d.toLocaleString('pt-BR');
    }

    // Preenche nomes
    const elRemetente = document.getElementById('modal-remetente');
    if(elRemetente) elRemetente.innerText = nomeRemetente;

    const elDestinatario = document.getElementById('modal-destinatario');
    if(elDestinatario) elDestinatario.innerText = nomeDestinatario;
    
    // IDs técnicos (Opcional, só se existirem no HTML)
    const elRemId = document.getElementById('modal-remetente-id');
    if(elRemId) elRemId.innerText = item.userId || item.autorId || '-';

    // Mostra o Modal
    const modal = document.getElementById('modalDetalhes');
    if(modal) {
        modal.style.display = 'flex'; // ou 'block', dependendo do seu CSS
        // Adiciona classe para animação se houver
        modal.classList.add('show');
    }
}

function fecharModal() {
    const modal = document.getElementById('modalDetalhes');
    if(modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

// Fecha ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modalDetalhes');
    if (event.target == modal) {
        fecharModal();
    }
}