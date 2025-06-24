// ======================================================
// 🔐 RUTAS DE AUTENTICACIÓN Y AUTORIZACIÓN
// ======================================================

const express = require('express');

// Importamos los controladores de autenticación
const { registerUser, loginUser } = require('../controllers/authController');

// Importamos middlewares para verificar token y rol
const { verificarToken, verificarAdministrador } = require('../middleware/authMiddleware');

const router = express.Router(); // Creamos el router

// ===============================================
// 📝 REGISTRO PÚBLICO (solo para vendedores)
// ===============================================
// Esta ruta permite que un nuevo usuario (vendedor) se registre sin autenticación previa
router.post('/register-public', registerUser);

// ===============================================
// 🛡️ REGISTRO PRIVADO (solo administradores)
// ===============================================
// Solo usuarios con token válido y rol de administrador pueden registrar otros usuarios
router.post('/register-admin', verificarToken, verificarAdministrador, registerUser);

// ===============================================
// 🔑 LOGIN DE USUARIOS
// ===============================================
// Ruta pública para autenticación (retorna token si es correcto)
router.post('/login', loginUser);

// ===============================================
// 👤 PERFIL DE USUARIO (protegido)
// ===============================================
// Solo usuarios autenticados pueden acceder a esta ruta
router.get('/perfil', verificarToken, (req, res) => {
  res.status(200).json({
    mensaje: 'Ruta protegida accedida con éxito',
    usuario: req.usuario // El usuario fue añadido por el middleware verificarToken
  });
});

// ===============================================
// 🧑‍💼 RUTA EXCLUSIVA PARA ADMINISTRADORES
// ===============================================
// Verifica token y que el usuario tenga rol de "administrador"
router.get('/admin', verificarToken, verificarAdministrador, (req, res) => {
  res.status(200).json({
    mensaje: 'Bienvenido, administrador.',
    usuario: req.usuario
  });
});

// Exportamos el router para usarlo en index.js
module.exports = router;
