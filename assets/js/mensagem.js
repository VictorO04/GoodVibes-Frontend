// Referências dos elementos de controle
const selectFiltro = document.getElementById('selectFiltro');
const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

// Helpers
function escapeHtml(str){
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(dateStr){
    if(!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleString();
}

// Inicialização
function iniciar(){
    if(!containerMsg) return;
    containerMsg.innerHTML = 'Selecione o filtro e digite para pesquisar...';
}

// Renderização das mensagens em cards organizados
function renderizarMensagens(dados){
    if(!containerMsg) return;
    containerMsg.innerHTML = '';

    if(!dados || (Array.isArray(dados) && dados.length === 0)){
        containerMsg.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        return;
    }

    const lista = Array.isArray(dados) ? dados : [dados];

    lista.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'post-it';

        const id = item.id || item._id || 'N/A';
        const tipo = item.tipoMensagem || item.tipo || 'Confissão';
        const texto = item.mensagem || item.descricao || item.texto || '';
    // não mostramos autor/destinatário por solicitação do design
    const data = item.createdAt || item.data || item.date || '';

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
                <span class="post-date">${escapeHtml(formatDate(data))}</span>
            </footer>
        `;

        // entrada animada
        card.style.opacity = 0;
        card.style.transform = 'translateY(8px) scale(0.98)';
        containerMsg.appendChild(card);

        setTimeout(()=>{
            card.style.transition = 'all 260ms cubic-bezier(.2,.9,.2,1)';
            card.style.opacity = 1;
            card.style.transform = 'translateY(0) scale(1)';
        }, 30);
    });
}

// Busca
async function executarBusca(){
    if(!inputBuscar || !containerMsg) return;
    const termo = inputBuscar.value;
    const tipoFiltro = selectFiltro?.value || 'tipo';

    if(termo.trim() === ''){
        containerMsg.innerHTML = 'Por favor, digite um termo de pesquisa.';
        return;
    }

    containerMsg.innerHTML = 'Carregando...';
    const msgs = await carregarMensagens(termo, tipoFiltro);
    renderizarMensagens(msgs);
}

async function carregarMensagens(termo, tipoFiltro){
    try{
        let url;
        if(tipoFiltro === 'id'){
            url = `http://localhost:3000/confissoes/${termo}`;
            console.log(`--> Buscando ID: ${termo}`);
        } else {
            url = `http://localhost:3000/confissoes/tipo/${encodeURIComponent(termo)}`;
            console.log(`--> Buscando TIPO: ${termo}`);
        }

        const res = await fetch(url);
        if(res.status === 404) return [];
        if(!res.ok) throw new Error(`Erro HTTP ${res.status}`);

        const body = await res.json();
        const validKeys = ['confissoes','confissao','dados','data'];
        for(let k of validKeys){
            if(body[k]) return body[k];
        }
        if(body.id || body._id) return [body];
        return [];
    } catch(e){
        console.error('Erro na requisição:', e);
        if(containerMsg) containerMsg.innerHTML = `🛑 Erro ao carregar dados: ${e.message}`;
        return [];
    }
}

// Eventos
if (!btnBuscar) console.warn("Elemento 'btnBuscar' não encontrado. Verifique o ID no HTML.");
else btnBuscar.addEventListener('click', executarBusca);

if (!inputBuscar) console.warn("Elemento 'inputBuscar' não encontrado. Verifique o ID no HTML.");
else inputBuscar.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') executarBusca(); });

iniciar();
