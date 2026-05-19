# installed by sdd-evolution-harness-engineering workshop
# lock.sh — per-git-common-dir flock

with_lock() {
  local gcd; gcd="$(git_common_dir)"
  mkdir -p "$gcd"
  local lockfile="${gcd}/workshop.lock"
  (
    flock -x 9 || { echo "ERROR: failed to acquire flock on ${lockfile}" >&2; exit 1; }
    "$@"
  ) 9>"$lockfile"
}
