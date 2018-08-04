
// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class TreeEdge extends Graphics{
    constructor(d){
        super();
        this.data = d;

        let linewidth = 0.6; //default
        let max_linewidth = 3;

        if (d.target.data.genes.size != 0){            
            linewidth = ([...d.source.data.genes].filter(x => d.target.data.genes.has(x)).length / d.target.data.genes.size) * max_linewidth;
        }
        if (linewidth < 0.6) linewidth = 0.6;

        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);
        this.lineStyle(linewidth, d.target.color, 1);  // linewidth, color, alpha
        this.moveTo(p0[0], p0[1]);
        
        // create an arc
        // (cx, cy, radius, startAngle, endAngle, anticlockwise)          
        if (d.source.x !== 0 && d.source.y !== 0){
            if(d.source.x < d.target.x ) {
                this.arc(0, 0, d.source.y, p0[2], p1[2]);
            }else{
                this.arc(0, 0, d.source.y, p0[2], p1[2], true);
            }
        }

        this.lineTo(p1[0], p1[1]);
        this.endFill();
        this.data.target.linkGraphics = this;
    }

    enableHighlight(){        
    }
    
    disableHighlight(){
    }

}
