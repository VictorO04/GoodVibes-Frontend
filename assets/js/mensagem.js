import getAllByid from "../../backEnd/src/controllers/mensagensControllers.js"
const blocoCentral = document.getElementById("bloco-central");



async function preencherPostIts(getAllByid) {
    let postItMensagem = `<div class="post-it">
    <p class="texto">${getAllByid[0].conteudo}</p>
    </div>`
    
    blocoCentral.appendChild(postItMensagem);
    };

