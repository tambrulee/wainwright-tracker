import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "../data/wainwrights.csv");
const outputPath = path.join(__dirname, "../data/wainwrights.json");

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

const data = parsed.data.map((row) => ({
  id: slugify(row["Name"]),
  heightRank: parseNumber(row["Height Rank"]),
  name: row["Name"],
  classification: row["Classification(§ DoBIH codes)"],
  completed: parseBool(row["Completed"]),
  completedDate: row["Completed Date"] || null,
  heightFt: parseNumber(row["Height (ft)"]),
  heightM: parseNumber(row["Height (m)"]),
  url: row["URL"],
  osGridReference: row["OS Grid Reference"],
  planned: parseBool(row["Planned"]),
  priority: parseBool(row["Priority"]),
  prominenceFt: parseNumber(row["Prom. (ft)"]),
  prominenceM: parseNumber(row["Prom. (m)"]),
  section: row["Section"],
  topoMap: row["Topo Map"],
  x: parseNumber(row["X"]),
  y: parseNumber(row["Y"]),
  latitude: parseNumber(row["Latitude"]),
  longitude: parseNumber(row["Longitude"]),
}));

const missingCoords = data.filter((fell) => !fell.latitude || !fell.longitude);

console.log(`✅ Converted ${data.length} Wainwrights`);
console.log(`⚠️ Missing coords: ${missingCoords.length}`);

if (missingCoords.length) {
  console.log(missingCoords.map((fell) => fell.name));
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));