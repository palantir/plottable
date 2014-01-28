# grunt-cli [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-cli.png?branch=master)](http://travis-ci.org/gruntjs/grunt-cli)
> The grunt command line interface.

Install this globally and you'll have access to the `grunt` command anywhere on your system.

```shell
npm install -g grunt-cli
```

**Note:** The job of the `grunt` command is to load and run the version of grunt you have installed locally to your project, irrespective of its version.  Starting with grunt v0.4, you should never install grunt itself globally.  For more information about why, [please read this](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation).

See the grunt [Getting Started](http://gruntjs.com/getting-started) guide for more information.

## Shell tab auto-completion
To enable bash tab auto-completion for grunt, add the following line to your `~/.bashrc` file. Currently, the only supported shell is bash.

```bash
eval "$(grunt --completion=bash)"
```
