#!/usr/bin/env node

const bot = require("circle-github-bot").create();

demos = [
    bot.artifactLink('demo/index.html', 'demo'),
    bot.artifactLink('quicktests/index.html', 'quicktests')
];

bot.comment(`
<h3>${bot.env.commitMessage}</h3>
Demo: <strong>${demos.join(' | ')}</strong>
`);
