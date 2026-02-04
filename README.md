# Homebrew Tap for CREEM CLI

Official Homebrew tap for [CREEM CLI](https://github.com/armitage-labs/pugpay-monorepo/tree/main/packages/creem-cli).

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
npm install -g creem-cli
```

### npx (No Install)
```bash
npx creem-cli <command>
```

## Links

- [CREEM Website](https://creem.io)
- [CREEM Documentation](https://docs.creem.io)
- [CLI Documentation](https://docs.creem.io/cli)
