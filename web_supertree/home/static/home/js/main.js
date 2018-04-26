

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

            // for each Gene-tree get the leaves distribution over pre-definded groups
            var streamData = [];
            var labels = supertree.groupsLabels;
            var sizeGroups = labels.length;
            var groups_dist = nodes_data.group_sp_distribution;       
            console.log("test data", groups_dist);
            max_values = {}
            for (let label in labels){
                max_values[label] = 0;
            }
            var genes = [];            
            for (let gene in groups_dist){
                dist = groups_dist[gene];
                g = {};
                genes.push(gene);
                for (let label in labels){
                    g[label] = 0;
                }
                for (let label in dist){
                    g[label] = dist[label];
                    if (g[label] > max_values[label]){
                        max_values[label] = g[label];
                    }
                }
                streamData.push(g);            
            }

            console.log("streamData", streamData);                        

            stream = {};
            stream["data"] = streamData;
            stream["groupsLabels"] = labels;
            stream["max_values"] = max_values;
            stream["genes"] = genes;

            d3.csv('/static/home/data_stream_test.txt', function(error, data) {
                if (error) throw error;
                console.log(stream.data);
                
                // stream.data = data;
                // stream.groupsLabels = ["negative","positive","neutral"]

                // var stream = new Stream();
                var streamView = new StreamView(stream);
            });

            // set up GUI... and diagrams coordination

        });
    });
    
   

});


