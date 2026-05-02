/**
 * Google Apps Script compatible con la invitación de Laura.
 * Hojas esperadas:
 * - Mensajes: fecha | nombre | mensaje
 * - RSVP: fecha | nombre | cantidad | nota
 */
const SPREADSHEET_ID = 'PEGAR_ID_DEL_GOOGLE_SHEET_ACA';

function doGet(e) {
  const action = (e.parameter.action || '').trim();

  if (action === 'getMensajes') {
    return jsonResponse(getRows_('Mensajes').map(row => ({
      fecha: row[0],
      nombre: row[1],
      mensaje: row[2],
    })).filter(item => item.nombre && item.mensaje));
  }

  if (action === 'getRSVP') {
    return jsonResponse(getRows_('RSVP').map(row => ({
      fecha: row[0],
      nombre: row[1],
      cantidad: Number(row[2]) || 1,
      nota: row[3] || '',
    })).filter(item => item.nombre));
  }

  return jsonResponse({ ok: true });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const action = (data.action || '').trim();

  if (action === 'addMensaje') {
    const nombre = String(data.nombre || '').trim();
    const mensaje = String(data.mensaje || '').trim();
    if (!nombre || !mensaje) return jsonResponse({ ok: false, error: 'Faltan nombre o mensaje' });
    getSheet_('Mensajes').appendRow([new Date(), nombre, mensaje]);
    return jsonResponse({ ok: true });
  }

  if (action === 'addRSVP') {
    const nombre = String(data.nombre || '').trim();
    const cantidad = Math.max(1, Number(data.cantidad) || 1);
    const nota = String(data.nota || '').trim();
    if (!nombre) return jsonResponse({ ok: false, error: 'Falta nombre' });
    getSheet_('RSVP').appendRow([new Date(), nombre, cantidad, nota]);
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ ok: false, error: 'Acción no reconocida' });
}

function getRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  return values.length > 1 ? values.slice(1) : [];
}

function getSheet_(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    if (sheetName === 'Mensajes') sheet.appendRow(['fecha', 'nombre', 'mensaje']);
    if (sheetName === 'RSVP') sheet.appendRow(['fecha', 'nombre', 'cantidad', 'nota']);
  }
  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
