#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
    printf 'usage: %s <backup-directory>\n' "$0" >&2
    exit 2
fi

backup_dir="$(realpath "$1")"
database="ricebowl_restore_check_$$"
case "${database}" in
    ricebowl_restore_check_[0-9]*) ;;
    *) printf 'unsafe temporary database name\n' >&2; exit 2 ;;
esac

for file in postgres.dump uploads.tar.gz SHA256SUMS; do
    [[ -f "${backup_dir}/${file}" ]] || { printf 'missing %s\n' "${file}" >&2; exit 2; }
done

(
    cd "${backup_dir}"
    sha256sum --check SHA256SUMS
)
gzip --test "${backup_dir}/uploads.tar.gz"
tar -tzf "${backup_dir}/uploads.tar.gz" > /dev/null

cleanup() {
    docker compose exec -T postgres sh -c \
        'dropdb --if-exists --force --username="$POSTGRES_USER" "$1"' sh "${database}" > /dev/null
}
trap cleanup EXIT

docker compose exec -T postgres sh -c \
    'createdb --username="$POSTGRES_USER" "$1"' sh "${database}"
docker compose exec -T postgres sh -c \
    'pg_restore --exit-on-error --no-owner --no-acl --username="$POSTGRES_USER" --dbname="$1"' sh "${database}" \
    < "${backup_dir}/postgres.dump"

table_count="$(docker compose exec -T postgres sh -c \
    'psql --tuples-only --no-align --username="$POSTGRES_USER" --dbname="$1" --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''public'\'';"' \
    sh "${database}")"
if [[ ! "${table_count}" =~ ^[1-9][0-9]*$ ]]; then
    printf 'restored database has no public tables\n' >&2
    exit 1
fi

printf 'backup verified: %s public tables and a readable uploads archive\n' "${table_count}"
