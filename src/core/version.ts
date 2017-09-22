/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

// __VERSION__ is a global constant which will be replaced by webpack's DefinePlugin
declare var __VERSION__: string;

/*
 * WARNING: The js output of this expression is searched by string (yes, I know) and replaced with a
 * real version number during the dist phase for for npm module publishing. Modifying this line should
 * be accompanied by modifying the "sed-version" task in package.json accordingly.
 */
export let version = "test";
