
const RANDOMS = Array.apply(null, Array(256)).map(() => Math.random());
const MASK = 0xFF;

function lerp(a: number, b: number, t: number) {
    return a * ( 1 - t ) + b * t;
};

export function noise(x: number) {
    const xFloor = Math.floor(x);
    const t = x - xFloor;
    const tRemapSmoothstep = t * t * ( 3 - 2 * t );
    const xMin = xFloor & MASK;
    const xMax = (xMin + 1) & MASK;
    return lerp(RANDOMS[xMin], RANDOMS[xMax], tRemapSmoothstep);
}
