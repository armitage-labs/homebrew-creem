# Security Policy

## Supported versions

Security fixes are provided for the latest formula and release automation on
the default branch. Keep Creem CLI updated to the latest stable release.
Older CLI versions and the archived standalone CLI repository are unsupported.

## Report a vulnerability privately

Do not open a public issue, discussion, or pull request for a suspected
vulnerability in the formula, release automation, or distributed CLI.

Use Creem's canonical
[GitHub private vulnerability reporting](https://github.com/armitage-labs/creem/security/advisories/new)
route. Identify `armitage-labs/homebrew-creem` and include, when possible:

- the affected formula version or workflow commit;
- the impact and affected configurations;
- reproduction steps or a minimal proof of concept;
- any known mitigations.

The [monorepo security policy](https://github.com/armitage-labs/creem/blob/main/SECURITY.md)
owns the reporting and disclosure process. If private reporting is unavailable,
email [security@creem.io](mailto:security@creem.io) with the subject "Security
vulnerability." Do not include secrets or sensitive exploit details in the
initial email; ask for a secure reporting route.

## Non-security reports

For ordinary Homebrew defects and documentation problems, use this repository's
[issue forms](https://github.com/armitage-labs/homebrew-creem/issues/new/choose).
For CLI behavior unrelated to packaging, use the
[monorepo issue forms](https://github.com/armitage-labs/creem/issues/new/choose).
