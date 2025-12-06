// Função de Carregamento Global (para o avatar)
function carregarAvatarHeader() {
    const headerAvatar = document.getElementById('headerAvatar'); 
    if (!headerAvatar) return;

    const avatarURL = localStorage.getItem('usuarioAvatarURL');
    
    // Se encontrou a URL salva, usa ela. Senão, usa o SRC padrão do HTML.
    if (avatarURL) {
        headerAvatar.src = avatarURL;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. CARREGA AVATAR
    carregarAvatarHeader(); 

    // Elementos do formulário
    const remetenteIdInput = document.getElementById('remetenteId');
    const saveRemetenteBtn = document.getElementById('saveRemetenteBtn');
    const destinatarioIdInput = document.getElementById('destinatarioId');
    const tipoMensagemSelect = document.getElementById('tipoMensagem');
    const campoEscrita = document.getElementById('campo-escrita');
    const btnPublicar = document.getElementById('btnPublicar');
    const pubStatus = document.getElementById('pubStatus');
    const togglePanelBtn = document.getElementById('togglePanel');
    const inspiracaoPanel = document.querySelector('.panel');

    const API_URL = 'http://localhost:3000/confissoes'; // Ajuste conforme sua API

    // ===================================================
    // LÓGICA DE SALVAR/CARREGAR ID DO REMETENTE
    // ===================================================

    // Carregar ID salvo
    const savedRemetenteId = localStorage.getItem('remetenteIdSalvo');
    if (savedRemetenteId) {
        remetenteIdInput.value = savedRemetenteId;
    }

    // Ação de salvar ID
    saveRemetenteBtn.addEventListener('click', () => {
        const id = remetenteIdInput.value.trim();
        if (id) {
            localStorage.setItem('remetenteIdSalvo', id);
            pubStatus.innerText = 'ID Salvo! ✅';
            setTimeout(() => pubStatus.innerText = '', 3000);
        } else {
            pubStatus.innerText = 'Insira um ID válido.';
        }
    });
    
    // ===================================================
    // LÓGICA DE PUBLICAÇÃO
    // ===================================================
    
    btnPublicar.addEventListener('click', async () => {
        const mensagem = campoEscrita.value.trim();
        const remetenteId = remetenteIdInput.value.trim();
        const destinatarioId = destinatarioIdInput.value.trim();
        const tipoMensagem = tipoMensagemSelect.value;

        if (!mensagem || !remetenteId) {
            pubStatus.innerText = 'Preencha a mensagem e seu ID de remetente.';
            return;
        }

        pubStatus.innerText = 'Publicando... ⏳';
        btnPublicar.disabled = true;

        // Construção dos dados a serem enviados (ajuste os nomes das chaves conforme sua API)
        const payload = {
            // O ID do usuário que está escrevendo
            autorId: parseInt(remetenteId), 
            // O ID do usuário que irá receber (pode ser null/undefined se for para o mural geral)
            destinatarioId: destinatarioId ? parseInt(destinatarioId) : null,
            tipo: tipoMensagem,
            mensagem: mensagem,
            // Outros campos como 'anonimo: true' se necessário
        };

        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.message || `Erro de Servidor: ${resposta.status}`);
            }

            // Sucesso!
            pubStatus.innerText = 'Publicado com sucesso! 🎉';
            campoEscrita.value = ''; // Limpa o campo
            
        } catch (erro) {
            console.error('Erro na publicação:', erro);
            pubStatus.innerText = `Falha na publicação: ${erro.message}`;
            
        } finally {
            btnPublicar.disabled = false;
            setTimeout(() => pubStatus.innerText = '', 5000);
        }
    });

    // ===================================================
    // LÓGICA DO PAINEL DE INSPIRAÇÕES
    // ===================================================

    // Alternar visibilidade do painel lateral
    togglePanelBtn.addEventListener('click', () => {
        const isHidden = inspiracaoPanel.classList.toggle('hidden');
        if (isHidden) {
            togglePanelBtn.innerText = 'Mostrar Inspirações';
        } else {
            togglePanelBtn.innerText = 'Ocultar Inspirações';
        }
    });
    
    // Adiciona uma classe inicial se você quer que ele comece escondido
    // inspiracaoPanel.classList.add('hidden'); // Descomente se quiser começar escondido

});