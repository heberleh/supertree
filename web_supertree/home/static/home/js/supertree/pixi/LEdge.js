// testing https://jsfiddle.net/henryheberle/9cn7s82u/


class LEdge extends Graphics {
    constructor(container, d) {
        super();
        this.data = d;
        this.color = 0x9966FF;

        let p0 = project(d.source[0], d.source[1]);
        let p1 = project(d.target[0], d.target[1]);

        this.lineStyle(1, this.color, 0.05); // linewidth, color, alpha
        
        this.moveTo(p0[0], p0[1]);
        this.lineTo(p1[0], p1[1]);
        this.endFill();

        // //line.hitArea = line; 

        // how to get mouseover event for lines?
        this.interactive = true;
        this.hitArea = this.getBounds(); // is it necessary when drawing lines?
       
        this.on('mouseover', function () {
            console.log("over", this);
            this.clear()
            this.lineStyle(1, this.color, 1); // linewidth, color, alpha     
            this.dirty++;
            this.clearDirty++;              
        });

        // this.on('mouseout', function () {
        //     console.log("out",this);
        //     this.lineAlpha = 0.05;
        // });

        container.addChild(this);
    }
}