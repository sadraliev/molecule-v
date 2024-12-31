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

### Git Branch Naming Convention

This convention is designed to standardize the structure of branch names, making them descriptive and easy to understand. The format follows:

**`prefix/issue-id/name-of-task`**

#### Prefixes and Their Purpose:

- **`feature/`**  
  For developing new features.  
  Example: `feature/PROJ-123/footer-links`

- **`bugfix/`**  
  To fix bugs in the code. These branches are often associated with a specific issue.  
  Example: `bugfix/PROJ-456/button-alignment`

- **`hotfix/`**  
  To fix critical bugs in the production environment.  
  Example: `hotfix/PROJ-789/crash-on-load`

- **`release/`**  
  To prepare a new release. Typically used for tasks such as final revisions and preparation for deployment.  
  Example: `release/1.0.0`

- **`docs/`**  
  Used to write, modify, or correct documentation.  
  Example: `docs/PROJ-234/update-readme`
