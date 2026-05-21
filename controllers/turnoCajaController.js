const TurnoCaja = require('../models/turnoCajaModel');
const Venta = require('../models/ventaModel');
const VentaPago = require('../models/ventaPagoModel');
const Usuario = require('../models/userModel');

const calcularResumen = async (turnoid, montoInicial) => {
  const ventas = await Venta.findAll({
    where: { turnoid },
    include: [{ model: VentaPago, as: 'pagos' }],
  });

  const metodos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
  ventas.forEach((v) => {
    (v.pagos || []).forEach((p) => {
      const m = p.metodo;
      if (metodos[m] !== undefined) metodos[m] += Number(p.monto);
    });
  });

  const totalVendido = metodos.efectivo + metodos.tarjeta + metodos.transferencia;
  const efectivoEsperado = Number(montoInicial) + metodos.efectivo;

  return {
    totalVentas: ventas.length,
    efectivo: metodos.efectivo,
    tarjeta: metodos.tarjeta,
    transferencia: metodos.transferencia,
    totalVendido,
    efectivoEsperado,
  };
};

const abrir = async (req, res) => {
  try {
    const { usuarioid, negocioid } = req.usuario;
    const { montoInicial = 0 } = req.body;

    const turnoActivo = await TurnoCaja.findOne({
      where: { usuarioid, negocioid, estado: 'abierto' },
    });
    if (turnoActivo) {
      return res.status(400).json({ mensaje: 'Ya tienes un turno abierto.' });
    }

    const turno = await TurnoCaja.create({
      usuarioid,
      negocioid,
      montoInicial: Number(montoInicial),
      fechaApertura: new Date(),
      estado: 'abierto',
    });

    res.status(201).json({ mensaje: 'Turno abierto correctamente.', turno });
  } catch (error) {
    console.error('Error al abrir turno:', error);
    res.status(500).json({ mensaje: 'Error al abrir el turno.' });
  }
};

const getActivo = async (req, res) => {
  try {
    const { usuarioid, negocioid } = req.usuario;

    const turno = await TurnoCaja.findOne({
      where: { usuarioid, negocioid, estado: 'abierto' },
      include: [{ model: Usuario, as: 'usuario', attributes: ['primer_nombre', 'primer_apellido'] }],
    });

    if (!turno) return res.json({ turno: null, resumen: null });

    const resumen = await calcularResumen(turno.turnoid, turno.montoInicial);
    res.json({ turno, resumen });
  } catch (error) {
    console.error('Error al obtener turno activo:', error);
    res.status(500).json({ mensaje: 'Error al obtener el turno activo.' });
  }
};

const cerrar = async (req, res) => {
  try {
    const { usuarioid, negocioid } = req.usuario;
    const { montoEfectivoReal } = req.body;

    const turno = await TurnoCaja.findOne({
      where: { usuarioid, negocioid, estado: 'abierto' },
    });
    if (!turno) return res.status(404).json({ mensaje: 'No tienes un turno abierto.' });

    const resumen = await calcularResumen(turno.turnoid, turno.montoInicial);
    const diferencia = Number(montoEfectivoReal) - resumen.efectivoEsperado;

    await turno.update({
      estado: 'cerrado',
      fechaCierre: new Date(),
      montoEfectivoReal: Number(montoEfectivoReal),
    });

    res.json({
      mensaje: 'Turno cerrado correctamente.',
      turno,
      reporte: {
        ...resumen,
        montoInicial: Number(turno.montoInicial),
        montoEfectivoReal: Number(montoEfectivoReal),
        diferencia,
      },
    });
  } catch (error) {
    console.error('Error al cerrar turno:', error);
    res.status(500).json({ mensaje: 'Error al cerrar el turno.' });
  }
};

const getTurnos = async (req, res) => {
  try {
    const { negocioid } = req.usuario;

    const turnos = await TurnoCaja.findAll({
      where: { negocioid },
      include: [{ model: Usuario, as: 'usuario', attributes: ['primer_nombre', 'primer_apellido'] }],
      order: [['fechaApertura', 'DESC']],
    });

    const turnosConResumen = await Promise.all(
      turnos.map(async (t) => {
        const resumen = await calcularResumen(t.turnoid, t.montoInicial);
        return { ...t.toJSON(), resumen };
      })
    );

    res.json({ turnos: turnosConResumen });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los turnos.' });
  }
};

module.exports = { abrir, getActivo, cerrar, getTurnos };
