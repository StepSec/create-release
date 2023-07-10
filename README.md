# create-release

To add release to any project:

```
npm init release
```

This temporarily installs `create-release` (this project), and runs [the `bin` script](./index.js) in
`./package.json`. This script will install [release-it](https://github.com/stepsec/release) to the project, and
add basic configuration to either `.release.json` or `package.json`.

Also see [npm-init](https://docs.npmjs.com/cli/init).
