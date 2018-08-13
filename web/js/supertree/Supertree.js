class Supertree {

    constructor(data) {                
        this._data = data;

        // set up supertree        
        this._simple_hierarchy = parseNewick(this.data.supertree.newick);
        this._hierarchy = this._setUpSupertreeD3Hierarchy();
        
        // set up data in the supertree structure
        // set up preorder index - used for hash in next method
        this._storeData(this.hierarchy, this.data, 0);
         
        // creates a hash of supertree nodes by pre-order index
        this._supertreeNodesHash = this._setUpSupertreeNodesHash();

        // set up groups, sorting
        this._groupsLabels = this.data.groups_names.sort();

        // set up forest, add some attributes for visualization
        this._forest = this.data.forest;
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
        
        // finding min max number of genes in genomes
        let max_n_g = 0;
        let min_n_g = this._forest.length;
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
        this._lgts = this._setUpLGTs(this.data.transfers);        

        this._totalsInGroups = this._setUpTotalsInGroups();

        this._setUpGenesGroupsDistribution();

    }

    /**
     * Computes the number of leaves in each group/class.
     */
    _setUpTotalsInGroups(){
        let totalsInGroups = {};
        this.groupsLabels.forEach(label =>{
            totalsInGroups[label] = 0;
        });

        this.hierarchy.leaves().forEach(leaf =>{             
            totalsInGroups[leaf.data.group] += 1;
        });
        console.log("Number of genomes in each group: ", totalsInGroups)
        return totalsInGroups;
    }
    
    /**
     * Changes each node from the given tree (D3 hierarchy node), adding new attributes and setting up the related pre-order index. This index is used to configure the LGT/Transfers edges.
     * @param {D3 hierarchy node} node 
     * @param {Json data} data 
     * @param {The starting preorder index} index
     */
    _storeData(node, data, index) {

        let st_node_data = this.data.supertree.nodes[index];
        for (let key in st_node_data){
            node.data[key] = st_node_data[key];            
        }
        node.data.genes = new Set(st_node_data.genes_intersect)
        
        node.preorder_idx = index;

        // TODO if node has not attribute data.name -> create it joining its leaves' names

        index += 1;

        if (d.children){
            for (let i in d.children){
                let child = d.children[i];
                index = this._storeData(d, data, index);
            }
        }
        return index;
    }

    get groupsLabels() {
        return this._groupsLabels;
    }

    get hierarchy() {
        return this._hierarchy;
    }

    get forest() {
        return this._forest;
    }

    /**
     * Returns the list of edges that may represent LGTs. 
     * If edges are from RSPR software, they can be of two types:
     * rspr-moves or shared-genes between supertree nodes from different groups.
     */
    get lgts(){
        return this._lgts;
    }


    _setUpSupertreeD3Hierarchy() {
        return d3.hierarchy(this._simple_hierarchy, function (d) {
                return d.branchSet;
            })
            .sum(function (d) {
                return d.branchSet ? 0 : 1;
            })
            .sort(function (a, b) {
                return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
            });
    }

    /**
     * Create a new list of LGTs/Transfers edges given the original list of edges. This list create new attributes and change some attributes that before stored just indexes to now store the pointers to the objects. For instance, source was storing index 0, now it is storing supertree.node[0].
     * TODO Adapt this code to the new Json file from RSPR.
     * @param {list} l list of original transfers/edges
     */
    _setUpLGTs(l) {
        console.log("Number of LGTs in Data.json...", l.length);
        let lgts_nodes = [];
        let hash = this._supertreeNodesHash;
        console.log("Hashed ids: ", this._supertreeNodesHash);
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
        if (non_tracked_edges.length > 0){
            console.log(">> What is going on with these edges?", non_tracked_edges);
        }
        console.log("Number of LGTs stored in supertree as nodes...", lgts_nodes.length);
        return lgts_nodes;
    }

    _setUpSupertreeNodesHash() {
        var nodes_hash = {};
        this.hierarchy.descendants().forEach(function (d) {
            nodes_hash[d.preorder_idx] = d;
        });
        return nodes_hash;
    }

    get numberOfGenomes(){
        return this.hierarchy.leaves().length;
    }

    getGroupsDistribution(gene){
        return this._nodes_data.group_sp_distribution[gene];
    }

    get maxNGenes(){
        return this._max_number_of_genes_in_a_genome;
    }

    get minNGenes(){
        return this._min_number_of_genes_in_a_genome;
    }

    get totalsInGroups(){
        return this._totalsInGroups;
    }

    get maxNumberOfGenesInEdges(){
        // finding max number of genes in transfers
        // the set "genes" may represent different sets...
        // rspr edges has different genes than shared-genes edges.
        // TODO guarantee that the lgt.genes is set up according to some default choice or that it changes according to user interaction if this method is associated to any visualization attribute.
        
        let max_genes = 0;
        this._lgts.forEach(lgt =>{
            if (lgt.genes.size > max_genes){
                max_genes = lgt.genes.size;
            }
        });
        return max_genes;
    }

    /**
     * Returns the original Json data.
     */
    get data(){
        return this._data;
    }

    /**
     * Returns a supertree Node from D3 Hierarchy given its pre-order index.
     * @param preorder_idx integer
     */
    getNode(preorder_idx){
        this._supertreeNodesHash[preorder_idx];
    }

    getGroupName(index){
        return this._groupsLabels[index];
    }

    /**
     * Returns a vector containing 
     */
    getGeneGroupsDistribution(gene_index){
        return this.data.forest[gene_index].groups_distribution;
    }

}