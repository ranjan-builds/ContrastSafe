# ContrastSafe

ContrastSafe is an **accessible color palette generator** designed to help designers and developers easily create WCAG-compliant color schemes for UI/UX projects. With live previews, contrast analysis, and lightning-fast palette generation, ContrastSafe ensures your color choices are visually appealing and accessible to all users.

## Features

- **WCAG AA/AAA Standards:** Quickly toggle between compliance levels (4.5:1 and 7:1).
- **Instant Palette Generation:** Generate entire color palettes at the click of a button.
- **Contrast Matrix:** Visualize and verify the contrast ratio between every pair of palette colors.
- **Live Preview:** See your palette in action on a realistic mock UI.
- **One-click Copy:** Instantly copy any color from the palette to your clipboard.
- **Theme Modes:** Generate palettes for light, dark, or random themes.

## Demo

Open `index.html` directly in your browser—**no build or installation steps required.**

![ContrastSafe Screenshot](screenshot.png) <!-- Add screenshot if available -->

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)

### Usage

1. Download or clone the repository.
2. Open `index.html`.  
   ```
   git clone https://github.com/ranjan-builds/ContrastSafe.git
   cd ContrastSafe
   open index.html   # Or double-click the file
   ```
3. Use the navbar controls to toggle AA/AAA mode and generate new palettes.
4. Explore the "Palette" panel and the "Contrast Matrix" for accessibility assessment.
5. Check the right-side "Live Preview" to see your palette applied to a sample interface.
6. Copy any color by clicking on its swatch.

### File Overview

- `index.html` — Main application UI using Tailwind CSS, Google Fonts, and FontAwesome (via CDN)
- `script.js` — Application logic: color generation, contrast calculation, UI updates

## How It Works

ContrastSafe uses luminance and contrast ratio calculations to algorithmically adjust palette colors. It automatically generates background, surface, text, brand, and accent colors that meet accessibility standards. The app provides a quick-glance contrast matrix and live sample interface to preview your chosen palette in a real-world context.

## Accessibility

- All color data is generated to be **WCAG AA or AAA compliant** (4.5:1 or 7:1 ratios).
- Contrast ratios are shown for all color pairs in the palette.
- The "Math" section explains how calculations are performed.

## Tech Stack

- **HTML5**
- **JavaScript** (Vanilla)
- **Tailwind CSS** (CDN)
- **Google Fonts** (Outfit & Plus Jakarta Sans)
- **FontAwesome** (CDN)

## Contributing

Pull requests are welcome! Please open an issue first for feedback or discussion.


## Authors

- [ranjan-builds](https://github.com/ranjan-builds)

---
*Accessible colors, beautiful products—a better web for everyone.*
