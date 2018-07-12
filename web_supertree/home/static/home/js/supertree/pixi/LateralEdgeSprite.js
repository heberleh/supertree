// testing https://jsfiddle.net/henryheberle/9cn7s82u/


class LateralEdgeSprite {
    constructor(container, d, view) {
        this.data = d;
        this.container = container;
        this._highlighted = false;
        this._selected = false;
        this._supertreeView = view;

        // defaults
        this.defaultAlpha = 0.05;
        this.highlightAlpha = 1;

        this.defaultColor = 0x808080;
        
        let s = d3.scaleLinear()
                    .domain([1, this.data.supertree.max_number_of_genes_in_edges])
                    .range([1.0, 4.0]);
        this.defaultWidth = s(this.data.genes.size);
        // this.defaultWidth = 1;
        let p0 = project(d.source.x, d.source.y);
        let p1 = project(d.target.x, d.target.y);        
        
        this.rebuild(p0[0], p0[1], p1[0], p1[1]);        
    }

    highlightOn() {
        this.sprite.alpha = this.highlightAlpha;
        this._highlighted = true;
    }
    
    highlightOff() {
        if (!this.selected) {
            this.sprite.alpha = this.defaultAlpha;
            this._highlighted = false;
        }        
    }

    setDefaultAlpha(alpha) {
        this.defaultAlpha = alpha;
    }

    get highlighted() {
        return this._highlighted;
    }

    set selected(sel) {
        this._selected = sel;
        if (sel) {
            this.highlightOn();
        } else {
            this.highlightOff();
        };
    }

    get selected() {
        return this._selected;
    }

    set color(color){
        this.sprite.color = color;    
    }
    
    get color(){
        return this.defaultColor;
    }

    rebuild(x0, y0, x1, y1){
        if (this.sprite){           
            this.sprite.destroy();
        }

        this.sprite = new LineSprite(this.defaultWidth, this.defaultColor, x0, y0, x1, y1);
        this.sprite.alpha = this.defaultAlpha;

        this.sprite.interactive = true;
        
        // this.sprite.on('mouseover', () => {
        //     this.highlightOn();
        // });

        // this.sprite.on('mouseout', () => {
        //     this.highlightOff();
        // });

        this.sprite.on('mousedown', ()=>{            
            console.log(this.data.genes);
            this.data.genes.forEach(g => {
                console.log(this.data.supertree.getGroupsDistribution(g));
                let src_v = this.data.supertree.getGroupsDistribution(g)[this.data.source.data.c]/this.data.supertree.totals_in_groups[this.data.source.data.c];
                let trg_v = this.data.supertree.getGroupsDistribution(g)[this.data.target.data.c]/this.data.supertree.totals_in_groups[this.data.target.data.c];

                console.log("values: ", src_v, trg_v, this.data.supertree.totals_in_groups[this.data.source.data.c], this.data.supertree.totals_in_groups[this.data.target.data.c]);
                console.log("dif: ", Math.trunc(Math.abs(src_v - trg_v) * 100));
            });


            
                        
            // this._supertreeView.highlightLeavesFromGenes(this.data.genes);
            // this._supertreeView.filterLGTsFromGenes(this.data.genes);
            // this._supertreeView.listGenes(this.data.genes);

        });

        this.container.addChild(this.sprite);
    }

}