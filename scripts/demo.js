#!/usr/bin/env node

const bot = require("circle-github-bot").create();

demos = [
    bot.artifactLink('quicktests/index.html', 'quicktests'),
    bot.artifactLink('quicktests/fiddle.html', 'fiddle'),
];

bot.comment(`
<h3>${bot.env.commitMessage}</h3>
Demo: <strong>${demos.join(' | ')}</strong>
`);
