#!/bin/sh
# Read one documentation blob from an operator-verified, local Git source cache.
set -eu

fail() {
    echo "Life Profile source unavailable: $1" >&2
    exit 1
}

[ "$#" = 4 ] || fail 'expected checkout, origin URL, full commit and document path'
checkout=$1
origin=$2
commit=$3
document=$4
case "$checkout" in /*) ;; *) fail 'checkout must be an absolute path' ;; esac
case "$commit" in *[!0-9a-f]*|'') fail 'expected a full lowercase commit ID' ;; esac
[ "${#commit}" = 40 ] || [ "${#commit}" = 64 ] || fail 'expected a full commit ID'
case "$document" in
    *[!a-zA-Z0-9_./-]*|*..*|*//*|*/./*) fail 'invalid document path' ;;
    AGENTS.md|docs/*.md) ;;
    *) fail 'expected an instruction document' ;;
esac

source_git() {
    env -i PATH="$PATH" LC_ALL=C GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null \
        GIT_NO_LAZY_FETCH=1 GIT_ALLOW_PROTOCOL= \
        git --no-replace-objects --literal-pathspecs -C "$checkout" "$@"
}

root=$(source_git rev-parse --show-toplevel) || fail 'checkout inaccessible'
[ "$root" = "$checkout" ] || fail 'expected the exact checkout root'
url=$(source_git config --local --no-includes --get-all remote.origin.url) || fail 'missing origin'
[ -n "$origin" ] && [ "$url" = "$origin" ] || fail 'origin differs from the selected repository'
resolved=$(source_git rev-parse --verify "$commit^{object}") || fail 'pinned object unavailable'
[ "$resolved" = "$commit" ] || fail 'abbreviated object ID'
kind=$(source_git cat-file -t "$commit") || fail 'pinned commit unavailable'
[ "$kind" = commit ] || fail 'pin does not name a commit'
entry=$(source_git ls-tree --format='%(objectmode) %(objecttype) %(objectname)' \
    "$commit" -- "$document") || fail 'cannot inspect pinned tree'
case "$entry" in
    '100644 blob '*|'100755 blob '*) ;;
    *) fail 'missing or non-ordinary document at the pin' ;;
esac
source_git cat-file blob "${entry##* }" || fail 'document bytes unavailable'
