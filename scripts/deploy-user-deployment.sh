#!/usr/bin/env bash
#
# ============================================================================
#  Deploy Two-Monitor POS -> Convex deployment AKUN SENDIRI
#  Deployment ref : dev/jpxcode  (deployment: academic-chickadee-457)
#  Akun           : jepanx76@gmail.com (jpXCode)
# ============================================================================
#  Cara pakai:
#    bash scripts/deploy-user-deployment.sh
#
#  Yang dilakukan:
#    1. Memakai CONVEX_DEPLOY_KEY / CONVEX_DEPLOYMENT milik akun kamu
#    2. Push semua fungsi backend (produk, transaksi, auth) ke deployment kamu
#    3. Generate ulang tipe TypeScript dari deployment kamu
#
#  CATATAN KEAMANAN: file ini berisi deploy key. JANGAN commit/publish ke
#  repositori publik. Setelah deployment berhasil, regenerate key di dashboard
#  Convex dan perbarui file ini / Keys UI.
# ============================================================================
set -u

# --- Environment dari akun Convex kamu --------------------------------------
export CONVEX_DEPLOY_KEY="dev:academic-chickadee-457|eyJ2MiI6ImZlNzYzN2M1OThhZDRmMWZhOGUxMWExN2ExMTVkMmZiIn0="
export CONVEX_DEPLOYMENT="dev/jpxcode"
# URL client yang BENAR (bukan .convex.site):
export VITE_CONVEX_URL="https://academic-chickadee-457.convex.cloud"
# -----------------------------------------------------------------------------

echo ""
echo "==> Target deployment: ${CONVEX_DEPLOYMENT}"
echo "==> URL frontend        : ${VITE_CONVEX_URL}"
echo ""

# 1) Push backend + regenerate types (non-interactive, exit sendiri)
echo "==> Push fungsi backend ke deployment akun kamu ..."
npx convex dev --once

# 2) Tampilkan daftar fungsi yang ter-deploy (verifikasi)
echo ""
echo "==> Verifikasi fungsi ter-deploy:"
npx convex function-spec 2>/dev/null | head -40 || true

echo ""
echo "==> Selesai. Cek dashboard: https://dashboard.convex.cloud (deployment academic-chickadee-457)"
echo "==> Jangan lupa set env auth di deployment kamu (SITE_URL, JWT_PRIVATE_KEY, JWKS)"
