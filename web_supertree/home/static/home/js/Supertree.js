

class Supertree{    

    constructor(supertree_newick, nodes_data){
        // set up supertree       
        this._supertree = null; // hierarchy... or another Tree structure in Javascript. 
        this._simple_hierarchy = parseNewick(supertree_newick)

        // set up groups -> original groups
        this._setUpTreeGroupsLabels(nodes_data.supertree_nodes);
        //////////////////////////////
        
        // set up forest
        this._forest = nodes_data.forest;

        // set up LGTs edges

    }

    _setUpTreeGroupsLabels(nodes){
        gs = new Set();
        for (let key in nodes){
            gs.add(nodes[key].g);
        }
        this._groupsIndexes = [...gs];
    }

    get minGroup(){
        return Math.min(this._groupsIndexes);
    }    

    get maxGroup(){
        return Math.max(this._groupsIndexes);
    }
    
    get hierarchy(){
        return this._simple_hierarchy;
    }
}
