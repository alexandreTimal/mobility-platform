#!/usr/bin/env bash
# Rituel de suivi des tâches (voir docs/plans/2026-11-24-suivi-design.md).
#
#   scripts/task.sh who                       qui travaille sur quoi
#   scripts/task.sh start <N> [--force]       prendre l'issue N (assigne, En cours, branche, commentaire)
#   scripts/task.sh note <N> "<texte>"        point d'étape
#   scripts/task.sh block <N> "<raison>"      label « bloqué » + commentaire
#   scripts/task.sh unblock <N>               retire « bloqué »
#   scripts/task.sh release <N> ["<raison>"]  lâcher la tâche (À faire, sans responsable)
#
# Prérequis : gh (scope project), jq, git. DRY_RUN=1 n'effectue aucune modification.
set -euo pipefail

REPO=${REPO:-alexandreTimal/mobility-platform}
PROJECT_OWNER=${PROJECT_OWNER:-alexandreTimal}
PROJECT_NUMBER=${PROJECT_NUMBER:-3}
BLOCKED_LABEL="bloqué"

die() { echo "✖ $*" >&2; exit 1; }
info() { echo "› $*"; }
run() { if [[ "${DRY_RUN:-0}" == 1 ]]; then echo "  DRY_RUN: $*"; else "$@"; fi; }
usage() { sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

command -v gh >/dev/null || die "gh introuvable."
command -v jq >/dev/null || die "jq introuvable."

me() { gh api user -q .login; }

# --- Project : identifiants et options du champ Status -------------------------
project_meta() {
  # shellcheck disable=SC2016
  gh api graphql -f l="$PROJECT_OWNER" -F p="$PROJECT_NUMBER" -f query='query($l:String!,$p:Int!){user(login:$l){projectV2(number:$p){id
    field(name:"Status"){... on ProjectV2SingleSelectField{id options{id name}}}}}}' -q .data.user.projectV2
}

# Données de l'issue N : id, titre, état, responsables, labels, élément et statut dans le Project.
issue_data() {
  # shellcheck disable=SC2016
  gh api graphql -f o="${REPO%/*}" -f r="${REPO#*/}" -F n="$1" -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){issue(number:$n){
    id number title state url assignees(first:10){nodes{login}} labels(first:20){nodes{name}}
    projectItems(first:20){nodes{id project{number} fieldValueByName(name:"Status"){... on ProjectV2ItemFieldSingleSelectValue{name}}}}}}}' \
    -q .data.repository.issue 2>/dev/null || true
}

load_issue() {
  [[ "${1:-}" =~ ^[0-9]+$ ]] || die "Numéro d'issue attendu."
  N=$1
  DATA=$(issue_data "$N")
  jq -e '.id' >/dev/null 2>&1 <<<"$DATA" || die "Issue #$N introuvable dans $REPO."
  TITLE=$(jq -r .title <<<"$DATA")
  STATUS=$(jq -r --argjson p "$PROJECT_NUMBER" '[.projectItems.nodes[] | select(.project.number==$p)][0].fieldValueByName.name // ""' <<<"$DATA")
  ASSIGNEES=$(jq -r '[.assignees.nodes[].login] | join(" ")' <<<"$DATA")
}

# set_status <statut sans emoji> : ajoute l'issue au Project si besoin, puis change son statut.
set_status() {
  local target=$1 meta project_id field option item
  meta=$(project_meta)
  project_id=$(jq -r .id <<<"$meta")
  field=$(jq -r .field.id <<<"$meta")
  option=$(jq -r --arg t "$target" '.field.options[] | select(.name|endswith($t)) | .id' <<<"$meta")
  [[ -n "$option" ]] || die "Statut « $target » introuvable dans le Project."
  item=$(jq -r --argjson p "$PROJECT_NUMBER" '[.projectItems.nodes[] | select(.project.number==$p)][0].id // ""' <<<"$DATA")
  if [[ -z "$item" ]]; then
    if [[ "${DRY_RUN:-0}" == 1 ]]; then item="(dry-run)"; else
      # shellcheck disable=SC2016
      item=$(gh api graphql -f p="$project_id" -f c="$(jq -r .id <<<"$DATA")" \
        -f query='mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}' \
        -q .data.addProjectV2ItemById.item.id)
    fi
  fi
  # shellcheck disable=SC2016
  run gh api graphql -f p="$project_id" -f i="$item" -f f="$field" -f o="$option" \
    -f query='mutation($p:ID!,$i:ID!,$f:ID!,$o:String!){updateProjectV2ItemFieldValue(input:{projectId:$p,itemId:$i,fieldId:$f,value:{singleSelectOptionId:$o}}){projectV2Item{id}}}' >/dev/null
  info "#$N : « ${STATUS:-sans statut} » → « $target »."
}

comment() { run gh issue comment "$N" -R "$REPO" --body "$1" >/dev/null; info "#$N : commentaire ajouté."; }

# Branche <type>/<N>-<slug> à partir du titre Conventional Commits.
branch_name() {
  local type slug
  type=$(sed -nE 's/^([a-z0-9]+)(\([^)]*\))?!?:.*/\1/p' <<<"$TITLE")
  [[ -n "$type" ]] || type=chore
  slug=$(sed -E 's/^[a-z0-9]+(\([^)]*\))?!?:[[:space:]]*//' <<<"$TITLE" \
    | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/ /g' \
    | awk '{ s = ""; for (i = 1; i <= NF; i++) { t = s (s ? "-" : "") $i; if (length(t) > 40) break; s = t } print s }')
  echo "$type/$N-${slug:-tache}"
}

# --- Commandes -----------------------------------------------------------------
cmd_who() {
  # shellcheck disable=SC2016
  gh api graphql -f l="$PROJECT_OWNER" -F p="$PROJECT_NUMBER" -f query='query($l:String!,$p:Int!){user(login:$l){projectV2(number:$p){
    items(first:100){nodes{fieldValueByName(name:"Status"){... on ProjectV2ItemFieldSingleSelectValue{name}}
      content{... on Issue{number title state assignees(first:5){nodes{login}} labels(first:20){nodes{name}}}}}}}}}' \
    -q '.data.user.projectV2.items.nodes[]
        | select(.content.number != null and .content.state == "OPEN")
        | select((.fieldValueByName.name // "") | test("En cours|En revue"))
        | [ (.fieldValueByName.name),
            ("#" + (.content.number|tostring)),
            ([.content.assignees.nodes[].login] | if length == 0 then "personne" else join(", ") end),
            ((if ([.content.labels.nodes[].name] | index("'"$BLOCKED_LABEL"'")) then "⛔ " else "" end) + .content.title) ]
        | @tsv' | sort | column -t -s $'\t' || true
}

cmd_start() {
  local force=0 user branch existing
  [[ "${2:-}" == --force ]] && force=1
  load_issue "${1:-}"
  [[ "$(jq -r .state <<<"$DATA")" == OPEN ]] || die "#$N est fermée."
  user=$(me)

  if [[ "$STATUS" =~ (En\ cours|En\ revue)$ && -n "$ASSIGNEES" && " $ASSIGNEES " != *" $user "* && $force == 0 ]]; then
    die "#$N est déjà « $STATUS » chez $ASSIGNEES. Parlez-en, puis relancez avec --force si besoin."
  fi

  [[ " $ASSIGNEES " == *" $user "* ]] || { run gh issue edit "$N" -R "$REPO" --add-assignee "$user" >/dev/null; info "#$N : responsable → $user."; }
  [[ "$STATUS" == *"En cours" ]] && info "#$N : déjà « $STATUS »." || set_status "En cours"

  run git fetch -q origin main
  existing=$(git ls-remote --heads origin 2>/dev/null | sed -nE "s#.*refs/heads/([a-z0-9]+/$N-.*)#\1#p" | head -1)
  if [[ -n "$existing" ]]; then
    branch=$existing; info "Branche existante : $branch."
  else
    branch=$(branch_name)
    run git push -q origin "origin/main:refs/heads/$branch"
    info "Branche créée et poussée : $branch."
  fi
  if [[ -z "$(git status --porcelain)" ]]; then
    run git fetch -q origin "$branch"
    if git show-ref -q --verify "refs/heads/$branch"; then run git switch -q "$branch"
    else run git switch -q -c "$branch" --track "origin/$branch"; fi
    info "Basculé sur $branch."
  else
    info "Dossier de travail non propre : basculer plus tard avec « git switch $branch » (ou utiliser un worktree)."
  fi

  comment "▶️ **Démarré** par @$user sur la branche \`$branch\`."
}

cmd_note() {
  load_issue "${1:-}"; [[ -n "${2:-}" ]] || die "Texte du point d'étape attendu."
  comment "🔄 **Point d'étape** (@$(me))"$'\n\n'"$2"
}

cmd_block() {
  load_issue "${1:-}"; [[ -n "${2:-}" ]] || die "Raison du blocage attendue."
  run gh issue edit "$N" -R "$REPO" --add-label "$BLOCKED_LABEL" >/dev/null
  comment "⛔ **Bloqué** (@$(me)) : $2"
}

cmd_unblock() {
  load_issue "${1:-}"
  run gh issue edit "$N" -R "$REPO" --remove-label "$BLOCKED_LABEL" >/dev/null
  comment "✅ **Débloqué** (@$(me))${2:+ : $2}"
}

cmd_release() {
  local user; load_issue "${1:-}"; user=$(me)
  set_status "À faire"
  [[ " $ASSIGNEES " == *" $user "* ]] && { run gh issue edit "$N" -R "$REPO" --remove-assignee "$user" >/dev/null; info "#$N : $user n'est plus responsable."; }
  comment "⏹️ **Tâche libérée** par @$user${2:+ : $2}"
}

case "${1:-}" in
  who) cmd_who ;;
  start|note|block|unblock|release) c=$1; shift; "cmd_$c" "$@" ;;
  -h|--help|help|"") usage ;;
  *) echo "Commande inconnue : $1" >&2; usage 1 ;;
esac
