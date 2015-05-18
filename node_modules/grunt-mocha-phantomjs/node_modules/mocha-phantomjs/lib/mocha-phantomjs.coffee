system  = require 'system'
webpage = require 'webpage'
fs = require 'fs'

USAGE = """
        Usage: phantomjs mocha-phantomjs.coffee URL REPORTER [CONFIG]
        """

class Reporter

  constructor: (@reporter, @config) ->
    @url = system.args[1]
    @columns = parseInt(system.env.COLUMNS or 75) * .75 | 0
    @mochaStartWait = @config.timeout || 6000
    @startTime = Date.now()
    @output = if @config.file then fs.open(@config.file, 'w') else system.stdout
    @fail(USAGE) unless @url

  run: ->
    @initPage()
    @loadPage()

  customizeMocha: (options) ->
    Mocha.reporters.Base.window.width = options.columns

  customizeOptions: ->
    columns: @columns

  # Private

  fail: (msg, errno) ->
    @output.close() if @output and @config.file
    console.log msg if msg
    phantom.exit errno || 1

  finish: ->
    @output.close() if @config.file
    phantom.exit @page.evaluate -> mochaPhantomJS.failures

  initPage: ->
    @page = webpage.create
      settings: @config.settings
    @page.customHeaders = @config.headers if @config.headers
    @page.addCookie(cookie) for cookie in @config.cookies or []
    @page.viewportSize = @config.viewportSize if @config.viewportSize
    @page.onConsoleMessage = (msg) -> system.stdout.writeLine(msg)
    @page.onResourceError = (resErr) =>
      if !@config.ignoreResourceErrors
        system.stdout.writeLine "Error loading resource #{resErr.url} (#{resErr.errorCode}). Details: #{resErr.errorString}" 
    @page.onError = (msg, traces) =>
      return if @page.evaluate -> window.onerror?
      for {line, file}, index in traces
        traces[index] = "  #{file}:#{line}"
      @fail "#{msg}\n\n#{traces.join '\n'}"
    @page.onInitialized = =>
      @page.evaluate (env)->
        window.mochaPhantomJS =
          env: env
          failures: 0
          ended: false
          started: false
          run: ->
            mochaPhantomJS.started = true
            window.callPhantom 'mochaPhantomJS.run': true
            mochaPhantomJS.runner
      , system.env

  loadPage: ->
    @page.open @url
    @page.onLoadFinished = (status) =>
      @page.onLoadFinished = ->
      @onLoadFailed() if status isnt 'success'
      @waitForInitMocha()
    @page.onCallback = (data) =>
      if data?.hasOwnProperty 'Mocha.process.stdout.write'
        @output.write data['Mocha.process.stdout.write']
      else if data?.hasOwnProperty 'mochaPhantomJS.run'
        @waitForRunMocha() if @injectJS()
      else if typeof data?.screenshot is "string"
        @page.render(data.screenshot + ".png")
      true

  onLoadFailed: ->
    @fail "Failed to load the page. Check the url: #{@url}"

  injectJS: ->
    if @page.evaluate(-> window.mocha?)
      @page.injectJs 'mocha-phantomjs/core_extensions.js'
      @page.evaluate @customizeMocha, @customizeOptions()
      true
    else
      @fail "Failed to find mocha on the page."
      false

  runMocha: ->
    @page.evaluate (config) ->
      mocha.useColors config.useColors
      mocha.bail config.bail
      mocha.grep config.grep if config.grep
      mocha.invert() if config.invert
    , @config

    @config.hooks.beforeStart?(this)

    unless @page.evaluate(@setupReporter, @reporter) is true
      customReporter = fs.read(@reporter)
      wrapper = ->
        require = (what) ->
          what = what.replace /[^a-zA-Z0-9]/g, ''
          for r of Mocha.reporters
            return Mocha.reporters[r] if r.toLowerCase() is what
          throw new Error "Your custom reporter tried to require '#{what}', but Mocha is not running in Node.js in mocha-phantomjs, so Node modules cannot be required - only other reporters"

        module = {}
        exports = undefined
        process = Mocha.process

        'customreporter'
        Mocha.reporters.Custom = exports or module.exports

      wrappedReporter = wrapper.toString().replace "'customreporter'", "(function() {#{customReporter.toString()}})()"
      @page.evaluate wrappedReporter

      if @page.evaluate(-> !Mocha.reporters.Custom) or @page.evaluate(@setupReporter) isnt true
        @fail "Failed to use load and use the custom reporter #{@reporter}"

    if @page.evaluate @runner
      @mochaRunAt = new Date().getTime()
      @waitForMocha()
    else
      @fail "Failed to start mocha."

  waitForMocha: =>
    ended = @page.evaluate -> mochaPhantomJS.ended
    if ended
      @config.hooks.afterEnd?(this)
      @finish()
    else
      setTimeout @waitForMocha, 100

  waitForInitMocha: =>
    setTimeout @waitForInitMocha, 100 unless @checkStarted()

  waitForRunMocha: =>
    if @checkStarted() then @runMocha() else setTimeout @waitForRunMocha, 100

  checkStarted: =>
    started = @page.evaluate -> mochaPhantomJS.started
    if !started && @mochaStartWait && @startTime + @mochaStartWait < Date.now()
      @fail "Failed to start mocha: Init timeout", 255
    started

  setupReporter: (reporter) ->
    try 
      mocha.setup
        reporter: reporter or Mocha.reporters.Custom
      true
    catch error
      error

  runner: ->
    try
      mochaPhantomJS.runner = mocha.run()
      if mochaPhantomJS.runner
        cleanup = ->
          mochaPhantomJS.failures = mochaPhantomJS.runner.failures
          mochaPhantomJS.ended = true
        if mochaPhantomJS.runner?.stats?.end
          cleanup()
        else
          mochaPhantomJS.runner.on 'end', cleanup
      !!mochaPhantomJS.runner
    catch error
      false

if phantom.version.major < 1 or (phantom.version.major is 1 and phantom.version.minor < 9)
  console.log 'mocha-phantomjs requires PhantomJS > 1.9.1'
  phantom.exit -1

reporter = system.args[2] || 'spec'

config   = JSON.parse system.args[3] || '{}'

if config.hooks
  config.hooks = require(config.hooks)
else
  config.hooks = {}

mocha = new Reporter reporter, config
mocha.run()
