
// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class TreeEdge extends Graphics{
    constructor(container, d){
        super();
        this.data = d;
        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);        
        this.lineStyle(1, d.target.color, 1);  // linewidth, color, alpha
        this.moveTo(p0[0], p0[1]);
        // create an arc
        // (cx, cy, radius, startAngle, endAngle, anticlockwise)  
        if (p0[0] !== p1[0]){
            if(d.source.x < d.target.x ) {
                this.arc(0, 0, d.source.y, p0[2], p1[2]);
            }else{
                this.arc(0, 0, d.source.y, p0[2], p1[2], true);
            }        
        }                        
        this.lineTo(p1[0], p1[1]);
        this.endFill(); 
        container.addChild(this);
    }

    enableHighlight(){        
    }
    
    disableHighlight(){
    }

}
