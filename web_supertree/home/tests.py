from django.contrib.auth.models import User
from django.test import TestCase
from ete3 import Tree

from home.test_data import TestData

from .models import SupertreeModel


class SupertreeAppTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345abcdeku249s')
        self.supertree_model = SupertreeModel.objects.create(
                                                reference_newick=TestData.supertree_newick(),
                                                forest_newicks=TestData.forest_newicks(),
                                                user = self.user
                                                )
        self.format = 9        
        self.supertree = Tree(
                                newick=SupertreeModel.objects.first().reference_newick,
                                format=self.format
                            )
        self.forest = []
        for tree_nw in self.supertree_model.forest_newicks.split(';'):
            self.forest.append(Tree(newick=tree_nw+';', format=self.format))

    def testPrinting(self):
        print(self.supertree)
        for i in range(5):
            print(self.forest[i])

    def testShowingGUI(self):
        self.supertree.show()

    
    def testForest2ReferenceDistancesHistogram(self):
        
