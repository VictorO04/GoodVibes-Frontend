const btn = document.getElementById("btn-modo")

btn.addEventListener("click", () => {
    if(body.classList.contains("claro")){
        body.classList.replace("claro","escuro");
         btn.textContent = "claro"
    }else{
         body.classList.replace("escuro", "claro");
        btnTema.textContent = "🌕";
    }
})