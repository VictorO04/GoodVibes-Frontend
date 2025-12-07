
const CONFIG = {
    API_URL: 'http://localhost:3000/confissoes'
};


const imgPreview = document.getElementById('preview');
const imgHeader = document.getElementById('headerAvatar');
const fileInput = document.getElementById('upload');
const inputId = document.getElementById('idUsuario');
const inputBio = document.getElementById('userBio');
const btnSalvar = document.getElementById('saveProfile');
const containerConfissoes = document.getElementById('userConfissoes');


const AVATAR_KEY = 'usuarioAvatarURL'; 


function iniciarPerfil() {
    
    const idSalvo = localStorage.getItem('usuario_id');
    const bioSalva = localStorage.getItem('usuario_bio');
    
    const fotoSalva = localStorage.getItem(AVATAR_KEY); 

    
    if (idSalvo) inputId.value = idSalvo;
    if (bioSalva) inputBio.value = bioSalva;
    
    
    if (fotoSalva) {
        if(imgPreview) imgPreview.src = fotoSalva;
        
        if(imgHeader) imgHeader.src = fotoSalva; 
    }

    
    carregarMinhasConfissoes(idSalvo);
}


if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const imagemBase64 = evt.target.result;
                if(imgPreview) imgPreview.src = imagemBase64;
                if(imgHeader) imgHeader.src = imagemBase64; 
                
                
                localStorage.setItem(AVATAR_KEY, imagemBase64); 
            };
            reader.readAsDataURL(file);
        }
    });
}


if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
        const idUser = inputId.value.trim(); 
        const bio = inputBio.value.trim();

        if (!idUser) {
            alert("Por favor, digite seu ID para carregar suas mensagens.");
            return;
        }

        
        localStorage.setItem('usuario_id', idUser);
        localStorage.setItem('usuario_bio', bio);
        

        
        const textoOriginal = btnSalvar.innerText;
        btnSalvar.innerText = "Salvo! ✅";
        btnSalvar.style.backgroundColor = "#4caf50";
        btnSalvar.style.color = "white";
        
        setTimeout(() => {
            btnSalvar.innerText = textoOriginal;
            btnSalvar.style.backgroundColor = "";
            btnSalvar.style.color = "";
            
            
            carregarMinhasConfissoes(idUser);
        }, 1500);
    });
}


async function carregarMinhasConfissoes(idUsuario) {
    if (!containerConfissoes) return;
    
    containerConfissoes.innerHTML = '<p style="text-align:center; padding:20px;">Buscando histórico...</p>';

    if (!idUsuario) {
        containerConfissoes.innerHTML = '<p style="text-align:center; opacity:0.7">Digite seu ID e salve para ver suas postagens.</p>';
        return;
    }

    try {
        const res = await fetch(CONFIG.API_URL);
        const dados = await res.json();
        
        let lista = [];
        if(Array.isArray(dados)) lista = dados;
        else if(dados.confissoes) lista = dados.confissoes;
        else if(dados.data) lista = dados.data;

        
        const minhasMensagens = lista.filter(item => {
            const busca = String(idUsuario);
            
            const itemId = String(item.id || item._id || '');
            const itemUserId = String(item.userId || item.user_id || '');
            const itemAutor = String(item.autor || '');

            return itemId === busca || itemUserId === busca || itemAutor === busca;
        });

        renderizarLista(minhasMensagens);

    } catch (error) {
        console.error("Erro ao buscar confissões:", error);
        containerConfissoes.innerHTML = '<p style="color:#ff6b6b; text-align:center">Erro ao conectar na API.</p>';
    }
}

function renderizarLista(lista) {
    containerConfissoes.innerHTML = '';

    if (lista.length === 0) {
        containerConfissoes.innerHTML = '<p style="text-align:center; opacity:0.6; padding:20px;">Nenhuma mensagem encontrada para este ID.</p>';
        return;
    }

    lista.forEach(item => {
        const div = document.createElement('div');
        div.className = 'mini-card'; 

        const dataRaw = item.createdAt || item.data || new Date();
        const dataFormatada = new Date(dataRaw).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
        });
        
        const texto = item.mensagem || item.texto || item.descricao || '';
        const idMsg = item.id || item._id || '';

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; opacity:0.7; font-size:0.8em; margin-bottom:5px;">
                <span>Data: ${dataFormatada}</span>
                <span>ID: #${idMsg}</span>
            </div>
            <p>${texto}</p>
        `;
        containerConfissoes.appendChild(div);
    });
}

iniciarPerfil();