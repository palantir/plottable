
declare module SVGTypewriter.Utils.Methods {
    /**
     * Check if two arrays are equal by strict equality.
     */
    function arrayEq<T>(a: T[], b: T[]): boolean;
    /**
     * @param {any} a Object to check against b for equality.
     * @param {any} b Object to check against a for equality.
     *
     * @returns {boolean} whether or not two objects share the same keys, and
     *          values associated with those keys. Values will be compared
     *          with ===.
     */
    function objEq(a: any, b: any): boolean;
}

declare module SVGTypewriter.Utils.DOM {
    function transform(s: D3.Selection, x?: number, y?: number): any;
    function getBBox(element: D3.Selection): SVGRect;
}


declare module SVGTypewriter.Utils {
    class Cache<T> {
        /**
         * @constructor
         *
         * @param {string} compute The function whose results will be cached.
         * @param {(v: T, w: T) => boolean} [valueEq]
         *        Used to determine if the value of canonicalKey has changed.
         *        If omitted, defaults to === comparision.
         */
        constructor(compute: (k: string) => T, valueEq?: (v: T, w: T) => boolean);
        /**
         * Attempt to look up k in the cache, computing the result if it isn't
         * found.
         *
         * @param {string} k The key to look up in the cache.
         * @return {T} The value associated with k; the result of compute(k).
         */
        get(k: string): T;
        /**
         * Reset the cache empty.
         *
         * @return {Cache<T>} The calling Cache.
         */
        clear(): Cache<T>;
    }
}


declare module SVGTypewriter.Utils {
    class Tokenizer {
        tokenize(line: string): string[];
    }
}


declare module SVGTypewriter.Utils.StringMethods {
    /**
     * Treat all sequences of consecutive whitespace as a single " ".
     */
    function combineWhitespace(str: string): string;
    function isNotEmptyString(str: string): boolean;
    function trimStart(str: string, c?: string): string;
    function trimEnd(str: string, c?: string): string;
}


declare module SVGTypewriter.Animators {
    class BaseAnimator {
        /**
         * The default duration of the animation in milliseconds
         */
        static DEFAULT_DURATION_MILLISECONDS: number;
        /**
         * The default easing of the animation
         */
        static DEFAULT_EASING: string;
        constructor();
        animate(selection: D3.Selection): any;
        _animate(selection: D3.Selection, attr: any): D3.Transition.Transition;
        duration(): number;
        duration(duration: number): BaseAnimator;
        moveX(): number;
        moveX(shift: number): BaseAnimator;
        moveY(): number;
        moveY(shift: number): BaseAnimator;
        delay(): number;
        delay(delay: number): BaseAnimator;
        easing(): string;
        easing(easing: string): BaseAnimator;
    }
}


declare module SVGTypewriter.Animators {
    class UnveilAnimator extends BaseAnimator {
        constructor();
        direction(): string;
        direction(direction: string): UnveilAnimator;
        animate(selection: any): any;
    }
}


declare module SVGTypewriter.Animators {
    class OpacityAnimator extends BaseAnimator {
        animate(selection: D3.Selection): any;
    }
}


declare module SVGTypewriter.Wrappers {
    interface WrappingResult {
        originalText: string;
        wrappedText: string;
        noLines: number;
        noBrokeWords: number;
        truncatedText: string;
    }
    class Wrapper {
        _breakingCharacter: string;
        constructor();
        maxLines(): number;
        maxLines(noLines: number): Wrapper;
        textTrimming(): string;
        textTrimming(option: string): Wrapper;
        allowBreakingWords(): boolean;
        allowBreakingWords(allow: boolean): Wrapper;
        wrap(text: string, measurer: Measurers.AbstractMeasurer, width: number, height?: number): WrappingResult;
    }
}


declare module SVGTypewriter.Wrappers {
    class SingleLineWrapper extends Wrapper {
        wrap(text: string, measurer: Measurers.AbstractMeasurer, width: number, height?: number): WrappingResult;
    }
}


declare module SVGTypewriter.Writers {
    interface WriteOptions {
        selection: D3.Selection;
        xAlign: string;
        yAlign: string;
        textRotation: number;
        animator?: Animators.BaseAnimator;
    }
    class Writer {
        _writerID: number;
        _elementID: number;
        constructor(measurer: Measurers.AbstractMeasurer, wrapper?: Wrappers.Wrapper);
        measurer(newMeasurer: Measurers.AbstractMeasurer): Writer;
        wrapper(newWrapper: Wrappers.Wrapper): Writer;
        addTitleElement(add: boolean): Writer;
        write(text: string, width: number, height: number, options: WriteOptions): void;
    }
}


declare module SVGTypewriter.Measurers {
    /**
     * Dimension of area's BBox.
     */
    interface Dimensions {
        width: number;
        height: number;
    }
    class AbstractMeasurer {
        static HEIGHT_TEXT: string;
        constructor(area: D3.Selection, className?: string);
        measure(text?: string): Dimensions;
    }
}


declare module SVGTypewriter.Measurers {
    class Measurer extends AbstractMeasurer {
        constructor(area: D3.Selection, className?: string, useGuards?: boolean);
        _addGuards(text: string): string;
        _measureLine(line: string): Dimensions;
        measure(text?: string): {
            width: number;
            height: number;
        };
    }
}


declare module SVGTypewriter.Measurers {
    class CharacterMeasurer extends Measurer {
        _measureCharacter(c: string): Dimensions;
        _measureLine(line: string): {
            width: number;
            height: number;
        };
    }
}


declare module SVGTypewriter.Measurers {
    class CacheCharacterMeasurer extends CharacterMeasurer {
        constructor(area: D3.Selection, className?: string);
        _measureCharacterNotFromCache(c: string): Dimensions;
        _measureCharacter(c: string): Dimensions;
        reset(): void;
    }
}
