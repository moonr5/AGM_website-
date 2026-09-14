const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const REDIRECTS = {
  "en/people": "/en/about/",
  "en/corporate": "/en/about/",
  "en/investors": "/en/about/",
  "en/our-fleet": "/en/#range",
  "en/enquire": "/en/contacts/",
  "en/owner-care": "/en/services/",
  "en/arts-and-culture": "/en/sustainability/",
  "en/brand-representative": "/en/contacts/",
};

function redirectHtml(target) {
  return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0;url=${target}">
    <link rel="canonical" href="${target}">
</head>
<body>
    <p>Redirecting to <a href="${target}">${target}</a>...</p>
</body>
</html>
`;
}

for (const [rel, target] of Object.entries(REDIRECTS)) {
  const file = path.join(ROOT, rel);
  fs.writeFileSync(file, redirectHtml(target), "utf8");
  console.log("redirect:", rel, "->", target);
}

const privacy = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Privacy Policy — PT. Agara Global Maritim</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 24px; line-height: 1.7; color: #111; }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        a { color: #000; }
    </style>
</head>
<body>
    <p><a href="/en/">← Back to Home</a></p>
    <h1>Privacy Policy</h1>
    <p>PT. Agara Global Maritim ("AGM") respects your privacy. We only collect personal information that you voluntarily provide when contacting us (such as name, email, or phone number) to respond to inquiries about our marine services.</p>
    <p>We do not sell your personal data. Information may be used to communicate about charter, shipbuilding, or support services you request.</p>
    <p>For privacy questions, contact us at ardi.2772@gmail.com or +62 813-5439-6700.</p>
    <p><strong>PT. Agara Global Maritim</strong> — Marunda, North Jakarta</p>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "en/privacy-policy"), privacy, "utf8");
console.log("wrote: en/privacy-policy");
