const fs = require('fs');
const path = require('path');

// 1. Read en.po to extract all msgid, msgstr, js-lingui-id and references
const enPoContent = fs.readFileSync('packages/twenty-front/src/locales/en.po', 'utf8');

const blocks = enPoContent.split('\n\n');
const settingsEntries = [];

for (const block of blocks) {
  const idMatch = block.match(/#\. js-lingui-id: ([A-Za-z0-9+/=_-]+)/);
  if (!idMatch) continue;
  const id = idMatch[1];

  const fileRefs = [];
  const refMatches = block.matchAll(/#: (.*)/g);
  for (const rm of refMatches) {
    fileRefs.push(rm[1]);
  }

  const isSettings = fileRefs.some(ref => ref.includes('settings') || ref.includes('Settings'));
  if (!isSettings) continue;

  const msgidMatch = block.match(/msgid "([\s\S]*?)"\nmsgstr/);
  const msgid = msgidMatch ? msgidMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : '';

  settingsEntries.push({ id, msgid, fileRefs });
}

console.log(`Found ${settingsEntries.length} entries referenced in settings files.`);

// 2. Read current fa-IR.ts
const faContent = fs.readFileSync('packages/twenty-front/src/locales/generated/fa-IR.ts', 'utf8');
const match = faContent.match(/export const messages=JSON\.parse\("(.*)"\)as Messages;/);
if (!match) {
  console.error('Could not parse fa-IR.ts');
  process.exit(1);
}
const currentFa = JSON.parse(match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));

const missingOrEnglish = [];
const persianRegex = /[\u0600-\u06FF]/;

for (const entry of settingsEntries) {
  const val = currentFa[entry.id];
  let isTranslated = false;
  if (val) {
    if (typeof val === 'string' && persianRegex.test(val)) isTranslated = true;
    else if (Array.isArray(val) && val.some(part => typeof part === 'string' && persianRegex.test(part))) isTranslated = true;
  }

  if (!isTranslated) {
    missingOrEnglish.push({
      id: entry.id,
      msgid: entry.msgid,
      currentVal: val,
      fileRefs: entry.fileRefs
    });
  }
}

console.log(`Settings entries missing or still English: ${missingOrEnglish.length}`);
fs.writeFileSync('scratch/missing_settings.json', JSON.stringify(missingOrEnglish, null, 2));
