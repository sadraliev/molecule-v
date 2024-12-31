## Prerequisites

### Node.js Version
Make sure you have the correct Node.js version installed. The required version is specified in the `.nvmrc` file.

To set up the correct Node.js version, use [nvm](https://github.com/nvm-sh/nvm):
```bash
nvm install
nvm use
```

### Commitlint and Conventional Commits

This project uses [commitlint](https://commitlint.js.org/) to enforce commit message conventions based on the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard. This ensures consistent commit messages, improves readability of the commit history, and enables automated release processes.

To make commit use prompt:
```bash
make commit
```