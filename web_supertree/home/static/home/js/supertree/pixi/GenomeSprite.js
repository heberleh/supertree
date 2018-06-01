// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class GenomeSprite extends Sprite {

    constructor(container, data, supertreeView) {
        super();
        this._node = data;
        this._supertreeView = supertreeView;
        this._canvas = null;
        
        let max_height =  150;
        this.width = 7;
        
        this.height = Math.trunc( max_height * this._node.data.genes.size/this._supertreeView.supertree.maxNgenes);
        
        this.container = container;

        //console.log("width, height:", this.width, this.height);

        this._setUpGroups();

        this._createTexture();
        this._supertreeView.numerOfGenomes;

        this.alpha = 0.7;

        var p = project(this._node.x+0.5, this._node.y);
        this.rotation += p[2] - Math.PI/2;
        if (p[0] < 0) {            
            this.anchor.set(1,1);
            this.rotation += Math.PI;
        }
        this.x = p[0];
        this.y = p[1];
        this.updatePosition();
        this.container.addChild(this);
    }

    _setUpGroups() {
        let groups = {};
        this._supertreeView.supertree.groupsLabels.forEach(label => {
            if (label != "-" && label.length > 0){
                groups[label] = 0;
            }
        });

        let groups_data = this._supertreeView.stream.group_sp_distribution;       

        //console.log("groups_data", groups_data);
        this._node.data.genes.forEach(gene => {
            let group_distr = groups_data[gene];            
            let max_g = 0;
            let selected_g = '';
            for (let group in group_distr) {
                if (group_distr[group] > max_g) {
                    max_g = group_distr[group];
                    selected_g = group;
                }
            }            
            groups[selected_g] += 1;            
        });        
            

        if (this._node.data.genes.size == 0){
            console.log("Why is this node problematic?",this._node.data);
        }else{
            for (let group in groups) {
                groups[group] = groups[group] / this._node.data.genes.size;
            }
        }
        
        this._groups = groups;
    }

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
        var gradient = context.createLinearGradient(0, 0, 0, 50);

        let k = 0;
        let last_color = null;
        //console.log(this._groups);
        for (let label in this._groups) {
            last_color = this._supertreeView.groupsColorMap(label);
            gradient.addColorStop(k, last_color);
            let k2 = this._groups[label];
            if (k2 > 0.05) {
                k2 = k + (k2 - 0.05);
            }           

            gradient.addColorStop(k2, last_color);
            k += this._groups[label];
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
}