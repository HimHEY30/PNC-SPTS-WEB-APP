/* eslint-disable */
const fs = require('fs');

const content = fs.readFileSync('src/views/admin/ProfileView.vue', 'utf-8');
const match = content.match(/<template>([\s\S]*)<\/template>/);
const template = match[1];

function findTagBounds(str, startIdx) {
  if (str[startIdx] !== '<') return null;
  let i = startIdx;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  i++;
  while (i < str.length && str[i] !== '>' && str[i] !== ' ' && str[i] !== '\n' && str[i] !== '\t' && str[i] !== '\r') i++;
  if (i >= str.length) return null;
  const tagName = str.substring(startIdx + 1, i);
  while (i < str.length) {
    const ch = str[i];
    if (ch === '"') inDoubleQuote = !inDoubleQuote;
    else if (ch === "'") inSingleQuote = !inSingleQuote;
    else if (ch === '>' && !inDoubleQuote && !inSingleQuote)
      return { tagName, start: startIdx, end: i + 1, selfClosing: str[i-1] === '/' };
    i++;
  }
  return null;
}

// Collect all events with line number
const allEvents = [];
for (let i = 0; i < template.length; i++) {
  if (template[i] === '<') {
    const tag = findTagBounds(template, i);
    if (tag && (tag.tagName === 'div' || tag.tagName === '/div') && !tag.selfClosing) {
      const lineNum = template.substring(0, tag.start).split('\n').length;
      const text = template.substring(tag.start, tag.end).replace(/\n/g, '\\n').substring(0, 60);
      allEvents.push({ type: tag.tagName === '/div' ? 'close' : 'open', line: lineNum, pos: tag.start, text });
      i = tag.end - 1;
    }
  }
}

// Track events between lines 350 and 370 (around where main container should close)
const eventsAround = allEvents.filter(e => e.line >= 350 && e.line <= 370);
console.log("Events around lines 350-370:");
for (const e of eventsAround) {
  console.log(`  ${e.type} at line ${e.line}: ${e.text}`);
}

console.log("\n--- Full stack trace ---");
const stack = [];
for (const e of allEvents) {
  if (e.type === 'open') {
    stack.push(e);
  } else {
    if (stack.length > 0) {
      const popped = stack.pop();
      console.log(`Close at line ${e.line} -> Open at line ${popped.line}: ${popped.text.substring(0,40)}`);
    } else {
      console.log(`EXTRA close at line ${e.line}`);
    }
  }
}
