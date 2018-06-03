import ete3 as ete
from test_data import TestData

class SuperTreeApp:
    
    def __init__(self, supertree_newick, forest_newick, type=9):        
        self.supertree = ete.Tree(supertree, type=type)

        this.forest = []
        for tree in forest_newick:
            self.forest.append(ete.Tree(forest,type=type))

    def __str__(self):
        return self.supertree
