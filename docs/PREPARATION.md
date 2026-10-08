# Preparation record

Verified on 2026-10-08. Work was performed in the original repository, without creating a copy or rewriting Git history. No commits were pushed.

## Validation

- Fifteen tests passed, including an actual local HTTP startup without Firebase, authorization, CORS and CSRF.
- Tests also cover order and request access, state transitions, reviews, expiring JWTs, file validation, transaction rollback and Firebase failure recovery.
- The MySQL concurrency integration test was skipped because `TEST_DATABASE_URL` was not configured. In-memory resolver tests do not prove MySQL locking.
- Prisma 3.14 client generation and schema validation passed.
- Server syntax, GraphQL schema and all 44 companion mobile documents passed checks.
- The current Git index passed the targeted private-file scan. The historical scan identifies the original `.env`, Firebase Admin JSON and `src/utils.js`; history still needs separate preparation before public publication.
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
