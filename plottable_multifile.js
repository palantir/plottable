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

synchronousRequire("../build/utils/utils.js");
synchronousRequire("../build/utils/osUtils.js");
synchronousRequire("../build/utils/idCounter.js");
synchronousRequire("../build/utils/strictEqualityAssociativeArray.js");
synchronousRequire("../build/utils/textUtils.js");
synchronousRequire("../build/utils/domUtils.js");

synchronousRequire("../build/core/plottableObject.js");
synchronousRequire("../build/core/broadcaster.js");
synchronousRequire("../build/core/dataSource.js");
synchronousRequire("../build/core/component.js");
synchronousRequire("../build/core/componentContainer.js");
synchronousRequire("../build/core/componentGroup.js");
synchronousRequire("../build/core/table.js");
synchronousRequire("../build/core/scale.js");
synchronousRequire("../build/core/renderer.js");
synchronousRequire("../build/core/renderController.js");

synchronousRequire("../build/scales/quantitiveScale.js");
synchronousRequire("../build/scales/linearScale.js");
synchronousRequire("../build/scales/logScale.js");
synchronousRequire("../build/scales/ordinalScale.js");
synchronousRequire("../build/scales/colorScale.js");
synchronousRequire("../build/scales/timeScale.js");
synchronousRequire("../build/scales/interpolatedColorScale.js");
synchronousRequire("../build/scales/scaleDomainCoordinator.js");

synchronousRequire("../build/components/axis.js");
synchronousRequire("../build/components/label.js");
synchronousRequire("../build/components/legend.js");
synchronousRequire("../build/components/renderers/xyRenderer.js");
synchronousRequire("../build/components/renderers/circleRenderer.js");
synchronousRequire("../build/components/renderers/lineRenderer.js");
synchronousRequire("../build/components/renderers/rectRenderer.js");
synchronousRequire("../build/components/renderers/gridRenderer.js");
synchronousRequire("../build/components/renderers/abstractBarRenderer.js");
synchronousRequire("../build/components/renderers/barRenderer.js");
synchronousRequire("../build/components/renderers/horizontalBarRenderer.js");

synchronousRequire("../build/interactions/keyEventListener.js");
synchronousRequire("../build/interactions/interaction.js");
synchronousRequire("../build/interactions/clickInteraction.js");
synchronousRequire("../build/interactions/mousemoveInteraction.js");
synchronousRequire("../build/interactions/keyInteraction.js");
synchronousRequire("../build/interactions/panZoomInteraction.js");
synchronousRequire("../build/interactions/drag/dragInteraction.js");
synchronousRequire("../build/interactions/drag/dragBoxInteraction.js");
synchronousRequire("../build/interactions/drag/xDragBoxInteraction.js");
synchronousRequire("../build/interactions/drag/xyDragBoxInteraction.js");
synchronousRequire("../build/interactions/drag/setupDragBoxZoom.js");

synchronousRequire("../build/templates/standardChart.js");
