const { TOOLS, CRITICAL_TOOLS } = require('../config/chatTools');
const { executeTool } = require('../services/chatService');
const Negocio = require('../models/negocioModel');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const TOOL_LABELS = {
  get_ventas:       'Consultando ventas...',
  get_egresos:      'Consultando egresos...',
  get_productos:    'Revisando inventario...',
  get_clientes:     'Buscando clientes...',
  get_categorias:   'Revisando categorías...',
  get_proveedores:  'Buscando proveedores...',
  get_stats:        'Calculando estadísticas...',
  get_balance:      'Calculando balance...',
  create_venta:     'Registrando venta...',
  create_egreso:    'Registrando egreso...',
  create_producto:  'Creando producto...',
  create_cliente:   'Registrando cliente...',
  create_categoria: 'Creando categoría...',
  update_producto:  'Preparando actualización...',
  delete_venta:     'Preparando eliminación...',
  delete_egreso:    'Preparando eliminación...',
  delete_producto:  'Preparando eliminación...',
  delete_cliente:   'Preparando eliminación...',
  delete_categoria: 'Preparando eliminación...',
};

const TOOL_SUGGESTIONS = {
  get_ventas:       ['¿Cuál fue mi mejor producto?', '¿Comparar con el mes anterior?', '¿Cuánto es mi ticket promedio?'],
  get_egresos:      ['¿Ver balance del mes?', '¿Cuánto gasté esta semana?', '¿Cuál es mi egreso más grande?'],
  get_productos:    ['¿Qué productos están por agotarse?', '¿Cuál tiene mejor margen?', '¿Cuánto vale mi inventario?'],
  get_clientes:     ['¿Quién compra más?', '¿Cuántos clientes nuevos este mes?', 'Registrar un nuevo cliente'],
  get_categorias:   ['¿Cuántos productos tiene cada categoría?', '¿Ver mis productos?', 'Crear una nueva categoría'],
  get_proveedores:  ['¿Ver mis egresos recientes?', '¿Cuánto compré este mes?', 'Registrar un nuevo egreso'],
  get_stats:        ['¿Cómo van las ventas esta semana?', '¿Ver balance del mes?', '¿Cuál es mi producto más vendido?'],
  get_balance:      ['¿Cuál fue mi mejor mes?', '¿Ver mis últimas ventas?', '¿Cómo van los egresos?'],
  create_venta:     ['¿Cuánto vendí hoy?', '¿Ver mis ventas de la semana?', 'Registrar otra venta'],
  create_egreso:    ['¿Cuánto gasté esta semana?', '¿Ver mis últimos egresos?', 'Registrar otro egreso'],
  create_producto:  ['¿Ver mis productos con poco stock?', '¿Cuántos productos tengo?', 'Crear otra categoría'],
  create_cliente:   ['¿Ver todos mis clientes?', '¿Registrar una venta?', '¿Quién compra más?'],
  create_categoria: ['¿Ver todas mis categorías?', 'Crear un producto en esta categoría', '¿Cuántos productos tengo?'],
};

const buildSystemPrompt = (negocioNombre) => {
  const now = new Date();
  const hoy = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const fechaISO = now.toISOString().split('T')[0];
  const ayer = new Date(now); ayer.setDate(ayer.getDate() - 1);
  const ayerISO = ayer.toISOString().split('T')[0];
  const semanaISO = new Date(now); semanaISO.setDate(semanaISO.getDate() - 6);
  const semanaDesdeISO = semanaISO.toISOString().split('T')[0];
  const mesDesdeISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const anioDesdeISO = `${now.getFullYear()}-01-01`;

  return `Eres el asistente de IA de Lumxis para el negocio "${negocioNombre}". Hoy es ${hoy} (${fechaISO}).

ACCESO A DATOS: Tienes acceso completo y directo a los datos del negocio mediante herramientas. SIEMPRE usa las herramientas disponibles para consultar o modificar datos. NUNCA digas que no tienes acceso, NUNCA pidas al usuario que ejecute comandos ni le expliques cómo hacerlo manualmente.

ENCADENAMIENTO OBLIGATORIO — cuando el usuario pide eliminar o modificar algo por nombre:
1. Llama primero la herramienta get_X para buscar por nombre y obtener el ID numérico.
2. Luego llama la herramienta de acción con ese ID.
Ejemplos: eliminar categoría → get_categorias luego delete_categoria. Eliminar producto → get_productos luego delete_producto. Modificar producto → get_productos luego update_producto.

FECHAS RELATIVAS — usa siempre estas fechas exactas:
- "hoy" → fechaDesde: ${fechaISO}, fechaHasta: ${fechaISO}
- "ayer" → fechaDesde: ${ayerISO}, fechaHasta: ${ayerISO}
- "esta semana" / "últimos 7 días" → fechaDesde: ${semanaDesdeISO}, fechaHasta: ${fechaISO}
- "este mes" → fechaDesde: ${mesDesdeISO}, fechaHasta: ${fechaISO}
- "este año" → fechaDesde: ${anioDesdeISO}, fechaHasta: ${fechaISO}

REGLAS ABSOLUTAS:
- Responde SIEMPRE en español, de forma clara y natural para un usuario de negocio.
- NUNCA muestres nombres de funciones, código, JSON, ni sintaxis técnica al usuario.
- NUNCA expliques los pasos internos que vas a seguir; simplemente ejecútalos y reporta el resultado.
- Usa Markdown: **negrita** para valores importantes, listas para múltiples items, tablas para comparaciones.
- Valores monetarios en formato colombiano: $1.200.000
- El sistema gestiona confirmaciones automáticamente; no preguntes al usuario si está seguro antes de llamar una herramienta.
- Si el usuario pregunta algo fuera de tus herramientas, dilo de forma natural sin mencionar tecnicismos.`;
};

const buildConfirmationDescription = (toolName, args) => {
  const map = {
    update_producto: () => {
      const cambios = [];
      if (args.precioVenta !== undefined) cambios.push(`precio de venta: $${Number(args.precioVenta).toLocaleString('es-CO')}`);
      if (args.precioCompra !== undefined) cambios.push(`precio de compra: $${Number(args.precioCompra).toLocaleString('es-CO')}`);
      if (args.cantidadDisponible !== undefined) cambios.push(`stock: ${args.cantidadDisponible} unidades`);
      return `Modificar "${args.nombre || `producto ID ${args.productoid}`}" — ${cambios.join(', ')}`;
    },
    delete_producto: () => `Eliminar permanentemente el producto "${args.nombre || `ID: ${args.productoid}`}"`,
    delete_venta:    () => `Eliminar permanentemente la venta #${args.ventaid} (el stock se revertirá)`,
    delete_egreso:   () => `Eliminar permanentemente el egreso #${args.egresoid} (el stock se revertirá)`,
    delete_cliente:  () => `Eliminar permanentemente el cliente "${args.nombre || `ID: ${args.clienteid}`}"`,
    delete_categoria:() => `Eliminar permanentemente la categoría "${args.nombre || `ID: ${args.categoriaid}`}"`,
  };
  return map[toolName]?.() || `Ejecutar acción: ${toolName}`;
};

const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const MAX_RETRIES = 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const OPENROUTER_HEADERS = () => ({
  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://lumxis.app',
  'X-Title': 'Lumxis'
});

const sendSSE = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

const callOpenRouter = async (messages, useTools = true) => {
  let lastErr;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const body = { model: MODEL, messages };
      if (useTools) { body.tools = TOOLS; body.tool_choice = 'auto'; }
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: OPENROUTER_HEADERS(),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errText = await response.text();
        const err = new Error(`OpenRouter ${response.status}: ${errText}`);
        err.status = response.status;
        if (response.status !== 429) throw err;
        lastErr = err;
        await sleep(1500 * (attempt + 1));
        continue;
      }
      try {
        const data = await response.json();
        if (!data?.choices?.[0]) {
          lastErr = new Error('Respuesta sin choices del modelo');
          await sleep(1000);
          continue;
        }
        return data;
      } catch {
        lastErr = new Error('Respuesta malformada del modelo');
        await sleep(1000);
        continue;
      }
    } catch (err) {
      if (err.status && err.status !== 429) throw err;
      lastErr = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
};

const streamOpenRouter = async (messages, res) => {
  let lastErr;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: OPENROUTER_HEADERS(),
        body: JSON.stringify({ model: MODEL, messages, stream: true })
      });
      if (!response.ok) {
        const errText = await response.text();
        const err = new Error(`OpenRouter ${response.status}: ${errText}`);
        err.status = response.status;
        if (response.status !== 429) throw err;
        lastErr = err;
        await sleep(1500 * (attempt + 1));
        continue;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const parsed = JSON.parse(raw);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) sendSSE(res, { type: 'delta', content: delta });
          } catch {}
        }
      }
      return; // streamed successfully
    } catch (err) {
      if (err.status && err.status !== 429) throw err;
      lastErr = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
};

const chat = async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  try {
    const { messages = [], confirmedAction } = req.body;
    const { usuarioid, negocioid } = req.usuario;

    if (confirmedAction) {
      try {
        const result = await executeTool(confirmedAction.tool, confirmedAction.args, negocioid, usuarioid);
        sendSSE(res, { type: 'delta', content: result.mensaje || 'Acción ejecutada correctamente.' });
      } catch (err) {
        sendSSE(res, { type: 'delta', content: `No se pudo ejecutar la acción: ${err.message}` });
      }
      sendSSE(res, { type: 'done' });
      return res.end();
    }

    const negocio = await Negocio.findByPk(negocioid);
    const negocioNombre = negocio?.nombre || 'tu negocio';

    const openRouterMessages = [
      { role: 'system', content: buildSystemPrompt(negocioNombre) },
      ...messages
    ];

    const MAX_TOOL_ITERATIONS = 5;
    let currentMessages = openRouterMessages;
    let hadToolCalls = false;
    let finalSuggestions = null;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const llmResponse = await callOpenRouter(currentMessages);
      const assistantMsg = llmResponse?.choices?.[0]?.message;
      if (!assistantMsg) throw new Error('Respuesta inesperada del modelo');

      // No tool calls — either first response (stream directly) or end of chain (break to stream)
      if (!assistantMsg.tool_calls?.length) {
        if (!hadToolCalls) {
          sendSSE(res, { type: 'delta', content: assistantMsg.content || '' });
          sendSSE(res, { type: 'done' });
          return res.end();
        }
        break;
      }

      hadToolCalls = true;
      const toolCalls = assistantMsg.tool_calls;

      // If any tool is critical, pause and ask for confirmation
      const criticalCall = toolCalls.find(tc => CRITICAL_TOOLS.has(tc.function.name));
      if (criticalCall) {
        const toolArgs = JSON.parse(criticalCall.function.arguments);
        sendSSE(res, {
          type: 'confirmation',
          tool: criticalCall.function.name,
          args: toolArgs,
          description: buildConfirmationDescription(criticalCall.function.name, toolArgs)
        });
        sendSSE(res, { type: 'done' });
        return res.end();
      }

      // Show tool status for this iteration
      const statusLabel = toolCalls.length === 1
        ? (TOOL_LABELS[toolCalls[0].function.name] || 'Procesando...')
        : 'Procesando consulta...';
      sendSSE(res, { type: 'tool_status', label: statusLabel });

      // Execute all tools in parallel
      const toolResults = await Promise.all(
        toolCalls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments);
          try {
            const result = await executeTool(tc.function.name, args, negocioid, usuarioid);
            return { tool_call_id: tc.id, content: JSON.stringify(result) };
          } catch (err) {
            return { tool_call_id: tc.id, content: JSON.stringify({ error: err.message }) };
          }
        })
      );

      // Track suggestions from the first meaningful tool call
      if (!finalSuggestions) {
        finalSuggestions = TOOL_SUGGESTIONS[toolCalls[toolCalls.length - 1].function.name] || null;
      }

      currentMessages = [
        ...currentMessages,
        assistantMsg,
        ...toolResults.map(r => ({ role: 'tool', tool_call_id: r.tool_call_id, content: r.content }))
      ];
    }

    // Stream the final response after the tool chain completes
    await streamOpenRouter(currentMessages, res);
    if (finalSuggestions) sendSSE(res, { type: 'suggestions', items: finalSuggestions });
    sendSSE(res, { type: 'done' });
    res.end();

  } catch (err) {
    console.error('Chat controller error:', err.message);
    const msg = err.status === 429
      ? 'El asistente está temporalmente saturado. Espera unos segundos e intenta de nuevo.'
      : 'Lo siento, no pude conectar con el asistente. Intenta de nuevo.';
    sendSSE(res, { type: 'error', content: msg });
    sendSSE(res, { type: 'done' });
    res.end();
  }
};

module.exports = { chat };
