import express from "express";
import { getAllmensagens,getAllByid } from "./../controllers/mensagensControllers.js";

const router = express.Router();

router.get("/",getAllmensagens)
router.get("/:id",getAllByid)


export default router