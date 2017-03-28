/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

export class CanvasBuffer {
    /**
     * Resizes the canvas' internal pixel buffer to match the devicePixelRatio
     */
    public static sizePixels(
            ctx: CanvasRenderingContext2D,
            screenWidth: number,
            screenHeight: number,
            devicePixelRatio = 2,
        ) {
        const { canvas } = ctx;
        canvas.width = screenWidth * devicePixelRatio;
        canvas.height = screenHeight * devicePixelRatio;
        canvas.style.width = `${screenWidth}px`;
        canvas.style.height = `${screenHeight}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public pixelWidth: number;
    public pixelHeight: number;

    constructor(
        public screenWidth: number,
        public screenHeight: number,
        public devicePixelRatio = 1,
    ){
        this.pixelWidth = screenWidth * devicePixelRatio;
        this.pixelHeight = screenHeight * devicePixelRatio;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        CanvasBuffer.sizePixels(this.ctx, screenWidth, screenHeight, devicePixelRatio);
    }

    public blit(ctx: CanvasRenderingContext2D, x = 0, y = 0) {
        ctx.drawImage(this.canvas, x, y);
    }

    public blitCenter(ctx: CanvasRenderingContext2D, x = 0, y = 0) {
        this.blit(
            ctx,
            Math.floor(x - this.screenWidth / 2),
            Math.floor(y - this.screenHeight / 2),
        );
    }

    /**
     * Changes the size of the underlying canvas in screen space, respecting the
     * current devicePixelRatio.
     *
     * @param center - optionally enable a translate transformation moving the
     *                 origin to the center of the canvas.
     */
    public resize(screenWidth: number, screenHeight: number, center = false) {
        const { devicePixelRatio } = this;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.pixelWidth = screenWidth * devicePixelRatio;
        this.pixelHeight = screenHeight * devicePixelRatio;
        CanvasBuffer.sizePixels(this.ctx, screenWidth, screenHeight, devicePixelRatio);
        if (center) {
            this.ctx.translate(screenWidth / 2, screenWidth / 2);
        }
        return this;
    }

    /**
     * Temporarily resets the current context transformation and fills the
     * entire canvas with the provided color. If no color is provided, the
     * canvas is cleared instead.
     */
    public clear(color?: string) {
        const { pixelWidth, pixelHeight, ctx } = this;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (color == null) {
            ctx.clearRect(0, 0, pixelWidth, pixelHeight);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, pixelWidth, pixelHeight);
        }
        ctx.restore();
        return this;
    }

    public getImageData() {
        return this.ctx.getImageData(0, 0, this.pixelWidth, this.pixelHeight);
    }
}
