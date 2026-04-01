const fs = require("fs");
const files = [
  "src/routes/users.js",
  "src/init-db.js",
  "src/routes/events.js",
  "src/routes/bookings.js",
];
files.forEach((f) => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, "utf8");
    content = content.replace(/\\`/g, "`");
    fs.writeFileSync(f, content);
  }
});
console.log("Fixed");
