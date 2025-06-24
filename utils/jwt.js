// ======================================================
// 🔐 UTILIDADES PARA GENERAR Y VERIFICAR TOKENS JWT
// ======================================================

const jwt = require('jsonwebtoken'); // Importamos el paquete JWT

// ==============================================
// ✅ Función para generar un token JWT
// ==============================================
const generarToken = (usuario) => {
  return jwt.sign(
    {
      // Información del usuario que irá dentro del token (payload)
      usuarioId: usuario.usuarioid,
      correo: usuario.correo,
      primerNombre: usuario.primer_nombre,
      segundoNombre: usuario.segundo_nombre,
      primerApellido: usuario.primer_apellido,
      segundoApellido: usuario.segundo_apellido,
      telefono: usuario.telefono,
      rol: usuario.rol  // Incluimos el rol para control de permisos
    },
    'clave_secreta',  // ⚠️ Reemplaza esto con process.env.JWT_SECRET en producción
    {
      expiresIn: '1h'  // El token expirará en 1 hora
    }
  );
};

// ==============================================
// 🔍 Función para verificar un token JWT
// ==============================================
const verificarToken = (token) => {
  try {
    // Verificamos y decodificamos el token
    return jwt.verify(token, 'clave_secreta'); // ⚠️ Igual aquí, usa process.env.JWT_SECRET
  } catch (error) {
    // Si hay un error (token inválido o expirado), devolvemos null
    return null;
  }
};

// Exportamos las funciones para usarlas en controladores o middlewares
module.exports = {
  generarToken,
  verificarToken
};
