// --- CONFIGURAÇÃO ---
const CONFIG = {
    API_URL: 'http://localhost:3000/confissoes'
};

// --- ELEMENTOS DO DOM ---
const imgPreview = document.getElementById('preview');
const imgHeader = document.getElementById('headerAvatar');
const fileInput = document.getElementById('upload');
const inputId = document.getElementById('idUsuario'); // Mudou de inputNome para inputId
const inputBio = document.getElementById('userBio');
const btnSalvar = document.getElementById('saveProfile');
const containerConfissoes = document.getElementById('userConfissoes');

// --- 1. FUNÇÃO INICIAL: CARREGAR DADOS ---
function iniciarPerfil() {
    // Recupera dados salvos (Agora buscamos o ID)
    const idSalvo = localStorage.getItem('usuario_id');
    const bioSalva = localStorage.getItem('usuario_bio');
    const fotoSalva = localStorage.getItem('fotoPerfil');

    // Preenche os inputs
    if (idSalvo) inputId.value = idSalvo;
    if (bioSalva) inputBio.value = bioSalva;
    
    // Atualiza fotos
    if (fotoSalva) {
        if(imgPreview) imgPreview.src = fotoSalva;
        if(imgHeader) imgHeader.src = fotoSalva;
    }

    // Busca as mensagens usando o ID salvo
    carregarMinhasConfissoes(idSalvo);
}

// --- 2. UPLOAD DE FOTO ---
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                const imagemBase64 = evt.target.result;
                if(imgPreview) imgPreview.src = imagemBase64;
                if(imgHeader) imgHeader.src = imagemBase64;
                localStorage.setItem('fotoPerfil', imagemBase64);
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- 3. SALVAR PERFIL ---
if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
        const idUser = inputId.value.trim(); // Pega o ID
        const bio = inputBio.value.trim();

        if (!idUser) {
            alert("Por favor, digite seu ID para carregar suas mensagens.");
            return;
        }

        // Salva no LocalStorage com a nova chave 'usuario_id'
        localStorage.setItem('usuario_id', idUser);
        localStorage.setItem('usuario_bio', bio);

        // Feedback Visual
        const textoOriginal = btnSalvar.innerText;
        btnSalvar.innerText = "Salvo! ✅";
        btnSalvar.style.backgroundColor = "#4caf50";
        btnSalvar.style.color = "white";
        
        setTimeout(() => {
            btnSalvar.innerText = textoOriginal;
            btnSalvar.style.backgroundColor = "";
            btnSalvar.style.color = "";
            
            // Recarrega lista com o novo ID
            carregarMinhasConfissoes(idUser);
        }, 1500);
    });
}

// --- 4. BUSCAR CONFISSÕES PELO ID ---
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

        // --- FILTRO POR ID ---
        const minhasMensagens = lista.filter(item => {
            // Convertemos tudo para String para evitar erro de (10 === "10")
            const busca = String(idUsuario);
            
            // Verifica se o ID bate com:
            // 1. O ID da mensagem (se o usuário quiser ver uma msg especifica)
            // 2. O campo 'userId' (se existir no banco)
            // 3. O campo 'autor' (caso você tenha salvado o ID no lugar do nome do autor)
            
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