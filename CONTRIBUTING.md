# Contributing

This project is open for testing, questions, bug reports and pull requests. You can help by trying the customer/contractor workflow, reporting setup problems, improving documentation or working on an issue.

## Try the project

Follow the [README](README.md). Use the companion repository and synthetic demo accounts for the full workflow. Start with an isolated development database and your own local configuration.

## Questions and bugs

Open an [issue](https://github.com/proxymades/client-executor-server/issues/new/choose). Include what you are trying to do, the steps you followed, expected and actual behavior, and relevant toolchain versions. For mobile issues, specify Android/iOS and device or simulator. Include only the error output needed to reproduce the problem; remove passwords, tokens, connection strings and personal data.

## Changes

1. Fork the repository and create a branch for one focused change.
2. Discuss larger changes in an issue before implementing them.
3. Follow the existing code structure and keep unrelated changes out of the pull request.
4. Run the checks relevant to your change and describe the result in the pull request.
5. Explain the behavior changed and how someone else can verify it. State when native/device or database checks have not been run.

Server checks:

```sh
npm run check
npm test
npx prisma validate
```

Database changes must use the Prisma generator; do not hand-edit migration SQL. Use a separate test database for integration checks. The MySQL test is skipped when `TEST_DATABASE_URL` is absent, so distinguish passing resolver/HTTP tests from real database validation.
