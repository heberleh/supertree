// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class Leaf extends Text{

    constructor(container, d){        
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
            this.style.fontWeight = 'bold';           
        });
        this.on('mouseout', function () {            
            this.style.fontWeight = 'normal';           
        });
        container.addChild(this);
    }

}


