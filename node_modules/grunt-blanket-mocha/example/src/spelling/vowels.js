window.Vowels = {}

window.Vowels.isVowel = function ( theLetter ) {

    if ( !theLetter ) {
        return false;
    } else if ( theLetter.length > 1 ) {
        return false;
    }

    theLetter = theLetter.toUpperCase();

    switch(theLetter) {
        case "A":
        case "E":
        case "I":
        case "O":
        case "U":
            return true;
        default:
            return false;
    }

};

window.Vowels.isNotVowel = function(theLetter) {

    var isAVowel = isVowel(theLetter);

    return ! isAVowel;
};
