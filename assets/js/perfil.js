const upload = document.getElementById("upload")
const preview = document.getElementById("preview")

const imagemSalva = localStorage.getItem("fotoPerfil")

if(imagemSalva){
    preview.src = imagemSalva
}

upload.addEventListener("change", () => {
    const file = upload.files[0]
    if(file){
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result
            localStorage.setItem("fotoPerfil", base64)
            preview.src = base64
        }
        reader.readAsDataURL(file)
    }
})
