#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    printf 'usage: %s <empty-destination-directory>\n' "$0" >&2
    exit 2
fi

destination="$(realpath -m "$1")"
if [[ "${destination}" == "/" || "${destination}" == "${HOME}" ]]; then
    printf 'refusing unsafe backup destination: %s\n' "${destination}" >&2
    exit 2
fi
mkdir -p "${destination}"
if find "${destination}" -mindepth 1 -maxdepth 1 -print -quit | grep -q .; then
    printf 'backup destination must be empty: %s\n' "${destination}" >&2
    exit 2
fi

docker compose exec -T postgres sh -c \
    'pg_dump --format=custom --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' \
    > "${destination}/postgres.dump"

docker compose run --rm --no-deps \
    -v "${destination}:/backup" \
    uploads-init sh -c 'tar -czf /backup/uploads.tar.gz -C /data/uploads .'

(
    cd "${destination}"
    sha256sum postgres.dump uploads.tar.gz > SHA256SUMS
)

printf 'backup created at %s\n' "${destination}"
