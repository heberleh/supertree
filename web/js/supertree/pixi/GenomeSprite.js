// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class GenomeSprite extends Sprite {

    constructor(container, node, supertreeView) {
        super();
        this._node = node;
        this._supertreeView = supertreeView;
        this._supertree = this._supertreeView.supertree;
        this._canvas = null;

        let max_height = 150;
        this.width = 7;

        let s = d3.scaleLinear()
                    .domain([this._supertree.minNGenes,this._supertree.maxNGenes])
                    .range([10, max_height]);

        //console.log("Scale genome size: ", [this._supertreeView.supertree.minNgenes,this._supertreeView.supertree.maxNgenes], s(this._node.data.genes.size));
        this.height = Math.trunc(s(this._node.data.genes.size));

        this.container = container;

        //console.log("width, height:", this.width, this.height);

        this._setUpGroups();

        this._createTexture();        

        this.alpha = 0.7;

        var p = project(this._node.x + 0.5, this._node.y);
        this.rotation += p[2] - Math.PI / 2;
        if (p[0] < 0) {
            this.anchor.set(1, 1);
            this.rotation += Math.PI;
        }else{
            this.anchor.set(1,1);
            this.rotation += Math.PI;
        }
        
        this.x = p[0];
        this.y = p[1];
        this.updatePosition();
        this.container.addChild(this);
    }

    _setUpGroups() {
        let groups = [];
        this._supertree.groupsLabels.forEach(label => groups.push(0));

        this._node.data.genes.forEach(gene => {
            let group_distr = this._supertree.getGeneGroupsDistribution(gene);
            let max_g = 0;
            let selected_g = '';
            for (let i in group_distr) { // for each group
                if (group_distr[i] > max_g) { // if |group| is max -> selected_group = group
                    max_g = group_distr[i];
                    selected_g = i;
                }
            }
            groups[selected_g] += 1;
        });


        if (this._node.data.genes.size == 0) { 
            console.log("Genome with ZERO genes?", this._node.data);
        } else {
            for (let i in groups) {
                groups[i] = groups[i] / this._node.data.genes.size;
            }
        }
        let groups_list = [];
        for (let i in groups) {
            groups_list.push({                
                "name": this._supertree.groupsLabels[i],
                "count": groups[i]
            });            
        }
        groups_list.sort(function (a, b) {
            if (a.count > b.count) return true;
            else return false;
        });

        this._groups = groups_list;
    }

    // _setUpGroupsSum() {
    //     let groups = {};
    //     this._supertree.groupsLabels.forEach(label => {
    //         if (label != "-" && label.length > 0) {
    //             groups[label] = 0;
    //         }
    //     });

    //     let groups_data = this._supertreeView.stream.group_sp_distribution;

    //     //console.log("groups_data", groups_data);

    //     this._node.data.genes.forEach(gene => {
    //         let group_distr = groups_data[gene];
    //         let selected_g = '';
    //         for (let group in group_distr) {
    //             groups[group] += group_distr[group];
    //         }
    //     });

    //     let total = 0;
    //     for (let group in groups) {
    //         total += groups[group];
    //     }
    //     if (this._node.data.genes.size == 0) {
    //         console.log("Why is this node problematic?", this._node.data);
    //     } else {
    //         for (let group in groups) {
    //             groups[group] = groups[group] / total;
    //         }
    //     }

    //     let groups_list = [];
    //     for (let group in groups) {
    //         groups_list.push({
    //             "name": group,
    //             "count": groups[group]
    //         });
    //     }
    //     groups_list.sort(function (a, b) {
    //         if (a.count > b.count) return true;
    //         else return false;
    //     });

    //     this._groups = groups_list;
    // }

    _initCanvas() {
        this._canvas = document.createElement("canvas");
        this._canvas.width = this._width + 2;
        this._canvas.height = this._height;
        this._baseTexture = new BaseTexture(this._canvas);
    }

    _resetCanvas() {
        if (this.canvas) {
            this.canvas.remove();
        }
        this.initCanvas()
    }

    _createTexture() {
        let texture = null;

        if (this._canvas === null) {
            this._initCanvas();
        }

        var context = this._canvas.getContext("2d");
        var gradient = context.createLinearGradient(0, 0, 0, this.height);

        let k = 0.0;
        let last_color = null;
        //console.log(this._groups);
        for (let i in this._groups) {
            let group = this._groups[i];

            if(this._node.data.name == "Leuconostoc_kimchii_IMSNU_11154"){
                console.log("from ",k);
            }

            let color = this._supertreeView.groupsColorMap(group.name);
            
            gradient.addColorStop(k, color);
            k += group.count;
            gradient.addColorStop(k, color);

            if(this._node.data.name == "Leuconostoc_kimchii_IMSNU_11154"){
                console.log("to ",k, " with color ", color, " group ", group);
            }
            last_color = color;
        }

        gradient.addColorStop(1, last_color);

        context.fillStyle = gradient;
        context.fillRect(this.x, this.y, this.width, this.height);

        //console.log("canvas befor error", this._canvas, context);
        this.texture = new PIXI.Texture(this._baseTexture, PIXI.SCALE_MODES.LINEAR);
        this.texture.frame = new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    }

    updatePosition() {
        this.position.x = this.x;
        this.position.y = this.y;
        // this.height = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1));
        // var dir = Math.atan2(this.y1 - this.y2, this.x1 - this.x2);
        // this.rotation = Math.PI * 0.5 + dir;
    }

    get groups(){
        return this._groups;
    }
}