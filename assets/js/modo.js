
const btn = document.getElementById("btn-tema")
const header = document.getElementById("header")
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo) {
    header.classList.remove("claro", "escuro"); 
    header.classList.add(temaSalvo);
}









if (btn) {
    btn.addEventListener("click", () => {
        if (header.classList.contains("claro")) {
            header.classList.replace("claro", "escuro");
            localStorage.setItem("tema", "escuro"); 
        } else {
            header.classList.replace("escuro", "claro");
            localStorage.setItem("tema", "claro");
        }
    });
}



