// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class GenomeSprite extends Sprite{

    constructor(data, supertreeView) {
        super();
        this._data = data;
        this._setUpGroups();

        this._createTexture();        
        this._supertreeView = supertreeView;
        let max_n = this._supertreeView.supertree.numerOfGenomes();        
                  
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.updatePosition();        
    }
    
    _setUpGroups(){
        let groups = {};        
        this._supertreeView.supertree.groupsLabels.forEach(label=>{
            groups[label] = 0;
        });

        var total = 0;
        for (let i in this._data.genes){
            let gene = this._data.genes[i];            
        }

        let groups_data = this._supertreeView.stream.data;
        let total_genomes = 0;
        this._data.genes.forEach(gene => {
            let group_distr = groups_data[gene];
            for (let group in group_distr){
                groups[group] += group_distr[group];
                total_genomes += group_distr[group];
            }
        });

        for (let group in groups){
            groups[group] = groups[group]/total_genomes;
        }

        this._groups = groups;
    }

    _initCanvas() {
        this._canvas = document.createElement("canvas");
        this._canvas.width = this._width + 2;        
        this._canvas.height = this._height;
        this._baseTexture = new BaseTexture(this._canvas);
    }

    _resetCanvas(){
        if (this.canvas){
            this.canvas.remove();
        }
        this.initCanvas()        
    }

    _createTexture() {        
        let texture = null;

        if (this._canvas === null) {
            this.initCanvas();
        }
        var context = this._canvas.getContext("2d");
        var gradient = context.createLinearGradient(0, 0, 0, 50);
        
        let k = 0;
        let last_color = null;
        this._supertreeView.groupsLabels.forEach(label =>{
            last_color = this._treeGroupColorMap(label);
            gradient.addColorStop(k, last_color);
            let k2 = this._groups[label];
            if (k2 > 0.05){
                k2 = k+(k2-0.05);
            }                        
            gradient.addColorStop(k2, last_color);
            k += this._groups[label];            
        });
        gradient.addColorStop(1, last_color);
      
        context.fillStyle = gradient;     
        context.fillRect(this.x, this.y, this.width, this.height);

        this.texture = new PIXI.Texture(this._canvas, PIXI.SCALE_MODES.LINEAR);
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