# Homebrew Tap for CREEM CLI

Official Homebrew tap for [CREEM CLI](https://github.com/armitage-labs/creem/tree/main/packages/cli).

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
npm install -g @creem_io/cli
```

### npx (No Install)
```bash
npx @creem_io/cli <command>
```

## Links

- [CREEM Website](https://creem.io)
- [CREEM Documentation](https://docs.creem.io)
- [CLI Documentation](https://docs.creem.io/cli)
