#!/usr/bin/env sh
set -eu

if [ $# -gt 0 ]; then
  case "$1" in
    sync|pull|list)
      has_root=0
      has_db=0

      for arg in "$@"; do
        case "$arg" in
          --root|--root=*) has_root=1 ;;
          --db|--db=*) has_db=1 ;;
        esac
      done

      if [ "$has_root" -eq 0 ]; then
        if [ "${GH_2_LOCAL_ROOT:-}" != "" ]; then
          root_default="$GH_2_LOCAL_ROOT"
        else
          root_default="${GH_REPO_SYNC_ROOT:-/data/repos}"
        fi
        set -- "$@" --root "$root_default"
      fi

      if [ "$has_db" -eq 0 ]; then
        if [ "${GH_2_LOCAL_DB:-}" != "" ]; then
          db_default="$GH_2_LOCAL_DB"
        else
          db_default="${GH_REPO_SYNC_DB:-/data/repos.db}"
        fi
        set -- "$@" --db "$db_default"
      fi
      ;;
  esac
fi

exec node /app/dist/cli.js "$@"
