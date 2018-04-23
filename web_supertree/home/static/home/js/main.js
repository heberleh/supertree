

$(document).ready(function() {

    // read files and load models  -> when loading from django... how it would be?
    d3.json("/static/home/data.json", function(error, nodes_data) {
        if (error) throw error;
        d3.text("/static/home/new_tree.nw", function (error, supertree_nw) {
            if (error) throw error;
            
            // create models
            var supertree = new Supertree(supertree_nw, nodes_data);

            var supertreeView = new SupertreeView(d3.select("#diagrams"), supertree);
            // create diagrams

            // set up GUI... and diagrams coordination

        });
    });
    
   

});


