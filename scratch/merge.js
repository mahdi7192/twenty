const fs = require("fs");
const path = require("path");

const faIRTsPath = "packages/twenty-front/src/locales/generated/fa-IR.ts";
const translationsDir = "scratch/translations";

console.log("Reading generated/fa-IR.ts from:", faIRTsPath);
const originalContent = fs.readFileSync(faIRTsPath, "utf8");

const start = originalContent.indexOf("JSON.parse(") + "JSON.parse(".length;
const end = originalContent.lastIndexOf(")as Messages;");
if (start === -1 || end === -1) {
  console.error("Could not locate JSON.parse payload in fa-IR.ts");
  process.exit(1);
}

const rawArg = originalContent.substring(start, end);
const unescapedJsonStr = JSON.parse(rawArg);
const messages = JSON.parse(unescapedJsonStr);
console.log("Original message keys in fa-IR.ts:", Object.keys(messages).length);

if (!fs.existsSync(translationsDir)) {
  console.log("Translations directory does not exist yet.");
  process.exit(0);
}

const isPersian = str => /[\u0600-\u06FF]/.test(str);
const hasPersian = val => {
  if (!val) return false;
  if (typeof val === "string") return isPersian(val);
  if (Array.isArray(val)) {
    return val.some(item => {
      if (typeof item === "string") return isPersian(item);
      if (Array.isArray(item)) return item.some(sub => typeof sub === "string" && isPersian(sub));
      return false;
    });
  }
  return false;
};

const files = fs.readdirSync(translationsDir).filter(f => f.endsWith(".json") && f !== "test.json");
console.log("Found translation files:", files);

let appliedCount = 0;
for (const file of files) {
  const filePath = path.join(translationsDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const keys = Object.keys(data);
    let fileApplied = 0;
    for (const id of keys) {
      if (hasPersian(data[id])) {
        messages[id] = data[id];
        appliedCount++;
        fileApplied++;
      }
    }
    console.log(`Merged ${file}: ${fileApplied} valid Persian items (out of ${keys.length})`);
  } catch (err) {
    console.error("Error reading", file, ":", err.message);
  }
}

console.log("Total translations merged:", appliedCount);

const updatedJsonStr = JSON.stringify(messages);
const outerEscaped = JSON.stringify(updatedJsonStr);
const newContent = "/*eslint-disable*/import type{Messages}from\"@lingui/core\";export const messages=JSON.parse(" + outerEscaped + ")as Messages;\n";

fs.writeFileSync(faIRTsPath, newContent, "utf8");
console.log("Successfully updated fa-IR.ts!");

const verifyStart = newContent.indexOf("JSON.parse(") + "JSON.parse(".length;
const verifyEnd = newContent.lastIndexOf(")as Messages;");
const verifyJson = JSON.parse(newContent.substring(verifyStart, verifyEnd));
const verifyObj = JSON.parse(verifyJson);
let persianKeyCount = 0;
for (const k of Object.keys(verifyObj)) {
  if (hasPersian(verifyObj[k])) persianKeyCount++;
}
console.log("Verified updated fa-IR.ts: successfully parsed", Object.keys(verifyObj).length, "keys, with", persianKeyCount, "Persian keys.");
