

class Supertree{

    constructor(referenceTreeText){
        this._referenceTree = null;
        this._trees = [];
        this._attachReferenceTree(referenceTreeText);
    }

    attachTrees(treesText){
        var t = treesText.replace(/(\r\n\t|\n|\r\t)/gm,"").split(";");
        for(let i = 0; i < t.length; i++){
            if(t[i].length > 0){ 
                this._trees.push(new Tree(t[i]));        
            }
        }
    }

    _attachReferenceTree(text){      
        this._referenceTree = new Tree(text.replace(/(\r\n\t|\n|\r\t)/gm,"").replace(";",""));
    }

    matchReferenceTree(smallTree){
        // return true if the tree exists exactly as it is in the reference tree.
    }

    get referenceTree(){
        return this._referenceTree;
    }

    get trees(){
        return this._trees;
    }

    print(){
        console.log("Small trees");
        console.log(this._trees);
        console.log("Reference tree:");
        console.log(this._referenceTree);
    }
}