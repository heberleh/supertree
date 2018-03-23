
class Edge{

    constructor(index, id, src_idx, trg_idx){
        this._id = id;
        this._index = index;
        this._trees = [];
        this._reference = false;
        this._src = src_idx;
        this._trg = trg_idx;
    }

    attachTree(tree){
        this._trees.push(tree);
    }

    set reference(r){
        this._reference = r;
    }

    get reference(){
        return this._reference
    }

    get src(){
        return this._src;
    }

    get trg(){
        return this._trg;
    }

}