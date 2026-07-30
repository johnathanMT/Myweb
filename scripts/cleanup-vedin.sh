#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# cleanup-vedin.sh — remove the Vedin/Jyotish astrology app from this portfolio.
#
# These files are reachable ONLY from the (now-removed) Vedin routes and are NOT
# used by any remaining portfolio component — verified by an import-graph crawl.
# Deleting them drops the Vedin, Algorithms (KaTeX) and admin chunks from the
# build entirely. Safe to run: `git rm` keeps everything in history.
#
# Run from the repo root (Myweb_Frontend):   bash scripts/cleanup-vedin.sh
# ────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

git rm -f "src/components/Algorithms.tsx"
git rm -f "src/components/AreaRadar.tsx"
git rm -f "src/components/AshtakavargaView.tsx"
git rm -f "src/components/CustomerPanel.tsx"
git rm -f "src/components/DiamondChart.tsx"
git rm -f "src/components/Jyotish.tsx"
git rm -f "src/components/KundliChart.tsx"
git rm -f "src/components/MarkdownView.tsx"
git rm -f "src/components/Research.tsx"
git rm -f "src/components/ShadbalaView.tsx"
git rm -f "src/components/TimelineChart.tsx"
git rm -f "src/components/VedinAdmin.tsx"
git rm -f "src/lib/jyotish.ts"
git rm -f "src/lib/research.ts"
git rm -f "src/lib/stats.ts"
git rm -f "src/lib/stats.test.ts"
git rm -f "src/types/astrology.ts"
git rm -f "src/types/tz-lookup.d.ts"

echo ""
echo "Removed Vedin source files. Optional — drop now-unused npm deps too:"
echo "    npm uninstall tz-lookup katex"
echo ""
echo "Then verify:  npm run build"
