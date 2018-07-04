class Supertree {

    constructor(supertree_newick, nodes_data, lgts_key) {
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


        // set up groups -> original groups
        this._groupsLabels = this._setUpTreeGroupsLabels(nodes_data.supertree);
        //////////////////////////////

        // set up forest
        this._forest = nodes_data.forest;
        console.log("Forest", this._forest);
        for(let i in this._forest){
            let gene = this._forest[i];
            if (typeof(gene.attributes) == 'undefined'){
                gene.attributes = {};
            }
            if (typeof(gene.filtered) == 'undefined'){
                gene.filtered = true;
            }
            if (typeof(gene.filtered_by_search) == 'undefined'){
                gene.filtered_by_search = true;
            }
        }
        
        let max_n_g = 0;
        let min_n_g = Object.values(this._forest).length;
        
        this.hierarchy.leaves().forEach(leaf =>{             
            if(max_n_g < leaf.data.genes.size){
                max_n_g = leaf.data.genes.size;
            }
            if(min_n_g > leaf.data.genes.size){
                min_n_g = leaf.data.genes.size;
            }        
        });
        this._max_number_of_genes_in_a_genome = max_n_g;
        this._min_number_of_genes_in_a_genome = min_n_g;

        // set up LGTs edges
        console.log("DEBUG", nodes_data[lgts_key]);
        this._lgts = this._setUpLGTs(nodes_data[lgts_key]);


        let max_genes = 0;
        this._lgts.forEach(lgt =>{
            if (lgt.genes.size > max_genes){
                max_genes = lgt.genes.size;
            }
        });      
        console.log("Max number of genes in edges", max_genes);
        this._max_number_of_genes_in_edges = max_genes;

        this._totals_in_groups = this._setUpTotalsInGroups();

    }

    _setUpTotalsInGroups(){
        let totals_in_groups = {};
        this.groupsLabels.forEach(label =>{
            totals_in_groups[label] = 0;
        });

        this.hierarchy.leaves().forEach(leaf =>{             
            totals_in_groups[leaf.data.c] += 1;
        });
        console.log("Number of genomes in each group: ", totals_in_groups)
        return totals_in_groups;
    }

    _updateNodesData() {
        
        // this._nodes_data.lgts.forEach(lgt=>{

        //     new_genes = new Set();
        //     lgt.genes.forEach(gene =>{
        //         new_genes.add()
        //     });
        // });      
    }

    _setUpGenesDict() {

    }

    // given a ROOT d... of a tree.. store the date in this tree
    _storeData(d) {
        //console.log(Object.keys(this._nodes_data.supertree));
        if (d.data.name == "") {
            d.data.c = '-';
            d.data.genes = [];
        } else {
            try {
                var node = this._nodes_data.supertree[d.data.name];
                d.data.c = node.g;
                d.data.genes = new Set(node.genes);                
            } catch (error) {
                console.log(error);
                console.log("ERROR");
                console.log(d.data.name);
                d.data.c = node.g;
                d.data.genes = new Set();

                return;
            }

        }
        if (d.children) d.children.forEach((d) => this._storeData(d));
    }

    _setUpTreeGroupsLabels(nodes) {
        var gs = new Set();
        var gs_list = [];
        for (let key in nodes) {
            if (!gs.has(nodes[key].g)){
                gs.add(nodes[key].g);
                gs_list.push(nodes[key].g);
            }
        }

        return gs_list.sort();
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
                l[e].genes_array = l[e].genes;
                l[e].genes = new Set(l[e].genes);
                l[e].supertree = this;
                l[e].filtered = true;
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

    getGroupsDistribution(gene){
        return this._nodes_data.group_sp_distribution[gene];
    }

    get maxNgenes(){
        return this._max_number_of_genes_in_a_genome;
    }

    get minNgenes(){
        return this._min_number_of_genes_in_a_genome;
    }

    get totals_in_groups(){
        return this._totals_in_groups;
    }

    get max_number_of_genes_in_edges(){
        return this._max_number_of_genes_in_edges;
    }
}