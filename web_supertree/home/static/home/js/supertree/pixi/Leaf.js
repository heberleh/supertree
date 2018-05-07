// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class Leaf extends Text{

    constructor(d){        
        let style = {fontFamily : 'Arial', fontSize: 10, fill : d.color, align : 'center'};
        super(d.data.name, style);        
        var p = project(d.x, d.y);
        this.data = d;
        this.rotation += p[2];
        if (p[0] < 0){
            this.anchor.x = 1;
            this.anchor.y = 1;
            this.rotation += Math.PI;
        }
        this.x = p[0];
        this.y = p[1];
        this.interactive = true;        
        
        this.on('mouseover', function () {        
            console.log(this)    ;
            this.style.fontWeight = 'bold';           
        });

        this.on('mouseout', function () {            
            this.style.fontWeight = 'normal';           
        });

        this.highlight = false;
        this.on('mousedown', function(){
            let node = this.data;
            console.log("mouse cliked");

            if (this.highlight){
                let color = 0x000000;                
                while(node.parent){    
                    console.log(node);
                    node.linkGraphics.lineColor = color;
                    node = node.parent;
                }            
            }else{                
                while(node.parent){
                    console.log(node);                              
                    node.linkGraphics.lineColor = node.color;
                    node = node.parent;
                }   

            }            
            this.highlight = !this.highlight;

        });

        // function moveToFront() {
        //     this.parentNode.appendChild(this);
        // }

        // function mouseovered(active) {
        //     return function (d) {
        //         d3.select(this).classed("label--active", active);
        //         d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
        //         do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = droot.parent);
        //     };
        // }
    }

}


