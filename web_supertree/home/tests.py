import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
from django.contrib.auth.models import User
from django.test import TestCase
from ete3 import Tree
from networkx.drawing.nx_agraph import graphviz_layout
from scipy.sparse import csr_matrix

from home.test_data import TestData

from .models import SupertreeModel

# from skbio import DistanceMatrix
# from skbio.tree import nj



class SupertreeAppTest(TestCase):
    databaseTest = False


    def testRFDistanceTrees2(self):
        t1 = Tree("((((1,2),(3,4)),((5,6),(7,8))),(((9,10),(11,12)),((13,14),(15,16))));")
        t2 = Tree("(((7,8),((1,(2,(14,5))),(3,4))),(((11,(6,12)),10),((13,(15,16)),9)));")
        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = t2.robinson_foulds(t1)
        print(t1, t2)
        print("RF distance is %s over a total of %s" %(rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:", parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:", parts_t2 - parts_t1)
        print("Partitions in tree1:", parts_t1)
        print("Partitions in tree2:", parts_t2)



    def setUp(self):

        if self.databaseTest:
            self.user = User.objects.create_user(
                username='testuser', password='12345abcdeku249s')
            self.supertree_model = SupertreeModel.objects.create(
                reference_newick=TestData.supertree_newick(),
                forest_newicks=TestData.forest_newicks(),
                user=self.user
            )
            self.format = 9
            self.supertree = Tree(
                newick=SupertreeModel.objects.first().reference_newick,
                format=self.format
            )
            self.forest = []
            for tree_nw in self.supertree_model.forest_newicks.split(';'):
                self.forest.append(
                    Tree(newick=tree_nw+';', format=self.format))
        else:
            reference_newick = TestData.supertree_newick()
            forest_newicks = TestData.forest_newicks()
            self.format = 9
            self.supertree = Tree(
                newick=reference_newick,
                format=self.format
            )
            self.forest = []
            for tree_nw in forest_newicks.split(';'):
                self.forest.append(
                    Tree(newick=tree_nw+';', format=self.format))

    def testPrinting(self):
        print(self.supertree)
        for i in range(5):
            print(self.forest[i])

    def testShowingGUI(self):
        self.supertree.show()

    def testRFDistanceSimple(self):
        t1 = Tree('(((a,b),c,k), ((e, f), g));')
        t2 = Tree('(((a,c),b,k), ((e, f), g));')        
        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = t1.robinson_foulds(t2)
        print(t1, t2)
        print("RF distance is %s over a total of %s" %(rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:", parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:", parts_t2 - parts_t1)
        print("Partitions in tree2 that were not found in tree2:", parts_t1)
        print("Partitions in tree2 that were not found in tree2:", parts_t2)
        
        # We can also compare trees sharing only part of their labels

        t1 = Tree('(((a,b),c), ((e, f), g));')
        t2 = Tree('(((a,c),b), (g, H));')
        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2= t1.robinson_foulds(t2)

        print(t1, t2)
        print("Same distance holds even for partially overlapping trees")
        print("RF distance is %s over a total of %s" %(rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:", parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:", parts_t2 - parts_t1)

    def testRFDistance(self):
        tree1 = self.supertree
        tree2 = self.forest[2]

        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = tree1.robinson_foulds(tree2)

        print(discarded_edges_t2)
        dif = parts_t2 - parts_t1
        print("Partitions in tree2 that were not found in tree1:")
        print("\n\n\n")
        for bag in dif:
            print(bag)
            for node in tree2.get_monophyletic(values=bag, target_attr='name'):
                print(node.get_ascii(attributes=["name"], show_internal=False))

        print(tree2)
        tree1.show()

    def testRFDistanceMatrix(self):
        size = 10  # len(self.forest)
        row = []
        col = []
        data = []
        for i in range(size):
            for j in range(i, size):
                rf = self.forest[i].robinson_foulds(self.forest[j])[0]
                if not rf == 0:
                    row.append(i)
                    col.append(j)
                    data.append(rf)

        print("creating matrix")
        matrix = csr_matrix(
            (np.array(data), (np.array(row), np.array(col))), shape=(size, size))
        x, y = matrix.nonzero()
        print(x)
        print(y)
        for i in x:
            for j in y:
                print(matrix[i, j])

    def testRFDistanceVector(self):
        index = []
        distances = []
        max_distances = []
        for i in range(len(self.forest)):
            data = self.forest[i].robinson_foulds(self.supertree)
            rf = data[0]
            max_rf = data[1]
            if not rf == 0:
                index.append(i)
                distances.append(rf)
                max_distances.append(max_rf)

        print(np.array(distances)/np.array(max_distances))

    def testForest2ReferenceDistancesHistogram(self):
        return None

    def testSimpleTrees(self):
        t1 = Tree('(((a,b),c), ((e, f), g));')
        t2 = Tree('(((a,c),b), ((e, f), g));')

        print(t1.robinson_foulds(t2))

        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = t1.robinson_foulds(
            t2)

        print(t1, t2)
        print("RF distance is %s over a total of %s" % (rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:",
              parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:",
              parts_t2 - parts_t1)

        # We can also compare trees sharing only part of their labels

        t1 = Tree('(((a,b),c), ((e, f), g));')
        t2 = Tree('(((a,c),b), (g, H));')

        # rf, rf_max, common_attrs, names, edges_t1, edges_t2, discarded_edges_t1, discarded_edges_t2
        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = t1.robinson_foulds(
            t2)

        print(t1, t2)
        print("Same distance holds even for partially overlapping trees")
        print("RF distance is %s over a total of %s" % (rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:",
              parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:",
              parts_t2 - parts_t1)

    def testSetGraph(self):
        g = nx.DiGraph()
        vertex_hash = {}
        i = 0

        for tree in self.forest[1:10000]:
            for node in tree.traverse("preorder"):
                if not node.is_root():
                    if node.is_leaf():
                        trg = node.name
                    else:
                        names = node.get_leaf_names()
                        names.sort()
                        trg = ','.join(names)

                    names = node.up.get_leaf_names()
                    names.sort()
                    src = ','.join(names)

                    src_idx, trg_idx = 0, 0
                    if not trg in vertex_hash:
                        vertex_hash[trg] = i
                        g.add_node(i, n=trg)
                        trg_idx = i
                        i += 1
                    else:
                        trg_idx = vertex_hash[trg]

                    if not src in vertex_hash:
                        vertex_hash[src] = i
                        g.add_node(i, n=src)
                        src_idx = i
                        i += 1
                    else:
                        src_idx = vertex_hash[src]
                    
                    if g.has_edge(src_idx,trg_idx):
                        g[src_idx][trg_idx]['w']  += 1
                        # g[src_idx][trg_idx]['trees'].append()
                    else:                        
                        g.add_edge(src_idx,trg_idx,w=1)

    
        g2 = nx.DiGraph()
        for node in self.supertree.traverse("preorder"):
            if not node.is_root():
                type = "internal"
                if node.is_leaf():                    
                    trg = node.name
                    type = "leaf"
                else:                    
                    names = node.get_leaf_names()
                    names.sort()
                    trg = ','.join(names)

                names = node.up.get_leaf_names()
                names.sort()
                src = ','.join(names)

                src_idx, trg_idx = 0, 0
                if not trg in vertex_hash:
                    trg_idx = i
                    vertex_hash[trg] = trg_idx
                    g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                    i += 1                    
                else:
                    trg_idx = vertex_hash[trg]
                    if not g2.has_node(trg_idx):
                        g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                
                if not src in vertex_hash:
                    src_idx = i
                    vertex_hash[src] = src_idx                    
                    g2.add_node(src_idx, n=src, type=type, tree=node.up)                    
                    i += 1
                else:
                    src_idx = vertex_hash[src]
                    if not g2.has_node(src_idx):
                        g2.add_node(src_idx, n=src, type=type, tree=node.up)
                
                if g2.has_edge(src_idx,trg_idx):
                    g2[src_idx][trg_idx]['w']  += 1
                else:                        
                    g2.add_edge(src_idx,trg_idx,w=1)
     
        max_w = 0
        second_max = 0
        w = []

        edges_filtered = []
        # print("Number of edges in Supertree",len(g2.edges))
        # for edges in supertree
        # for e in g2.edges():
        #     src = e[0]
        #     trg = e[1]
        #     # if the smaller trees has this edge
        #     if g.has_edge(src,trg):            
        #         #get the number of times it appears in the smaller trees
        #         ew = g[src][trg]['w']
        #         print(g[src][trg])
        #         # w.append(ew)
        #         if ew > 100:
        #             edges_filtered.append([src,trg])

        w = []
        # get edges that are not in the supertree
        filtered_edges = []
        for e in g.edges():
            if not g2.has_edge(e[0], e[1]):
                src = e[0]
                trg = e[1]
                # if the smaller trees has this edge                
                weight = g[src][trg]['w']

                if g2.has_node(src) and g2.has_node(trg):                    
                    # if lateral
                    # if g2.node[trg]['tree'] not in g2.node[src]['tree']:                       
                    #     filtered_edges.append([src,trg])
                    #     w.append(weight)                        

                    if g2.node[src]['tree'].get_distance(g2.nodes[trg]['tree'],topology_only=True) > 2:                            
                        filtered_edges.append([src,trg])
                        w.append(weight)
                        print("=== Number of genes related to this edge: ",weight)
                        # print(g2.node[src]["tree"])
                        # print(g2.node[trg]["tree"])
                        # print("----------------------------")
            
        print("Number of confliction edges:", len(filtered_edges))

        # plt.hist(w)
        # plt.title("Weights Histogram")
        # plt.xlabel("Value")
        # plt.ylabel("Frequency")
        # plt.show()
        
        g3 = nx.DiGraph()
        g3.add_nodes_from(g2)
        types = nx.get_node_attributes(g2,'type')
        for node in g3.nodes:
            g3.node[node]['type'] = types[node]

        for e in g2.edges:
            g3.add_edge(e[0], e[1], type="reference")
        for e in filtered_edges:            
            g3.add_edge(e[0], e[1], type="conflict")

        for node in g3.nodes:           
            if not g2.has_node(node):               
                g3.node[node]['type'] = 'internal_conflict'            

        # nx.draw_spring(g3)
        # plt.show()

        nx.write_gml(g3, "test.gml")

        labels = {}
        for (i,data) in g2.nodes(data=True):
            if data['type'] == 'leaf':
                labels[i]=data['n'].split('_')[0]
            
        pos=graphviz_layout(g2,prog='twopi',args='')
        plt.figure(figsize=(8,8))
        print(pos)        
        nx.draw(g2,pos,node_size=20,alpha=0.5,node_color="blue", with_labels=False)
        nx.draw_networkx_edges(g2, pos=pos, edgelist=filtered_edges, edge_color="red", style="dashed", alpha=0.4)

        nx.draw_networkx_labels(g2,pos,labels,font_size=8, alpha=0.7)
        plt.axis('equal')
        plt.savefig('circular_tree.png')
        plt.show()

        


        # for e in g.edges(data=True):
        #     if e[2]['w'] >= second_max:
        #         print(e)

    # def testPeptidesTrees(self):                
    #     dm = DistanceMatrix(data, ids)
    #     newick = nj(dm, result_constructor=str)
    #     pass

    def get_name(self,tree):
        names = tree.get_leaf_names()
        names.sort()
        return ','.join(names)

    def testSetGraphLGT(self):
        g = nx.DiGraph()
        vertex_hash = {}
        i = 0

        for node in self.supertree.traverse("preorder"):
            if not node.is_root():
                names_set = None
                if node.is_leaf():
                    trg = node.name
                    trg_names_set = set([node.name])
                else:
                    names = node.get_leaf_names()
                    trg_names_set = set(names)
                    names.sort()
                    trg = ','.join(names)

                names = node.up.get_leaf_names()
                src_names_set = set(names)
                names.sort()
                src = ','.join(names) 
                if not trg in vertex_hash:
                    vertex_hash[trg] = i
                    g.add_node(i, n=trg, set=trg_names_set, genes=set())
                    i += 1
                
                if not src in vertex_hash:
                    vertex_hash[src] = i
                    g.add_node(i, n=src, set=src_names_set, genes=set())
                    i += 1
            else:
                root_name = self.get_name(node)
                vertex_hash[root_name] = i
                names = node.get_leaf_names()
                names_set = set(names)
                g.add_node(i, n=root_name, set=names_set, genes=set())               
                i += 1


        number_of_trees = len(self.forest)
        # number_of_trees = 10000
        for tree_index in range(number_of_trees):
            tree = self.forest[tree_index]            
            for node in tree.traverse("preorder"):
                if not node.is_root():
                    names_set = None
                    if node.is_leaf():
                        trg = node.name
                        trg_names_set = set([node.name])
                    else:
                        names = node.get_leaf_names()
                        trg_names_set = set(names)
                        names.sort()
                        trg = ','.join(names)

                    names = node.up.get_leaf_names()
                    src_names_set = set(names)
                    names.sort()
                    src = ','.join(names)

                    src_idx, trg_idx = 0, 0
                    if not trg in vertex_hash:
                        trg_idx = i
                        vertex_hash[trg] = trg_idx
                        g.add_node(trg_idx, n=trg, set=trg_names_set, genes=set([tree_index]))           
                        i += 1
                    else:
                        trg_idx = vertex_hash[trg]
                        g.node[trg_idx]['genes'].add(tree_index)
                    
                    if not src in vertex_hash:
                        src_idx = i
                        vertex_hash[src] = src_idx
                        g.add_node(src_idx, n=src, set=src_names_set, genes=set([tree_index]))          
                        i += 1
                    else:
                        src_idx = vertex_hash[src]
                        g.node[src_idx]['genes'].add(tree_index)

                    
                    if g.has_edge(src_idx,trg_idx):
                        g[src_idx][trg_idx]['w']  += 1
                        g[src_idx][trg_idx]['genes'].add(tree_index)
                        # g[src_idx][trg_idx]['trees'].append()
                    else:                        
                        g.add_edge(src_idx,trg_idx,w=1,genes=set([tree_index]))

    
        g2 = nx.DiGraph()
        for node in self.supertree.traverse("preorder"):
            if not node.is_root():
                type = "internal"
                if node.is_leaf():                    
                    trg = node.name
                    type = "leaf"
                else:                    
                    names = node.get_leaf_names()
                    names.sort()
                    trg = ','.join(names)

                names = node.up.get_leaf_names()
                names.sort()
                src = ','.join(names)

                src_idx, trg_idx = 0, 0
                if not trg in vertex_hash:
                    trg_idx = i
                    vertex_hash[trg] = trg_idx
                    g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                    i += 1                    
                else:
                    trg_idx = vertex_hash[trg]
                    if not g2.has_node(trg_idx):
                        g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                
                if not src in vertex_hash:
                    src_idx = i
                    vertex_hash[src] = src_idx                    
                    g2.add_node(src_idx, n=src, type=type, tree=node.up)                    
                    i += 1
                else:
                    src_idx = vertex_hash[src]
                    if not g2.has_node(src_idx):
                        g2.add_node(src_idx, n=src, type=type, tree=node.up)
                
                if g2.has_edge(src_idx,trg_idx):
                    g2[src_idx][trg_idx]['w']  += 1
                else:                        
                    g2.add_edge(src_idx,trg_idx,w=1)
            else:
                names = node.get_leaf_names()
                names.sort()
                root = ','.join(names)
                print("Root name", root)
                root_idx = i
                vertex_hash[root] = root_idx                    
                g2.add_node(root_idx, n=root, type='internal', tree=node)                    
                i += 1
                
            
        # print(g2.nodes(data=True))
        
        # get edges that are not in the supertree
        filtered_edges = []
        
        dist_min = 10
        dist_max = 30
        weight_min = 1
        weight_max = 1
        distances = []
        weights = []
        for e in g.edges():
            src = e[0]
            trg = e[1]
            weight = g[src][trg]['w']
            if weight >= weight_min and weight <= weight_max and not g2.has_edge(src,trg):
                if g2.has_node(trg):
                    tree_trg = g2.node[trg]['tree']
                    if not tree_trg.is_leaf():                                            
                        src_set = g.node[src]['set']
                        trg_set = g.node[trg]['set']

                        dif_set = src_set - trg_set     

                        if len(dif_set)>0:
                            l_names = list(dif_set)
                            
                            new_name = None
                            if len(l_names) > 1:
                                l_names.sort()
                                new_name = ','.join(l_names)
                            else:
                                new_name = l_names[0]
                                                                                
                            if new_name in vertex_hash:
                                new_src = vertex_hash[new_name]
                                if g2.has_node(new_src):  
                                    d = tree_trg.get_distance(g2.node[new_src]['tree'],topology_only=True)                                    
                                    if d >= dist_min and d <= dist_max:
                                        ancestor = tree_trg.get_common_ancestor(g2.node[new_src]['tree'])                                        
                                        ancestor_name = self.get_name(ancestor)
                                        if not ancestor.is_root():
                                            edge_genes = g[src][trg]['genes']
                                            ancestor_inter = edge_genes.intersection(g.nodes[vertex_hash[ancestor_name]]['genes'])
                                            if len(ancestor_inter) > 0:
                                                print("ancestor inter edge",ancestor_inter)
                                            else:
                                                filtered_edges.append([trg,new_src])
                                                distances.append(d)
                                                weights.append(weight)
                                                # print("--------- GENES ----------")                                                
                                                # print("trg inter edge",edge_genes.intersection(g.nodes[new_src]['genes']))
                                                # print("src inter edge",edge_genes.intersection(g.nodes[trg]['genes']))
                                                # print("src genes: ", len(g.nodes[trg]['genes']))
                                                # print("trg genes: ", len(g.nodes[new_src]['genes']))
                                                # print("src inter trg", len(g.nodes[new_src]['genes'].intersection(g.nodes[trg]['genes'])))                                       
                            else:
                                continue
                                ancestor = self.supertree.get_common_ancestor(l_names)
                                ancestor_name = self.get_name(ancestor)
                                if ancestor_name in vertex_hash:            
                                    d = tree_trg.get_distance(ancestor,topology_only=True)
                                    if d >= dist_min and d <= dist_max:
                                        filtered_edges.append([trg,vertex_hash[ancestor_name]])
                                        distances.append(d)
                                        weights.append(weight)
                                else:
                                    print("Error - ancestor name is not indexed: ", ancestor_name)                                             
                
        print("Number of confliction edges:", len(filtered_edges))

        plt.hist(distances)
        plt.title("Dists Histogram")
        plt.xlabel("Value")
        plt.ylabel("Frequency")
        plt.show()
        plt.hist(weights)
        plt.title("Weights Histogram")
        plt.xlabel("Value")
        plt.ylabel("Frequency")
        plt.show()
        
        g3 = nx.DiGraph()
        g3.add_nodes_from(g2)
        types = nx.get_node_attributes(g2,'type')
        for node in g3.nodes:
            g3.node[node]['type'] = types[node]

        for e in g2.edges:
            g3.add_edge(e[0], e[1], type="reference")
        for e in filtered_edges:            
            g3.add_edge(e[0], e[1], type="conflict")

        for node in g3.nodes:           
            if not g2.has_node(node):               
                g3.node[node]['type'] = 'internal_conflict'            

        # nx.draw_spring(g3)
        # plt.show()

        nx.write_gml(g3, "test.gml")

        labels = {}
        for (i,data) in g2.nodes(data=True):
            if data['type'] == 'leaf':
                labels[i]=data['n'].split('_')[0]
            
        pos=graphviz_layout(g2,prog='twopi',args='')
        plt.figure(figsize=(8,8))             
        nx.draw(g2,pos,node_size=20,alpha=0.5,node_color="blue", with_labels=False)
        nx.draw_networkx_edges(g2, pos=pos, edgelist=filtered_edges, edge_color="red", style="dashed", alpha=0.07)

        nx.draw_networkx_labels(g2,pos,labels,font_size=8, alpha=0.7)
        plt.axis('equal')
        plt.savefig('circular_tree.png')
        plt.show()


    def cluster_tree(self, tree, level_cut_off):
        # create node attribute class=cluster based on level of tree



    def testSetGraphLGT2(self):
        g = nx.DiGraph()
        vertex_hash = {}
        i = 0

        # cluster super tree

        # identify genes of each leaf of the supertree
        # while creating a hash group-genes:
            # for each leaf of each gene: 
                # tree.hash[supertree[leaf].group].add(leaf)
            # if len(tree.hash.keys()) > 1:
                # has LGT = true
            # increment LGT for each pair of idenfitied groups
        

        # 
        
        super_tree_root = self.supertree.get_root()
        for node in self.supertree.traverse("preorder"):
                    
            if not node.is_root():
                names_set = None
                if node.is_leaf():
                    trg = node.name
                    trg_names_set = set([node.name])
                else:
                    names = node.get_leaf_names()
                    trg_names_set = set(names)
                    names.sort()
                    trg = ','.join(names)

                names = node.up.get_leaf_names()
                src_names_set = set(names)
                names.sort()
                src = ','.join(names) 
                if not trg in vertex_hash:
                    vertex_hash[trg] = i
                    g.add_node(i, n=trg, set=trg_names_set, genes=set())
                    i += 1
                
                if not src in vertex_hash:
                    vertex_hash[src] = i
                    g.add_node(i, n=src, set=src_names_set, genes=set())
                    i += 1
            else:
                root_name = self.get_name(node)
                vertex_hash[root_name] = i
                names = node.get_leaf_names()
                names_set = set(names)
                g.add_node(i, n=root_name, set=names_set, genes=set())               
                i += 1


        number_of_trees = len(self.forest)
        number_of_trees = 10000
        for tree_index in range(number_of_trees):
            tree = self.forest[tree_index]
            for node in tree.traverse("preorder"):
                if not node.is_root():
                    names_set = None
                    if node.is_leaf():
                        trg = node.name
                        trg_names_set = set([node.name])
                    else:
                        names = node.get_leaf_names()
                        trg_names_set = set(names)
                        names.sort()
                        trg = ','.join(names)

                    names = node.up.get_leaf_names()
                    src_names_set = set(names)
                    names.sort()
                    src = ','.join(names)

                    src_idx, trg_idx = 0, 0
                    if not trg in vertex_hash:
                        trg_idx = i
                        vertex_hash[trg] = trg_idx
                        g.add_node(trg_idx, n=trg, set=trg_names_set, genes=set([tree_index]))           
                        i += 1
                    else:
                        trg_idx = vertex_hash[trg]
                        g.node[trg_idx]['genes'].add(tree_index)
                    
                    if not src in vertex_hash:
                        src_idx = i
                        vertex_hash[src] = src_idx
                        g.add_node(src_idx, n=src, set=src_names_set, genes=set([tree_index]))          
                        i += 1
                    else:
                        src_idx = vertex_hash[src]
                        g.node[src_idx]['genes'].add(tree_index)

                    
                    if g.has_edge(src_idx,trg_idx):
                        g[src_idx][trg_idx]['w']  += 1
                        g[src_idx][trg_idx]['genes'].add(tree_index)
                        # g[src_idx][trg_idx]['trees'].append()
                    else:                        
                        g.add_edge(src_idx,trg_idx,w=1,genes=set([tree_index]))

    
        g2 = nx.DiGraph()
        for node in self.supertree.traverse("preorder"):
            if not node.is_root():
                type = "internal"
                if node.is_leaf():                    
                    trg = node.name
                    type = "leaf"
                else:                    
                    names = node.get_leaf_names()
                    names.sort()
                    trg = ','.join(names)

                names = node.up.get_leaf_names()
                names.sort()
                src = ','.join(names)

                src_idx, trg_idx = 0, 0
                if not trg in vertex_hash:
                    trg_idx = i
                    vertex_hash[trg] = trg_idx
                    g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                    i += 1                    
                else:
                    trg_idx = vertex_hash[trg]
                    if not g2.has_node(trg_idx):
                        g2.add_node(trg_idx, n=trg, type=type, tree=node)                    
                
                if not src in vertex_hash:
                    src_idx = i
                    vertex_hash[src] = src_idx                    
                    g2.add_node(src_idx, n=src, type=type, tree=node.up)                    
                    i += 1
                else:
                    src_idx = vertex_hash[src]
                    if not g2.has_node(src_idx):
                        g2.add_node(src_idx, n=src, type=type, tree=node.up)
                
                if g2.has_edge(src_idx,trg_idx):
                    g2[src_idx][trg_idx]['w']  += 1
                else:                        
                    g2.add_edge(src_idx,trg_idx,w=1)
            else:
                names = node.get_leaf_names()
                names.sort()
                root = ','.join(names)
                print("Root name", root)
                root_idx = i
                vertex_hash[root] = root_idx                    
                g2.add_node(root_idx, n=root, type='internal', tree=node)                    
                i += 1
                
            
        # print(g2.nodes(data=True))
        
        # get edges that are not in the supertree
        filtered_edges = []
        
        dist_min = 10
        dist_max = 30
        weight_min = 1
        weight_max = 1
        distances = []
        weights = []
        for e in g.edges():
            src = e[0]
            trg = e[1]
            weight = g[src][trg]['w']
            if weight >= weight_min and weight <= weight_max and not g2.has_edge(src,trg):
                if g2.has_node(trg):
                    tree_trg = g2.node[trg]['tree']
                    if not tree_trg.is_leaf():                                            
                        src_set = g.node[src]['set']
                        trg_set = g.node[trg]['set']

                        dif_set = src_set - trg_set     

                        if len(dif_set)>0:
                            l_names = list(dif_set)
                            
                            new_name = None
                            if len(l_names) > 1:
                                l_names.sort()
                                new_name = ','.join(l_names)
                            else:
                                new_name = l_names[0]
                                                                                
                            if new_name in vertex_hash:
                                new_src = vertex_hash[new_name]
                                if g2.has_node(new_src):  
                                    d = tree_trg.get_distance(g2.node[new_src]['tree'],topology_only=True)                                    
                                    if d >= dist_min and d <= dist_max:
                                        ancestor = tree_trg.get_common_ancestor(g2.node[new_src]['tree'])                                        
                                        ancestor_name = self.get_name(ancestor)
                                        if not ancestor.is_root():
                                            edge_genes = g[src][trg]['genes']
                                            ancestor_inter = edge_genes.intersection(g.nodes[vertex_hash[ancestor_name]]['genes'])
                                            if len(ancestor_inter) > 0:
                                                print("ancestor inter edge",ancestor_inter)
                                            else:
                                                filtered_edges.append([trg,new_src])
                                                distances.append(d)
                                                weights.append(weight)
                                                # print("--------- GENES ----------")                                                
                                                # print("trg inter edge",edge_genes.intersection(g.nodes[new_src]['genes']))
                                                # print("src inter edge",edge_genes.intersection(g.nodes[trg]['genes']))
                                                # print("src genes: ", len(g.nodes[trg]['genes']))
                                                # print("trg genes: ", len(g.nodes[new_src]['genes']))
                                                # print("src inter trg", len(g.nodes[new_src]['genes'].intersection(g.nodes[trg]['genes'])))                                       
                            else:
                                continue
                                ancestor = self.supertree.get_common_ancestor(l_names)
                                ancestor_name = self.get_name(ancestor)
                                if ancestor_name in vertex_hash:            
                                    d = tree_trg.get_distance(ancestor,topology_only=True)
                                    if d >= dist_min and d <= dist_max:
                                        filtered_edges.append([trg,vertex_hash[ancestor_name]])
                                        distances.append(d)
                                        weights.append(weight)
                                else:
                                    print("Error - ancestor name is not indexed: ", ancestor_name)                                             
                
        print("Number of confliction edges:", len(filtered_edges))

        plt.hist(distances)
        plt.title("Dists Histogram")
        plt.xlabel("Value")
        plt.ylabel("Frequency")
        plt.show()
        plt.hist(weights)
        plt.title("Weights Histogram")
        plt.xlabel("Value")
        plt.ylabel("Frequency")
        plt.show()
        
        g3 = nx.DiGraph()
        g3.add_nodes_from(g2)
        types = nx.get_node_attributes(g2,'type')
        for node in g3.nodes:
            g3.node[node]['type'] = types[node]

        for e in g2.edges:
            g3.add_edge(e[0], e[1], type="reference")
        for e in filtered_edges:            
            g3.add_edge(e[0], e[1], type="conflict")

        for node in g3.nodes:           
            if not g2.has_node(node):               
                g3.node[node]['type'] = 'internal_conflict'            

        # nx.draw_spring(g3)
        # plt.show()

        nx.write_gml(g3, "test.gml")

        labels = {}
        for (i,data) in g2.nodes(data=True):
            if data['type'] == 'leaf':
                labels[i]=data['n'].split('_')[0]
            
        pos=graphviz_layout(g2,prog='twopi',args='')
        plt.figure(figsize=(8,8))             
        nx.draw(g2,pos,node_size=20,alpha=0.5,node_color="blue", with_labels=False)
        nx.draw_networkx_edges(g2, pos=pos, edgelist=filtered_edges, edge_color="red", style="dashed", alpha=0.07)

        nx.draw_networkx_labels(g2,pos,labels,font_size=8, alpha=0.7)
        plt.axis('equal')
        plt.savefig('circular_tree.png')
        plt.show()