// import Edge from 'Edge.js';
// import Node from 'Node.js';


class SuperGraph{
    // directed graph

    constructor(supertree) {
        this._hashNodes = {}; // {node1.id: node1, node1.id: node2}
        this._hashEdges = {}; // {edge.src+edge.trg: edge}
        this._g = new jsnx.DiGraph();
        this._createGraph(supertree);  
        this._supertree = supertree;
        this._leaves = this._supertree.referenceTree.leaves;
    }

    get nNodes(){
        return this._g.number_of_nodes();
    }

    get nEdges(){
        return this._g.number_of_edges();
    }

    nodeByID(id){
        return this._hashNodes[id];
    }

    addNode(node_id, reference, tree) {
        // add a node to the graph
        // if it exists, attach the tree (tree id) to it
        if(this._hashNodes[node_id] === undefined){            
            var node = new Node(this._g.numberOfNodes(), node_id);
            this._g.addNode(this._g.numberOfNodes());
            node.attachTree(tree);
            if(reference){
                node.reference = reference;
            } 
            this._hashNodes[node_id] = node;
        }else{
            this._hashNodes[node_id].attachTree(tree);
            if(reference){
                this._hashNodes[node_id].reference = reference;
            }            
        }
    }

    addEdge(edge, ref, tree){


        try {
            var src_index = this._hashNodes[edge[0]].index;
            var trg_index = this._hashNodes[edge[1]].index;
        }catch(error) {
            console.log(error);
            console.log(edge);        
            console.log("Source:");
            console.log(this._hashNodes[edge[0]]);
            console.log("Target:");
            console.log(this._hashNodes[edge[1]]);
        }

        var strID = src_index.toString() +'_'+ trg_index.toString();

        if(strID in this._hashEdges){
            this._hashEdges[strID].attachTree(tree);
            if(ref){
                this._hashEdges[strID].reference = ref;
            }
        }else{
            this._g.addEdge(src_index, trg_index);
            var edge = new Edge(this._g.numberOfEdges(), strID, src_index, trg_index);
            if(ref){
                edge.reference = ref;
            }
            edge.attachTree(tree);
            this._hashEdges[strID] = edge;
        }
    }

    _createGraph(supertree){
        var referenceTree = supertree.referenceTree;
        var trees = supertree.trees;

        //navigate through supertree adding remaining nodes/edges (are there?)
        var referenceNodes = referenceTree.nodes;
        for(let i = 0; i < referenceNodes.length; i++){
            this.addNode(referenceNodes[i],true,referenceTree);
        }
        
        var referenceEdges = referenceTree.edges;
        for(let i = 0; i < referenceEdges.length; i++){
            this.addEdge(referenceEdges[i],true,referenceTree);
        }

        for(let i = 0; i < trees.length; i++){
            console.log('tree'+i);
            var tNodes = trees[i].nodes;
            for(let j = 0; j < tNodes.length; j++){
                this.addNode(tNodes[j],true,trees[i]);
            }
            
            var tEdges = trees[i].edges;
            for(let j = 0; j < tEdges.length; j++){
                this.addEdge(tEdges[j],true,trees[i]);
            }
        }


        // mark nodes and edges from supergraph that are in the supertree as Reference=True
    }

    print(){
        console.log("Super-graph nodes:");
        console.log(this._hashNodes);
        console.log("Super-graph edges:");
        console.log(this._hashEdges);
        console.log("Leaves:");
        for(var i = 0; i < this._leaves.length; i++){
            console.log(this._hashNodes[this._leaves[i]]);
        }
    }


}