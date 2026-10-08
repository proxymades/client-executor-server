# Before public publication

Preparation keeps the original local Git history and working credentials. `.env` and service-account JSON files are excluded from new commits but may still exist on the development machine.

The original server history contains database credentials in `.env`, a Firebase Admin private key and a hard-coded JWT signing secret. The original mobile history contains Firebase project configuration. Neither repository has been pushed or made public during preparation.

Review the current Git index:

```sh
npm run check:public
```

Then check the historical paths known to have contained private material:

```sh
npm run check:public -- --history
```

The targeted scanner prints paths only, never credential values. It is not a complete secret or security audit. An unsuccessful historical check is expected until the old private material has been removed from history or a clean publication history has been created. The history check must pass before publishing this server history.

Before publication:

- Decide whether to preserve and clean history or start a new publication history. This preparation has done neither.
- Replace any previously exposed database passwords and revoke/replace the Firebase Admin key if it has escaped private storage. Configure deployment with the new JWT signing secret; existing sessions must sign in again.
- Exclude personal photos, database dumps, local settings and signing credentials.
- Verify native app behavior, Firebase delivery and the MySQL integration test on isolated development systems.
- Add real screenshots from demo accounts and review the ISC license.

Historical cleanup and public publishing are separate steps. See GitHub's instructions at https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository.
