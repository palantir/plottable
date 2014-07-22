Plottable Landing Page
======================

This site uses Grunt to run concat/minify/imagemin and Compass/SASS. Pages are compiled using Jekyll, using Github-Pages gem.


Installation
------------

Install [Bundler](http://bundler.io):

    [sudo] gem install bundler

Install Gems:

    bundle install

Install [Node.JS/npm](http://nodejs.org):

    Follow instructions online...

Install [Grunt CLI](http://gruntjs.com/getting-started)

    npm install -g grunt-cli

Install npm dependencies:

    npm install

Run default Grunt task:

    grunt


Running
-------

To start building pages using Jekyll and compiling assets with Grunt, run these two commands:

To run Jekyll:

    bundle exec jekyll serve --watch

To run Grunt then watch:

    grunt && grunt watch


Frameworks
----------

Modernizr and Compass are available. Bootstrap 3.1.1 is included as source sass (not using `bootstrap-sass` since I couldn't figure out how to manage to include javascript files using `grunt-contrib-compass`)


Grunt (build tool)
------------------

## Image Assets

Grunt will automatically compile (optimize/strip metadata) image files inside `/images` and put them into `_sites/build/`. So, in order to reference images you will need to prepend `/build` to the URL. For example if you have an image `/images/global/foobar.png` you would reference:

    <img src="/build/images/global/foobar.png">

_This is a good candidate to create a custom Liquid Filter._

## JavaScript / SASS

The default Grunt task will compile and minify specific JavaScript/SASS files. You'll need to look at the `Gruntfile` to see the specifics. In order to include a new JS file, you'll need to add that file in `Gruntfile`. For the most part, you'll want to include your JS file to concatenate with `/build/js/application.js` however, you'll see that Modernizr and Respond.js are compiled separately. This is because Modernizr need to be included in `<head>` while Respond.js is included only for IE < 9. If for some reason you need to be specific about how to include your JS, you'll want to specify that in the `Gruntfile`.


Notes
-----

Don't touch anything in `/build`. All assets will automatically be generated there. If you edit any files in that directory, the next time the source is modified, a new generated file will destroy any changes you made.

The recommended workflow is to have two terminal windows open, one running jekyll watch and the other running grunt watch. Actually, there should be one rake task that should launch all necessary tasks.
