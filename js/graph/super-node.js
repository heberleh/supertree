


class Node{

    constructor(index, id){
        this._id = id;
        this._index = index;
        this._trees = [];
        this._reference = false;
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

    get index(){
        return this._index;
    }


}