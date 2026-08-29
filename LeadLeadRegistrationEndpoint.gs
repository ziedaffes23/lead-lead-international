/**
 * Lead & Lead 2K26 registration endpoint.
 *
 * Deploy this file as a Web App from the spreadsheet that receives registrations.
 * The website sends text/plain JSON to the deployed /exec URL.
 * Existing sheets with an “AIESEC email” column remain compatible, but the
 * endpoint accepts and stores any valid email address.
 */

const REGISTRATIONS_SHEET_NAME = "Sheet1";
const DRIVE_FOLDER_ID = "1W9D3eZ6p2X6Y4qaOO-JzDr1MJtwceCUR";

const REQUIRED_HEADERS = [
  "Timestamp", "First name", "Last name", "CIN number", "Phone country", "Phone",
  "Email", "Local committee", "Nationality", "Other nationality", "Track", "Position",
  "Single room", "Department", "Price", "Currency", "Allergies", "Note",
  "Profile Photo URL", "Profile Photo Name", "CV URL", "CV Name",
  "Identity Document URL", "Identity Document Name", "Indemnity Signature", "Indemnity Accepted",
];

const HEADER_ALIASES = {
  Email: ["Email", "AIESEC email"],
};

const ALLOWED_TRACKS = ["MMB", "EB"];
const ALLOWED_POSITIONS = ["Manager", "Team Leader", "LCVP", "LCP"];

const LEADERBOARD_LCS = [
  "LC Thyna", "LC University", "SU Bullaregia", "LC Tacapes", "LC Ruspina", "LC Carthage",
  "LC Sfax", "LC Bardo", "LC Bizerte", "LC Hadrumet", "LC Medina", "LC Nabel",
];

const LEADERBOARD_LC_ALIASES = {
  "lc bellaregia": "SU Bullaregia",
  "lc bullaregia": "SU Bullaregia",
  "su bullaregia": "SU Bullaregia",
  "lc nabeul": "LC Nabel",
  "lc nabel": "LC Nabel",
};

function doGet(event) {
  if (event && event.parameter && event.parameter.view === "leaderboard") {
    return jsonResponse({ ok: true, leaderboard: getLeaderboardTotals() });
  }
  return jsonResponse({ ok: true, service: "Lead & Lead 2K26 registration endpoint" });
}

function doPost(event) {
  try {
    const payload = parsePayload(event);
    validatePayload(payload);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REGISTRATIONS_SHEET_NAME);
    if (!sheet) throw new Error(`Worksheet "${REGISTRATIONS_SHEET_NAME}" was not found.`);

    const headers = ensureHeaders(sheet);
    const driveDocuments = saveAttachmentsToDrive(payload);
    const email = cleanText(payload.email || payload.aiesecEmail).toLowerCase();
    const rowByHeader = {
      "Timestamp": new Date(),
      "First name": cleanText(payload.firstName),
      "Last name": cleanText(payload.lastName),
      "CIN number": cleanText(payload.cin),
      "Phone country": cleanText(payload.phoneCountry),
      "Phone": cleanText(payload.phone),
      "Email": email,
      "AIESEC email": email,
      "Local committee": cleanText(payload.lc),
      "Nationality": cleanText(payload.nationality),
      "Other nationality": "",
      "Track": cleanText(payload.track),
      "Position": cleanText(payload.position),
      "Single room": payload.singleRoom === true || String(payload.singleRoom).toLowerCase() === "true" ? "Yes" : "No",
      "Department": cleanText(payload.department),
      "Price": numberOrBlank(payload.price),
      "Currency": cleanText(payload.currency),
      "Allergies": cleanText(payload.allergies),
      "Note": cleanText(payload.note),
      "Profile Photo URL": driveDocuments.photo ? driveDocuments.photo.url : cleanUrl(payload.photoUrl),
      "Profile Photo Name": driveDocuments.photo ? driveDocuments.photo.name : cleanText(payload.photoName),
      "CV URL": driveDocuments.cv ? driveDocuments.cv.url : cleanUrl(payload.cvUrl),
      "CV Name": driveDocuments.cv ? driveDocuments.cv.name : cleanText(payload.cvName),
      "Identity Document URL": driveDocuments.identity ? driveDocuments.identity.url : cleanUrl(payload.identityUrl),
      "Identity Document Name": driveDocuments.identity ? driveDocuments.identity.name : cleanText(payload.identityName),
      "Indemnity Signature": cleanText(payload.indemnitySignature),
      "Indemnity Accepted": payload.indemnityAccepted === true || String(payload.indemnityAccepted).toLowerCase() === "true" ? "Yes" : "No",
    };

    sheet.appendRow(headers.map((header) => Object.prototype.hasOwnProperty.call(rowByHeader, header) ? rowByHeader[header] : ""));
    return jsonResponse({ ok: true, row: sheet.getLastRow(), documents: driveDocuments });
  } catch (error) {
    console.error(error);
    return jsonResponse({ ok: false, error: error && error.message ? error.message : "Unable to record the registration." });
  }
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents) throw new Error("Missing registration payload.");
  try { return JSON.parse(event.postData.contents); } catch (_) { throw new Error("Registration payload must be valid JSON."); }
}

function validatePayload(payload) {
  const required = ["firstName", "lastName", "cin", "phoneCountry", "phone", "email", "lc", "nationality", "track", "position", "department", "price", "currency", "allergies", "note", "photoUrl", "cvUrl", "identityUrl", "indemnitySignature", "indemnityAccepted"];
  required.forEach((key) => {
    if (payload[key] === undefined || payload[key] === null || String(payload[key]).trim() === "") throw new Error(`Missing required field: ${key}.`);
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(payload.email).trim())) throw new Error("Email must be a valid email address.");
  if (payload.nationality !== "Tunisian") throw new Error("Only Tunisian registrations are currently accepted.");
  if (payload.indemnityAccepted !== true && String(payload.indemnityAccepted).toLowerCase() !== "true") throw new Error("Indemnity consent is required.");
  if (!ALLOWED_TRACKS.includes(cleanText(payload.track))) throw new Error("Select a valid conference track.");
  if (!ALLOWED_POSITIONS.includes(cleanText(payload.position))) throw new Error("Select a valid position.");
}

function ensureHeaders(sheet) {
  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getDisplayValues()[0].map(cleanText);
  if (!headers.some((header) => HEADER_ALIASES.Email.includes(header))) {
    headers.push("Email");
    sheet.getRange(1, headers.length).setValue("Email");
  }
  REQUIRED_HEADERS.forEach((header) => {
    const exists = header === "Email" ? headers.some((current) => HEADER_ALIASES.Email.includes(current)) : headers.includes(header);
    if (!exists) {
      headers.push(header);
      sheet.getRange(1, headers.length).setValue(header);
    }
  });
  return headers;
}

function saveAttachmentsToDrive(payload) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const documents = {};
  const baseName = `${cleanText(payload.firstName)}-${cleanText(payload.lastName)}-${cleanText(payload.cin)}`.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || `registration-${Date.now()}`;
  const candidates = [
    { key: "photo", url: payload.photoUrl, name: payload.photoName || "profile-photo" },
    { key: "cv", url: payload.cvUrl, name: payload.cvName || "cv" },
    { key: "identity", url: payload.identityUrl, name: payload.identityName || "identity-document" },
  ];

  candidates.forEach((candidate) => {
    const url = cleanUrl(candidate.url);
    const response = UrlFetchApp.fetch(url, { followRedirects: true, muteHttpExceptions: true });
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      throw new Error(`Unable to download ${candidate.key} for Drive storage.`);
    }
    const originalName = cleanText(candidate.name).replace(/[^a-zA-Z0-9._-]+/g, "-") || candidate.key;
    const file = folder.createFile(response.getBlob().setName(`${baseName}-${candidate.key}-${originalName}`));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    documents[candidate.key] = { name: file.getName(), url: file.getUrl() };
  });

  return documents;
}

function getLeaderboardTotals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REGISTRATIONS_SHEET_NAME);
  if (!sheet) throw new Error(`Worksheet "${REGISTRATIONS_SHEET_NAME}" was not found.`);
  const rows = sheet.getDataRange().getDisplayValues();
  const headers = rows.shift() || [];
  const emailIndex = findHeaderIndex(headers, HEADER_ALIASES.Email);
  const lcIndex = headers.indexOf("Local committee");
  if (emailIndex < 0 || lcIndex < 0) return [];
  const latestLcByEmail = {};
  rows.forEach((row) => {
    const email = cleanText(row[emailIndex]).toLowerCase();
    const lc = canonicalLeaderboardLc(row[lcIndex]);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email) && lc) latestLcByEmail[email] = lc;
  });
  const totals = {};
  Object.keys(latestLcByEmail).forEach((email) => {
    const lc = latestLcByEmail[email];
    totals[lc] = (totals[lc] || 0) + 1;
  });
  return Object.keys(totals).map((lc) => ({ lc, registrations: totals[lc] }))
    .sort((left, right) => right.registrations - left.registrations || left.lc.localeCompare(right.lc)).slice(0, 3);
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => candidates.includes(header));
}

function canonicalLeaderboardLc(value) {
  const normalized = cleanText(value).replace(/\s+/g, " ").toLowerCase();
  const canonical = LEADERBOARD_LCS.find((lc) => lc.toLowerCase() === normalized);
  return canonical || LEADERBOARD_LC_ALIASES[normalized] || "";
}

function cleanText(value) { return value === undefined || value === null ? "" : String(value).trim(); }
function cleanUrl(value) {
  const candidate = cleanText(value);
  if (!candidate) return "";
  if (!/^https:\/\//i.test(candidate)) throw new Error("Attachment links must use HTTPS.");
  return candidate;
}
function numberOrBlank(value) { const number = Number(value); return Number.isFinite(number) ? number : ""; }
function jsonResponse(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
