


class Node{

    constructor(index, id){
        this._id = id;
        this._index = index;
        this._trees = [];
    }

    attachTree(tree){
        this._trees.push(tree);
    }


}