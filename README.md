# Istawra Consulting

**Version:** v2.0

**Description:** Static site intended for GitHub Pages deployment.

## Structure

```
/
├── index.html                (Home)
├── advisory.html             (Advisory)
├── insights.html             (Insights)
├── how-we-think.html         (How We Think)
├── about.html                (About)
├── contact.html              (Contact)
│
├── assets/
│   ├── css/
│   │   └── main.css          (Single stylesheet)
│   │
│   ├── images/
│   │   ├── logo.svg          (Primary logo)
│   │   ├── logo-white.svg    (Reverse logo)
│   │   └── favicon.svg       (Favicon)
│   │
│   └── fonts/                (Reserved for custom fonts)
│
└── README.md                 (This file)
```

## Deployment

1. Download all files from this directory
2. Drop them into your GitHub repository root
3. Commit as: `Release: istawra.com v2.0`
4. Push to main branch
5. GitHub Pages will automatically deploy from the root directory

## Testing Locally

To test the site locally before deployment:

```bash
# Using Python 3
python3 -m http.server 8000

# Then open http://localhost:8000 in your browser
```

## Features

- Pure HTML5 + CSS (no frameworks, no build step required)
- Responsive design (desktop-first, mobile-optimized)
- Institutional typography (Crimson Text serif)
- Semantic HTML structure
- All links use relative paths for portability

## Notes

- No server-side code required
- No build process needed
- Works by opening `index.html` locally in any browser
- Ready for immediate GitHub Pages deployment
