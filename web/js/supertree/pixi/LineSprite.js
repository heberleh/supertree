class LineSprite extends Sprite {

    constructor(thickness, color, x1, y1, x2, y2) {
        super();
        this.texture = LineSprite.getTexture(thickness, color);
        this._thickness = thickness;
        this._color = color;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.updatePosition();
        this.anchor.x = 0.5;
    }
    

    static initCanvas() {
        LineSprite.canvas = document.createElement("canvas");
        LineSprite.canvas.width = LineSprite.maxWidth + 2;
        LineSprite.canvas.height = LineSprite.maxColors;
        LineSprite.baseTexture = new PIXI.BaseTexture(LineSprite.canvas);
    }

    static resetCanvas(){
        if (LineSprite.canvas){
            LineSprite.canvas.remove();
        }
        LineSprite.initCanvas()        
    }

    static getTexture(thickness, color) {
        var key = thickness + "-" + color;
        if (!LineSprite.textureCache[key]) {
            if (LineSprite.canvas === null) {
                LineSprite.initCanvas();
            }
            var canvas = LineSprite.canvas;
            var context = canvas.getContext("2d");
            context.fillStyle = PIXI.utils.hex2string(color);
            context.fillRect(1, LineSprite.colors, thickness, 1);
            var texture = new PIXI.Texture(LineSprite.baseTexture, PIXI.SCALE_MODES.LINEAR);
            texture.frame = new PIXI.Rectangle(0, LineSprite.colors, thickness + 2, 1);
            LineSprite.textureCache[key] = texture;
            LineSprite.colors++;
        }
        return LineSprite.textureCache[key];
    }

    updatePosition() {
        this.position.x = this.x1;
        this.position.y = this.y1;
        this.height = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1));
        var dir = Math.atan2(this.y1 - this.y2, this.x1 - this.x2);
        this.rotation = Math.PI * 0.5 + dir;
    }

    get thickness() {
        return this._thickness;
    }

    set thickness(value) {
        this._thickness = value;
        this.texture = this.getTexture(this._thickness, this._color);
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;       
        this.texture = LineSprite.getTexture(this._thickness, this._color);
    }
}

LineSprite.textureCache = {};
LineSprite.maxWidth = 2000;
LineSprite.maxColors = 2000;
LineSprite.colors = 0;
LineSprite.canvas = null;