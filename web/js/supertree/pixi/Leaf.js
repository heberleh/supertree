// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class Leaf extends Text {

    constructor(d) {
        let style = {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: d.color,
            align: 'center'
            // stroke: "black",
            // strokeThickness: 1
        };
        super(d.data.name, style);
        var p = project(d.x - 1, d.y);
        this._node = d;

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
            this.highlightOn();
        });

        this.on('mouseout', function () {
            if (!this.selected) this.highlightOff();
        });

        this.highlight = false;

        let lineWidth = 1;

        this.on('mousedown', () => {
            console.log(this._node.data, this._node.data.genes);

            console.log(this._node.genomeSprite.groups);
            let lgts = this.superTreeView.supertree.lgts;
            if (this.selected) {
                this.setSelected(false);
                for (var i in lgts) {
                    lgts[i].lateralEdgeSprite.selected = false;
                }
            } else {
                this.setSelected(true);                
                lgts.forEach(lgt => {
                    //if (lgt.lateralEdgeSprite != null && (lgt.source.data.name.includes(this._node.data.name) || lgt.target.data.name.includes(this._node.data.name)) && anyIntersection(lgt.genes, this._node.data.genes)) {                          
                    
                    if(lgt.lateralEdgeSprite != null && (lgt.source.data.name == this._node.data.name || lgt.target.data.name == this._node.data.name)){                   
                        lgt.lateralEdgeSprite.selected = true;

                        // lgt.lateralEdgeSprite.sprite.visible = true;
                    } else {
                        lgt.lateralEdgeSprite.selected = false;
                        // lgt.lateralEdgeSprite.sprite.visible = false;
                    }
                });

            }
        });
    }

    highlightOn() {
        this.style.fontWeight = 'bold';
        this.style.fill = 0x000000;
        this.highlighted = true;
    }

    highlightOff() {
        this.style.fontWeight = 'normal';
        this.style.fill = this._node.color;
        this.highlighted = false;
    }

    setSelected(value) {
        this.selected = value;
        if (value) {
            this.highlightOn();
        } else {
            this.highlightOff();
        }
    }
}