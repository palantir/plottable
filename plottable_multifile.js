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

synchronousRequire("../out/utils/utils.js");
synchronousRequire("../out/utils/osUtils.js");
synchronousRequire("../out/utils/idCounter.js");
synchronousRequire("../out/utils/strictEqualityAssociativeArray.js");
synchronousRequire("../out/utils/textUtils.js");
synchronousRequire("../out/utils/domUtils.js");

synchronousRequire("../out/core/plottableObject.js");
synchronousRequire("../out/core/broadcaster.js");
synchronousRequire("../out/core/dataSource.js");
synchronousRequire("../out/core/component.js");
synchronousRequire("../out/core/componentContainer.js");
synchronousRequire("../out/core/componentGroup.js");
synchronousRequire("../out/core/table.js");
synchronousRequire("../out/core/scale.js");
synchronousRequire("../out/core/renderer.js");
synchronousRequire("../out/core/renderController.js");

synchronousRequire("../out/scales/quantitiveScale.js");
synchronousRequire("../out/scales/linearScale.js");
synchronousRequire("../out/scales/logScale.js");
synchronousRequire("../out/scales/ordinalScale.js");
synchronousRequire("../out/scales/colorScale.js");
synchronousRequire("../out/scales/timeScale.js");
synchronousRequire("../out/scales/interpolatedColorScale.js");
synchronousRequire("../out/scales/scaleDomainCoordinator.js");

synchronousRequire("../out/components/axis.js");
synchronousRequire("../out/components/label.js");
synchronousRequire("../out/components/legend.js");
synchronousRequire("../out/components/renderers/xyRenderer.js");
synchronousRequire("../out/components/renderers/circleRenderer.js");
synchronousRequire("../out/components/renderers/lineRenderer.js");
synchronousRequire("../out/components/renderers/rectRenderer.js");
synchronousRequire("../out/components/renderers/gridRenderer.js");
synchronousRequire("../out/components/renderers/abstractBarRenderer.js");
synchronousRequire("../out/components/renderers/barRenderer.js");
synchronousRequire("../out/components/renderers/horizontalBarRenderer.js");

synchronousRequire("../out/interactions/keyEventListener.js");
synchronousRequire("../out/interactions/interaction.js");
synchronousRequire("../out/interactions/clickInteraction.js");
synchronousRequire("../out/interactions/mousemoveInteraction.js");
synchronousRequire("../out/interactions/keyInteraction.js");
synchronousRequire("../out/interactions/panZoomInteraction.js");
synchronousRequire("../out/interactions/drag/dragInteraction.js");
synchronousRequire("../out/interactions/drag/dragBoxInteraction.js");
synchronousRequire("../out/interactions/drag/xDragBoxInteraction.js");
synchronousRequire("../out/interactions/drag/xyDragBoxInteraction.js");
synchronousRequire("../out/interactions/drag/setupDragBoxZoom.js");

synchronousRequire("../out/templates/standardChart.js");
