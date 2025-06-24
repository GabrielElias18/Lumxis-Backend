// ======================================================
// 📤 RUTAS PARA GESTIÓN DE EGRESOS DE INVENTARIO
// ======================================================

const express = require("express");

// Importamos los controladores para egresos
const {
  createEgreso,
  getEgresos,
  updateEgreso,
  deleteEgreso
} = require("../controllers/egresoController");

// Middleware para verificar token del usuario
const { verificarToken } = require("../middleware/authMiddleware");

// Instanciamos el router de Express
const router = express.Router();

// ===============================================
// ➕ Registrar un nuevo egreso (salida del inventario)
// ===============================================
// Ruta: POST /api/egresos/
router.post("/", verificarToken, createEgreso);

// ===============================================
// 📄 Obtener todos los egresos del usuario autenticado
// ===============================================
// Ruta: GET /api/egresos/
router.get("/", verificarToken, getEgresos);

// ===============================================
// ✏️ Editar un egreso específico por ID
// ===============================================
// Ruta: PUT /api/egresos/:id
router.put("/:id", verificarToken, updateEgreso);

// ===============================================
// 🗑️ Eliminar un egreso específico por ID
// ===============================================
// Ruta: DELETE /api/egresos/:id
router.delete("/:id", verificarToken, deleteEgreso);

// Exportamos el router para ser utilizado en index.js
module.exports = router;
