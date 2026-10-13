/**
 * KMMC Website Backend — Google Apps Script
 * Copy this file into Code.gs in your Apps Script project.
 *
 * IMPORTANT:
 * - This is a starter API scaffold, not production authentication.
 * - Do not store plain-text passwords or expose confidential client records
 *   through a publicly accessible web app.
 * - Configure deployment access and add verified authentication/authorization
 *   before using this API for real client, employee, invoice or tax data.
 */
const KMMC_CONFIG = {
  SPREADSHEET_ID: '1TCwQsyuJNWFwhgJVN98Qwn_xTEuS8Yq_y3_DthzK1Bc',
  DEFAULT_SHEET: 'Records',
  ALLOWED_SHEETS: ['Records']
};

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();

  if (action === 'health') {
    return jsonOutput_({
      ok: true,
      application: 'KMMC Website Backend',
      version: '0.1.0',
      message: 'Apps Script endpoint is responding. Authentication is not configured.'
    });
  }

  if (action === 'headers') {
    const sheetName = safeSheetName_((e.parameter && e.parameter.sheet) || KMMC_CONFIG.DEFAULT_SHEET);
    const sheet = getSheet_(sheetName, false);
    if (!sheet) return jsonOutput_({ ok: true, sheet: sheetName, headers: [] });
    const lastColumn = sheet.getLastColumn();
    const headers = lastColumn ? sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0] : [];
    return jsonOutput_({ ok: true, sheet: sheetName, headers: headers });
  }

  return jsonOutput_({
    ok: false,
    error: 'Unsupported GET action.',
    supportedActions: ['health', 'headers']
  });
}

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'Request body must be valid JSON.' });
  }

  const action = String(payload.action || '').toLowerCase();

  // Intentionally do not provide public read/write or login actions until
  // authentication and role-based authorization have been implemented.
  if (action === 'health') {
    return jsonOutput_({ ok: true, application: 'KMMC Website Backend', version: '0.1.0' });
  }

  return jsonOutput_({
    ok: false,
    error: 'This action is not enabled in the starter scaffold.',
    supportedActions: ['health']
  });
}

function getSheet_(sheetName, createIfMissing) {
  const safeName = safeSheetName_(sheetName);
  const ss = SpreadsheetApp.openById(KMMC_CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(safeName);
  if (!sheet && createIfMissing) sheet = ss.insertSheet(safeName);
  return sheet;
}

function safeSheetName_(sheetName) {
  const name = String(sheetName || KMMC_CONFIG.DEFAULT_SHEET).trim();
  if (KMMC_CONFIG.ALLOWED_SHEETS.indexOf(name) === -1) {
    throw new Error('Sheet is not allow-listed: ' + name);
  }
  return name;
}

function jsonOutput_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run manually from the Apps Script editor to verify spreadsheet access.
 * Creates the allow-listed Records sheet and writes a header row if empty.
 */
function setupKmmcBackend() {
  const sheet = getSheet_(KMMC_CONFIG.DEFAULT_SHEET, true);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['RecordID', 'RecordType', 'Name', 'Status', 'CreatedAt', 'UpdatedAt']);
  }
  return 'KMMC backend scaffold is connected to spreadsheet: ' + KMMC_CONFIG.SPREADSHEET_ID;
}
