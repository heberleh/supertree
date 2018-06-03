// testing https://jsfiddle.net/henryheberle/9cn7s82u/


class LEdge extends Graphics {
    constructor(d) {
        super();
        this.data = d;
       
        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);

        this.color = 0x808080;
        this.lineStyle(1, this.color, 0.02); // linewidth, color, alpha        
        this.moveTo(p0[0], p0[1]);
        this.lineTo(p1[0], p1[1]);
        this.endFill();

        // //line.hitArea = line; 

        // how to get mouseover event for lines?
        this.interactive = true;
        this.hitArea = this.getBounds(); // is it necessary when drawing lines?
       
        this.on('mouseover', function () {
            console.log("over", this);
            this.clear();  
            //this.destroy();
            this.lineWidth = 2; 
            this.lineAlpha = 1;
            this.alpha = 1;
            
        });

        // this.on('mouseout', function () {            
        //     this.lineAlpha = 0.05;
        // });
    }
}   

// class LEdge extends Sprite {
//     constructor(d) {
//         super();
//         this.data = d;
        
//         let p0 = project(d.source.x, d.source.y);
//         let p1 = project(d.target.x, d.target.y);

//         this.color = 0x808080;
//         this.lineStyle(1, this.color, 0.02); // linewidth, color, alpha        
//         this.moveTo(p0[0], p0[1]);
//         this.lineTo(p1[0], p1[1]);
//         this.endFill();

//         // //line.hitArea = line; 

//         // how to get mouseover event for lines?
//         this.interactive = true;
//         this.hitArea = this.getBounds(); // is it necessary when drawing lines?
       
//         this.on('mouseover', function () {
//             console.log("over", this);
//             this.clear();  
//             //this.destroy();
//             this.lineWidth = 2; 
//             this.lineAlpha = 1;
//             this.alpha = 1;            
//         });

//         // this.on('mouseout', function () {            
//         //     this.lineAlpha = 0.05;
//         // });
//     }
// }