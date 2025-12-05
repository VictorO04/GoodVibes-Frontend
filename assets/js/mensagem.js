async function carregarMensagens(termo) {
    try {
        const termoCodificado = encodeURIComponent(termo);
        const res = await fetch(`http://localhost:3000/confissoes/tipo/${termoCodificado}`);
        
        if (!res.ok) throw new Error();
        
        const mensagens = await res.json();
        return mensagens;
    } catch (e) {
        console.error(e);
        return null;
    }
}

const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

function iniciar() {
    containerMsg.innerHTML = '<p style="text-align:center; color:#666;">Digite algo acima para pesquisar as mensagens...</p>';
}

function renderizarMensagens(array) {
    containerMsg.innerHTML = '';

    if (array === null) {
        containerMsg.innerHTML = '<p>Erro de conexão. Tente novamente.</p>';
        return;
    }

    if (!array || array.length === 0) {
        containerMsg.innerHTML = '<p>Nenhuma mensagem encontrada para essa busca.</p>';
        return;
    }

    array.forEach((u) => {
        const divPostIt = document.createElement('div');
        divPostIt.className = 'post-it';

        const p = document.createElement('p');
        p.textContent = u.mensagem;

        divPostIt.appendChild(p);
        containerMsg.appendChild(divPostIt);
    });
}

async function executarBusca() {
    const termo = inputBuscar.value;
    containerMsg.innerHTML = '<p>Carregando...</p>';
    const msgs = await carregarMensagens(termo);
    renderizarMensagens(msgs);
}

btnBuscar.onclick = executarBusca;

inputBuscar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executarBusca();
    }
});

iniciar();



