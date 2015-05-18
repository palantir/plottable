# Please send all pull requests to the __incoming-pr__ branch.

This repository uses [travis-ci](https://travis-ci.org/axemclion/jquery-indexeddb) for running the continuous integration (CI) tests. It uses [saucelabs](http://saucelabs.com) to run automated test cases on different browsers. The saucelabs server can be only accessed using a secure environment variable that is not accessible in pull requests.

The Pull-Request lifecycle
------------------------

Thank you for submitting a patch to this project, we really appreciate it. Here is a quick overview of the process used to ensure that pull requests do not break existing functionality. You just have to do Step 1, all others are done by travis.

1. Send a pull request with your changes to `incoming-pr` branch
2. Travis runs only jslint on your pull request.
  * If the pull request tests fail, please correct the lint errors
3. Once the pull request passes the lint test, you pull request is merged into `incoming-pr` branch.
4. Travis runs *ALL* tests on `incoming-pr` branch. Since `incoming-pr` has access to the secure environment variables, it runs the saucelabs tests also.
  * If the saucelabs tests fail, `incoming-pr` is reverted to its original state.
  * Your changes are preserved in a separate branch. Please take a look at this branch and fix any failing tests
5. Once travis on the `incoming-pr` branch succeeds, your commits are automatically merged into `master`.


Filing Issues
-------------

If this plugin is not working for you, please read the documentation, and the examples. You can also look at the [Gruntfile.js](https://github.com/axemclion/grunt-saucelabs/blob/master/Gruntfile.js#L49) in this directory to see a sample of the task used, with all the parameters.
If you are looking for a feature, it would be best to open a bug and send in a pull request.

Discussions
------------
This project is maintained by [Sebastian Tiedtke](https://github.com/sourishkrout) and [Parashuram](http://github.com/axemclion). It would be easy to send them a tweet and ask them questions.
