const express = require("express");
const {
  createEgreso,
  getEgresos,
  getEgresoById,
  updateEgreso,
  deleteEgreso
} = require("../controllers/egresoController");
const { verificarToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Registrar egreso (soporta uno o muchos items)
router.post("/", verificarToken, createEgreso);

// Obtener todos los egresos
router.get("/", verificarToken, getEgresos);

// Obtener un egreso por ID
router.get("/:id", verificarToken, getEgresoById);

// Actualizar egreso (PATCH)
router.patch("/:id", verificarToken, updateEgreso);

// Eliminar egreso
router.delete("/:id", verificarToken, deleteEgreso);

module.exports = router;
