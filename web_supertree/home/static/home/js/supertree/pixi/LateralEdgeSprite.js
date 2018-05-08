// testing https://jsfiddle.net/henryheberle/9cn7s82u/


class LateralEdgeSprite{
    constructor(d) {
        this.data = d;
        this._highlighted = false;      

        // defaults
        this.defaultAlpha = 0.05;
        this.highlightAlpha = 1;

        this.defaultColor = 0x808080;
        this.defaultWidth = 1;
        
        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);
        this.sprite = new LineSprite(this.defaultWidth, this.defaultColor, p0[0], p0[1], p1[0], p1[1]);
        this.sprite.alpha = this.defaultAlpha;        

        this.sprite.interactive = true;
        this.sprite.on('mouseover', ()=> {
            this.highlightOn();            
        });

        this.sprite.on('mouseout', ()=> {            
            this.highlightOff();
        });
    }

    highlightOn(){
        this.sprite.alpha = this.highlightAlpha;
        this._highlighted = true;
    }
    
    highlightOff(){
        this.sprite.alpha = this.defaultAlpha;
        this._highlighted = false;
    }

    setDefaultAlpha(alpha){
        this.defaultAlpha = alpha;        
    }

    get highlighted(){
        return this._highlighted;
    }
}