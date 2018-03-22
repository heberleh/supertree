// import Edge from 'Edge.js';
// import Node from 'Node.js';


class SuperGraph{
    // directed graph

    constructor() {
        this._hashNodes = {}; // {node1.id: node1, node1.id: node2}
        this._hashEdges = {}; // {edge.src+edge.trg: edge}
        this._g = new jsnx.DiGraph();
        this._nodeIndex = 0;
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

    addNode(node_id, type) {
        // add a node to the graph
        // if it exists, attach the tree (tree id) to it
        if(node_id in this._hashNodes){            
            this._hashNodes[node_id].addTree(tree);
            return this._hashNodes[node_id];
        }else{
            this._g.addNode(this._nodeIndex);
            var node = new Node(this._nodeIndex, node_id);
            node.attachTree(tree);            
            this._hashNodes[node_id] = node; 
            this._nodeIndex += 1;           
        }
    }

    addEdge(src_index, trg_index, tree){
        var strID = src_index.toString() +'_'+ trg_index.toString();

        if(strID in this._hashEdges){
            this._hashEdges[strID].attachTree(tree);
        }else{
            this._g.addEdge(src_index, trg_index);
            var edge = new Edge(this._edges.length, src_index, trg_index);
        }
        if(this._hashEdges[strID]){

        }
    }

    attachTree(tree){
        // navigate throgh it and add the nodes and edges to this supergraph

    }

    attachSupertree(supertree){
        //navigate through supertree adding remaining nodes/edges (are there?)
        // mark nodes and edges from supergraph that are in the supertree as Reference=True
    }


}