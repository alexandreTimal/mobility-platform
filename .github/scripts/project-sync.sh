#!/usr/bin/env bash
# Complète les workflows intégrés du GitHub Project (ajout auto → Backlog,
# PR liée → En revue, fermé/mergé → Terminé, réouvert → À faire) avec ce
# qu'ils ne savent pas faire :
#
#   push sur <type>/<N>-<slug>   → issue N : 🚧 En cours (si Backlog / À faire)
#                                   + le pousseur devient responsable si l'issue n'en a pas
#   PR fermée sans merge         → issues liées : 🎯 À faire (si En cours / En revue)
#
# Les issues sont trouvées via le nom de branche et les « Closes #N » de la PR.
# Variables : GH_TOKEN, PROJECT_OWNER, PROJECT_NUMBER, REPO, EVENT, BRANCH, ACTOR
#             + pour les PR : ACTION, PR_NUMBER, PR_MERGED
# DRY_RUN=1 affiche les changements sans rien modifier.
set -euo pipefail

log() { echo "[project-sync] $*"; }

if [[ -z "${GH_TOKEN:-}" ]]; then
  log "::warning::Secret PROJECT_TOKEN absent : synchronisation ignorée (voir CONTRIBUTING / README)."
  exit 0
fi
: "${PROJECT_OWNER:?}" "${PROJECT_NUMBER:?}" "${REPO:?}" "${EVENT:?}" "${BRANCH:?}"

run() { if [[ "${DRY_RUN:-0}" == 1 ]]; then log "DRY_RUN: $*"; else "$@"; fi; }

# --- Statut cible et statuts de départ autorisés ------------------------------
target=""; allowed_from=()   # vide = tout statut de départ accepté
case "$EVENT" in
  push)
    target="En cours"; allowed_from=("Backlog" "À faire") ;;
  pull_request)
    if [[ "${ACTION:-}" == closed && "${PR_MERGED:-false}" != true ]]; then
      target="À faire"; allowed_from=("En cours" "En revue")
    fi ;;
esac
[[ -z "$target" ]] && { log "Événement $EVENT/${ACTION:-} ignoré."; exit 0; }

# --- Issues concernées --------------------------------------------------------
issues=()
if [[ "$BRANCH" =~ ^[a-z]+/([0-9]+)- ]]; then issues+=("${BASH_REMATCH[1]}"); fi
if [[ "$EVENT" == pull_request && -n "${PR_NUMBER:-}" ]]; then
  while read -r n; do [[ -n "$n" ]] && issues+=("$n"); done < <(
    gh pr view "$PR_NUMBER" -R "$REPO" --json closingIssuesReferences -q '.closingIssuesReferences[].number')
fi
if [[ ${#issues[@]} -gt 0 ]]; then mapfile -t issues < <(printf '%s\n' "${issues[@]}" | sort -un); fi
if [[ ${#issues[@]} -eq 0 ]]; then
  log "::notice::Aucune issue liée (branche « $BRANCH »). Nommer la branche <type>/<N>-<slug> et mettre « Closes #N » dans la PR."
  exit 0
fi

# --- Métadonnées du Project ---------------------------------------------------
project_id=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json -q .id)
fields=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json)
status_field=$(jq -r '.fields[] | select(.name=="Status") | .id' <<<"$fields")
option_id=$(jq -r --arg t "$target" '.fields[] | select(.name=="Status") | .options[] | select(.name|endswith($t)) | .id' <<<"$fields")
[[ -z "$option_id" ]] && { log "::error::Statut « $target » introuvable dans le Project."; exit 1; }

owner=${REPO%/*}; name=${REPO#*/}
# shellcheck disable=SC2016
query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){issueOrPullRequest(number:$n){
  ... on Issue{ url assignees(first:1){totalCount}
    projectItems(first:20){nodes{id project{number}
      fieldValueByName(name:"Status"){... on ProjectV2ItemFieldSingleSelectValue{name}}}}}}}}'

for n in "${issues[@]}"; do
  if ! data=$(gh api graphql -f query="$query" -f o="$owner" -f r="$name" -F n="$n" -q .data.repository.issueOrPullRequest 2>/dev/null); then
    log "::warning::#$n introuvable dans $REPO, ignoré."; continue
  fi
  url=$(jq -r '.url // empty' <<<"$data")
  [[ -z "$url" ]] && { log "#$n n'est pas une issue, ignoré."; continue; }

  item_id=$(jq -r --argjson p "$PROJECT_NUMBER" '.projectItems.nodes[] | select(.project.number==$p) | .id' <<<"$data")
  current=$(jq -r --argjson p "$PROJECT_NUMBER" '.projectItems.nodes[] | select(.project.number==$p) | .fieldValueByName.name // ""' <<<"$data")

  if [[ -z "$item_id" ]]; then
    log "#$n absente du Project : ajout."
    if [[ "${DRY_RUN:-0}" == 1 ]]; then item_id="(dry-run)"; else
      item_id=$(gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$url" --format json -q .id); fi
  fi

  # Les statuts sont « <emoji> <nom> » : on compare sur la fin du libellé.
  allowed=1
  if [[ ${#allowed_from[@]} -gt 0 && -n "$current" ]]; then   # sans statut : toujours modifiable
    allowed=0; for s in "${allowed_from[@]}"; do [[ "$current" == *"$s" ]] && allowed=1; done
  fi
  if [[ $allowed == 0 ]]; then
    log "#$n : statut « ${current:-vide} » conservé (pas de passage vers « $target »)."
  elif [[ "$current" == *"$target" ]]; then
    log "#$n : déjà « $current »."
  else
    run gh project item-edit --project-id "$project_id" --id "$item_id" \
      --field-id "$status_field" --single-select-option-id "$option_id" >/dev/null
    log "#$n : « ${current:-vide} » → « $target »."
  fi

  if [[ "$EVENT" == push && -n "${ACTOR:-}" && "$(jq -r .assignees.totalCount <<<"$data")" == 0 ]]; then
    run gh issue edit "$n" -R "$REPO" --add-assignee "$ACTOR" >/dev/null && log "#$n : responsable → $ACTOR."
  fi
done
