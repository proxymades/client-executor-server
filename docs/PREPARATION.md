# Preparation record

[English](PREPARATION.md) | [Русский](PREPARATION.ru.md)

Verified on 2026-10-08. Initial preparation was performed in the original repository without creating a copy. History was cleaned later for the new publication repositories; see the update below.

## Validation

- Fifteen tests passed, including an actual local HTTP startup without Firebase, authorization, CORS and CSRF.
- Tests also cover order and request access, state transitions, reviews, expiring JWTs, file validation, transaction rollback and Firebase failure recovery.
- The MySQL concurrency integration test was skipped because `TEST_DATABASE_URL` was not configured. In-memory resolver tests do not prove MySQL locking.
- Prisma 3.14 client generation and schema validation passed.
- Server syntax, GraphQL schema and all 44 companion mobile documents passed checks.
- The current Git index passed the targeted private-file scan. The later history-cleanup update below records removal of the original `.env`, Firebase Admin JSON and signing/image secrets.
- No schema changes were applied to any database; demo seed data was not written.

The existing generated migration files were added to Git without editing their contents. Only the Prisma generator preview flag changed. The local `.env` retained its database settings and received a newly generated JWT secret. The local Firebase Admin credential file was preserved; neither database nor Firebase credentials were rotated.

## Changed files

A = new tracked file; M = modified; D = removed from Git (local configuration and credential files are preserved). Existing generated migrations marked A were already on disk and are newly tracked.

| Status | Path |
| --- | --- |
| D | `.env` |
| A | `.env.example` |
| M | `.gitignore` |
| A | `LICENSE` |
| A | `PUBLISHING.md` |
| A | `README.md` |
| D | `clex-493e2-firebase-adminsdk-nbbl0-9073f165ae.json` |
| A | `docs/PREPARATION.md` |
| M | `images.js` |
| M | `package-lock.json` |
| M | `package.json` |
| A (existing generated file) | `prisma/migrations/20220522131816_init/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220522133658_delete_username/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220522143547_/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220522150202_init/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220522150428_change_name/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220531143035_order_process/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220601162624_add_ex_to_order/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220601162903_mod_ex_order/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220601163017_mod_ex_order/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220602140229_order_request_table/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220603135102_executor_order_request_process/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220605102257_order_request_accepted/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220606134736_order_repulse/migration.sql` |
| A (existing generated file) | `prisma/migrations/20220607134411_notification_tokens_tables/migration.sql` |
| A (existing generated file) | `prisma/migrations/migration_lock.toml` |
| M | `prisma/schema.prisma` |
| A | `scripts/check-public-files.js` |
| A | `scripts/check.js` |
| A | `scripts/seed-demo.js` |
| A | `src/access.js` |
| A | `src/config.js` |
| M | `src/index.js` |
| A | `src/notifications.js` |
| M | `src/resolvers/Mutation.js` |
| M | `src/resolvers/Query.js` |
| A | `src/uploads.js` |
| M | `src/uri.js` |
| M | `src/utils.js` |
| A | `src/validation.js` |
| A | `test/http.test.js` |
| A | `test/mysql.test.js` |
| A | `test/resolvers.test.js` |

## History cleanup update – 2026-10-08

The user chose to preserve and clean local history and publish to new repositories, leaving the old private repositories unchanged. The new names use hyphens: `client-executor-mobile` and `client-executor-server`.

`git-filter-repo` 2.47.0 removed private/configuration paths and replaced the two old secret values throughout historical file contents and commit messages. No fetch or push to the old repositories was performed. All 29 mobile commits and 27 server commits that existed before cleanup were preserved. The branch is `main` for the new repositories.

Checksums confirmed that the rewrite changed none of the current tracked working files. A full stored-object audit inspected 711 mobile blobs/commits and 153 server blobs/commits after cleanup, including unreachable objects. No known removed secret values or additional private-key/token indicators remained. Local ignored configuration and credential files were preserved.

The publication update changes these tracked files: `README.md`, `PUBLISHING.md`, `docs/PREPARATION.md`, `scripts/check-public-files.js`, and on the server `scripts/check.js`. The historical check now inspects all reachable file blobs. The server recognizes the new companion folder name while retaining support for the original local layout.

## Project presentation update – 2026-10-08

The owner intends this to be an open source project that people can run, test, discuss and contribute to. The earlier archive/portfolio description was an incorrect assumption and was removed from the current README. Technical verification limits remain explicit. README links, contribution guidance and issue templates now support questions, bug reports and feature proposals.

Changed existing files: `README.md`, `PUBLISHING.md`, `docs/PREPARATION.md`. New files: `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/question.md`, `.github/ISSUE_TEMPLATE/feature_request.md`. Application and API behavior were not changed by this documentation update.

## Bilingual documentation update – 2026-10-14

Added complete Russian versions of README, contribution guidance, the publication record and this report. Documents link to both languages through `English | Русский`; English remains the default README. Separate Russian bug, question and feature templates were added to Issues. The mobile screenshot checklist was translated too. Commands, parameters and validation limits are retained in both languages.

Changed existing files: `README.md`, `CONTRIBUTING.md`, `PUBLISHING.md`, `docs/PREPARATION.md`, `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/question.md`, `.github/ISSUE_TEMPLATE/feature_request.md`; on mobile, also `docs/screenshots/README.md`. New files: `README.ru.md`, `CONTRIBUTING.ru.md`, `PUBLISHING.ru.md`, `docs/PREPARATION.ru.md`, `.github/ISSUE_TEMPLATE/bug_report.ru.md`, `.github/ISSUE_TEMPLATE/question.ru.md`, `.github/ISSUE_TEMPLATE/feature_request.ru.md`; on mobile, also `docs/screenshots/README.ru.md`.
