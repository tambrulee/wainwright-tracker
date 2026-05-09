import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "../data/wainwrights.csv");
const outputPath = path.join(__dirname, "../data/wainwrights.json");

function normaliseKey(key) {
  return String(key || "")
    .replace(/\uFFFD/g, " ") // removes � replacement characters
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[().§]/g, "")
    .trim()
    .toLowerCase();
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseBool(value) {
  return String(value || "").trim().toLowerCase() === "yes";
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(String(value).replace(/,/g, "").trim());
}

const csv = fs.readFileSync(inputPath, "utf8");

const parsed = Papa.parse(csv, {
  header: true,
  skipEmptyLines: true,
});

console.log(parsed.meta.fields.map(normaliseKey));

const data = parsed.data.map((row) => {
  const cleanRow = {};

  Object.entries(row).forEach(([key, value]) => {
    cleanRow[normaliseKey(key)] = value;
  });

  return {
    id: String(parseNumber(cleanRow["heightrank"])),
    heightRank: parseNumber(cleanRow["heightrank"]),
    name: cleanRow["name"],
    classification: cleanRow["classificationdobih codes"],
    completed: parseBool(cleanRow["completed"]),
    completedDate: cleanRow["completed date"] || null,
    heightFt: parseNumber(cleanRow["heightft"]),
    heightM: parseNumber(cleanRow["heightm"]),
    url: cleanRow["url"],
    osGridReference: cleanRow["os grid reference"],
    planned: parseBool(cleanRow["planned"]),
    priority: parseBool(cleanRow["priority"]),
    prominenceFt: parseNumber(cleanRow["promft"]),
    prominenceM: parseNumber(cleanRow["promm"]),
    section: cleanRow["section"],
    topoMap: cleanRow["topo map"],
    x: parseNumber(cleanRow["x"]),
    y: parseNumber(cleanRow["y"]),
    latitude: parseNumber(cleanRow["latitude"]),
    longitude: parseNumber(cleanRow["longitude"]),
  };
});

const missingCoords = data.filter((fell) => !fell.latitude || !fell.longitude);

console.log(`✅ Converted ${data.length} Wainwrights`);
console.log(`⚠️ Missing coords: ${missingCoords.length}`);

if (missingCoords.length) {
  console.log(missingCoords.map((fell) => fell.name));
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));