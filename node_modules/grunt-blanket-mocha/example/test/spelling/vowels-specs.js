describe("Vowels test", function() {

    it("should not consider F to be a vowel", function() {
        expect(Vowels.isVowel("F") ).to.be.false;
    });

});
