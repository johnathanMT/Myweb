#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# cleanup-deadcode.sh — remove pre-existing dead components from the portfolio.
#
# Every file below is UNREACHABLE from the app entry (src/main.tsx) — verified
# with an import-graph crawl. None is imported by any live component, so removing
# them changes nothing at runtime; it only shrinks the repo and the type-check
# surface. (`git rm` keeps them in history if ever needed.)
#
# NOTE: ArticleCard.tsx is included because it is the ONLY importer of the (also
# dead) MediaGallery.tsx — deleting MediaGallery without it would leave a broken
# import. Both are dead, so they go together.
#
# Run from the repo root (Myweb_Frontend):   bash scripts/cleanup-deadcode.sh
# ────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

git rm -f "src/components/AboutMe.tsx"
git rm -f "src/components/ArticleCard.tsx"
git rm -f "src/components/BlogSnippets.tsx"
git rm -f "src/components/CRTHero.tsx"
git rm -f "src/components/CyberCursor.tsx"
git rm -f "src/components/Lightbox.tsx"
git rm -f "src/components/MarqueeGallery.tsx"
git rm -f "src/components/MediaGallery.tsx"
git rm -f "src/components/Projects.tsx"
git rm -f "src/hooks/useIsMobile.ts"
git rm -f "src/lib/cyberScroll.js"

echo ""
echo "Removed 11 dead files. Verify nothing broke:  npm run build"
