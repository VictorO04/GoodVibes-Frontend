const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const containerMsg = document.getElementById('msg');



function iniciar() {
    
    containerMsg.innerHTML = '<p style="text-align:center; color:#666;">Digite algo acima para pesquisar as mensagens...</p>';
}


btnBuscar.onclick = () => {
    const termo = inputBuscar.value.toLowerCase();
    
    
    if (termo === "") {
        containerMsg.innerHTML = '<p>Por favor, digite algum termo para pesquisar.</p>';
        return; 
    }


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
        `;
        
        containerMsg.appendChild(divPostIt);
    });
}


iniciar();