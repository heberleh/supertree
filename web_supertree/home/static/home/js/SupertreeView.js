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

        this._hash_pos = this._setUpLinks();

        console.log("number of lgts", supertree.lgts.length);
        this._lgts = this._setUpLGTs(supertree.lgts);
        console.log("number of lgts", this._lgts.length);
        this._updateLGTS(this._lgts);


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
        let root = this._diagram_container;
        var hash_pos = {};
        this._supertree_d3_hiearchy.links().forEach(function (d) {
            createTreeEdge(root, d.source.x, d.source.y, d.target.x, d.target.y, 1, colorToHex(d.target.color));
            hash_pos[d.target.data.name] = [d.target.x, d.target.y];
            hash_pos[d.source.data.name] = [d.source.x, d.source.y];
        });       
        return hash_pos;
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
        function moveToFront() {
            this.parentNode.appendChild(this);
        }

        function mouseovered(active) {
            return function (d) {
                d3.select(this).classed("label--active", active);
                d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
                do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = d.parent);
            };
        }

        return this._diagram
            .append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(this._supertree_d3_hiearchy.leaves())
            .enter().append("text")
            .attr("dy", ".31em")
            .attr("transform", (d) => {
                return "rotate(" + (d.x - 90) + ")translate(" + (this._innerRadius + 4) + ",0)" + (d.x < 180 ? "" :
                    "rotate(180)");
            })
            .attr("text-anchor", function (d) {
                return d.x < 180 ? "start" : "end";
            })
            .text(function (d) {
                return d.data.name.replace(/_/g, " ");
            })
            .style("fill", function (d) {
                return d.color;
            })
            .on("mouseover", mouseovered(true))
            .on("mouseout", mouseovered(false));
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
        d.color = this._treeGroupColor(d.data.c);
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

    _setUpLGTs(lgts_simple_vector) {
        // this._diagram.insert("g", ":first-child").attr("id", "lgts");

        // //console.log(lgts_simple_vector);
        var lgts_nodes = [];
        // var links = this._diagram.select("#links");

        var v = lgts_simple_vector;

        for (let e in v) {
            if(v[e][0] in this._hash_pos && v[e][1] in this._hash_pos){
                lgts_nodes.push({
                    "source": this._hash_pos[v[e][0]],
                    "target": this._hash_pos[v[e][1]]
                });
            }
        }
        //console.log("lgts",lgts_nodes);

        return lgts_nodes;
    }


    _updateLGTS(lgts_data) {
        let root = this._diagram_container;

        lgts_data.forEach(function (d) {
            createLGTEdge(root, d.source[0], d.source[1], d.target[0], d.target[1], 1, 0x9966FF, 0.05);
        });

        this._treeapp.start();

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