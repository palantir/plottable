///<reference path="testReference.ts" />

var assert = chai.assert;

describe("Word Wrap Util.ities", () => {
    it("properly wraps a short sentence", () => {
        var text = "All work and no play makes Jack a dull boy.";
        var width = 200;
        var wrappedText = Plottable.Util.WordWrap.breakTextToFitWidth(text, width, (text) => text.length * 10);

        assert.lengthOf(wrappedText, 3);
        assert.equal(wrappedText[0], "All work and no play ");
        assert.equal(wrappedText[1], "makes Jack a dull ");
        assert.equal(wrappedText[2], "boy.");
    });

    it("properly breaks a long word", () => {
        var text = "Supercalifragilisticexpialidocious";
        var width = 100;
        var wrappedText = Plottable.Util.WordWrap.breakTextToFitWidth(text, width, (text) => text.length * 10);

        assert.lengthOf(wrappedText, 4);
        assert.equal(wrappedText[0], "Supercali-");
        assert.equal(wrappedText[1], "fragilist-");
        assert.equal(wrappedText[2], "icexpiali-");
        assert.equal(wrappedText[3], "docious");
    });

    it("breaks on line break characters", () => {
        var text = "Hello:World";
        var width = 70;
        var wrappedText = Plottable.Util.WordWrap.breakTextToFitWidth(text, width, (text) => text.length * 10);

        assert.lengthOf(wrappedText, 2);
        assert.equal(wrappedText[0], "Hello:");
        assert.equal(wrappedText[1], "World");
    });

    it("breaks on line break characters in the correct place", () => {
        var width = 80;

        // should line break after these characters: ! " % ) , - . : ; ? ] }
        var text = "||||| d!d";
        var wrappedText = Plottable.Util.WordWrap.breakTextToFitWidth(text, width, (text) => text.length * 10);

        assert.lengthOf(wrappedText, 2);
        assert.equal(wrappedText[0], "||||| d!");
        assert.equal(wrappedText[1], "d");

        // should line break before these characters: { [
        text = "||||| d[d";
        wrappedText = Plottable.Util.WordWrap.breakTextToFitWidth(text, width, (text) => text.length * 10);

        assert.lengthOf(wrappedText, 2);
        assert.equal(wrappedText[0], "||||| d");
        assert.equal(wrappedText[1], "[d");
     });

    it("can predict when it will and won't break", () => {
        var text1 = "Hello:World";
        var text2 = "Hello World";
        var text3 = "HelloYWorld";
        var measureText = (text: string) => text.length * 10;
        var canBreak = (text: string) => Plottable.Util.WordWrap.canWrapWithoutBreakingWords(text, 70, measureText);

        assert.isTrue( canBreak(text1), "It can break \"Hello:World\"");
        assert.isTrue( canBreak(text2), "It can break \"Hello World\"");
        assert.isFalse(canBreak(text3), "It can't break \"HelloYWorld\"");
    });

});
