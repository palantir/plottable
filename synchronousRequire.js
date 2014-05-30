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
