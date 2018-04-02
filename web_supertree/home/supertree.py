
from ete3 import Tree

class Supertree:

    def __init__(reference_newick, forest_newicks, format=9):
        self.format = 9

        self.supertree = Tree(
            newick=reference_newick,
            format=self.format
        )

        self.forest = []
        for tree_nw in forest_newicks.split(';'):
            self.forest.append(Tree(newick=tree_nw+';', format=self.format))
    
        self.idh = {}
        self.id = []
        i = 0
        for name in self.supertree.get_leaf_names():
            if not name in self.idh:            
                self.idh[name] = i
                self.id.push(name)
                i++

        for name in self.supertree.get_leaf_names():
            if not name in self.idh:            
                self.idh[name] = i
                self.id.push(name)
                i++

                ......
