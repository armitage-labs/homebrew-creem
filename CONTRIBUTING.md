# Contributing to Creem's Homebrew tap

Thank you for contributing to the Homebrew distribution of Creem CLI.
This repository owns the formula and release automation, not the CLI source.
For CLI behavior changes, follow the
[monorepo contribution guide](https://github.com/armitage-labs/creem/blob/main/CONTRIBUTING.md).

## Before you start

- Use Node.js 24 or newer for automation tests and Homebrew on macOS or Linux.
- Search existing issues before opening a new one.
- Report vulnerabilities privately according to [SECURITY.md](./SECURITY.md).
- Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Set up and validate

The automation scripts use Node's standard library; no npm install is needed.

```sh
git clone https://github.com/armitage-labs/homebrew-creem.git
cd homebrew-creem
node --test scripts/auto-merge.test.cjs
```

Use a disposable environment for Homebrew checks: installing a formula also
installs its dependencies. If the official tap is already installed, use a
separate environment rather than replacing your normal tap configuration.
Commit local formula edits on your test branch first: tapping a local checkout
clones its committed Git state, not uncommitted files.

```sh
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew tap --custom-remote armitage-labs/creem "$PWD"
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install --build-from-source armitage-labs/creem/creem
brew audit --strict --online armitage-labs/creem/creem
brew test armitage-labs/creem/creem
```

CI performs installation, audit, and formula tests on macOS and Linux. Formula
tests verify the installed version, help output, and test-mode API destination
without real credentials or Creem API traffic. The small automation suite tests
merge eligibility and failure paths, including stale results and branch refresh.

## Release automation

After publishing a stable `@creem_io/cli` version (`X.Y.Z`), the monorepo verifies
the npm package identity and tarball integrity and opens a formula update PR.
Prereleases are not supported. Branches use `automation/creem-X.Y.Z`, so retries
reuse an existing open PR for that version.

Successful `Homebrew CI` triggers `Merge CLI releases`. It accepts only
non-draft, same-repository PRs authored by the configured release App, with all
three expected jobs passing for the current head. Only the npm URL and checksum
may change in `Formula/creem.rb`; equal/older versions and other edits are
rejected. The merge API receives the tested SHA. No PR code, caches, or uploaded
artifacts run in the privileged merge job.

If `main` advances, the workflow refreshes an eligible release branch with a
merge commit preserving both parents, then explicitly dispatches new CI. It
never force-pushes or merges the refreshed commit using old results. Formula
code changes still need human review.

### Maintainer setup

1. Merge the initial CI/automation implementation manually. It intentionally
   does not qualify for formula-only automatic merging.
2. Enable GitHub Actions and squash merging. Protect `main` with required checks
   `Automation tests`, `Homebrew (macos-14)`, and `Homebrew (ubuntu-24.04)`.
   Require branches to be up to date before merging and block direct/force
   pushes. Do not give the release App or Actions a bypass of these rules.
3. Require maintainer review of workflow and script changes. Configure
   `CODEOWNERS` for those paths using an actual team or maintainer with write
   access, and require code-owner approval in branch rules. Do not require that
   approval for formula-only releases if those are to merge unattended.
4. Follow the
   [monorepo setup guide](https://github.com/armitage-labs/creem/blob/main/CONTRIBUTING.md#homebrew-cli-releases)
   to install the release App only on this tap, with Contents and Pull requests
   write permissions. Store its ID/private key in the monorepo's `release`
   environment, not here. Restrict that environment to the protected `main`
   branch. No private key or npm publishing token belongs in this repository.
5. Only after these protections are configured, set repository variable
   `HOMEBREW_RELEASE_BOT_LOGIN` to the exact App login, including `[bot]`.
   Leaving it unset disables automatic merging.

The merge job uses this repository's `GITHUB_TOKEN` with Contents, Pull requests,
and Actions write permissions; Actions write is needed to dispatch fresh CI
after a branch refresh. The App token used to open PRs is short-lived and scoped
to this tap. Review and rotate its private key as part of credential maintenance.

This is a custom CI-gated merge, not GitHub's separate "Allow auto-merge"
feature. It neither approves PRs nor bypasses protection. Required checks and
up-to-date enforcement are mandatory: the script's checks alone cannot make
the final merge atomic with a concurrent change to `main`. If rules require
human approval, a maintainer must provide it and rerun the merge job.

The App and npm publisher remain trusted principals. Integrity checks detect
mismatched tarball bytes; they do not prove a package is harmless or independently
verify npm provenance. Installing the formula executes published package code
in unprivileged CI. Protect npm publishing and human maintainer accounts too.

### Recovery

If npm publishing succeeded but no tap PR appeared, use the standalone workflow
in the [monorepo recovery guide](https://github.com/armitage-labs/creem/blob/main/CONTRIBUTING.md#recovery-and-verification).
Do not republish npm or hand-edit checksums. A rerun reuses an existing open
version PR; inspect and reopen any deliberately closed PR before retrying.

If installation, audit, or tests fail, resolve the failure and rerun CI. If a
branch refresh succeeded but CI dispatch failed, run `Homebrew CI` manually on
that release branch. If merging is blocked by required review or repository
rules, satisfy them before rerunning the failed merge job. Do not disable checks
or bypass protection to make a release pass.

To pause unattended merges, remove `HOMEBREW_RELEASE_BOT_LOGIN` and cancel any
already-running merge job. This does not unpublish npm versions or revert the
installed formula.

## Pull requests

- Keep changes focused and explain their user or maintainer impact.
- Add or update behavioral tests when changing the formula or automation.
- Update documentation and complete the PR template, including testing and
  material AI-assistance notes.
- Do not include secrets, credentials, production data, or vulnerability details.
- This tap does not use Changesets or independently version the CLI. Published
  CLI versions are owned by the monorepo's release process.

Use the issue forms for confirmed tap bugs and documentation problems. Route
new product capabilities to [Featurebase](https://creem.featurebase.app/) and
product support to the [Creem documentation](https://docs.creem.io).
