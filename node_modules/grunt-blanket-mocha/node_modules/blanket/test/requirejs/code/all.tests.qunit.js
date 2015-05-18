/// <reference path="require.js" />
/// <reference path="qunit.js" />

// Blanket should save the XHR just in case there's a test that overwrites them.
window.XMLHttpRequest = null;
window.ActiveXObject = null;

requirejs(['./tests/base/base.qunit.test',
           './tests/ui/ui.qunit.test'],
    function (){}
);
