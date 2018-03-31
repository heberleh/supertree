from django.contrib.auth.models import User
from django.test import TestCase
from ete3 import Tree

from home.test_data import TestData

from .models import SupertreeModel
import numpy as np
from scipy.sparse import csr_matrix


class SupertreeAppTest(TestCase):
    databaseTest = False

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
                self.forest.append(Tree(newick=tree_nw+';', format=self.format))
        else:
            reference_newick=TestData.supertree_newick()
            forest_newicks=TestData.forest_newicks()
            self.format = 9
            self.supertree = Tree(
                newick=reference_newick,
                format=self.format
            )
            self.forest = []
            for tree_nw in forest_newicks.split(';'):
                self.forest.append(Tree(newick=tree_nw+';', format=self.format))

            

    def testPrinting(self):
        print(self.supertree)
        for i in range(5):
            print(self.forest[i])

    def testShowingGUI(self):
        self.supertree.show()

    def testRFDistance(self):
        tree1 = self.forest[0]
        tree2 = self.forest[1]

        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = tree1.robinson_foulds(
            tree1)
        print("Distance between Tree1 and Tree1:", rf, max_rf, rf/max_rf)

        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = tree1.robinson_foulds(
            tree2)
        print("Distance between Tree1 and Tree2:",  rf, max_rf, rf/max_rf)

        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = tree1.robinson_foulds(
            self.supertree)
        print("Distance between Tree1 and Reference:", rf, max_rf, rf/max_rf)

        lgt = parts_t1 - parts_t2
        print("Partitions in Reference that were not found in tree1:", lgt)
        print("\n\n\n")
        print(tree1)
        for bag in lgt:
            for node in tree1.get_monophyletic(values=bag, target_attr='name'):
                print(node)

        lgt = parts_t2 - parts_t1
        print("Partitions in tree1 that were not found in Reference:", lgt)
        print("\n\n\n")
        print(tree1)
        for bag in lgt:
            for node in tree1.get_monophyletic(values=bag, target_attr='name'):
                print(node)

        self.supertree.show()


    def testRFDistanceMatrix(self):        
        size = 10#len(self.forest)        
        row = []
        col = []
        data = []
        for i in range(size):            
            for j in range(i,size):
                rf = self.forest[i].robinson_foulds(self.forest[j])[0]
                if not rf == 0:                    
                    row.append(i)
                    col.append(j)
                    data.append(rf)
        
        print("creating matrix")
        matrix = csr_matrix((np.array(data),(np.array(row),np.array(col))),shape=(size,size))
        x,y = matrix.nonzero()
        print(x)
        print(y)
        for i in x:
            for j in y:
                print(matrix[i,j])

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

        #rf, rf_max, common_attrs, names, edges_t1, edges_t2, discarded_edges_t1, discarded_edges_t2
        rf, max_rf, common_leaves, parts_t1, parts_t2, discarded_edges_t1, discarded_edges_t2 = t1.robinson_foulds(
            t2)

        print(t1, t2)
        print("Same distance holds even for partially overlapping trees")
        print("RF distance is %s over a total of %s" % (rf, max_rf))
        print("Partitions in tree2 that were not found in tree1:",
              parts_t1 - parts_t2)
        print("Partitions in tree1 that were not found in tree2:",
              parts_t2 - parts_t1)
