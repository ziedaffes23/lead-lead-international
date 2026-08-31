/**
 * Lead & Lead 2K26 registration endpoint.
 *
 * Bind this script to the supplied Google Sheet and deploy it as a Web App.
 * The website sends text/plain JSON to the deployed /exec URL.
 */

const SPREADSHEET_ID = "1xTZ4JuQxvNhRQRASC0kCwk2x2pvoxO2bVxnsK8f1SZ0";
const REGISTRATIONS_SHEET_NAME = "Sheet1";
const LEADERSHIP_BASE_PRICE_EUR = 90;
const STANDARD_BASE_PRICE_EUR = 65;
const SINGLE_ROOM_PER_NIGHT_EUR = 20;
const STANDARD_DURATION_NIGHTS = 3;
const LEADERSHIP_DURATION_NIGHTS = 4;
const SHEET_WRITE_LOCK_TIMEOUT_MS = 30000;
const DRIVE_FOLDER_NAME = "LeadLead International Registrations";

const REQUIRED_HEADERS = [
  "Timestamp",
  "First name",
  "Last name",
  "Passport number",
  "Phone country",
  "Phone",
  "Email",
  "Gender",
  "Track",
  "Position",
  "Department",
  "LC Name",
  "Entity Name",
  "MC Position",
  "Country of origin",
  "Hosting LC",
  "Single room",
  "Price",
  "Currency",
  "Allergies",
  "Note",
  "Profile Photo URL",
  "Profile Photo Name",
  "CV URL",
  "CV Name",
  "Identity Document URL",
  "Identity Document Name",
  "Indemnity Signature",
  "Indemnity Accepted",
];

const HEADER_ALIASES = {
  Email: ["Email", "AIESEC email"],
  "Passport number": ["Passport number", "Passport Number", "CIN number"],
};

const ALLOWED_TRACKS = ["International AIESECer", "EP"];
const ALLOWED_POSITIONS = [
  "None",
  "MMB",
  "Manager",
  "Team Leader",
  "LCVP",
  "LCP",
  "MCVP",
  "MCP",
];

// Kept only for compatibility with the legacy leaderboard endpoint. New registrations
// intentionally do not collect or write a Local Committee value.
const LEADERBOARD_LCS = [
  "LC Thyna",
  "LC University",
  "SU Bullaregia",
  "LC Tacapes",
  "LC Ruspina",
  "LC Carthage",
  "LC Sfax",
  "LC Bardo",
  "LC Bizerte",
  "LC Hadrumet",
  "LC Medina",
  "LC Nabel",
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
  return jsonResponse({
    ok: true,
    service: "Lead & Lead 2K26 registration endpoint",
  });
}

function doPost(event) {
  try {
    const payload = parsePayload(event);
    if (payload.action === "uploadDocument") {
      return jsonResponse(uploadDocumentAction(payload));
    }
    validatePayload(payload);

    const sheet = getRegistrationSheet();

    const headers = ensureHeaders(sheet);
    const driveDocuments = saveRegistrationDocuments(payload);
    const email = cleanText(payload.email || payload.aiesecEmail).toLowerCase();
    const rowByHeader = {
      Timestamp: new Date(),
      "First name": cleanText(payload.firstName),
      "Last name": cleanText(payload.lastName),
      "Passport number": cleanText(payload.passportNumber),
      "CIN number": cleanText(payload.passportNumber),
      "Phone country": cleanText(payload.phoneCountry),
      Phone: cleanText(payload.phone),
      Email: email,
      "AIESEC email": email,
      Gender: cleanText(payload.gender),
      Track: cleanText(payload.track),
      Position: cleanText(payload.position),
      Department: cleanText(payload.department),
      "LC Name": cleanText(payload.lcName),
      "Entity Name": cleanText(payload.entityName),
      "MC Position": cleanText(payload.mcPosition),
      "Country of origin": cleanText(payload.countryOfOrigin),
      "Hosting LC": cleanText(payload.hostingLc),
      "Single room":
        payload.singleRoom === true ||
        String(payload.singleRoom).toLowerCase() === "true"
          ? "Yes"
          : "No",
      Price: numberOrBlank(payload.price),
      Currency: cleanText(payload.currency),
      Allergies: cleanText(payload.allergies),
      Note: cleanText(payload.note),
      "Profile Photo URL": driveDocuments.photo
        ? driveDocuments.photo.url
        : cleanUrl(payload.photoUrl),
      "Profile Photo Name": driveDocuments.photo
        ? driveDocuments.photo.name
        : cleanText(payload.photoName),
      "CV URL": driveDocuments.cv
        ? driveDocuments.cv.url
        : cleanUrl(payload.cvUrl),
      "CV Name": driveDocuments.cv
        ? driveDocuments.cv.name
        : cleanText(payload.cvName),
      "Identity Document URL": driveDocuments.identity
        ? driveDocuments.identity.url
        : cleanUrl(payload.identityUrl),
      "Identity Document Name": driveDocuments.identity
        ? driveDocuments.identity.name
        : cleanText(payload.identityName),
      "Indemnity Signature": cleanText(payload.indemnitySignature),
      "Indemnity Accepted":
        payload.indemnityAccepted === true ||
        String(payload.indemnityAccepted).toLowerCase() === "true"
          ? "Yes"
          : "No",
    };

    const rowValues = headers.map(header =>
      Object.prototype.hasOwnProperty.call(rowByHeader, header)
        ? rowByHeader[header]
        : ""
    );
    const writeLock = LockService.getScriptLock();
    writeLock.waitLock(SHEET_WRITE_LOCK_TIMEOUT_MS);
    let rowNumber;
    try {
      sheet.appendRow(rowValues);
      rowNumber = sheet.getLastRow();
    } finally {
      writeLock.releaseLock();
    }
    return jsonResponse({
      ok: true,
      row: rowNumber,
      documents: driveDocuments,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      ok: false,
      error:
        error && error.message
          ? error.message
          : "Unable to record the registration.",
    });
  }
}

function setupSheet() {
  const sheet = getRegistrationSheet();
  const headers = ensureHeaders(sheet);
  sheet.setFrozenRows(1);
  return { ok: true, sheet: sheet.getName(), headers: headers };
}

function setupDrive() {
  const folder = getDriveFolder();
  return { ok: true, folder: folder.getName(), folderUrl: folder.getUrl() };
}

function getRegistrationSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(
    REGISTRATIONS_SHEET_NAME
  );
  if (!sheet)
    throw new Error(`Worksheet "${REGISTRATIONS_SHEET_NAME}" was not found.`);
  return sheet;
}

function parsePayload(event) {
  if (!event || !event.postData || !event.postData.contents)
    throw new Error("Missing registration payload.");
  try {
    return JSON.parse(event.postData.contents);
  } catch (_) {
    throw new Error("Registration payload must be valid JSON.");
  }
}

function validatePayload(payload) {
  const required = [
    "firstName",
    "lastName",
    "passportNumber",
    "gender",
    "phoneCountry",
    "phone",
    "email",
    "track",
    "position",
    "department",
    "lcName",
    "entityName",
    "mcPosition",
    "countryOfOrigin",
    "hostingLc",
    "singleRoom",
    "price",
    "currency",
    "allergies",
    "note",

    "indemnitySignature",
    "indemnityAccepted",
  ];
  required.forEach(key => {
    if (
      payload[key] === undefined ||
      payload[key] === null ||
      String(payload[key]).trim() === ""
    )
      throw new Error(`Missing required field: ${key}.`);
  });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(payload.email).trim()))
    throw new Error("Email must be a valid email address.");
  if (!["Male", "Female"].includes(cleanText(payload.gender)))
    throw new Error("Select a valid gender.");
  if (!ALLOWED_TRACKS.includes(cleanText(payload.track)))
    throw new Error("Select a valid participant type.");
  if (!ALLOWED_POSITIONS.includes(cleanText(payload.position)))
    throw new Error("Select a valid position.");
  if (cleanText(payload.currency) !== "EUR")
    throw new Error("Currency must be EUR.");

  const leadershipPosition = [
    "LCVP",
    "LCP",
    "MCVP",
    "MCP",
  ].includes(cleanText(payload.position));
  const stayNights = leadershipPosition
    ? LEADERSHIP_DURATION_NIGHTS
    : STANDARD_DURATION_NIGHTS;
  const basePrice = leadershipPosition
    ? LEADERSHIP_BASE_PRICE_EUR
    : STANDARD_BASE_PRICE_EUR;
  const expectedPrice =
    basePrice +
    (payload.singleRoom === true ||
    String(payload.singleRoom).toLowerCase() === "true"
      ? SINGLE_ROOM_PER_NIGHT_EUR * stayNights
      : 0);
  if (Number(payload.price) !== expectedPrice)
    throw new Error(
      `Price must be ${expectedPrice} EUR for the selected room type.`
    );

  if (cleanText(payload.track) === "EP") {
    if (cleanText(payload.position) !== "None")
      throw new Error("EP registrations must not include an AIESEC position.");
    if (cleanText(payload.department) !== "None")
      throw new Error(
        "EP registrations must not include an AIESEC department."
      );
    if (cleanText(payload.lcName) !== "None")
      throw new Error("EP registrations must not include an LC name.");
    if (cleanText(payload.entityName) !== "None")
      throw new Error("EP registrations must not include an entity name.");
    if (
      !cleanText(payload.countryOfOrigin) ||
      cleanText(payload.countryOfOrigin) === "None"
    )
      throw new Error("Country of origin is required for EP registrations.");
    if (
      !cleanText(payload.hostingLc) ||
      cleanText(payload.hostingLc) === "None"
    )
      throw new Error("Hosting LC is required for EP registrations.");
  } else {
    if (cleanText(payload.position) === "None")
      throw new Error(
        "International AIESECer registrations require a position."
      );
    if (cleanText(payload.department) === "None")
      throw new Error(
        "International AIESECer registrations require a department."
      );
    const mcPosition = ["MCVP", "MCP"].includes(
      cleanText(payload.position)
    );
    if (!mcPosition && cleanText(payload.lcName) === "None")
      throw new Error(
        "International AIESECer registrations require an LC name unless the position is MCVP or MCP."
      );
    if (mcPosition && cleanText(payload.lcName) !== "None")
      throw new Error(
        "MCVP and MCP registrations must not include an LC name."
      );
    if (cleanText(payload.mcPosition) !== "None" && cleanText(payload.position) === "MCP")
      throw new Error("MCP registrations must not include an MC position.");
    if (
      cleanText(payload.position) === "MCVP" &&
      cleanText(payload.mcPosition) === "None"
    )
      throw new Error("MCVP registrations require an MC position.");
    if (
      !["MCVP", "MCP"].includes(cleanText(payload.position)) &&
      cleanText(payload.mcPosition) !== "None"
    )
      throw new Error("Only MCVP registrations may include an MC position.");
    if (cleanText(payload.entityName) === "None")
      throw new Error(
        "International AIESECer registrations require an entity name."
      );
    if (cleanText(payload.countryOfOrigin) !== "None")
      throw new Error(
        "International AIESECer registrations do not require a country of origin."
      );
    if (cleanText(payload.hostingLc) !== "None")
      throw new Error(
        "International AIESECer registrations do not require a hosting LC."
      );
  }
  if (
    payload.indemnityAccepted !== true &&
    String(payload.indemnityAccepted).toLowerCase() !== "true"
  )
    throw new Error("Indemnity consent is required.");

  validateDocumentPayload(payload.photoUrl, payload.photoDataUrl, "photo");
  validateDocumentPayload(payload.cvUrl, payload.cvDataUrl, "CV");
  validateDocumentPayload(
    payload.identityUrl,
    payload.identityDataUrl,
    "identity document"
  );
}

function ensureHeaders(sheet) {
  let headers = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getDisplayValues()[0]
    .map(cleanText);
  if (headers.length === 1 && !headers[0]) headers = [];

  if (!headers.some(header => HEADER_ALIASES.Email.includes(header))) {
    headers.push("Email");
    sheet.getRange(1, headers.length).setValue("Email");
  }
  REQUIRED_HEADERS.forEach(header => {
    const aliases = HEADER_ALIASES[header] || [header];
    if (!headers.some(current => aliases.includes(current))) {
      headers.push(header);
      sheet.getRange(1, headers.length).setValue(header);
    }
  });
  return headers;
}

function getLeaderboardTotals() {
  const sheet = getRegistrationSheet();
  const rows = sheet.getDataRange().getDisplayValues();
  const headers = rows.shift() || [];
  const emailIndex = findHeaderIndex(headers, HEADER_ALIASES.Email);
  const lcIndex = headers.indexOf("Local committee");
  if (emailIndex < 0 || lcIndex < 0) return [];
  const latestLcByEmail = {};
  rows.forEach(row => {
    const email = cleanText(row[emailIndex]).toLowerCase();
    const lc = canonicalLeaderboardLc(row[lcIndex]);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email) && lc)
      latestLcByEmail[email] = lc;
  });
  const totals = {};
  Object.keys(latestLcByEmail).forEach(email => {
    const lc = latestLcByEmail[email];
    totals[lc] = (totals[lc] || 0) + 1;
  });
  return Object.keys(totals)
    .map(lc => ({ lc, registrations: totals[lc] }))
    .sort(
      (left, right) =>
        right.registrations - left.registrations ||
        left.lc.localeCompare(right.lc)
    )
    .slice(0, 3);
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex(header => candidates.includes(header));
}

function canonicalLeaderboardLc(value) {
  const normalized = cleanText(value).replace(/\s+/g, " ").toLowerCase();
  const canonical = LEADERBOARD_LCS.find(lc => lc.toLowerCase() === normalized);
  return canonical || LEADERBOARD_LC_ALIASES[normalized] || "";
}

function getDriveFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function validateDocumentPayload(url, dataUrl, label) {
  const cleanData = cleanText(dataUrl);
  const cleanLink = cleanUrl(url);
  if (!cleanData && !cleanLink)
    throw new Error(`Missing required ${label} file.`);
  if (cleanData && !/^data:[^;]+;base64,[A-Za-z0-9+/=]+$/.test(cleanData))
    throw new Error(`Invalid ${label} file payload.`);
}

function safeDriveFileName(name, fallback) {
  const cleaned = cleanText(name).replace(/[^a-zA-Z0-9._-]+/g, "-");
  return (cleaned || fallback).slice(0, 120);
}

function saveDriveFile(dataUrl, name, fallback) {
  const cleanData = cleanText(dataUrl);
  if (!cleanData) return null;
  const match = cleanData.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) throw new Error(`Invalid ${fallback} file payload.`);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(match[2]),
    match[1],
    safeDriveFileName(name, fallback)
  );
  const file = getDriveFolder().createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingError) {
    console.warn(`Could not make ${fallback} file public: ${sharingError}`);
  }
  return { name: file.getName(), url: file.getUrl() };
}

function saveRegistrationDocuments(payload) {
  return {
    photo: saveDriveFile(payload.photoDataUrl, payload.photoName, "profile-photo"),
    cv: saveDriveFile(payload.cvDataUrl, payload.cvName, "cv"),
    identity: saveDriveFile(
      payload.identityDataUrl,
      payload.identityName,
      "identity-document"
    ),
  };
}

function uploadDocumentAction(payload) {
  const documentType = cleanText(payload.documentType);
  const definitions = {
    photo: { dataKey: "photoDataUrl", nameKey: "photoName", fallback: "profile-photo" },
    cv: { dataKey: "cvDataUrl", nameKey: "cvName", fallback: "cv" },
    identity: { dataKey: "identityDataUrl", nameKey: "identityName", fallback: "identity-document" },
  };
  const definition = definitions[documentType];
  if (!definition) throw new Error("Invalid document type.");
  const dataUrl = cleanText(payload[definition.dataKey]);
  if (!dataUrl) throw new Error(`Missing ${documentType} file.`);
  if (!/^data:[^;]+;base64,[A-Za-z0-9+/=]+$/.test(dataUrl))
    throw new Error(`Invalid ${documentType} file payload.`);
  const document = saveDriveFile(
    dataUrl,
    payload[definition.nameKey],
    definition.fallback
  );
  return { ok: true, documentType: documentType, document: document };
}

function cleanText(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}
function cleanUrl(value) {
  const candidate = cleanText(value);
  if (!candidate) return "";
  if (!/^https:\/\//i.test(candidate))
    throw new Error("Attachment links must use HTTPS.");
  return candidate;
}
function numberOrBlank(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
