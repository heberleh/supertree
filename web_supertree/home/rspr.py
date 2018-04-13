


def rspr(t1, t2, exact=True):
    pass

def matrix(trees, type = ("restricted", "onerow", "full"), maxdist = 1):
    pass


"""
1 - The first set of lines show the input trees. 
2 - The second set of lines are the
approximate agreement forests and the corresponding approximate rSPR distance.
3 - The third set of lines are the maximum agreement forests and the corresponding
exact rSPR distance. When calculating exact distances, the distance
currently being considered is printed on the first line of this section.

Each component of an agreement forest corresponds to an rSPR operation. 
The set of rSPR operations required to turn one tree into the other can
be found by applying rSPR operations that move these components to their
correct place in the other tree.

An agreement forest may contain p (rho) as a component. This represents
the root of the trees and indicates that an extra rSPR operation is
required to correctly root the tree."""
def maximum_agreement_forests(t1, t2, exact=True):
    pass


