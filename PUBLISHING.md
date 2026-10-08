# Publication and history cleanup

The local histories were cleaned on 2026-10-08 before publishing to these new repositories:

- Mobile: https://github.com/proxymades/client-executor-mobile
- Server: https://github.com/proxymades/client-executor-server

The original private GitHub repositories were left unchanged. No force push to them was performed. Local database settings, Firebase credential files and mobile endpoint overrides remain on the development machine and are excluded from Git.

## What was removed

- Mobile history: the original Android Firebase project configuration.
- Server history: `.env` and the Firebase Admin service-account JSON.
- Historical server code: the original JWT signing and image secrets were replaced with environment reads. Their exact values were removed from historical blobs and commit messages.

The rewrite preserved all 29 mobile and 27 server commits that existed at cleanup time. A checksum comparison confirmed that the current tracked working files were unchanged by the rewrite. All stored blobs and commit objects were inspected for the known removed values and additional private-key/token indicators, including unreachable objects; no matches remained. The only local branch was retained and renamed to `main` for the new repositories.

## Checks before future publication

```sh
npm run check:public
npm run check:public -- --history
```

The scanner prints file paths only, never credential values. The historical mode inspects all reachable file blobs. It is a targeted check, not a complete security audit. Avoid merging old uncleaned history from another machine or from the original private repositories.

Cleanup does not revoke credentials. The database password and Firebase Admin key were preserved locally and were not rotated. The current API uses the new signing secret generated during preparation. If any old credential has escaped private storage, revoke or replace it at its provider.

## Remaining validation

The archived dependencies still need a native toolchain migration for the installed Xcode environment. Native screenshots, Firebase push delivery and the dedicated MySQL concurrency test remain pending; see the repository README and `docs/PREPARATION.md`.
