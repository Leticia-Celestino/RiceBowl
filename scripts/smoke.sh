#!/usr/bin/env bash
set -euo pipefail

api_url="${API_URL:-http://127.0.0.1:8080}"
public_url="${PUBLIC_URL:-${api_url}}"
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_dir="$(mktemp -d /tmp/ricebowl-smoke.XXXXXX)"
trap 'rm -rf "${smoke_dir}"' EXIT

run_id="$(date +%s)-${RANDOM}"
email="smoke-${run_id}@example.test"
nickname="smoke${run_id//-/}"
cookie_jar="${smoke_dir}/cookies.txt"

printf 'safe smoke config\n' > "${smoke_dir}/hypr.conf"
tar -czf "${smoke_dir}/dotfiles.tar.gz" -C "${smoke_dir}" hypr.conf

expect_status() {
    local expected="$1"
    local actual="$2"
    local step="$3"
    if [[ "${actual}" != "${expected}" ]]; then
        printf '%s: expected HTTP %s, received %s\n' "${step}" "${expected}" "${actual}" >&2
        exit 1
    fi
}

curl --max-time 20 -sS -c "${cookie_jar}" -o "${smoke_dir}/csrf.json" "${api_url}/auth/csrf"
csrf_token="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('${smoke_dir}/csrf.json')).token)")"

register_status="$(curl --max-time 20 -sS -b "${cookie_jar}" -c "${cookie_jar}" -o /dev/null -w '%{http_code}' \
    -H "X-XSRF-TOKEN: ${csrf_token}" \
    -H 'Content-Type: application/json' \
    -d "{\"nickname\":\"${nickname}\",\"email\":\"${email}\",\"password\":\"smoke-pass-123\"}" \
    "${api_url}/auth/register")"
expect_status 202 "${register_status}" register

login_status="$(curl --max-time 20 -sS -b "${cookie_jar}" -c "${cookie_jar}" -o "${smoke_dir}/login.json" -w '%{http_code}' \
    -H "X-XSRF-TOKEN: ${csrf_token}" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${email}\",\"password\":\"smoke-pass-123\"}" \
    "${api_url}/auth/login")"
expect_status 200 "${login_status}" login

create_status="$(curl --max-time 20 -sS -o "${smoke_dir}/rice.json" -w '%{http_code}' \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" -H 'Content-Type: application/json' \
    -d '{"title":"CI smoke","description":"Critical path","distro":"Arch Linux","windowManager":"Hyprland","tags":["ci"]}' \
    "${api_url}/rices")"
expect_status 201 "${create_status}" create
rice_id="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('${smoke_dir}/rice.json')).id)")"

curl --max-time 20 -sS -o "${smoke_dir}/draft.json" "${api_url}/rices?author=${nickname}"
node -e "const p=JSON.parse(require('fs').readFileSync('${smoke_dir}/draft.json')); if(p.content.length !== 0) process.exit(1)"

cover_status="$(curl --max-time 20 -sS -o "${smoke_dir}/cover.json" -w '%{http_code}' -X PATCH \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" \
    -F "file=@${project_root}/frontend/src/assets/hero.png;type=image/png" \
    "${api_url}/rices/${rice_id}/cover")"
expect_status 200 "${cover_status}" cover

config_status="$(curl --max-time 20 -sS -o "${smoke_dir}/config.json" -w '%{http_code}' -X PATCH \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" \
    -F "file=@${smoke_dir}/dotfiles.tar.gz;type=application/gzip" \
    "${api_url}/rices/${rice_id}/config")"
expect_status 200 "${config_status}" config

cover_url="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('${smoke_dir}/cover.json')).coverUrl)")"
config_url="$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('${smoke_dir}/config.json')).configUrl)")"
[[ "${cover_url}" == http* ]] || cover_url="${public_url}${cover_url}"
[[ "${config_url}" == http* ]] || config_url="${public_url}${config_url}"
expect_status 200 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' "${cover_url}")" cover-download
expect_status 200 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' "${config_url}")" config-download

curl --max-time 20 -sS -o "${smoke_dir}/published.json" "${api_url}/rices?author=${nickname}"
node -e "const p=JSON.parse(require('fs').readFileSync('${smoke_dir}/published.json')); if(p.content.length !== 1) process.exit(1)"

expect_status 200 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' -X POST \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" "${api_url}/rices/${rice_id}/vote?value=1")" vote
expect_status 201 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' -X POST \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" -H 'Content-Type: application/json' \
    -d '{"content":"CI smoke comment"}' "${api_url}/rices/${rice_id}/comments")" comment
expect_status 204 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' -X DELETE \
    -b "${cookie_jar}" -H "X-XSRF-TOKEN: ${csrf_token}" "${api_url}/rices/${rice_id}")" delete
expect_status 404 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' "${cover_url}")" cover-cleanup
expect_status 404 "$(curl --max-time 20 -sS -o /dev/null -w '%{http_code}' "${config_url}")" config-cleanup

printf 'RiceBowl smoke test passed.\n'
