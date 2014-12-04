///<reference path="../typings/d3/d3.d.ts" />
///<reference path="./reference.ts" />

//Ambient declarations for 'module' and 'define' required by node
declare var module: any;
declare var define: any;

//declarations required to use Plottable in Node
var window: Window;
var document: Document;
var navigator: Navigator;

if (typeof module === 'object' && module.exports) {
    module.exports = function(windowObj:any, documentObj:any, navigatorObj:any): any {
        window = windowObj;
        document = documentObj;
        navigator = navigatorObj;
        return Plottable;
    };
} else if (typeof define === 'function' && define.amd) {
    define(function () { return Plottable; });
}
