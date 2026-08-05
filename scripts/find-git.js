const fs = require("fs");
const path = require("path");

const target = path.resolve(__dirname, "../src/app/App.jsx");
console.log("Reading:", target);

const content = fs.readFileSync(target, "utf8");
const lines = content.split("\n");

const matches = [];
lines.forEach((line, idx) => {
  if (/git/i.test(line)) {
    matches.push({ line: idx + 1, text: line });
  }
});

if (matches.length === 0) {
  console.log("No 'git' matches found in App.jsx");
} else {
  console.log(`Found ${matches.length} matches for 'git':`);
  matches.forEach((m) => {
    console.log(`  Line ${m.line}: ${m.text.trim()}`);
  });
}
