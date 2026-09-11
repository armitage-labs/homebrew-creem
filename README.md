# Homebrew Tap for CREEM CLI

Official Homebrew tap for [Creem CLI](https://github.com/armitage-labs/creem/tree/main/packages/cli).

## Installation

```bash
brew tap armitage-labs/creem
brew install creem
```

## Usage

```bash
# Login to your Creem account
creem login

# Check who you're logged in as
creem whoami

# List your products
creem products list

# Create a checkout
creem checkouts create

# View subscriptions
creem subscriptions list
```

## Upgrade

```bash
brew update
brew upgrade creem
```

## Uninstall

```bash
brew uninstall creem
brew untap armitage-labs/creem
```

## Alternative Installation Methods

### npm (Global)
```bash
npm install -g @creem_io/cli
```

### npx (No Install)
```bash
npx @creem_io/cli <command>
```

## Links

- [CREEM Website](https://creem.io)
- [CREEM Documentation](https://docs.creem.io)
- [CLI Documentation](https://docs.creem.io/code/cli)

## Release automation

The monorepo's release workflow opens a PR here after publishing `@creem_io/cli`.
It verifies the exact npm tarball's integrity and updates the formula URL and
SHA-256. Branches use `automation/creem-X.Y.Z`; retries reuse the version's PR.
See the [monorepo setup and recovery guide](https://github.com/armitage-labs/creem/blob/main/docs/homebrew-releases.md).

`Homebrew CI` installs, audits, and tests the checked-out formula on macOS and
Linux. Tests verify the CLI version/help and test-mode API routing without using
real API keys. A successful CI run triggers `Merge CLI releases`, which merges
only non-draft, same-repository PRs authored by the configured release App.
It requires all three CI jobs to pass for the current PR head, allows only URL
and checksum changes in `Formula/creem.rb`, rejects equal/older versions, and
passes the tested SHA to GitHub's merge API. No PR code or artifacts run in the
privileged merge job. Other PRs always require normal maintainer review.

When an earlier release or another change advances `main`, automation refreshes
the release branch using a merge commit with both parents (no force push), then
explicitly dispatches a new CI run. It never merges the refreshed commit using
the previous test results. Changes to formula code itself still need review.

### Maintainer setup

1. Enable GitHub Actions and squash merging for this repository.
2. Set repository variable `HOMEBREW_RELEASE_BOT_LOGIN` to the exact GitHub App
   login (including `[bot]`) used by the monorepo. Leaving it unset disables
   automatic merging.
3. Protect `main` with the required checks `Automation tests`,
   `Homebrew (macos-14)`, and `Homebrew (ubuntu-24.04)`. Require branches to be
   up to date before merging. Keep permissions restricted; the merge workflow
   needs `contents: write`, `pull-requests: write`, and `actions: write` (to
   dispatch fresh CI after updating a branch).
4. Configure the App ID/private key in the monorepo's `release` environment as
   described in its guide. App permissions are Contents and Pull requests write,
   scoped only to this tap. No private key is stored in this repository.

The merge workflow uses the merge API after CI succeeds; it does not require
GitHub's separate "Allow auto-merge" setting. It respects branch protection and
does not approve PRs or bypass review rules. If approval is required for these
bot PRs, a maintainer must supply it and rerun the merge workflow. To make future
formula updates fully automatic, repository rules must permit these validated
bot PRs to merge without human approval.

Merge this initial implementation manually before enabling automated releases;
it deliberately does not qualify for the formula-only auto-merge path. The older
PR #2 proposes 0.2.1 and is superseded by the 0.3.0 npm migration here.

### Local validation

```sh
node --test scripts/auto-merge.test.cjs
brew tap --custom-remote armitage-labs/creem /absolute/path/to/this/checkout
brew install --build-from-source armitage-labs/creem/creem
brew audit --strict --online armitage-labs/creem/creem
brew test armitage-labs/creem/creem
```
