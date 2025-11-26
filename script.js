// --- Configuration & State ---
let currentStandard = "AA"; // 'AA' or 'AAA'
let currentTheme = "random"; // 'light', 'dark', 'random'
let palette = {};

const RATIO_AA = 4.5;
const RATIO_AAA = 7.0;
const RATIO_LARGE_TEXT = 3.0; // AA large text
const RATIO_UI_COMPONENT = 3.0; // UI components/graphics

// --- Color Utilities ---

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// --- Generation Logic ---

function getRandomHue() {
  return Math.floor(Math.random() * 360);
}

function adjustLuminanceForContrast(fixedHex, hue, sat, startLum, targetRatio) {
  let lum = startLum;
  let currentHex = hslToHex(hue, sat, lum);
  let currentRatio = getContrastRatio(fixedHex, currentHex);

  // Safety break
  let iterations = 0;
  const maxIterations = 100;

  // Determine direction
  const fixedRgb = hexToRgb(fixedHex);
  const fixedLum = getLuminance(fixedRgb.r, fixedRgb.g, fixedRgb.b);
  const direction = fixedLum < 0.5 ? 1 : -1;

  while (currentRatio < targetRatio && iterations < maxIterations) {
    lum += 2 * direction;
    if (lum > 98) {
      lum = 98;
      break;
    }
    if (lum < 2) {
      lum = 2;
      break;
    }

    currentHex = hslToHex(hue, sat, lum);
    currentRatio = getContrastRatio(fixedHex, currentHex);
    iterations++;
  }

  return { hex: currentHex, h: hue, s: sat, l: lum };
}

function generatePalette() {
  const target = currentStandard === "AA" ? RATIO_AA : RATIO_AAA;
  let isDarkTheme = false;

  if (currentTheme === "light") isDarkTheme = false;
  else if (currentTheme === "dark") isDarkTheme = true;
  else isDarkTheme = Math.random() < 0.5;

  // 1. Generate Background
  const bgHue = getRandomHue();
  const bgSat = Math.floor(Math.random() * 20) + 5;
  const bgLum = isDarkTheme
    ? Math.floor(Math.random() * 10) + 5
    : Math.floor(Math.random() * 8) + 90;
  const bgHex = hslToHex(bgHue, bgSat, bgLum);

  // 2. Generate Surface (Card Bg)
  const surfLum = isDarkTheme ? bgLum + 5 : bgLum - 5;
  const surfHex = hslToHex(bgHue, bgSat, surfLum);

  // 3. Generate Primary Text (Strict Contrast against BG)
  const textHue = (bgHue + 180) % 360;
  const textSat = 10;
  const textStartLum = isDarkTheme ? 90 : 10;
  const textObj = adjustLuminanceForContrast(
    bgHex,
    textHue,
    textSat,
    textStartLum,
    target
  );

  // 4. Generate Brand/Action Color
  const brandHue = getRandomHue();
  const brandSat = Math.floor(Math.random() * 40) + 50;
  const brandStartLum = isDarkTheme ? 60 : 40;
  const brandObj = adjustLuminanceForContrast(
    bgHex,
    brandHue,
    brandSat,
    brandStartLum,
    RATIO_UI_COMPONENT
  );

  // 5. Generate Accent/Secondary
  const accentHue = (brandHue + 120) % 360;
  const accentSat = Math.floor(Math.random() * 30) + 50;
  const accentStartLum = isDarkTheme ? 70 : 40;
  const accentObj = adjustLuminanceForContrast(
    bgHex,
    accentHue,
    accentSat,
    accentStartLum,
    3.0
  );

  // Determine Text Color on Brand Button (White or Black)
  const brandRgb = hexToRgb(brandObj.hex);
  const brandLum = getLuminance(brandRgb.r, brandRgb.g, brandRgb.b);
  const onBrandHex = brandLum < 0.5 ? "#ffffff" : "#000000";

  palette = {
    background: bgHex,
    surface: surfHex,
    text: textObj.hex,
    brand: brandObj.hex,
    accent: accentObj.hex,
    onBrand: onBrandHex,
  };

  updateUI();
}

// --- UI Updates ---

function updateUI() {
  renderPaletteSwatches();
  renderMatrix();
  applyPreviewStyles();
}

function renderPaletteSwatches() {
  const container = document.getElementById("palette-container");
  container.innerHTML = "";

  const roles = [
    { key: "background", label: "Background", desc: "Page Base" },
    { key: "surface", label: "Surface", desc: "Cards / Panels" },
    { key: "text", label: "Text", desc: "Headings / Body" },
    { key: "brand", label: "Brand", desc: "Primary Actions" },
    { key: "accent", label: "Accent", desc: "Highlights / Data" },
  ];

  roles.forEach((role) => {
    const hex = palette[role.key];
    const div = document.createElement("div");
    div.className =
      "flex items-center p-3 rounded-lg mb-1 hover:bg-slate-800/50 transition-colors group cursor-pointer";

    const swatchTextColor =
      getContrastRatio(hex, "#ffffff") > 2 ? "#ffffff" : "#000000";

    div.onclick = () => copyToClipboard(hex);
    div.innerHTML = `
                    <div class="w-12 h-12 rounded-xl shadow-sm mr-4 shrink-0 flex items-center justify-center relative border border-white/10" 
                         style="background-color: ${hex}; color: ${swatchTextColor}">
                         <i class="fa-regular fa-clone opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"></i>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center mb-0.5">
                            <span class="font-bold text-slate-200 text-sm font-heading">${role.label}</span>
                            <span class="font-mono text-xs text-slate-400 opacity-60 group-hover:opacity-100 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">${hex}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 font-medium">${role.desc}</p>
                    </div>
                `;
    container.appendChild(div);
  });
}

function renderMatrix() {
  const matrix = document.getElementById("contrast-matrix");
  matrix.innerHTML = "";

  const keys = ["background", "surface", "text", "brand", "accent"];
  const labels = ["Bg", "Surf", "Text", "Brand", "Acc"];

  // Header Row
  let headerHtml = '<tr><th class="p-2"></th>';
  labels.forEach(
    (l) =>
      (headerHtml += `<th class="p-2 text-slate-500 font-bold uppercase text-[10px] tracking-wider">${l}</th>`)
  );
  headerHtml += "</tr>";
  matrix.innerHTML += headerHtml;

  // Rows
  keys.forEach((rowKey, i) => {
    let rowHtml = `<tr><th class="p-2 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">${labels[i]}</th>`;
    keys.forEach((colKey) => {
      if (rowKey === colKey) {
        rowHtml += `<td class="p-2 text-center text-slate-700">-</td>`;
      } else {
        const ratio = getContrastRatio(
          palette[rowKey],
          palette[colKey]
        ).toFixed(2);
        const isPass =
          ratio >= (currentStandard === "AA" ? RATIO_AA : RATIO_AAA);
        const badgeClass = isPass
          ? "bg-green-500/20 text-green-400 font-bold border border-green-500/20"
          : "bg-red-500/10 text-red-400/50 border border-red-500/10 opacity-70";

        rowHtml += `<td class="p-2 text-center"><span class="${badgeClass} px-2 py-0.5 rounded text-[10px] inline-block w-10">${ratio}</span></td>`;
      }
    });
    rowHtml += "</tr>";
    matrix.innerHTML += rowHtml;
  });
}

function applyPreviewStyles() {
  const p = palette;

  // Container
  const prevContainer = document.getElementById("preview-container");
  prevContainer.style.backgroundColor = p.background;
  prevContainer.style.color = p.text;

  // Nav
  const nav = document.getElementById("prev-nav");
  nav.style.backgroundColor = p.surface;
  nav.style.borderColor = adjustAlpha(p.text, 0.08);
  document.getElementById("prev-logo-icon").style.backgroundColor = p.brand;
  document.getElementById("prev-logo-icon").style.color = p.onBrand;
  document.getElementById("prev-logo-text").style.color = p.text;
  document.getElementById("prev-avatar").style.backgroundColor = p.accent;

  // Sidebar
  const sidebar = document.getElementById("prev-sidebar");
  sidebar.style.borderColor = adjustAlpha(p.text, 0.08);
  // Apply color to skeleton loaders
  Array.from(sidebar.children).forEach(
    (el) => (el.style.backgroundColor = p.text)
  );

  // Main Content
  document.getElementById("prev-h1").style.color = p.text;
  document.getElementById("prev-subtitle").style.color = adjustAlpha(
    p.text,
    0.6
  );

  // CTA Button
  const btn = document.getElementById("prev-cta");
  btn.style.backgroundColor = p.brand;
  btn.style.color = p.onBrand;

  // Cards
  const cards = ["prev-card-1", "prev-card-2", "prev-card-3"];
  cards.forEach((id) => {
    const el = document.getElementById(id);
    el.style.backgroundColor = p.surface;
    el.style.borderColor = adjustAlpha(p.text, 0.08);
  });

  // Graph Card
  const graphCard = document.getElementById("prev-graph-card");
  graphCard.style.backgroundColor = p.surface;
  graphCard.style.borderColor = adjustAlpha(p.text, 0.08);

  // SVG Lines
  document.getElementById("graph-line-1").style.stroke = p.brand;
  document.getElementById("graph-area-1").style.fill = p.brand;
  document.getElementById("graph-line-2").style.stroke = p.accent;

  // Form Inputs
  const input = document.getElementById("prev-input");
  input.style.backgroundColor = p.background;
  input.style.borderColor = adjustAlpha(p.text, 0.15);
  input.style.color = p.text;

  const select = document.getElementById("prev-select");
  select.style.backgroundColor = p.background;
  select.style.borderColor = adjustAlpha(p.text, 0.15);
  select.style.color = p.text;
}

// --- Helpers ---

function adjustAlpha(hex, opacity) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

function setStandard(std) {
  currentStandard = std;

  const btnAA = document.getElementById("mode-aa");
  const btnAAA = document.getElementById("mode-aaa");

  if (std === "AA") {
    btnAA.className =
      "px-4 py-1.5 text-sm font-semibold rounded-md bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 transition-all";
    btnAAA.className =
      "px-4 py-1.5 text-sm font-semibold rounded-md text-slate-400 hover:text-white transition-all";
    document.getElementById("compliance-badge").textContent =
      "WCAG AA Compliant";
    document.getElementById("math-ratio").textContent = "4.5:1";
  } else {
    btnAAA.className =
      "px-4 py-1.5 text-sm font-semibold rounded-md bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 transition-all";
    btnAA.className =
      "px-4 py-1.5 text-sm font-semibold rounded-md text-slate-400 hover:text-white transition-all";
    document.getElementById("compliance-badge").textContent =
      "WCAG AAA Compliant";
    document.getElementById("math-ratio").textContent = "7.0:1";
  }

  generatePalette();
}

function setThemeType(type) {
  currentTheme = type;
  generatePalette();
}

function copyToClipboard(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  // Visual feedback handled by CSS active states mostly, but could add toast here
}

// --- Initialization ---
window.addEventListener("DOMContentLoaded", () => {
  // Set initial state for buttons
  setStandard("AA");
});
