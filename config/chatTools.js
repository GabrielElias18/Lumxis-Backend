const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_ventas',
      description: 'Consulta las ventas del negocio. Filtra por fechas opcionales. Calcula las fechas a partir de frases como "hoy", "esta semana" o "este mes".',
      parameters: {
        type: 'object',
        properties: {
          fechaDesde: { type: 'string', description: 'Fecha inicio YYYY-MM-DD. Ejemplo: 2026-05-01' },
          fechaHasta: { type: 'string', description: 'Fecha fin YYYY-MM-DD. Ejemplo: 2026-05-19' },
          limit: { type: 'number', description: 'Máximo de resultados. Default 10, máximo 50.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_egresos',
      description: 'Consulta los egresos (compras) del negocio. Filtra por fechas opcionales. Calcula las fechas a partir de frases como "hoy", "esta semana" o "este mes".',
      parameters: {
        type: 'object',
        properties: {
          fechaDesde: { type: 'string', description: 'Fecha inicio YYYY-MM-DD' },
          fechaHasta: { type: 'string', description: 'Fecha fin YYYY-MM-DD' },
          limit: { type: 'number', description: 'Máximo de resultados. Default 10.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_productos',
      description: 'Lista productos del inventario. Busca por nombre, categoría o stock bajo. Si necesitas el ID de un producto para update_producto o delete_producto, úsala primero.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Buscar por nombre (búsqueda parcial)' },
          categoriaId: { type: 'number', description: 'Filtrar por ID de categoría' },
          stockBajoUmbral: { type: 'number', description: 'Solo productos con stock <= este número' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_clientes',
      description: 'Busca clientes del negocio por nombre. Si necesitas el ID de un cliente para delete_cliente, úsala primero.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre o parte del nombre del cliente' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_categorias',
      description: 'Lista todas las categorías del negocio con sus IDs. Úsala primero cuando necesites el ID de una categoría para delete_categoria o para filtrar productos.',
      parameters: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Filtrar por nombre (búsqueda parcial, opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_proveedores',
      description: 'Lista todos los proveedores del negocio.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_stats',
      description: 'Obtiene estadísticas anuales: total ingresos, egresos, balance y margen.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'number', description: 'Año a consultar. Default: año actual.' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_venta',
      description: 'Registra una nueva venta. Descuenta el stock automáticamente.',
      parameters: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: 'Lista de productos vendidos',
            items: {
              type: 'object',
              required: ['productoNombre', 'cantidad'],
              properties: {
                productoNombre: { type: 'string', description: 'Nombre exacto del producto' },
                cantidad: { type: 'number', description: 'Cantidad vendida' }
              }
            }
          },
          clienteid: { type: 'number', description: 'ID del cliente (opcional)' },
          descripcion: { type: 'string', description: 'Notas de la venta (opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_egreso',
      description: 'Registra un nuevo egreso (compra de inventario). Suma stock automáticamente.',
      parameters: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            description: 'Lista de productos comprados',
            items: {
              type: 'object',
              required: ['productoNombre', 'cantidad'],
              properties: {
                productoNombre: { type: 'string', description: 'Nombre exacto del producto' },
                cantidad: { type: 'number', description: 'Cantidad comprada' }
              }
            }
          },
          proveedorid: { type: 'number', description: 'ID del proveedor (opcional)' },
          descripcion: { type: 'string', description: 'Notas del egreso (opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_producto',
      description: 'Crea un nuevo producto en el inventario (sin imágenes).',
      parameters: {
        type: 'object',
        required: ['nombre', 'precioCompra', 'precioVenta', 'categoriaNombre'],
        properties: {
          nombre: { type: 'string', description: 'Nombre del producto' },
          descripcion: { type: 'string', description: 'Descripción (opcional)' },
          cantidadDisponible: { type: 'number', description: 'Stock inicial. Default 0.' },
          precioCompra: { type: 'number', description: 'Precio de compra en COP' },
          precioVenta: { type: 'number', description: 'Precio de venta en COP' },
          categoriaNombre: { type: 'string', description: 'Nombre exacto de la categoría existente' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_cliente',
      description: 'Registra un nuevo cliente.',
      parameters: {
        type: 'object',
        required: ['nombreCliente'],
        properties: {
          nombreCliente: { type: 'string', description: 'Nombre del cliente' },
          correo: { type: 'string', description: 'Correo electrónico (opcional)' },
          telefono: { type: 'string', description: 'Teléfono (opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_categoria',
      description: 'Crea una nueva categoría de productos.',
      parameters: {
        type: 'object',
        required: ['nombre'],
        properties: {
          nombre: { type: 'string', description: 'Nombre de la categoría' },
          descripcion: { type: 'string', description: 'Descripción (opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_producto',
      description: 'Modifica precio de compra, precio de venta o stock de un producto. REQUIERE el ID numérico del producto. Si no lo tienes, llama primero get_productos con el nombre para obtenerlo.',
      parameters: {
        type: 'object',
        required: ['productoid'],
        properties: {
          productoid: { type: 'number', description: 'ID del producto a modificar' },
          nombre: { type: 'string', description: 'Nombre del producto (para mostrar en confirmación)' },
          precioCompra: { type: 'number', description: 'Nuevo precio de compra (opcional)' },
          precioVenta: { type: 'number', description: 'Nuevo precio de venta (opcional)' },
          cantidadDisponible: { type: 'number', description: 'Nuevo stock (opcional)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_producto',
      description: 'Elimina un producto permanentemente. REQUIERE el ID numérico. Si no lo tienes, llama primero get_productos con el nombre para obtenerlo.',
      parameters: {
        type: 'object',
        required: ['productoid'],
        properties: {
          productoid: { type: 'number', description: 'ID del producto a eliminar' },
          nombre: { type: 'string', description: 'Nombre del producto (para mostrar en confirmación)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_venta',
      description: 'Elimina una venta permanentemente. El stock de los productos se revierte. REQUIERE el ID numérico. Si no lo tienes, llama primero get_ventas para encontrarlo.',
      parameters: {
        type: 'object',
        required: ['ventaid'],
        properties: {
          ventaid: { type: 'number', description: 'ID de la venta a eliminar' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_egreso',
      description: 'Elimina un egreso permanentemente. El stock de los productos se revierte. REQUIERE el ID numérico. Si no lo tienes, llama primero get_egresos para encontrarlo.',
      parameters: {
        type: 'object',
        required: ['egresoid'],
        properties: {
          egresoid: { type: 'number', description: 'ID del egreso a eliminar' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_cliente',
      description: 'Elimina un cliente permanentemente. REQUIERE el ID numérico. Si no lo tienes, llama primero get_clientes con el nombre para obtenerlo.',
      parameters: {
        type: 'object',
        required: ['clienteid'],
        properties: {
          clienteid: { type: 'number', description: 'ID del cliente a eliminar' },
          nombre: { type: 'string', description: 'Nombre del cliente (para mostrar en confirmación)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_categoria',
      description: 'Elimina una categoría permanentemente. REQUIERE el ID numérico. Si no lo tienes, llama primero get_categorias para obtenerlo por nombre.',
      parameters: {
        type: 'object',
        required: ['categoriaid'],
        properties: {
          categoriaid: { type: 'number', description: 'ID de la categoría a eliminar' },
          nombre: { type: 'string', description: 'Nombre de la categoría (para mostrar en confirmación)' }
        }
      }
    }
  }
];

const CRITICAL_TOOLS = new Set([
  'update_producto',
  'delete_producto',
  'delete_venta',
  'delete_egreso',
  'delete_cliente',
  'delete_categoria'
]);

module.exports = { TOOLS, CRITICAL_TOOLS };
