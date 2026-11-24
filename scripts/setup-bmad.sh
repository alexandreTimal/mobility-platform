#!/usr/bin/env bash
# Installe BMad à l'identique pour chaque membre de l'équipe (AD-14).
# Appelé par `pnpm bootstrap` ; peut aussi être lancé seul : ./scripts/setup-bmad.sh
set -euo pipefail

BMAD_VERSION="6.12.2"
MODULES="bmm,tea,cis"
PINS=(--pin tea=v1.27.2 --pin cis=v0.3.2)

if [ -n "${CI:-}" ] || [ "${SKIP_BMAD:-0}" = "1" ]; then
  echo "→ BMad ignoré (CI ou SKIP_BMAD=1)."
  exit 0
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT/_bmad/_config/manifest.yaml"

if ! command -v npx >/dev/null 2>&1; then
  echo "✗ npx introuvable : installe Node.js 24 (voir README)." >&2
  exit 1
fi

if [ -f "$MANIFEST" ] && grep -q "version: $BMAD_VERSION" "$MANIFEST"; then
  ACTION=(--action quick-update)
  echo "→ BMad $BMAD_VERSION déjà installé : mise à jour rapide des skills."
else
  ACTION=()
  echo "→ Installation de BMad $BMAD_VERSION…"
fi

USER_NAME="$(git -C "$ROOT" config user.name || true)"

npx -y "bmad-method@$BMAD_VERSION" install \
  --directory "$ROOT" \
  --modules "$MODULES" \
  "${PINS[@]}" \
  --tools claude-code \
  --user-name "${USER_NAME:-Contributeur}" \
  --communication-language French \
  --document-output-language French \
  --set "tea.test_artifacts={project-root}/_bmad-output/test-artifacts" \
  --no-shims \
  --yes \
  "${ACTION[@]}" </dev/null

cat <<'EOF'

✓ BMad est installé. En bref :
  • Dans Claude Code, tape /mobility-help : où en est le projet, où trouver quoi, quoi faire ensuite.
  • /bmad-help : quel skill BMad utiliser maintenant.
  • /bmad-build #N : développer une issue (code, tests, revue) ; /bmad-code-review pour relire une PR.
  • Un skill = un contexte neuf (/clear entre deux).
  • Les règles du projet sont dans docs/technique/architecture.md : l'IA doit les respecter, toi aussi.
  Guide complet : docs/guide/bmad.md
EOF
