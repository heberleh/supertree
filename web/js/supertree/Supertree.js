class Supertree {

    constructor(data) {                
        this._data = data;
        console.log("Json for supertree: ", data)

        // set up supertree        
        this._simple_hierarchy = parseNewick(this._data.supertree.newick);
        //console.log("Simple supertree: ", this._simple_hierarchy);

        this._hierarchy = this._setUpSupertreeD3Hierarchy(this._simple_hierarchy);
        console.log("D3 supertree: ", this._hierarchy);
        
        // set up data in the supertree structure
        // set up preorder index - used for hash in next method
        this._storeData(this._hierarchy, this._data);
         
        // creates a hash of supertree nodes by pre-order index
        this._supertreeNodesHash = this._setUpSupertreeNodesHash();

        // set up groups
        // ! if implement sorting, must sort the attributes "groups_distributions"
        this._groupsLabels = this._data.groups_names;
        

        // set up forest, add some attributes for visualization
        this._forest = this._data.forest;
        //console.log("Forest", this._forest);
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

        // TODO if for each tree, the distribution of genomes on groups is not defined... compute it
        //this._setUpGenesGroupsDistribution();

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
    _storeData(node, data) {
        let leaf_names = [];        
        for (let i in node.leaves()){             
            leaf_names.push(node.leaves()[i].data.name);
        }
        leaf_names.sort();
        let node_id = leaf_names.join('__');

        let st_node_data = data.supertree.nodes[node_id];

        for (let key in st_node_data){
            if (key != "branchset"){
                node.data[key] = st_node_data[key];  
            }
        }
        node.data.genes = new Set(st_node_data.genes_intersect)

        if (node.children){
            for (let i in node.children){
                let child = node.children[i];
                //console.log("Preorder_d3: ", index);
                this._storeData(child, data);
            }
        }
       
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


    _setUpSupertreeD3Hierarchy(simple_hierarchy) {
        return d3.hierarchy(simple_hierarchy, function (d) {
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
     * @param {list} l list of original transfers/edges
     */
    _setUpLGTs(l) {
        console.log("Number of LGTs in Data.json...", l.length);
        let lgts_nodes = [];
        let hash = this._supertreeNodesHash;
        //console.log("Hashed ids: ", this._supertreeNodesHash);
        var non_tracked_edges = [];
        console.log("Hash of nodes...", this._supertreeNodesHash);
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
            nodes_hash[d.data.preorder_number] = d;
        });
        return nodes_hash;
    }

    get numberOfGenomes(){
        return this.hierarchy.leaves().length;
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
        return this._forest[gene_index].groups_distribution;
    }

    getSupertreeGroupsDistribution(){
        return this._data.supertree.groups_distribution;
    }

}