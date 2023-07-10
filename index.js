#!/usr/bin/env node

import fs from 'fs';
import util from 'util';
import { EOL } from 'os';
import prompts from 'prompts';
import gitRemoteOriginUrl from 'git-remote-origin-url';
import parseGitUrl from 'git-url-parse';
import { execa } from 'execa';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const RELEASE_GIT_CONFIG = '.release-git.json';
const PACKAGE_CONFIG = 'package.json';

(async () => {
  let manifest = {};
  let hasManifest = false;
  let isManifestChanged = false;

  let config = {};
  let hasConfig = false;
  let isConfigChanged = false;

  let isGitHub = false;
  let isGitLab = false;
  let remoteUrl;

  try {
    manifest = JSON.parse(await readFile(PACKAGE_CONFIG));
    hasManifest = true;
  } catch (err) {}

  try {
    config = JSON.parse(await readFile(RELEASE_GIT_CONFIG));
    hasConfig = true;
  } catch (err) {}

  try {
    remoteUrl = await gitRemoteOriginUrl();
  } catch (err) {}

  if (remoteUrl) {
    const parsedRemoteUrl = parseGitUrl(remoteUrl);
    isGitHub = parsedRemoteUrl.host.includes('github.com');
    isGitLab = parsedRemoteUrl.host.includes('gitlab.com');
  }

  const questions = [];

  if (isGitHub) {
    questions.push({
      type: 'confirm',
      name: 'github',
      message: 'Publish a GitHub Release with every release?',
      initial: true
    });
  }

  if (isGitLab) {
    questions.push({
      type: 'confirm',
      name: 'gitlab',
      message: 'Publish a GitLab Release with every release?',
      initial: true
    });
  }

  if (hasManifest) {
    questions.push({
      type: 'select',
      name: 'config',
      message: 'Where to add the release-git config?',
      choices: [
        { title: '.release-git.json', value: RELEASE_GIT_CONFIG },
        { title: 'package.json', value: PACKAGE_CONFIG }
      ],
      initial: 0,
      hint: ' '
    });
  }

  const answers = await prompts(questions);

  if (answers.github) {
    config.github = {
      release: true
    };
    isConfigChanged = true;
  }

  if (answers.gitlab) {
    config.gitlab = {
      release: true
    };
    isConfigChanged = true;
  }

  if (hasManifest) {
    manifest.scripts = manifest.scripts || {};
    if (!('release' in manifest.scripts)) {
      manifest.scripts.release = 'release-git';
      isManifestChanged = true;
    }
  }

  if (isConfigChanged && (!answers.config || answers.config === RELEASE_GIT_CONFIG)) {
    await writeFile(RELEASE_GIT_CONFIG, JSON.stringify(config, null, '  ') + EOL);
  }

  if (answers.config === PACKAGE_CONFIG) {
    manifest['release-git'] = config;
    isManifestChanged = true;
  }
  if (isManifestChanged) {
    await writeFile(PACKAGE_CONFIG, JSON.stringify(manifest, null, '  ') + EOL);
  }

  await execa('npm', ['install', 'release-git', '--save-dev'], { stdio: 'inherit' });
})();
