// ======================================================
// 🔐 UTILIDADES PARA GENERAR Y VERIFICAR TOKENS JWT
// ======================================================

const jwt = require('jsonwebtoken');

// ==============================================
// ✅ Función para generar un token JWT
// ==============================================
const generarToken = (payload) => {
  // Ahora aceptamos un objeto directo para mayor flexibilidad
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'clave_secreta',
    {
      expiresIn: '24h' // Aumentamos la duración a 24h para mejor UX en POS
    }
  );
};

// ==============================================
// 🔍 Función para verificar un token JWT
// ==============================================
const verificarToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
  } catch (error) {
    return null;
  }
};

module.exports = {
  generarToken,
  verificarToken
};
