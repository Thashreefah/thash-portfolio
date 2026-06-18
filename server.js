// =========================================================
// LOCAL PORTFOLIO SERVER
// =========================================================
// Run this with: node server.js
// Then open http://localhost:3000 in your browser.
//
// While running this way, clicking "Save Portfolio" in the
// browser sends your edits here, and this script writes them
// directly into index.html on your computer. After that, just
// run upload.bat as usual to publish to Netlify.
//
// This server ONLY runs on your PC. It has nothing to do with
// Netlify and is never uploaded or deployed there.
// =========================================================

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = __dirname; // folder this file lives in
const INDEX_PATH = path.join(ROOT, "index.html");

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found: " + filePath);
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
}

function handleSave(req, res) {
    let body = "";
    req.on("data", chunk => {
        body += chunk;
        // Basic safety limit: refuse absurdly large payloads (5MB)
        if (body.length > 5 * 1024 * 1024) {
            req.destroy();
        }
    });

    req.on("end", () => {
        try {
            const { portfolioHTML } = JSON.parse(body);

            if (typeof portfolioHTML !== "string" || portfolioHTML.length === 0) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: false, error: "No HTML received." }));
                return;
            }

            const currentHTML = fs.readFileSync(INDEX_PATH, "utf8");

            // Replace everything between <main id="portfolio"> and </main>
            const startTag = /<main\s+id=["']portfolio["']\s*>/i;
            const endTag = /<\/main>/i;

            const startMatch = currentHTML.match(startTag);
            const endMatch = currentHTML.match(endTag);

            if (!startMatch || !endMatch) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    ok: false,
                    error: 'Could not find <main id="portfolio"> ... </main> in index.html.'
                }));
                return;
            }

            const startIndex = startMatch.index + startMatch[0].length;
            const endIndex = currentHTML.search(endTag);

            const newHTML =
                currentHTML.slice(0, startIndex) +
                "\n" + portfolioHTML + "\n    " +
                currentHTML.slice(endIndex);

            // Keep a timestamped backup before overwriting, just in case
            const backupPath = path.join(
                ROOT,
                `index.backup.${Date.now()}.html`
            );
            fs.writeFileSync(backupPath, currentHTML, "utf8");

            fs.writeFileSync(INDEX_PATH, newHTML, "utf8");

            console.log("✔ index.html updated successfully.");
            console.log("  Backup saved as:", path.basename(backupPath));

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true }));
        } catch (err) {
            console.error("Save failed:", err.message);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
    });
}

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/save") {
        handleSave(req, res);
        return;
    }

    // Serve static files (index.html, style.css, script.js, images, etc.)
    let urlPath = req.url === "/" ? "/index.html" : req.url;
    urlPath = decodeURIComponent(urlPath.split("?")[0]);
    const filePath = path.join(ROOT, urlPath);

    // Basic safety: prevent escaping the project folder
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("403 Forbidden");
        return;
    }

    sendFile(res, filePath);
});

server.listen(PORT, () => {
    console.log("=======================================");
    console.log(`Portfolio server running!`);
    console.log(`Open this in your browser:`);
    console.log(`  http://localhost:${PORT}`);
    console.log("");
    console.log("Edits you Save will be written directly");
    console.log("into index.html in this folder.");
    console.log("Press Ctrl+C to stop the server.");
    console.log("=======================================");
});
