import dados from "../data/dados.js"
const { mensagens } = dados;


const getAllmensagens = (req,res) => {
    let resultado = mensagens;

    res.status(200).json({
        total: resultado.length,
        mensagens:resultado
    })
}
const getAllByid = (req,res)=>{
    let id = req.params.id;
    id = parseInt(id)
    let resultado = mensagens;
    const msg = resultado.find(b => b.id === id)

    if(!msg){
        res.status(404).json({
            success:false,
            message:"Nenhuma mensagem foi encontrada com esse id"
        })
    }else{
        res.status(200).json ({
            total: resultado.length,
            mensagem:msg
        })
    }
}

export {getAllmensagens, getAllByid}
