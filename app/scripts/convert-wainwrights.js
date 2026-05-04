import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "../data/wainwrights.csv");
const outputPath = path.join(__dirname, "../data/wainwrights.json");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseBool(value) {
  return String(value).trim().toLowerCase() === "yes";
}

function parseNumber(value) {
  if (!value) return null;
  return Number(String(value).replace(/,/g, ""));
}

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split("\t");

  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    const row = Object.fromEntries(headers.map((h, i) => [h.trim(), values[i]?.trim() ?? ""]));

    return {
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
    };
  });
}

const csv = fs.readFileSync(inputPath, "utf8");
const data = parseCSV(csv);

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log(`Converted ${data.length} Wainwrights to data/wainwrights.json`);