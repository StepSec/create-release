# create-release-git

To add release-git to any project:

```
npm init release-git
```

This temporarily installs `create-release-git` (this project), and runs [the `bin` script](./index.js) in
`./package.json`. This script will install [release-git](https://github.com/release-git/release-git) to the project, and
add basic configuration to either `.release-git.json` or `package.json`.

Also see [npm-init](https://docs.npmjs.com/cli/init).
