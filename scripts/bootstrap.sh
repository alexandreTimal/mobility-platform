#!/usr/bin/env bash
# Installe et prépare la plateforme en une commande (AD-13) : `pnpm bootstrap`.
# Idempotent : peut être relancé sans casse (le .env existant est conservé,
# seules les valeurs Supabase locales y sont mises à jour).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REQUIRED_NODE="24.3"

step() { printf '\n→ %s\n' "$1"; }
fail() { printf '\n✗ %s\n' "$1" >&2; exit 1; }

# --- 1. Prérequis -----------------------------------------------------------

step "Vérification des prérequis"

command -v node >/dev/null 2>&1 \
  || fail "Node.js est introuvable. Installe Node.js ${REQUIRED_NODE} ou plus récent (voir .nvmrc et le README)."

if ! node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit(major > 24 || (major === 24 && minor >= 3) ? 0 : 1);
'; then
  fail "Node.js $(node -v) est trop ancien : la version ${REQUIRED_NODE} ou plus récente est requise (\`nvm install\` lit .nvmrc)."
fi
echo "  ✓ Node.js $(node -v)"

if ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm est introuvable. Active-le avec \`corepack enable pnpm\` (Node ≥ 24.15) ou installe-le avec \`npm install -g pnpm@12\`.
  La version exacte du dépôt (champ packageManager) est ensuite sélectionnée automatiquement."
fi
# Un pnpm 10 ou 11 global bascule tout seul sur la version du dépôt, mais installe
# alors un lanceur sans shebang que Turborepo ne sait pas exécuter (`pnpm test` échoue
# avec « Exec format error »). On le détecte ici plutôt qu'au premier `pnpm test`.
if ! pnpm exec sh -c '
  p="$(command -v pnpm)"
  magic="$(head -c 4 "$p" | od -An -c | tr -d " ")"
  case "$magic" in "#!"*|*ELF*) exit 0 ;; *) exit 1 ;; esac
' >/dev/null 2>&1; then
  fail "Le pnpm installé ($(cd / && pnpm --version)) ne peut pas lancer la version du dépôt pour Turborepo.
  Installe pnpm 12 : \`npm install -g pnpm@12\` (ou \`corepack enable pnpm\` avec Node ≥ 24.15), puis relance \`pnpm bootstrap\`."
fi
echo "  ✓ pnpm $(pnpm --version)"

command -v docker >/dev/null 2>&1 \
  || fail "Docker est introuvable : installe Docker (Docker Desktop ou Docker Engine) puis relance \`pnpm bootstrap\`."
docker info >/dev/null 2>&1 \
  || fail "Docker n'est pas démarré : lance Docker puis relance \`pnpm bootstrap\` (Supabase local tourne dans Docker)."
echo "  ✓ Docker démarré"

# --- 2. Dépendances ---------------------------------------------------------

step "Installation des dépendances"
pnpm install

# --- 3. BMad (ignoré en CI ou avec SKIP_BMAD=1) -----------------------------

step "Outils IA (BMad)"
bash "$ROOT/scripts/setup-bmad.sh"

# --- 4. Fichier .env --------------------------------------------------------

step "Fichier .env"
if [ -f .env ]; then
  echo "  ✓ .env existant conservé"
else
  cp .env.example .env
  echo "  ✓ .env créé depuis .env.example"
fi

# Remplace (ou ajoute) KEY=valeur dans .env sans toucher aux autres lignes.
set_env() {
  local key="$1" value="$2" tmp
  tmp="$(mktemp)"
  awk -v key="$key" -v value="$value" '
    BEGIN { done = 0 }
    $0 ~ "^" key "=" { print key "=" value; done = 1; next }
    { print }
    END { if (!done) print key "=" value }
  ' .env >"$tmp"
  cat "$tmp" >.env
  rm -f "$tmp"
}

# --- 5. Supabase local ------------------------------------------------------

step "Démarrage de Supabase en local (le premier lancement télécharge les images Docker)"
pnpm exec supabase start

STATUS="$(pnpm exec supabase status -o env 2>/dev/null)" \
  || fail "Impossible de lire l'état de Supabase local (\`pnpm exec supabase status\`)."

status_value() {
  printf '%s\n' "$STATUS" | sed -n "s/^$1=\"\(.*\)\"\$/\1/p"
}

DB_URL="$(status_value DB_URL)"
API_URL="$(status_value API_URL)"
PUBLISHABLE_KEY="$(status_value PUBLISHABLE_KEY)"
SECRET_KEY="$(status_value SECRET_KEY)"

for name in DB_URL API_URL PUBLISHABLE_KEY SECRET_KEY; do
  [ -n "${!name}" ] || fail "Valeur ${name} absente de \`supabase status\` : vérifie la version de la CLI Supabase."
done

set_env DATABASE_URL "$DB_URL"
set_env DATABASE_URL_MIGRATIONS "$DB_URL"
set_env NEXT_PUBLIC_SUPABASE_URL "$API_URL"
set_env NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "$PUBLISHABLE_KEY"
set_env SUPABASE_SECRET_KEY "$SECRET_KEY"
echo "  ✓ URL et clés locales reportées dans .env"

# --- 6. Migrations et données de démo ---------------------------------------

step "Application des migrations"
pnpm db:migrate

step "Chargement des données de démo"
pnpm db:seed

cat <<EOF

✓ Installation terminée.
  • pnpm dev   : lance la plateforme sur http://localhost:3000
  • pnpm test  : lance tous les tests
  • Supabase Studio : $(status_value STUDIO_URL)
EOF
