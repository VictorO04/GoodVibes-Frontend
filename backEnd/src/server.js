import express from "express";
import dotenv from "dotenv";
import mensagensRotes from "./../src/routes/mensagensRoutes.js"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carregar variáveis de ambiente e definir constante para porta do servidor
dotenv.config();
const serverPort = process.env.PORT || 3001;

// Rota principal GET para "/"
app.get("/", (req, res) => {
    res.send("🚀 Servidor funcionando...");
});


app.use("/mensagens",mensagensRotes)


app.listen(serverPort, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${serverPort} 🚀`);
});


