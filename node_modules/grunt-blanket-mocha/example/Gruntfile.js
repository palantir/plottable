/*global module*/
module.exports = function(grunt) {

    "use strict";

    grunt.initConfig({

        blanket_mocha : {
            test: {
                src: ['test.html'],
                options : {
                    threshold : 60,
                    globalThreshold : 65,
                    log : true,
                    logErrors: true,
                    moduleThreshold : 60,
                    modulePattern : "./src/(.*?)/",
                    customThreshold: {
                        './src/spelling/plurals.js': 50
                    }
                }
            }

        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('coverage', ['blanket_mocha']);
    grunt.registerTask('default', ['blanket_mocha']);
};
