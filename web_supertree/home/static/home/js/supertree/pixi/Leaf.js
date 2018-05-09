// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class Leaf extends Text {

    constructor(d) {
        let style = {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: d.color,
            align: 'center'
        };
        super(d.data.name, style);
        var p = project(d.x-1, d.y);
        this.data = d;
        this.rotation += p[2];
        if (p[0] < 0) {
            this.anchor.x = 1;
            this.anchor.y = 1;
            this.rotation += Math.PI;
        }
        this.x = p[0];
        this.y = p[1];
        this.interactive = true;

        this.on('mouseover', function () {
            //console.log(this);
            this.style.fontWeight = 'bold';
        });

        this.on('mouseout', function () {
            this.style.fontWeight = 'normal';
        });

        this.highlight = false;

        let lineWidth = 1;

        this.on('mousedown', () => {
            this.highlight = !this.highlight;

            let lgts = this.superTreeView.lgts;
            for (var i in lgts) {
                let lgt = lgts[i];
                
                if (lgt.lateralEdgeSprite != null && (lgt.source.data.name.includes(this.data.data.name) || lgt.target.data.name.includes(this.data.data.name))) {
                    //console.log(lgt);
                    if (this.highlight) {
                        lgt.lateralEdgeSprite.highlightOn();                        
                    } else {
                        lgt.lateralEdgeSprite.highlightOff();                        
                    }
                }
            }
        });

        // this.on('mousedown', function(){
        //     let node = this.data;
        //     console.log("mouse cliked");

        //     if (this.highlight){
        //         let color = 0x000000;                
        //         while(node.parent){    
        //             console.log(node);

        //             let line = node.linkGraphics;
        //             line.clear();
        //             line.lineStyle(lineWidth, color, line.lineAlpha); 
        //             console.log(lineWidth, color, line.lineAlpha);
        //             node = node.parent;
        //         }            
        //     }else{                
        //         while(node.parent){
        //             console.log(node);

        //             let line = node.linkGraphics;
        //             line.clear();
        //             line.lineStyle(lineWidth, node.color, line.lineAlpha); 
        //             console.log(lineWidth, node.color, line.lineAlpha);

        //             node = node.parent;
        //         }   

        //     }            
        //     this.highlight = !this.highlight;

        // });

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