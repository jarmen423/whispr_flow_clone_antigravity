/**
 * Generate PWA Icons
 * 
 * Generates simple SVG-based icons for the LocalFlow PWA.
 * Run with: node scripts/generate-icons.js
 */

const fs = require("fs");
const path = require("path");

// Simple LocalFlow icon SVG (microphone with sound waves)
const iconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  
  <!-- Microphone -->
  <g transform="translate(50, 50)" fill="white">
    <!-- Mic body -->
    <rect x="-12" y="-20" width="24" height="32" rx="12"/>
    
    <!-- Mic stand -->
    <path d="M -20 5 Q -20 -25 0 -25 Q 20 -25 20 5 L 20 8 Q 20 20 0 20 Q -20 20 -20 8 Z" 
          fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/>
    
    <!-- Mic base -->
    <line x1="0" y1="20" x2="0" y2="32" stroke="white" stroke-width="5" stroke-linecap="round"/>
    <line x1="-15" y1="32" x2="15" y2="32" stroke="white" stroke-width="5" stroke-linecap="round"/>
    
    <!-- Sound waves -->
    <path d="M -28 -8 Q -32 -8 -32 0 Q -32 8 -28 8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <path d="M 28 -8 Q 32 -8 32 0 Q 32 8 28 8" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <path d="M -36 -12 Q -42 -12 -42 0 Q -42 12 -36 12" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <path d="M 36 -12 Q 42 -12 42 0 Q 42 12 36 12" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  </g>
</svg>
`;

// Generate PNG from SVG using a simple canvas-based approach
// Since we can't use canvas in Node easily, we'll just save the SVGs
// and let Next.js handle them, or use a simple data URL approach

const sizes = [192, 512];

const publicDir = path.join(__dirname, "..", "public");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate SVG icons for now
// In production, you'd want to convert these to PNG
sizes.forEach((size) => {
  const svg = iconSVG(size);
  const filename = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg.trim());
  console.log(`Generated: ${filename}`);
});

// Also generate a favicon.svg
const faviconSVG = iconSVG(32);
fs.writeFileSync(path.join(publicDir, "favicon.svg"), faviconSVG.trim());
console.log("Generated: favicon.svg");

console.log("\nNote: For production, convert these SVGs to PNGs.");
console.log("You can use tools like:");
console.log("  - sharp (Node.js): npm install sharp");
console.log("  - Inkscape (CLI)");
console.log("  - Online converters");
