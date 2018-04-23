import matplotlib.pyplot as plt
import matplotlib
import networkx as nx
import numpy as np
from django.contrib.auth.models import User
from django.test import TestCase
from ete3 import Tree, TreeStyle, NodeStyle
from networkx.drawing.nx_agraph import graphviz_layout
from scipy.sparse import csr_matrix
import itertools
import json

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
            for tree_nw in sorted(forest_newicks.split(';'), key=len, reverse=True):
                self.forest.append(
                    Tree(newick=tree_nw+';', format=self.format))
        self.forest = sorted(self.forest, key=len, reverse=True)


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

    def cluster_tree(self, tree, cut_off):
        g = 0
        s = -1
        for node in tree.traverse("preorder"):
            node.add_features(g=g)        
        g += 1

        def cluster_root(node):
            if node.dist > 0 and node.dist < cut_off:
                return True
            else:
                if len(node) == 1:
                    return True
                else:
                    return False

        for root in tree.iter_leaves(is_leaf_fn=cluster_root):
            if len(root) == 1:
                cluster = s
                s -= 1
            else:
                cluster = g
                g += 1

            for node in root.traverse("postorder"):
                    node.g = cluster
        
        print("Number of groups: ", g)
        print("Number of singles; ", s)
        return (s,g)
        
    def jaccard(self, s1, s2):
        n = len(s1.intersection(s2))
        return n / float(len(s1) + len(s2) - n)


    def testSetGraphLGTClustering(self):
        # parameters
        number_of_trees = len(self.forest)
        number_of_trees = 2000             
        
        vertex_hash = {}
        i = 0

        # self.forest.sort(key=lambda x: len(x.get_leaf_names()), reverse=True)
        # setup genes attribue in the supertree
        for node in self.supertree.traverse("preorder"):
            node.add_features(inter_genes = set(), union_genes=set(), name=self.get_name(node))
        
        # store gene set
        for tree_index in range(number_of_trees):
            for name in self.forest[tree_index].get_leaf_names():
                for leaf in self.supertree.get_leaves_by_name(name):
                    leaf.union_genes.add(tree_index)            
        
        # for leaf in self.supertree:
        #     leaf.union_genes = leaf.inter_genes
        for node in self.supertree.iter_descendants("postorder"):                        
            node.up.union_genes.update(node.union_genes) 

        # build gene sets for ancestors in the supertree
        for node in self.supertree.iter_descendants("postorder"):            
            if node.up.inter_genes:
                node.up.inter_genes &= node.union_genes               
            else: #if first visit
                node.up.inter_genes.update(node.union_genes)                        
               
        # compute groups weights
        for node in self.supertree.iter_descendants("preorder"):        
            try:
                d = (len(node.up.inter_genes) / float(len(node.union_genes)))
                if d == 1:
                    d = 0.95
                node.dist = 1 - d    
                # node.support = len(node.inter_genes)            
            except:
                pass                

        min_g, max_g = self.cluster_tree(self.supertree, cut_off=0.5)
        cmap = plt.get_cmap("tab20c")   
        norm = matplotlib.colors.Normalize(vmin=min_g, vmax=max_g)
        
        for node in self.supertree.traverse("postorder"):                         
            nstyle = NodeStyle()
            nstyle['bgcolor'] = matplotlib.colors.to_hex(cmap(norm(node.g)))
            node.set_style(nstyle)

        print("Computing LGT candidates...")

        # how to use t.get_cached_content() to get it faster?
        potential_lgts = nx.Graph()        
        for tree_index in range(number_of_trees):
            species = self.forest[tree_index].get_leaf_names()
            clusters = {}
            clusters_dist = {}
            for name in species:
                for leaf in self.supertree.get_leaves_by_name(name):
                    if leaf.g in clusters:
                        clusters[leaf.g].append(leaf)
                    else:
                        clusters[leaf.g] = [leaf]            
            for c in clusters:
                clusters_dist[c] = len(clusters[c])

            self.forest[tree_index].add_features(clusters_dist = clusters_dist)

            # cluster_lgts_dist = {} # for now it does not make sense to store this
            for c1, c2 in itertools.combinations(clusters, 2):
                n1 = self.supertree.get_common_ancestor(clusters[c1])
                n2 = self.supertree.get_common_ancestor(clusters[c2])
                potential_lgts.add_edge(n1.name,n2.name)
        
        print("Number of LGT candidates: ",len(potential_lgts.edges))
        nx.draw(potential_lgts,pos=nx.spring_layout(potential_lgts))
        plt.show()

        self.supertree.write(format=1, outfile="./home/static/home/new_tree.nw")
        
        # write data associated with each tree from the florest
        json_txt = "{\"forest\":{"        
        for tree_index in range(number_of_trees):
            tree = self.forest[tree_index]
            json_txt += "\""+str(tree_index) +"\":{"
            
            # write the species
            json_txt += "\"species\":["
            for leaf in tree:
                json_txt +=  "\""+ leaf.name + "\","
            json_txt = json_txt[:-1]

            # write the tree in newick format
            json_txt += "],\"newick\": "
            json_txt += "\"(A,B);\""

            # write the distribution of species in each group, for this gene
            json_txt += ",\"group_sp_distribution\":"
            json_txt += json.dumps(tree.clusters_dist)

            # write how many edges have src/trg in each group
            json_txt += ",\"group_lgt_distribution\":{"            
            json_txt += "}"
            json_txt += "},"
        json_txt = json_txt[:-1]
        
        # write lgts edges
        json_txt += "},\"lgts\":["
        
        # write genes and group of each node from supertree
        json_txt += "],\"supertree\":{"
        for node in self.supertree.traverse("postorder"):
            json_txt += "\"" + node.name.replace(',', '_') + "\":"
            json_txt += "{\"genes\":["
            for gene in node.union_genes:
                json_txt += "\""+str(gene) + "\","
            if len(node.union_genes) > 0:
                json_txt = json_txt[: -1]
            json_txt += "],\"g\":\"" + str(node.g)
            json_txt += "\"},"
        json_txt = json_txt[: -1]
        json_txt += "}}"
        
        with open("./home/static/home/data.json","w") as f:
            f.write(json_txt)
            f.close()        

        ts = TreeStyle()
        ts.show_leaf_name = True
        ts.show_branch_length = True
        # ts.show_branch_support = True
        self.supertree.show(tree_style=ts)

