// import Edge from 'Edge.js';
// import Node from 'Node.js';


class SuperGraph{
    // directed graph

    constructor() {
        this._hashNodes = {}; // {node1.id: node1, node1.id: node2}
        this._hashEdges = {}; // {edge.src+edge.trg: edge}

        this._nodes = []; // [node1, node2]
        this._edges = [];
        this._g = new jsnx.DiGraph();
    }

    get nNodes(){
        return this._nodes.length;
    }

    get nEdges(){
        return this._edges.length;
    }

    edge(i){
        return this._edges[i];
    }

    node(i){
        return this._nodes[i];
    }

    nodeByID(id){
        return this._hashNodes[id];
    }

    addNode(node_id, type) {
        if(node_id in this._hashNodes){
            this._hashNodes[node_id].incrementWeight();
            return this._hashNodes[node_id];
        }else{
            this._g.addNode(this._nodes.length);
            var node = new Node(this._nodes.length, node_id);           
            this._nodes.push(node);
            this._hashNodes[node_id] = node;            
        }
    }

    addEdge(src_index, trg_index, reference){
        var strID = src_index.toString() +'_'+ trg_index.toString();

        if(strID in this._hashEdges){
            this._hashEdges[strID].incrementWeight();
        }else{
            this._g.addEdge(src_index, trg_index);
            var edge = new Edge(this._edges.length, src_index, trg_index);

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