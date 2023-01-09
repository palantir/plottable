#!/usr/bin/env node

const bot = require("circle-github-bot").create();

demos = [
    bot.artifactLink("quicktests/index.html", "quicktests"),
    bot.artifactLink("quicktests/fiddle.html", "fiddle"),
];

bot.comment(process.env.GITHUB_API_TOKEN, `
<h3>${bot.commitMessage()}</h3>
Demo: <strong>${demos.join(" | ")}</strong>
`);
