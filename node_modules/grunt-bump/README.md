# grunt-bump

> Bump package version, create tag, commit, push ...

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-bump --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-bump');
```

### Configuration
In your project's Gruntfile, add a section named `bump` to the data object passed into `grunt.initConfig()`. The options (and defaults) are:

```js
grunt.initConfig({
  bump: {
    options: {
      files: ['package.json'],
      updateConfigs: [],
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json'],
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: true,
      pushTo: 'upstream',
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
      globalReplace: false,
      prereleaseName: false,
      regExp: false
    }
  },
})
```

### Options

#### options.files
Type: `Array`
Default value: `['package.json']`

Maybe you wanna bump 'component.json' instead? Or maybe both: `['package.json', 'component.json']`? Can be either a list of files to bump (an array of files) or a grunt glob (e.g., `['*.json']`).

#### options.updateConfigs
Type: `Array`
Default value: `[]`

Sometimes you load the content of `package.json` into a grunt config. This will update the config property, so that even tasks running in the same grunt process see the updated value.

```js
bump: {
  options: {
    files:         ['package.json', 'component.json'],
    updateConfigs: ['pkg',          'component']
  }
}
```

#### options.commit
Type: `Boolean`
Default value: `true`

Should the changes be committed? False if you want to do additional things.

#### options.commitMessage
Type: `String`
Default value: `Release v%VERSION%`

If so, what is the commit message ? You can use `%VERSION%` which will get replaced with the new version.

#### options.commitFiles
Type: `Array`
Default value: `['package.json']`

An array of files that you want to commit. You can use `['-a']` to commit all files.

#### options.createTag
Type: `Boolean`
Default value: `true`

Create a Git tag?

#### options.tagName
Type: `String`
Default value: `v%VERSION%`

If `options.createTag` is set to true, then this is the name of that tag (`%VERSION%` placeholder is available).

#### options.tagMessage
Type: `String`
Default value: `Version %VERSION%`

If `options.createTag` is set to true, then yep, you guessed right, it's the message of that tag - description (`%VERSION%` placeholder is available).

#### options.push
Type: `Boolean`
Default value: `true`

Push the changes to a remote repo?

#### options.pushTo
Type: `String`
Default value: `upstream`

If `options.push` is set to true, which remote repo should it go to? This is what gets set as `remote` in the `git push {remote} {branch}` command. Use `git remote` to see the list of remote repo's you have listed. [Learn about remote repos](http://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes)

#### options.gitDescribeOptions
Type: `String`
Default value: `--tags --always --abbrev=1 --dirty=-d`

Options to use with `$ git describe`

#### options.globalReplace
Type: `Boolean`
Default value: `false`

Replace all occurrences of the version in the file. When set to `false`, only the first occurrence will be replaced.

#### options.prereleaseName
Type: `String`
Default value: `rc`

When bumping to a prerelease version this will be the identifier of the prerelease e.g. `dev`, `alpha`, `beta`, `rc` etc.
1.0.0-`prereleaseName`.0
When left as the default `false` version bump:prereleae will behave as follows:
* 1.0.0   to 1.0.1-0
* 1.0.1-0 to 1.0.1-1
* from a previous bump:git
  * 1.0.0-7-g10b5 to 1.0.0-8

#### options.regExp
Type: `RegExp`
Default value: `false`

Regex to find and replace version string in files described in `options.files`. If no value is specified, it will use the plugin's default.

### Usage Examples

Let's say current version is `0.0.1`.

```bash
$ grunt bump
>> Version bumped to 0.0.2
>> Committed as "Release v0.0.2"
>> Tagged as "v0.0.2"
>> Pushed to origin

$ grunt bump:patch
>> Version bumped to 0.0.3
>> Committed as "Release v0.0.3"
>> Tagged as "v0.0.3"
>> Pushed to origin

$ grunt bump:minor
>> Version bumped to 0.1.0
>> Committed as "Release v0.1.0"
>> Tagged as "v0.1.0"
>> Pushed to origin

$ grunt bump:major
>> Version bumped to 1.0.0
>> Committed as "Release v1.0.0"
>> Tagged as "v1.0.0"
>> Pushed to origin

$ grunt bump:patch
>> Version bumped to 1.0.1
>> Committed as "Release v1.0.1"
>> Tagged as "v1.0.1"
>> Pushed to origin

$ grunt bump:git
>> Version bumped to 1.0.1-ge96c
>> Committed as "Release v1.0.1-ge96c"
>> Tagged as "v1.0.1-ge96c"
>> Pushed to origin

$ grunt bump:prepatch
>> Version bumped to 1.0.2-0
>> Committed as "Release v1.0.2-0"
>> Tagged as "v1.0.2-0"
>> Pushed to origin

$ grunt bump:prerelease
>> Version bumped to 1.0.2-1
>> Committed as "Release v1.0.2-1"
>> Tagged as "v1.0.2-1"
>> Pushed to origin

$ grunt bump:patch # (major, minor or patch) will do this
>> Version bumped to 1.0.2
>> Committed as "Release v1.0.2"
>> Tagged as "v1.0.2"
>> Pushed to origin

$ grunt bump:preminor
>> Version bumped to 1.1.0-0
>> Committed as "Release v1.1.0-0"
>> Tagged as "v1.1.0-0"
>> Pushed to origin

$ grunt bump
>> Version bumped to 1.1.0
>> Committed as "Release v1.1.0"
>> Tagged as "v1.1.0"
>> Pushed to origin

$ grunt bump:premajor (with prerelaseName set to 'rc' in options)
>> Version bumped to 2.0.0-rc.0
>> Committed as "Release v2.0.0-rc.0"
>> Tagged as "v2.0.0-rc.0"
>> Pushed to origin

$ grunt bump
>> Version bumped to 2.0.0
>> Committed as "Release v2.0.0"
>> Tagged as "v2.0.0"
>> Pushed to origin

$ grunt bump:prerelease  # from a released version `prerelease` defaults to prepatch
>> Version bumped to 2.0.1-rc.0
>> Committed as "Release v2.0.1-rc.0"
>> Tagged as "v2.0.1-rc.0"
>> Pushed to origin
````

If you want to jump to an exact version, you can use the ```setversion``` tag in the command line.

```bash
$ grunt bump --setversion=2.0.1
>> Version bumped to 2.0.1
>> Committed as "Release v2.0.1"
>> Tagged as "v2.0.1"
>> Pushed to origin
```

Sometimes you want to run another task between bumping the version and committing, for instance generate changelog. You can use `bump-only` and `bump-commit` to achieve that:

```bash
$ grunt bump-only:minor
$ grunt changelog
$ grunt bump-commit
```

If you want to try out your settings, you can use any of the above commands with the ```dry-run``` tag in the command line.
With this tag specified there will be no changes, stages, commits or pushes.

```bash
$ grunt bump --dry-run
Running "bump" task
Running grunt-bump in dry mode!
>> bump-dry: Version bumped to 1.0.1 (in package.json)
>> bump-dry: git commit package.json -m "Release v1.0.1"
>> bump-dry: git tag -a v1.0.1 -m "Version 1.0.1"
>> bump-dry: git push origin && git push origin --tags
```

Since the tag is parsed and forwarded by grunt, it will also work if you pass it to a different task which then invokes bump.

## Contributing
See the [contributing guide](https://github.com/vojtajina/grunt-bump/blob/master/CONTRIBUTING.md) for more information. In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/): `grunt test jshint`.

## License
Copyright (c) 2014 Vojta Jína. Licensed under the MIT license.
