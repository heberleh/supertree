$(document).ready(function () {

    if (window.File && window.FileReader && window.FileList && window.Blob) {

        document.getElementById('file').addEventListener('change', handleFileSelect, false);

    } else {
        alert('The File APIs are not fully supported in this browser. Please try a different web browser or version. Usually Chrome and Firefox work fine.');
    }

    
});

/**
 * Handles the "file" parameter of the URL, that is, handles the XGMML network given through URL
 * @param {event} evt The event object
 */
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                console.log('e readAsText = ', e);
                console.log('e readAsText target = ', e.target);
                try {
                    json = JSON.parse(e.target.result);
                    alert('json global var has been set to parsed json of this file here it is unevaled = \n' + JSON.stringify(json));

                    //createSupertreeApp(json);

                } catch (ex) {
                    alert('ex when trying to parse json = ' + ex);
                }
            }
        })(f);
        reader.readAsText(f);
    }
}

/**
 * Creates a Supertree using the Json data and, then, creates the SupertreeView, displaying the supertree using Pixi.js (WebGL when available, otherwise, Canvas).
 * @param {Json data} json 
 */
function createSupertreeApp(json) {
           
            //console.log("lgts from file",nodes_data.lgts1,nodes_data.lgts2);
            // create models            
            var supertree = new Supertree(json);
            // create diagrams

            return null;
            // for each Gene-tree get the leaves distribution over pre-definded groups
            var streamData = [];
            var labels = supertree.groupsLabels;
            var sizeGroups = labels.length;
            var groups_dist = nodes_data.group_sp_distribution;
            var totals_in_groups = nodes_data.totals_in_groups;

            console.log("groups dist", groups_dist);
            console.log("total number of species in groups", totals_in_groups);
            //console.log("test data", groups_dist);
            max_values = {}
            for (let label in labels) {
                max_values[label] = 0;
            }
            var genes = [];

            for (let gene in groups_dist) {
                dist = groups_dist[gene];
                g = {};
                genes.push(gene);
                for (let label in labels) {
                    g[label] = 0;
                }
                for (let label in dist) {
                    g[label] = dist[label] / totals_in_groups[label];
                    if (g[label] > max_values[label]) {
                        max_values[label] = g[label];
                    }
                }
                streamData.push(g);

                if (streamData.length < 3) {
                    console.log("max values", max_values);
                    console.log("per group", groups_dist[gene]);
                }
            }

            stream = {};
            stream["data"] = streamData;
            stream["groupsLabels"] = labels;
            stream["totals_in_groups"] = totals_in_groups;
            //console.log("total",stream["totals_in_groups"]);
            stream["max_values"] = max_values;
            stream["group_sp_distribution"] = nodes_data.group_sp_distribution;
            stream["genes"] = genes;

            var supertreeView = new SupertreeView(document.getElementById("div_tree"), supertree, stream);
}