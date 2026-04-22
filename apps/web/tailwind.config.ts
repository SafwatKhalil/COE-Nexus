// Tailwind v4 — theme is configured via @theme in globals.css.
// This file only needs to declare content paths (v4 auto-detects most),
// and is retained for editor tooling compatibility.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts}',
  ],
}

export default config
