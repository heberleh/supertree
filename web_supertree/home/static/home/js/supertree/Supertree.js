

class Supertree{    

    constructor(supertree_newick, nodes_data){
        // set up supertree       
        this._supertree = null; // hierarchy... or another Tree structure in Javascript. 
        this._simple_hierarchy = parseNewick(supertree_newick)

        this._nodes_data = nodes_data;
        // set up groups -> original groups
        this._groupsLabels = this._setUpTreeGroupsLabels(nodes_data.supertree);
        //////////////////////////////
        
        // set up forest
        this._forest = nodes_data.forest;

        // set up LGTs edges
        this._lgts = nodes_data.lgts;

    }

    // given a ROOT d... of a tree.. store the date in this tree
    storeData(d) {        
        if (d.data.name == "") {
            d.data.c = 0;
            d.data.genes = [];
        } else {            
            try {
                var node = this._nodes_data.supertree[d.data.name];
                d.data.c = node.g;            
                d.data.genes = node.genes;
            } catch (error) {
                console.log(d.data.name);
                return;
            }
            
        }
        if (d.children) d.children.forEach((d) => this.storeData(d));
    }

    _setUpTreeGroupsLabels(nodes){
        var gs = new Set();
        for (let key in nodes){
            gs.add(nodes[key].g);
        }
        return [...gs].sort();
    }

    get groupsLabels(){
        return this._groupsLabels;
    }
    
    get hierarchy(){
        return this._simple_hierarchy;
    }

    get lgts(){
        return this._lgts;
    }
}
