

class Tree{

    constructor(newick_string){
        this._parse(newick_string);
        this._data = null;
    }

    _parse(newick_string){
        var json = newick_parse(newick_string);
        
        // compute internal ids for the internal nodes on json structure
        
        
    }

    get nodes(){
        // navigate and return list of nodes (leafs and internal nodes)
        this._data;//

        return null;
    }

    get edges(){
        //navigate and return list of edges
        this._data;//\

        return null;
    }

    get root(){
        // navigate and return the root node
        this._data;//
        
        return null;
    }

}