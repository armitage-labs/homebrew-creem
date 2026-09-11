# Creem CLI Homebrew tap

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

## Development

This repository contains the Homebrew formula and its release automation.
CLI source and npm releases live in the
[Creem monorepo](https://github.com/armitage-labs/creem/tree/main/packages/cli).
See [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks, maintainer setup,
and release recovery.

## Contributing and community

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. By
participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

- [GitHub issue forms](https://github.com/armitage-labs/homebrew-creem/issues/new/choose)
  for reproducible Homebrew installation bugs and documentation problems
- [CLI issues](https://github.com/armitage-labs/creem/issues/new/choose)
  for CLI behavior unrelated to Homebrew packaging
- [Discord](https://discord.gg/q3GKZs92Av) for community discussion
- [Featurebase](https://creem.featurebase.app/) for product feature requests
- [SECURITY.md](./SECURITY.md) for private vulnerability reporting

## License

This repository is licensed under the [MIT License](./LICENSE).
