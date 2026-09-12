# Contributing to the Homebrew tap

CLI source, documentation, issue reporting, and contribution policies live in
[the Creem monorepo](https://github.com/armitage-labs/creem/blob/main/CONTRIBUTING.md).
Submit formula/workflow changes here; follow the monorepo's
[Code of Conduct](https://github.com/armitage-labs/creem/blob/main/CODE_OF_CONDUCT.md)
and [private security reporting policy](https://github.com/armitage-labs/creem/blob/main/SECURITY.md).

## Validation

Use Node.js 24+; no npm dependencies are needed:

```sh
node --test scripts/auto-merge.test.cjs
```

For formula changes, commit them first and test in a disposable Homebrew
environment: a local tap clones committed files, and installation adds dependencies.

```sh
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew tap --custom-remote armitage-labs/creem "$PWD"
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install --build-from-source armitage-labs/creem/creem
brew audit --strict --online armitage-labs/creem/creem
brew test armitage-labs/creem/creem
```

CI runs these checks on macOS and Linux without real Creem credentials.
Include validation results in PRs; this tap does not use Changesets.

## Automated releases

The merge job accepts only the release bot's same-repository, non-draft PRs
changing the npm URL/checksum to a newer stable version. It requires successful
CI on the current head and retests after refreshing a stale branch. It uses
`GITHUB_TOKEN` with Contents/Pull requests write for merging and Actions write
for CI dispatch. GitHub's separate "Allow auto-merge" setting is not used.

## Recovery

For a missing update PR, use the [monorepo retry command](https://github.com/armitage-labs/creem/blob/main/CONTRIBUTING.md#homebrew-cli-releases).
Inspect/reopen deliberately closed release PRs before retrying. Resolve failed
checks or required approvals, then rerun the failed job; never bypass protection.
If branch refresh succeeded but CI dispatch failed, run `Homebrew CI` on that
release branch. To pause merging, unset `HOMEBREW_RELEASE_BOT_LOGIN` and cancel
any running merge job.
