const fs = require('fs');
const path = require('path');
const po = require('@lingui/format-po');
const f = po.formatter();

function tokenToString(token) {
  if (typeof token === 'string') return token;
  if (Array.isArray(token)) {
    if (token.length === 1) return '{' + token[0] + '}';
    const [arg, type, ...rest] = token;
    if (type === 'plural' || type === 'select' || type === 'selectordinal') {
      const casesObj = rest[0] || {};
      let casesStr = '';
      if (casesObj.offset) casesStr += ' offset:' + casesObj.offset;
      for (const [caseKey, caseVal] of Object.entries(casesObj)) {
        if (caseKey === 'offset') continue;
        casesStr += ' ' + caseKey + ' {' + (Array.isArray(caseVal) ? caseVal.map(tokenToString).join('') : String(caseVal)) + '}';
      }
      return '{' + arg + ', ' + type + ',' + casesStr + '}';
    }
    if (Array.isArray(arg) && arg[0] === '#') {
      return '{0, plural, other {#' + type + '}}';
    }
    return token.map(tokenToString).join('');
  }
  return String(token);
}

function compiledToMessage(val) {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(tokenToString).join('');
  return String(val);
}

function generatePo(enPoPath, generatedTsPath, outPoPath) {
  console.log(`Generating ${outPoPath}...`);
  const enPo = fs.readFileSync(enPoPath, 'utf8');
  const catalog = f.parse(enPo, { locale: 'en', filename: path.basename(enPoPath) });

  const content = fs.readFileSync(generatedTsPath, 'utf8');
  const start = content.indexOf('JSON.parse(') + 'JSON.parse('.length;
  const end = content.lastIndexOf(');');
  const messages = JSON.parse(JSON.parse(content.substring(start, end)));

  let matched = 0;
  for (const [id, item] of Object.entries(catalog)) {
    if (messages[id]) {
      item.translation = compiledToMessage(messages[id]);
      matched++;
    } else {
      item.translation = '';
    }
  }

  // Include extra keys from messages
  let extraCount = 0;
  for (const [id, val] of Object.entries(messages)) {
    if (!catalog[id]) {
      const msgStr = compiledToMessage(val);
      catalog[id] = {
        translation: msgStr,
        message: msgStr,
        comments: ['js-lingui-id: ' + id],
        origin: [],
        context: null,
        obsolete: false,
      };
      extraCount++;
    }
  }

  const serialized = f.serialize(catalog, { locale: 'fa-IR', sourceLocale: 'en' });
  fs.writeFileSync(outPoPath, serialized, 'utf8');
  console.log(`Wrote ${outPoPath}: ${matched} matched, ${extraCount} extra, total ${Object.keys(catalog).length} entries.`);
}

generatePo(
  'packages/twenty-front/src/locales/en.po',
  'packages/twenty-front/src/locales/generated/fa-IR.ts',
  'packages/twenty-front/src/locales/fa-IR.po'
);

generatePo(
  'packages/twenty-server/src/engine/core-modules/i18n/locales/en.po',
  'packages/twenty-server/src/engine/core-modules/i18n/locales/generated/fa-IR.ts',
  'packages/twenty-server/src/engine/core-modules/i18n/locales/fa-IR.po'
);

generatePo(
  'packages/twenty-emails/src/locales/en.po',
  'packages/twenty-emails/src/locales/generated/fa-IR.ts',
  'packages/twenty-emails/src/locales/fa-IR.po'
);
console.log('All PO files generated successfully!');
