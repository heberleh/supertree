class Supertree {

    constructor(supertree_newick, nodes_data) {
        // update data structure
        this._nodes_data = nodes_data;   

        ///////////////// todo ////////////////////////////////////
        //this._genesNamesVect = [];
        //this._genesNamesHash = {};        
        //this._setUpGenesDict(genes_names) // a list with the genes names (for each tree in forest, in the same order)
        ///////////////////////////////////////////////////////////

        // set up supertree       
        this._supertree = null; // hierarchy... or another Tree structure in Javascript. 
        this._simple_hierarchy = parseNewick(supertree_newick);
        this._d3Hierarchy = this._setUpSupertreeD3Hierarchy();
        
     
        // set up data in the supertree structure
        this._storeData(this.hierarchy);


        this._supertree_nodes_hash = this._setUpSupetreeNodesHash();
        console.log("number of nodes in hash", this._supertree_nodes_hash.length);


        // set up groups -> original groups
        this._groupsLabels = this._setUpTreeGroupsLabels(nodes_data.supertree);
        //////////////////////////////

        // set up forest
        this._forest = nodes_data.forest;

        // set up LGTs edges
        this._lgts = this._setUpLGTs(nodes_data.lgts);

    }

    _updateNodesData() {
        this._nodes_data.lgts.forEach(lgt=>{
            new_genes = new Set();
            lgt.genes.forEach(gene =>{
                new_genes.add()
            });
        });
    }

    _setUpGenesDict() {

    }

    // given a ROOT d... of a tree.. store the date in this tree
    _storeData(d) {
        if (d.data.name == "") {
            d.data.c = 0;
            d.data.genes = [];
        } else {
            try {
                var node = this._nodes_data.supertree[d.data.name];
                d.data.c = node.g;
                d.data.genes = new Set(node.genes);
            } catch (error) {
                console.log(d.data.name);
                return;
            }

        }
        if (d.children) d.children.forEach((d) => this._storeData(d));
    }

    _setUpTreeGroupsLabels(nodes) {
        var gs = new Set();
        for (let key in nodes) {
            gs.add(nodes[key].g);
        }
        return [...gs].sort();
    }

    get groupsLabels() {
        return this._groupsLabels;
    }

    get hierarchy() {
        return this._simple_hierarchy;
    }

    get lgts() {
        return this._lgts;
    }

    get forest() {
        return this._forest;
    }

    _setUpSupertreeD3Hierarchy() {
        return d3.hierarchy(this._simple_hierarchy, function (d) {
                return d.branchset;
            })
            .sum(function (d) {
                return d.branchset ? 0 : 1;
            })
            .sort(function (a, b) {
                return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
            });
    }

    get hierarchy() {
        return this._d3Hierarchy;
    }

    _setUpLGTs(l) {
        let lgts_nodes = [];
        let hash = this._supertree_nodes_hash;
        var non_tracked_edges = [];
        for (let e in l) {
            if (l[e].source in hash && l[e].target in hash) {
                l[e].source = hash[l[e].source];
                l[e].target = hash[l[e].target];
                l[e].lateralEdgeSprite = null;
                l[e].genes = new Set(l[e].genes);
                lgts_nodes.push(l[e]);                
            } else {
                non_tracked_edges.push(l[e]);
            }
        }
        console.log(">> What is going on with these edges?", non_tracked_edges);
        return lgts_nodes;
    }

    get lgts(){
        return this._lgts;
    }

    _setUpSupetreeNodesHash() {
        var nodes_hash = {};
        this.hierarchy.descendants().forEach(function (d) {
            nodes_hash[d.data.name] = d;
        });
        return nodes_hash;
    }

    get numerOfGenomes(){
        return this.hierarchy.leaves().length;
    }
}