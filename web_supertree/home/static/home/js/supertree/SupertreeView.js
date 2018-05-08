class SupertreeView {

    constructor(diagram_div, supertree) {
        this._outerRadius = 1000 / 2;
        this._innerRadius = this._outerRadius - 170;

        this._diagram_div = diagram_div;
        this.supertree = supertree;
        this._supertree_d3_hiearchy = this._setUpSupertreeD3Hierarchy(supertree);
        supertree.storeData(this._supertree_d3_hiearchy);        

        this._treeGroupColor = this._updateTreeGroupColors(supertree.groupsLabels);
        this._setColor(this._supertree_d3_hiearchy);
        this._treeLayoutCluster = this._setUpTreeLayoutCluster();
        this._treeLayoutCluster(this._supertree_d3_hiearchy);

        this._setRadius(this._supertree_d3_hiearchy,
            this._supertree_d3_hiearchy.data.length = 0,
            this._innerRadius / this._maxLength(this._supertree_d3_hiearchy)
        );

        this._setUpView();
        // /createLine(this._diagram_container, 50,50,200,200);

        // setUpLinkExtensions();....
        //this._setUpLinkExtension();

        
        this._setUpLabels();

        this._d3_nodes_hash = this._setUpHashOfD3Nodes();
        console.log("number of nodes in hash", this._d3_nodes_hash.length);
        console.log("number of lgts", supertree.lgts.length);

        this._lgts = this._setUpLGTs(supertree.lgts);
        console.log("number of lgts -> nodes", this._lgts.length);
        this._updateLGTS(this._lgts);    

        
        this._setUpLinks();
        ///////////////////////////////////////////////////////////////////////

        // this._svg = this._setUpSVG(diagram_div);
        // this._diagram = this._setUpDiagram(this._svg);

        // // hierarchy
        // this._supertree_d3_hiearchy = this._setUpSupertreeD3Hierarchy(supertree);

        // // DATA
        // supertree.storeData(this._supertree_d3_hiearchy);

        // // Colors        
        // this._treeGroupColor = this._updateTreeGroupColors(supertree.groupsLabels);
        // this._setColor(this._supertree_d3_hiearchy);

        // // D3 Radial Tree Layout Diagram        
        // this._treeLayoutCluster = this._setUpTreeLayoutCluster();
        // this._treeLayoutCluster(this._supertree_d3_hiearchy);
        // this._linkExtension = this._setUpLinkExtension();
        // this._link = this._setUpLinks();
        // this._labels = this._setUpLabels();

        // // Extensions
        // this._tooltip = this._setUpToolTip();

        // // Diagram Interaction        
        // this._setRadius(this._supertree_d3_hiearchy,
        //     this._supertree_d3_hiearchy.data.length = 0,
        //     this._innerRadius / this._maxLength(this._supertree_d3_hiearchy)
        // );


        // // TODO should this be out of this class? YES -> AND OUT OF THE DIAGRAM
        // this._clusterCheckbox = this._setUpCheckBoxClusterOnOff();

        // this._lgts = this._setUpLGTs(supertree.lgts);
        // this._updateLGTS(this._lgts);
    }

    // _setUpSVG(diagram_div) {        
    //     return diagram_div
    //         .append("svg")
    //         .attr("width", this._outerRadius * 2)
    //         .attr("height", this._outerRadius * 2);
    // }
    // _setUpDiagram(svg) {
    //     return svg
    //         .append("g")
    //         .attr("transform", "translate(" + this._outerRadius + "," + this._outerRadius + ")");
    // }

    _setUpHashOfD3Nodes(){
        let root = this._diagram_container;
        var d3_nodes_hash = {};
        this._supertree_d3_hiearchy.descendants().forEach(function (d) {
            d3_nodes_hash[d.data.name] = d;
        });
        return d3_nodes_hash;
    }

    _setUpView() {
        let width = this._outerRadius * 2;
        let height = this._outerRadius * 2;

        // App
        this._treeapp = new PIXI.Application(width, height, {
            backgroundColor: 0xffffff,
            antialias: true, // default: false
            transparent: false, // default: false
            resolution: 1 // default: 1
        });
        
        
        

        // Containers
        this._stage = this._treeapp.stage;
        this._diagram_container = new PIXI.Container();        
        this._stage.addChild(this._diagram_container);

        // Move container to the center
        this._diagram_container.x = this._treeapp.screen.width / 2;
        this._diagram_container.y = this._treeapp.screen.height / 2;

        this._view = this._diagram_div.append(this._treeapp.view);
        
        // this._treeapp.ticker.add(() => {
        //     // each frame we spin the bunny around a bit
        //    this._diagram_container.rotation += 0.001;
        // });        

    }



    _updateTreeGroupColors(labels, color_scheme = d3.schemeCategory10) {
        return d3.scaleOrdinal()
            .domain(labels)
            .range(color_scheme);
    }

    _setUpTreeLayoutCluster() {
        return d3.cluster()
            .size([360, this._innerRadius])
            .separation(function (a, b) {
                return 1;
            });
    }

    _setUpSupertreeD3Hierarchy(supertree) {
        return d3.hierarchy(supertree.hierarchy, function (d) {
                return d.branchset;
            })
            .sum(function (d) {
                return d.branchset ? 0 : 1;
            })
            .sort(function (a, b) {
                return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
            });
    }

    _setUpCheckBoxClusterOnOff() {
        this._checkBoxLayoutCluster =
            d3.select("#show-length input")
            .on("change", (d) => this._clusterCheckboxChanged(d)),

            this._timeout = setTimeout(() => {
                this._checkBoxLayoutCluster.property("checked", true).each((d) => this._clusterCheckboxChanged(d));
            }, 2000);
    }


    _setUpLinkExtension() {
        let radius = this._innerRadius;
        let root = this._diagram_container;
        this._supertree_d3_hiearchy.links().filter(function (d) {
            return !d.target.children;
        }).forEach(function (d) {
            createTreeEdge(root, d.target.x, d.target.y, d.target.x, radius, 1.5, colorToHex(d.target.color));
        });
    }
    // _setUpLinkExtension() {
    //     return this._diagram.append("g")
    //         .attr("class", "link-extensions")
    //         .selectAll("path")
    //         .data(this._supertree_d3_hiearchy.links().filter(function (d) {
    //             return !d.target.children;
    //         }))
    //         .enter().append("path")
    //         .each(function (d) {
    //             d.target.linkExtensionNode = this;
    //         })
    //         .attr("d", (d) => this._linkExtensionConstant(d));
    // }

    _setUpToolTip() {
        return this._diagram
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("");
    }

    _setUpLinks() {
        let container = this._diagram_container;
        this._supertree_d3_hiearchy.links().forEach(function (d) {
            d.graphics = new TreeEdge(d);            
            container.addChild(d.graphics);
        });
    }

    // _setUpLinks(linkConstant) {
    //     return this._diagram
    //         .append("g")
    //         .attr("class", "links")
    //         .attr("id", "links")
    //         .selectAll("path")
    //         .data(this._supertree_d3_hiearchy.links())
    //         .enter().append("path")
    //         .each(function (d) {
    //             d.target.linkNode = this;
    //         })
    //         .attr("d", linkConstant)
    //         .attr("stroke", function (d) {
    //             return d3.rgb(d.target.color).darker(1);
    //         })
    //         .attr('stroke-width', 1.5)
    //         .attr("id", function (d) {
    //             return "lgt_" + d.source.data.name
    //         })
    //         .on("mouseover", (d) => {
    //             this._tooltip.text("Length: " + d.target.data.length);
    //             return this._tooltip.style("visibility", "visible");
    //         })
    //         .on("mousemove", () => {
    //             return this._tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
    //         })
    //         .on("mouseout", () => {
    //             return this._tooltip.style("visibility", "hidden");
    //         });
    // }

    _setUpLabels() {
        let container = this._diagram_container;
        console.log("number of leaves", this._supertree_d3_hiearchy.leaves().length);
        this._supertree_d3_hiearchy.leaves().forEach(function(d){            
            d.graphics = new Leaf(d);
            container.addChild(d.graphics);
        });

        // function moveToFront() {
        //     this.parentNode.appendChild(this);
        // }

        // function mouseovered(active) {
        //     return function (d) {
        //         d3.select(this).classed("label--active", active);
        //         d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
        //         do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = droot.parent);
        //     };
        // }

        // return this._diagram
        //     .append("g")
        //     .attr("class", "labels")
        //     .selectAll("text")
        //     .data(this._supertree_d3_hiearchy.leaves())
        //     .enter().append("text")
        //     .attr("dy", ".31em")
        //     .attr("transform", (d) => {
        //         return "rotate(" + (d.x - 90) + ")translate(" + (this._innerRadius + 4) + ",0)" + (d.x < 180 ? "" :
        //             "rotate(180)");
        //     })
        //     .attr("text-anchor", function (d) {
        //         return d.x < 180 ? "start" : "end";
        //     })
        //     .text(function (d) {
        //         return d.data.name.replace(/_/g, " ");
        //     })
        //     .style("fill", function (d) {
        //         return d.color;
        //     })
        //     .on("mouseover", mouseovered(true))
        //     .on("mouseout", mouseovered(false));
    }

    _clusterCheckboxChanged() {
        clearTimeout(this._timeout);
        var t = d3.transition().duration(750);
        this._linkExtension.transition(t).attr("d", this.checked ? (d) => this._linkExtensionVariable(d) : (d) => this._linkExtensionConstant(d));

        this._link.transition(t).attr("d", this.checked ? (d) => this._linkVariable(d) : (d) => this._linkConstant(d));

    }

    // Compute the maximum cumulative length of any node in the tree.
    _maxLength(d) {
        return d.data.length + (d.children ? d3.max(d.children, () => this._maxLength) : 0);
    }

    // Set the radius of each node by recursively summing and scaling the distance from the root.
    _setRadius(d, y0, k) {
        d.radius = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach((d) => {
            this._setRadius(d, y0, k);
        });
    }

    // Set the color of each node by recursively inheriting.
    _setColor(d) {
        d.color =  colorToHex(this._treeGroupColor(d.data.c));
        if (d.children) d.children.forEach((d) => this._setColor(d));
    }

    _linkVariable(d) {
        return this._linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }

    _linkConstant(d) {
        return this._linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    _linkExtensionVariable(d) {
        return this._linkStep(d.target.x, d.target.radius, d.target.x, this._innerRadius);
    }

    _linkExtensionConstant(d) {
        return this._linkStep(d.target.x, d.target.y, d.target.x, this._innerRadius);
    }

    // Like d3.svg.diagonal.radial, but with square corners.
    _linkStep(startAngle, startRadius, endAngle, endRadius) {
        var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
            s0 = Math.sin(startAngle),
            c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
            s1 = Math.sin(endAngle);
        return "M" + startRadius * c0 + "," + startRadius * s0 +
            (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ?
                1 : 0) + " " + startRadius * c1 + "," + startRadius * s1) +
            "L" + endRadius * c1 + "," + endRadius * s1;
    }

    // TODO: if groups changed by user interaction, return custom groups
    getCurrentGroups() {
        return this._supertree.groupsLabels;
    }

    _setUpLGTs(l) {                
        let lgts_nodes = [];                
        let hash = this._d3_nodes_hash;
        var non_tracked_edges = []
        for (let e in l) {
            if(l[e][0] in hash && l[e][1] in hash){
                if (e <10){
                    console.log(hash[l[e][0]]);
                }
                lgts_nodes.push({
                    "source": hash[l[e][0]],
                    "target": hash[l[e][1]],
                    'weight': l[e][2]
                });
            }else{
                non_tracked_edges.push(l[e]);
            }
        }
        console.log("what is going on with these edges?",non_tracked_edges);
        return lgts_nodes;
    }


    _updateLGTS(lgts_data) {
        
        this._lgts_container = new PIXI.Container();        
        
        this._diagram_container.addChild(this._lgts_container);                
        
        let container = this._lgts_container;
        console.log("LGTs container",container);
        // container.children.forEach(function(node){
        //     node.destroy();
        // });
        // while (container.firstChild) {
        //     container.removeChild(container.firstChild);
        // }
                
        lgts_data.forEach(function (d) {
            d.graphics = new LEdge(d);
            container.addChild(d.graphics);
        });        

        // var lgts = this._diagram.select("#lgts");

        // function mouseovered(active) {
        //     return function (d) {
        //         if (active) {
        //             d3.select(this).attr("stroke", "black").attr('stroke-opacity', 1);
        //         } else {
        //             d3.select(this).attr("stroke", "red").attr('stroke-opacity', 0.10);
        //         }
        //     };
        // }

        // lgts = lgts
        //     .selectAll(".lgt")
        //     .data(lgts_data)
        //     .enter()
        //     .append('path')
        //     .classed('lgt', true)

        //     .attr('d', (d) => {
        //         return lgtLineC(d.source.x, d.source.y, d.target.x, d.target.y);
        //     })
        //     .attr('class', 'edgepath')
        //     .attr('fill-opacity', 0.3)
        //     .attr('stroke-opacity', 0.10)
        //     .attr('fill', 'blue')
        //     .attr('stroke-width', 0.5)
        //     .attr('stroke', 'red')
        //     .attr('id', function (d, i) {
        //         return 'edgepath' + i
        //     })
        //     //.style("pointer-events", "none")
        //     .on("mouseover", mouseovered(true))
        //     .on("mouseout", mouseovered(false));
    }
}


// {% comment %}
// var legend = svg.append("g")
// .attr("class", "legend")
// .selectAll("g")
// .data(color.domain())
// .enter().append("g")
// .attr("transform", function (d, i) {
//     return "translate(" + (outerRadius * 2 - 10) + "," + (i * 20 + 10) + ")";
// });

// legend.append("rect")
// .attr("x", -18)
// .attr("width", 18)
// .attr("height", 18)
// .attr("fill", color);

// legend.append("text")
// .attr("x", -24)
// .attr("y", 9)
// .attr("dy", ".35em")
// .attr("text-anchor", "end")
// .text(function (d) {
//     return d;
// }); {% endcomment %}