// http://stackoverflow.com/a/21795252
synchronousRequire = function synchronousRequire(inFileName) {
    var aRequest
        ,aScript
        ,aScriptSource
        ;

    //setup the full relative filename
    inFileName =
        window.location.protocol + '//'
        + window.location.host + '/'
        + inFileName;

    //synchronously get the code
    aRequest = new XMLHttpRequest();
    aRequest.open('GET', inFileName, false);
    aRequest.send();

    //set the returned script text while adding special comment to auto include in debugger source listing:
    aScriptSource = aRequest.responseText + '\n////# sourceURL=' + inFileName + '\n';

    //create a dom element to hold the code
    aScript = document.createElement('script');
    aScript.type = 'text/javascript';

    //set the script tag text, including the debugger id at the end!!
    aScript.text = aScriptSource;

    //append the code to the dom
    document.head.appendChild(aScript);
};

///<reference path="../typings/chai/chai-assert.d.ts" />
///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/d3/d3.d.ts" />
///<reference path="../typings/jquery/jquery.d.ts" />
///<reference path="../typings/jquery.simulate/jquery.simulate.d.ts" />
synchronousRequire("/build/test/testUtils.js");
///<reference path="../plottable.d.ts" />

synchronousRequire("/build/test/axisTests.js");
synchronousRequire("/build/test/broadcasterTests.js");
synchronousRequire("/build/test/componentContainerTests.js");
synchronousRequire("/build/test/componentGroupTests.js");
synchronousRequire("/build/test/componentTests.js");
synchronousRequire("/build/test/coordinatorTests.js");
synchronousRequire("/build/test/dataSourceTests.js");
synchronousRequire("/build/test/domUtilsTests.js");
synchronousRequire("/build/test/gridlinesTests.js");
synchronousRequire("/build/test/idCounterTests.js");
synchronousRequire("/build/test/interactionTests.js");
synchronousRequire("/build/test/labelTests.js");
synchronousRequire("/build/test/legendTests.js");
synchronousRequire("/build/test/perfdiagnostics.js");
synchronousRequire("/build/test/rendererTests.js");
synchronousRequire("/build/test/scaleTests.js");
synchronousRequire("/build/test/strictEqualityAssociativeArrayTests.js");
synchronousRequire("/build/test/tableTests.js");
synchronousRequire("/build/test/textUtilsTests.js");
synchronousRequire("/build/test/utilsTests.js");
