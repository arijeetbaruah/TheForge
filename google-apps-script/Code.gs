var ITEMS_SHEET_NAME        = "Mundane Items"; // ← your mundane items tab
var ENCHANTMENTS_SHEET_NAME = "Enchantments"; // ← your enchantments tab (update this)
var ORDERS_SHEET_NAME       = "Orders";  // ← submissions tab

function doGet(e) {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  var ss = SpreadsheetApp.openById(spreadsheetId);

  var output = {
    items:        parseItems(ss),
    enchantments: parseEnchantments(ss),
  };

  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    var ss    = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(ORDERS_SHEET_NAME);

    var body  = JSON.parse(e.postData.contents);

    // Write header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Task ID",
        "Discord ID",
        "Character",
        "Category",
        "Base Item",
        "Enchantment",
        "Providing Base Item",
        "Quantity",
        "Assignee",
        "Status",
        "Submitted At",
      ]);
    }

    sheet.appendRow([
      body.taskId           || "",
      body.discordId        || "",
      body.character        || "",
      body.category         || "",
      body.baseItem         || "",
      body.enchantment      || "",
      body.providingBase    ? "Yes" : "No",
      body.quantity         || "1",
      "",
      "Pending",
      new Date().toISOString(),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, taskId: body.taskId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseItems(ss) {
  var sheet   = ss.getSheetByName(ITEMS_SHEET_NAME);
  var rows    = sheet.getDataRange().getValues();
  var headers = rows[0].map(function(h) { return h.toString().trim(); });
  var result  = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (row.every(function(cell) { return cell === "" || cell === null; })) continue;

    var obj = {};
    headers.forEach(function(header, idx) { obj[header] = row[idx]; });

    result.push({
      Category:    String(obj["Category"]     || "").trim(),
      ItemName:    String(obj["Item Name"]    || "").trim(),
      PriceAmount: Number(obj["Price Amount"] || 0),
      PriceUnit:   String(obj["Price Unit"]   || "gp").trim().toLowerCase(),
    });
  }

  return result;
}

function parseEnchantments(ss) {
  var sheet   = ss.getSheetByName(ENCHANTMENTS_SHEET_NAME);
  var rows    = sheet.getDataRange().getValues();
  var headers = rows[0].map(function(h) { return h.toString().trim(); });
  var result  = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (row.every(function(cell) { return cell === "" || cell === null; })) continue;

    var obj = {};
    headers.forEach(function(header, idx) { obj[header] = row[idx]; });

    result.push({
      Category: String(obj["Category"] || "").trim(),
      Name:     String(obj["Name"]     || "").trim(),
      Tier:     String(obj["Tier"]     || "").trim(),
    });
  }

  return result;
}