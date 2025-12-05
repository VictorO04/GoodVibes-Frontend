
const btn = document.getElementById("btn-tema");
const header = document.getElementById("header");
const container = document.getElementById("container");

function aplicarTema(tema) {
    if (header) {
        header.classList.remove("claro", "escuro");
        header.classList.add(tema);
    }

    if (container) {
        container.classList.remove("white", "dark");
        if (tema === "claro") {
            container.classList.add("white");
        } else {
            container.classList.add("dark");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("temaHeader") || "claro";
    aplicarTema(temaSalvo);
});

if (btn) {
    btn.addEventListener("click", () => {
        const temaAtual = header.classList.contains("claro") ? "claro" : "escuro";
        const novoTema = temaAtual === "claro" ? "escuro" : "claro";
        localStorage.setItem("temaHeader", novoTema);
        aplicarTema(novoTema);
    });
}




