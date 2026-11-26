#!/usr/bin/env bash
# Usage: worker.sh start <task-id> <base-ref> <prompt-file>
#        worker.sh stop <task-id>
#        worker.sh clean <task-id>
# start: create .trees/<task-id> on branch factory/<task-id> and run one
#        copilot --yolo -p implementer in its own process group.
# stop:  terminate that worker's whole process group; keeps the worktree.
# clean: after integration, remove the worktree, merged branch, pid and prompt;
#        keeps the log until the PR merges. Refuses dirty trees and unmerged branches.
set -euo pipefail

usage() { echo "usage: $0 start <task-id> <base-ref> <prompt-file> | stop <task-id> | clean <task-id>" >&2; exit 2; }
[ $# -ge 2 ] || usage
cmd=$1 task=$2
root=$(git rev-parse --show-toplevel)
cd "$root"
tree=".trees/$task" pidfile=".trees/$task.pid" log=".trees/$task.log"
running() { [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; }

case $cmd in
start)
  [ $# -eq 4 ] || usage
  base=$3 prompt=$4
  [ -f "$prompt" ] || { echo "prompt not found: $prompt" >&2; exit 2; }
  running && { echo "worker $task already running (pid $(cat "$pidfile"))" >&2; exit 1; }
  [ -e "$tree" ] && { echo "$tree exists; reconcile it before redispatch" >&2; exit 1; }
  mkdir -p .trees
  exclude="$(git rev-parse --git-common-dir)/info/exclude"
  grep -qxF '.trees/' "$exclude" 2>/dev/null || echo '.trees/' >> "$exclude"
  git worktree add -q -b "factory/$task" "$tree" "$base"
  prompt_text=$(cat "$prompt")
  (cd "$tree" && exec setsid copilot --yolo -p "$prompt_text" >"$root/$log" 2>&1 </dev/null) &
  echo $! > "$pidfile"
  echo "task=$task tree=$tree branch=factory/$task base=$(git rev-parse "$base") pid=$! log=$log"
  ;;
stop)
  running || { echo "worker $task not running"; exit 0; }
  pgid=$(cat "$pidfile")
  kill -TERM -- "-$pgid"
  for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 -- "-$pgid" 2>/dev/null || break; sleep 1; done
  kill -0 -- "-$pgid" 2>/dev/null && kill -KILL -- "-$pgid"
  echo "stopped $task (pgid $pgid); worktree kept"
  ;;
clean)
  running && { echo "worker $task still running; stop it first" >&2; exit 1; }
  if [ -e "$tree" ]; then
    [ -z "$(git -C "$tree" status --porcelain)" ] || { echo "$tree has uncommitted work" >&2; exit 1; }
    git worktree remove "$tree"
  fi
  if git show-ref -q --verify "refs/heads/factory/$task"; then
    git branch -d "factory/$task" >/dev/null || { echo "factory/$task not merged into HEAD; integrate first" >&2; exit 1; }
  fi
  rm -f "$pidfile" ".trees/$task.prompt.md"
  echo "cleaned $task; kept $log"
  ;;
*) usage ;;
esac
