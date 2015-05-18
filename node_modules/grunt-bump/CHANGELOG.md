<a name"0.3.1"></a>
### 0.3.1 (2015-04-23)


#### Bug Fixes

* undefined suffix returns undefined ([5e8e187f](https://github.com/vojtajina/grunt-bump/commit/5e8e187f))


<a name="0.3.0"></a>
## 0.3.0 (2015-02-18)


#### Bug Fixes

* git bump now prepatchs correctly ([a2e06c1e](http://github.com/vojtajina/grunt-bump/commit/a2e06c1e1ea1cede536a86cdee0c38154e6bf8a4))


#### Features

* allow cli options as config options ([19532ad4](http://github.com/vojtajina/grunt-bump/commit/19532ad40176c1d19d3ed0fe5ec81a67c0294f2f))
* support custom regexp ([2fe1e89d](http://github.com/vojtajina/grunt-bump/commit/2fe1e89d78e17e04c07a01139454e6cb5292107a), closes [#126](http://github.com/vojtajina/grunt-bump/issues/126))


<a name="0.2.0"></a>
## 0.2.0 (2015-02-17)


#### Features

* add support for prereleases ([722373fc](http://github.com/vojtajina/grunt-bump/commit/722373fc3b4f80526dd0663a7ab43026417fa30e))


<a name="0.1.0"></a>
## 0.1.0 (2015-01-30)


#### Features

* add dry-run feature ([10f5ecda](http://github.com/vojtajina/grunt-bump/commit/10f5ecdab375f6eb68e4d750be768f5f91208dea), closes [#89](http://github.com/vojtajina/grunt-bump/issues/89))


<a name="0.0.17"></a>
### 0.0.17 (2015-01-28)


<a name="0.0.16"></a>
### 0.0.16 (2014-10-01)


#### Features

* replace version globally ([b87a3764](https://github.com/vojtajina/grunt-bump/commit/b87a3764170cd39a3b638d5f760d0a5342db4c0e))


<a name="0.0.15"></a>
### 0.0.15 (2014-07-28)


#### Bug Fixes

* readme contributing guide ([3eddb922](https://github.com/vojtajina/grunt-bump/commit/3eddb9229d62c9bdcb4e307d3a977533fbddb80a))
* revert git commit file matching ([d1eb1bf0](https://github.com/vojtajina/grunt-bump/commit/d1eb1bf089e43b03c059ac84b21107159813b220), closes [#68](https://github.com/vojtajina/grunt-bump/issues/68), [#69](https://github.com/vojtajina/grunt-bump/issues/69))


#### Breaking Changes

* `bump:build` has been replaced with `bump:prerelease`

 ([1d0233b6](https://github.com/vojtajina/grunt-bump/commit/1d0233b66b569ff8af40d31d129f4144819aa153))


<a name="0.0.14"></a>
### 0.0.14 (2014-05-15)


#### Features

* support Grunt glob patterns in `files` ([9f4d51d5](https://github.com/vojtajina/grunt-bump/commit/9f4d51d5645c37b1140893666bd01bf552f73d5c), closes [#61](https://github.com/vojtajina/grunt-bump/issues/61))


<a name="0.0.13"></a>
### 0.0.13 (2013-12-08)


#### Features

* support non-json file version bump ([db602cf6](https://github.com/vojtajina/grunt-bump/commit/db602cf6cab601eccf5017c9c14a9ef54b692fd1))


<a name="0.0.12"></a>
### 0.0.12 (2013-12-08)


#### Bug Fixes

* Bumping git version should append the short sha1 to the current version ([3679aecf](https://github.com/vojtajina/grunt-bump/commit/3679aecf8c7e0f6550bef662e19584ca1bfff655))


#### Features

* allow passing exact version as CLI argument ([8eaa21e9](https://github.com/vojtajina/grunt-bump/commit/8eaa21e92591d75e7a85426944eec3c41675a3c8))


<a name="0.0.11"></a>
### 0.0.11 (2013-07-08)


#### Bug Fixes

* read the version if only commiting ([7d11e978](https://github.com/vojtajina/grunt-bump/commit/7d11e978dec1892b866768fb595ab91190794826))


<a name="0.0.10"></a>
### 0.0.10 (2013-07-07)


#### Features

* add bump-only and bump-commit ([fc7a357b](https://github.com/vojtajina/grunt-bump/commit/fc7a357b24289f81265f4a151d2ea89c39dae8fc))


<a name="0.0.9"></a>
### 0.0.9 (2013-07-07)


#### Features

* add --bump-only and --commit-only ([4ef22475](https://github.com/vojtajina/grunt-bump/commit/4ef22475313e0cfccff38ef03c49c6e0b2edfdf9), closes [#17](https://github.com/vojtajina/grunt-bump/issues/17))
* add "git" to bump version using git-describe ([e1d9825b](https://github.com/vojtajina/grunt-bump/commit/e1d9825b41f44db1247b9eaf65b8da49c7023e33))


<a name="0.0.8"></a>
### 0.0.8 (2013-07-05)


#### Features

* make "upstream" the default remote ([6a4acd15](https://github.com/vojtajina/grunt-bump/commit/6a4acd159ad7116c1a3ada038e669cab3f164277))
