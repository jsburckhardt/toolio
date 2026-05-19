# installed by sdd-evolution-harness-engineering workshop
# drift.sh — detect drift across the six triggers.
#
# Triggers detected:
#   reset           — recorded headSha is unreachable from any ref (lost commit)
#   rebase          — REBASE_HEAD / rebase-merge / rebase-apply dirs present
#   checkout        — current branch differs from state-file branch
#   worktree-add    — number of worktrees > recorded count (or first observation)
#   worktree-remove — recorded worktreePath no longer exists in `git worktree list`
#   pr-merge        — recorded branch deleted upstream (state branch not found locally and HEAD changed)

detect_drift() {
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || return 0
  local root; root="$(repo_root)"
  cd "$root" 2>/dev/null || return 0

  local saved_branch saved_head saved_wt
  saved_branch="$(jq -r '.branch' "$sf")"
  saved_head="$(jq -r '.headSha' "$sf")"
  saved_wt="$(jq -r '.worktreePath' "$sf")"

  # rebase in progress
  if [ -d "$(git rev-parse --git-path rebase-merge 2>/dev/null)" ] \
     || [ -d "$(git rev-parse --git-path rebase-apply 2>/dev/null)" ] \
     || [ -f "$(git rev-parse --git-path REBASE_HEAD 2>/dev/null)" ]; then
    echo "rebase"; return 0
  fi

  local cur_branch; cur_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  local cur_head; cur_head="$(git rev-parse HEAD 2>/dev/null || echo unknown)"

  # checkout to different branch
  if [ "$saved_branch" != "unknown" ] && [ "$cur_branch" != "$saved_branch" ]; then
    # but the saved branch may have been deleted (pr-merge)
    if ! git rev-parse --verify --quiet "refs/heads/${saved_branch}" >/dev/null 2>&1; then
      echo "pr-merge"; return 0
    fi
    echo "checkout"; return 0
  fi

  # reset --hard — recorded headSha unreachable
  if [ "$saved_head" != "unknown" ] && [ "$saved_head" != "$cur_head" ]; then
    if ! git cat-file -e "$saved_head" 2>/dev/null; then
      echo "reset"; return 0
    fi
    if ! git merge-base --is-ancestor "$saved_head" HEAD 2>/dev/null; then
      echo "reset"; return 0
    fi
  fi

  # worktree-remove
  if [ -n "$saved_wt" ] && [ "$saved_wt" != "$root" ]; then
    if ! git worktree list --porcelain 2>/dev/null | grep -qF "$saved_wt"; then
      echo "worktree-remove"; return 0
    fi
  fi

  # worktree-add — if there are extra worktrees beyond the saved one
  local wt_count
  wt_count="$(git worktree list 2>/dev/null | wc -l | tr -d ' ')"
  local saved_wt_count
  saved_wt_count="$(jq -r '.worktreeCount // 1' "$sf")"
  if [ "$wt_count" -gt "$saved_wt_count" ]; then
    echo "worktree-add"; return 0
  fi

  return 0
}
