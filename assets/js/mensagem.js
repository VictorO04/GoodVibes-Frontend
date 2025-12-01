const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');

/* A variável 'mensagens' vem do arquivo dados.js */

function iniciar() {
    // ALTERAÇÃO: Começa vazio ou com uma mensagem de instrução
    containerMsg.innerHTML = '<p style="text-align:center; color:#666;">Digite algo acima para pesquisar as mensagens...</p>';
}

// Lógica do Botão BUSCAR
btnBuscar.onclick = () => {
    const termo = inputBuscar.value.toLowerCase();
    
    // 1. Se o campo estiver vazio, não faz nada ou avisa o usuário
    if (termo === "") {
        containerMsg.innerHTML = '<p>Por favor, digite algum termo para pesquisar.</p>';
        return; // Para a execução aqui
    }

    // 2. Se digitou algo, faz a busca
    const filtrados = mensagens.filter((u) => {
        const noTitulo = u.titulo && u.titulo.toLowerCase().includes(termo);
        const noConteudo = u.conteudo && u.conteudo.toLowerCase().includes(termo);
        const noTipo = u.tipo && u.tipo.toLowerCase().includes(termo);
        const noHumor = u.humor && u.humor.toLowerCase().includes(termo);

        return noTitulo || noConteudo || noTipo || noHumor;
    });
    
    mostrarLista(filtrados);
};

function mostrarLista(array) {
    containerMsg.innerHTML = ''; 

    if (!array || array.length === 0) {
        containerMsg.innerHTML = '<p>Nenhuma mensagem encontrada para essa busca.</p>';
        return;
    }

    array.forEach((u) => {
        const divPostIt = document.createElement('div');
        divPostIt.className = 'post-it'; 
        
        divPostIt.innerHTML = `
            <h3>${u.emoji} ${u.titulo}</h3>
            <p>${u.conteudo}</p>
            <div style="margin-top: 15px; border-top: 1px dashed rgba(0,0,0,0.1); padding-top: 5px;">
                <small><strong>Humor:</strong> ${u.humor}</small> <br>
                <small><strong>Tipo:</strong> ${u.tipo}</small>
            </div>
        `;
        
        containerMsg.appendChild(divPostIt);
    });
}

// Inicia a aplicação (mostrando apenas a instrução)
iniciar();