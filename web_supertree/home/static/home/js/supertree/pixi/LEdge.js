// testing https://jsfiddle.net/henryheberle/9cn7s82u/


class LEdge extends Graphics {
    constructor(container, d) {
        super();
        this.data = d;
        this.color = 0x808080;        
        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);

        this.lineStyle(1, this.color, 1); // linewidth, color, alpha
        
        this.moveTo(p0[0], p0[1]);
        this.lineTo(p1[0], p1[1]);
        this.endFill();

        // //line.hitArea = line; 

        // how to get mouseover event for lines?
        this.interactive = true;
        this.hitArea = this.getBounds(); // is it necessary when drawing lines?
       
        this.on('mouseover', function () {
            console.log("over", this);
            this.lineAlpha = 1;              
        });

        this.on('mouseout', function () {            
            this.lineAlpha = 1;
        });

        container.addChild(this);
    }
}