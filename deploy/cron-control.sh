#!/bin/bash
set -euo pipefail
root=/www/web/malab_cloudfood_me/public_html/MSA
private="$root/.deploy"
[[ "$(readlink -f "$root")" == "$root" && -d "$private" && ! -L "$private" ]]
export TMPDIR="$private"
case "${1:-status}" in
  install)
    [[ "$(id -un)" == zhangpinglu ]]
    [[ -s "$private/state.json" && -s "$private/update-apache.py" ]]
    backup=$(mktemp "$private/crontab.before.XXXXXX")
    error=$(mktemp "$private/crontab.error.XXXXXX")
    if ! LC_ALL=C crontab -l > "$backup" 2> "$error"; then
      grep -q '^no crontab for ' "$error" || { cat "$error" >&2; exit 1; }
      [[ ! -s "$backup" ]]
    fi
    candidate=$(mktemp "$private/crontab.next.XXXXXX")
    # A single owned entry; every unrelated cron entry remains byte-for-byte.
    sed '/ # MSA_WEBSITE_AUTOMATIC_UPDATE$/d' "$backup" > "$candidate"
    printf '\n*/5 * * * * /usr/bin/python -B %s/update-apache.py >> %s/cron.log 2>&1 # MSA_WEBSITE_AUTOMATIC_UPDATE\n' "$private" "$private" >> "$candidate"
    crontab "$candidate"
    LC_ALL=C crontab -l | grep ' # MSA_WEBSITE_AUTOMATIC_UPDATE$'
    ;;
  pause)
    touch "$private/paused"
    echo 'Automatic updates paused; current site remains available.'
    ;;
  resume)
    if [[ -f "$private/paused" && ! -L "$private/paused" ]]; then
      rm -- "$private/paused"
    fi
    echo 'Automatic updates resume at the next five-minute tick.'
    ;;
  status)
    if [[ -e "$private/paused" ]]; then echo PAUSED; else echo ENABLED; fi
    [[ ! -f "$private/state.json" ]] || cat "$private/state.json"
    [[ ! -f "$private/update.log" ]] || tail -n 8 "$private/update.log"
    ;;
  *) echo 'Usage: cron-control.sh install|pause|resume|status' >&2; exit 2;;
esac
