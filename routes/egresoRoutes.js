const express = require("express");
const { createEgreso, getEgresos, updateEgreso, deleteEgreso } = require("../controllers/egresoController");
const { verificarToken } = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Registrar un egreso
router.post("/", verificarToken, createEgreso);

// 📌 Obtener todos los egresos del usuario
router.get("/", verificarToken, getEgresos);

// 📌 Editar un egreso
router.put("/:id", verificarToken, updateEgreso);

// 📌 Eliminar un egreso
router.delete("/:id", verificarToken, deleteEgreso);

module.exports = router;
