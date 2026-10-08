# Client Executor Server – CLEX

The open source backend for the [CLEX customer and contractor application](https://github.com/proxymades/client-executor-mobile). Customers create orders for printing, promotional products and outdoor advertising; contractors submit offers, receive assignments and exchange reviews after completion.

Try the API with the companion mobile application and synthetic demo accounts. Questions, bug reports and contributions are welcome through [Issues](https://github.com/proxymades/client-executor-server/issues) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

Node.js, Express 4, Apollo Server 3.7, GraphQL 16, Prisma 3.14, MySQL, bcrypt and optional Firebase Admin notifications. Dependency updates and improvements to local setup are part of ongoing development.

Use Node.js 22.16 or newer for built-in `.env` loading. Local checks were run with Node.js 22.21.1 and npm 10.9.4.

## Development setup

```sh
git clone https://github.com/proxymades/client-executor-server.git
cd client-executor-server
```

Use a separate, empty MySQL development database. Do not point schema or demo commands at an existing production database.

```sh
npm ci
cp .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Put the generated value into `APP_SECRET` in `.env`; set `DATABASE_URL` to your development MySQL connection. Do not commit `.env`. Environment variables supplied by the host take precedence over the file.

Initialize an empty development database from the current schema:

```sh
npm run generate
npx prisma db push
```

The original generated migrations are included under `prisma/migrations/` without edits. Their complete replay has not been verified against a fresh MySQL instance. `db push` is a local bootstrap command, not a production migration procedure.

Start the API and image server in two terminals:

```sh
npm run dev
```

```sh
npm run images
```

The default endpoints are `http://localhost:4000/graphql` and `http://localhost:5001/`. `npm start` runs the API without nodemon. New upload directories are created on demand under the configured assets directory.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection used by Prisma |
| `APP_SECRET` | Random JWT signing secret, at least 32 characters |
| `PORT` | GraphQL port; default 4000 |
| `IMAGES_PORT` | Static image port; default 5001 |
| `ASSETS_DIR` | Upload directory; relative to the server root, default `public` |
| `CORS_ORIGINS` | Comma-separated browser origins; default `http://localhost:8081` |
| `FIREBASE_ENABLED` | `true` or `false`; default false |
| `FIREBASE_SERVICE_ACCOUNT` | Ignored service-account JSON path; absolute or relative to the server root |

For push notifications, configure your own Firebase project and either set `FIREBASE_SERVICE_ACCOUNT` or use Google Application Default Credentials. Then set `FIREBASE_ENABLED=true`. No Firebase credentials are needed for the API with push disabled. Notification delivery occurs after database commits; delivery failures do not undo saved operations. Actual FCM delivery remains unverified.

Photos are served by the separate static server. Their URLs are public; uploads themselves require the appropriate account role and order ownership. JPEG/PNG uploads have a 10 MB limit, signature validation and temporary-file replacement.

## Demo data

Optional synthetic accounts can be created only when explicitly enabled for a development database:

```sh
ALLOW_DEMO_SEED=true npm run seed:demo
```

| Role | Phone entered in the app | Password |
| --- | --- | --- |
| Customer | `1000000000` | `demo-password-123` |
| Contractor | `2000000000` | `demo-password-123` |

These are public demonstration credentials for an isolated local database. The script does not overwrite existing accounts or reset their passwords. It creates a sample order in Almaty. The seed has not been executed against the owner's database.

## Access and order transitions

Authenticated identity comes from an HS256 JWT with a seven-day expiry. Account queries require the matching customer/contractor role. Customer order reads and changes require ownership. All request IDs, including a previous selection, must belong to the affected order. Push tokens may only be registered or removed for the authenticated account.

Order operations use Prisma interactive transactions with a MySQL `FOR UPDATE` row lock. The generator's `interactiveTransactions` preview flag is required by Prisma 3.14; enabling it does not change database tables. Selection resets this order's other accepted offers. Completion and rejection update both order and offer state together. Accepted/completed requests cannot be cancelled by the contractor; only participants in completed orders may leave a review.

Use the mobile uploader's `Apollo-Require-Preflight: true` header for multipart requests because CSRF protection is enabled.

## Checks

```sh
npm run check
npm test
npx prisma validate
```

`check` verifies server syntax and the GraphQL schema. If [the companion mobile repository](https://github.com/proxymades/client-executor-mobile) is at `../client-executor-mobile` (or the original local path `../clex`), it validates its 44 GraphQL documents too.

The regular tests cover access restrictions, order transitions, reviews, JWT expiry, upload validation and a real HTTP startup without Firebase. Resolver tests use an in-memory Prisma substitute; they do not prove MySQL locking or concurrency. The MySQL integration test is skipped unless `TEST_DATABASE_URL` is set to a separate test database initialized from this schema:

```sh
TEST_DATABASE_URL='mysql://test-user:test-password@127.0.0.1:3306/clex_test' npm test
```

The integration test creates and removes only its own test records. It exercises simultaneous offers, simultaneous selection and duplicate feedback. It has not been run locally because a dedicated MySQL instance was unavailable.

## Current development priorities

- Run the MySQL integration test against an isolated database and verify the full mobile/API workflow.
- Simplify local startup and keep dependency/toolchain support up to date.
- Add rate limiting, phone ownership verification, account recovery and session revocation.
- Improve notification delivery with retries and a durable queue; delivery is currently best effort.
- Prepare monitoring, backups and deployment instructions for production use.

The current checks and remaining validation are described above. Open an issue if you encounter a setup problem or want to discuss a feature before implementing it.

## Publication

See [PUBLISHING.md](PUBLISHING.md). Removing a secret from the latest commit does not remove it from earlier commits. The local history was cleaned before publication; the old private GitHub repositories were left unchanged.

## License

[ISC](LICENSE), matching the original package declaration.
