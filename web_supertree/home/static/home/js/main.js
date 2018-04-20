

$(document).ready(function() {

    // read files and load models  -> when loading from django... how it would be?
    d3.json("/static/accounts/data.json", function(error, nodes_data) {
        if (error) throw error;
        d3.text("/static/accounts/new_tree.nw", function (error, supertree_data) {
            if (error) throw error;
            
            // create models
            var supertree = new Supertree(d3.select("#diagram"), supertree_nodes, nodes_data);

            // create diagrams

            // set up GUI... and diagrams coordination

        });
    });
    
   

});


