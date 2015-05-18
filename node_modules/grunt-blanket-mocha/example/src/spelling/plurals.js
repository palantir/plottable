window.Plurals = {}

window.Plurals.dog = function(howMany) {
    var ret;
    if (howMany < 0) {
        ret = "0 dogs";
    } else if (howMany === 1) {
        ret = "1 dog";
    } else {
        ret = "" + howMany + " dogs";
    }

    return ret;
};

window.Plurals.cat = function(howMany) {
    var ret;
    if (howMany < 0) {
        ret = "0 cats";
    } else if (howMany === 1) {
        ret = "1 cat";
    } else {
        ret = "" + howMany + " cats";
    }

    return ret;
};

window.Plurals.fish = function(howMany) {
    return "" + howMany + " fish";
};
