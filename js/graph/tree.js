

class Tree{

    constructor(newick_string){
        this._data = this._parse(newick_string);
    }

    _find(root){
        // keep going
        if('children' in root){  
            var allchildren = [];          
            for(let i = 0; i < root.children.length; i++){  
                var children = this._find(root.children[i]);
                for(let j = 0; j < children.length; j++){
                    allchildren.push(children[j]);
                }                
                allchildren.sort();
                root.name = allchildren.toString();                
            }
            return allchildren;            
        // stop condition
        }else{            
            return [root.name];
        }

    }

    _parse(newick_string){               
        // compute internal ids for the internal nodes on json structure
        var parser = require("biojs-io-newick");
        var json = parser.parse_newick(newick_string);       
        
        var allchildren = [];
        for(let i = 0; i < json.children.length; i++){
            var children = this._find(json.children[i]);
            for (let j = 0; j < children.length; j++){
                allchildren.push(children[j]);
            }            
        }
        allchildren.sort();        
        json.name = allchildren.toString();        
        return json;
    }


    _findNodes(root){        
        // keep going
        if('children' in root){ 
            var allchildren = [];          
            for(let i = 0; i < root.children.length; i++){  
                var children = this._findNodes(root.children[i]);
                for(let j = 0; j < children.length; j++){                    
                    allchildren.push(children[j]);
                }
            }
            allchildren.push(root.name);
            return allchildren;            
        // stop condition
        }else{            
            return [root.name];
        }

    }

    get nodes(){
        // navigate and return list of nodes (leafs and internal nodes)
        var allchildren = [];
        for(let i = 0; i < this._data.children.length; i++){
            var children = this._findNodes(this._data.children[i]);
            for (let j = 0; j < children.length; j++){
                allchildren.push(children[j]);
            }            
        }
        return allchildren;
    }

    _findEdges(parent, node){
        // keep going        
        if('children' in node){
            var alledges = [];          
            for(let i = 0; i < node.children.length; i++){  
                var edges = this._findEdges(node, node.children[i]);

                for(let j = 0; j < edges.length; j++){
                    alledges.push(edges[j]);
                }                                              
            }
            alledges.push([parent.name, node.name]);
            return alledges;            
        // stop condition
        }else{              
            return [[parent.name, node.name]];
        }

    }

    get edges(){
        //navigate and return list of edges
        var alledges = [];
        for(let i = 0; i < this._data.children.length; i++){

            var edges = this._findEdges(this._data, this._data.children[i]);
            for (let j = 0; j < edges.length; j++){
                alledges.push(edges[j]);
            }            
        }
        return alledges;
    }

    get root(){
        // navigate and return the root node
        this._data;
        
        return null;
    }

}