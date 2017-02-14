function makeData() {
    "use strict";

    const mediumLabels = [
        "Ready Player One",
        "The Magicians",
        "Harry Potter",
        "Accelerando",
        "The Name of the Wind"
    ];

    const longLabels = [
        "I am the very model of a modern Major-General",
        "I've information vegetable, animal, and mineral",
        "I know the kings of England, and I quote the fights historical",
        "From Marathon to Waterloo, in order categorical",
        "I'm very well acquainted, too, with matters mathematical",
        "I understand equations, both the simple and quadratical",
        "About binomial theorem I'm teeming with a lot o' news, (bothered for a rhyme)",
        "With many cheerful facts about the square of the hypotenuse.",
        // "I'm very good at integral and differential calculus",
        // "I know the scientific names of beings animalculous",
        // "In short, in matters vegetable, animal, and mineral",
        // "I am the very model of a modern Major-General",
        // "I know our mythic history, King Arthur's and Sir Caradoc's",
        // "I answer hard acrostics, I've a pretty taste for paradox",
        // "I quote in elegiacs all the crimes of Heliogabalus",
        // "In conics I can floor peculiarities parabolous",
        // "I can tell undoubted Raphaels from Gerard Dows and Zoffanies",
        // "I know the croaking chorus from The Frogs of Aristophanes!",
        // "Then I can hum a fugue of which I've heard the music's din afore, (bothered for a rhyme)",
        // "And whistle all the airs from that infernal nonsense Pinafore"
    ];

    return [mediumLabels, longLabels];
}

function run(svg, data, Plottable) {
    "use strict";

    let y = 0;
    const table = new Plottable.Components.Table();

    const slider = $('<input type="range" min=-80 max=80 value="45" />');
    const indicator = $("<pre>axis.tickLabelShearAngle(45)</pre>")
    slider.on("input", function() { indicator.text("axis.tickLabelShearAngle(" + this.value + ")") });
    $(svg.node()).parent().prepend(slider);
    $(svg.node()).parent().prepend(indicator);

    const angles = [-90, 90, 0];

    angles.forEach((angle) => {
        data.forEach((labels) => {
            const scale = new Plottable.Scales.Category().domain(labels);
            const axis = new Plottable.Axes.Category(scale, "bottom")
                .tickLabelMaxLines(2)
                .tickLabelAngle(angle)
                .tickLabelShearAngle(45)
                .margin(50);

            slider.on("input", function() {
                axis.tickLabelShearAngle(this.valueAsNumber);
            });

            new Plottable.Interactions.PanZoom(scale).attachTo(axis);
            table.add(axis, y++, 0);
        });
    });

    table.renderTo(svg);
}
