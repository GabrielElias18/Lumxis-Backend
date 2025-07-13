// ======================================================
// 🔐 UTILIDADES PARA GENERAR Y VERIFICAR TOKENS JWT
// ======================================================

const jwt = require('jsonwebtoken'); // Importamos el paquete JWT
require('dotenv').config(); // Asegura que se pueda acceder a variables de entorno

// ==============================================
// ✅ Función para generar un token JWT
// ==============================================
const generarToken = (usuario) => {
  return jwt.sign(
    {
      // Información del usuario que irá dentro del token (payload)
      usuarioid: usuario.usuarioid,
      correo: usuario.correo,
      primerNombre: usuario.primer_nombre,
      segundoNombre: usuario.segundo_nombre,
      primerApellido: usuario.primer_apellido,
      segundoApellido: usuario.segundo_apellido,
      telefono: usuario.telefono,
      rol: usuario.rol,
      tenant_db: usuario.tenant_db // Necesario para multi-tenant
    },
    process.env.JWT_SECRET || 'clave_secreta',  // Usa variable de entorno o valor por defecto
    {
      expiresIn: '1h' // El token expirará en 1 hora
    }
  );
};

// ==============================================
// 🔍 Función para verificar un token JWT
// ==============================================
const verificarToken = (token) => {
  try {
    // Verificamos y decodificamos el token
    return jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');
  } catch (error) {
    return null; // Token inválido o expirado
  }
};

// Exportamos las funciones
module.exports = {
  generarToken,
  verificarToken
};
