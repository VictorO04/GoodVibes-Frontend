const upload = document.getElementById("upload")
const preview = document.getElementById("preview")
const headerAvatar = document.getElementById("headerAvatar")

const imagemSalva = localStorage.getItem("fotoPerfil")

if (imagemSalva) {
    if (preview) preview.src = imagemSalva
    if (headerAvatar) headerAvatar.src = imagemSalva
}

upload.addEventListener("change", () => {
    const file = upload.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result
            try {
                localStorage.setItem("fotoPerfil", base64)
            } catch (e) {
                // localStorage pode falhar em modos restritos
            }
            if (preview) preview.src = base64
            if (headerAvatar) headerAvatar.src = base64
        }
        reader.readAsDataURL(file)
    }
})
