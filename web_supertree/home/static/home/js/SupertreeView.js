class SupertreeView {

    constructor(diagram_div, supertree) {
        this._diagram_div = diagram_div;

        this._outerRadius = 902 / 2;
        this._innerRadius = this._outerRadius - 170;
        this._svg = this._setUpSVG(diagram_div);
        this._diagram = this._setUpDiagram(this._svg);

        // D3 Radial Tree Layout Diagram
        this._supertree_d3_hiearchy = this._setUpSupertreeD3Hierarchy(supertree);
        this._treeLayoutCluster = this._setUpTreeLayoutCluster();
        this._treeLayoutCluster(this._supertree_d3_hiearchy);
        this._linkExtension = this._setUpLinkExtension();
        this._link = this._setUpLinks();
        this._labels = this._setUpLabels();

        // Extensions
        this._tooltip = this._setUpToolTip();

        // Colors
        this._treeGroupColor = this._updateTreeGroupColors(supertree.getMinGroup(), supertree.getMaxGroup());

        // Diagram Interaction
        setUpData(root, nodes_data);
        setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
        setColor(root);

        // TODO should this be out of this class? YES -> AND OUT OF THE DIAGRAM
        this._clusterCheckbox = this._setUpCheckBoxClusterOnOff();
    }

    _setUpSVG(diagram_div) {
        return diagram_div
            .append("svg")
            .attr("width", this._outerRadius * 2)
            .attr("height", this._outerRadius * 2);
    }
    _setUpDiagram(svg) {
        return svg
            .append("g")
            .attr("transform", "translate(" + this._outerRadius + "," + this._outerRadius + ")");
    }
    _updateTreeGroupColors(min_value, max_value, color_scheme = d3.schemeCategory10) {
        return d3.scaleOrdinal()
            .domain([min_value, max_value])
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
            .on("change", this._clusterCheckboxChanged),

            this._timeout = setTimeout(() => {
                input.property("checked", true).each(this._clusterCheckboxChanged);
            }, 2000);
    }

    _setUpLinkExtension() {
        var linkExtensionConstant =  this._linkExtensionConstant;
        return this._diagram.append("g")
            .attr("class", "link-extensions")
            .selectAll("path")
            .data(this._supertree_d3_hiearchy.links().filter(function (d) {
                return !d.target.children;
            }))
            .enter().append("path")
            .each(function (d) {
                d.target.linkExtensionNode = this;
            })
            .attr("d", linkExtensionConstant);
    }

    _setUpToolTip() {
        return this._diagram
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("");
    }

    _setUpLinks(linkConstant) {
        return this._diagram
            .append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(this._supertree_d3_hiearchy.links())
            .enter().append("path")
            .each(function (d) {
                d.target.linkNode = this;
            })
            .attr("d", linkConstant)
            .attr("stroke", function (d) {
                return d.target.color;
            })
            .on("mouseover", (d) => {
                this._tooltip.text("Length: " + d.target.data.length);
                return this._tooltip.style("visibility", "visible");
            })
            .on("mousemove", () => {
                return this._tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                return this._tooltip.style("visibility", "hidden");
            });
    }

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
            .on("mouseover", mouseovered(true))
            .on("mouseout", mouseovered(false));
    }

    _clusterCheckboxChanged() {
        var linkExtensionVariable = this._linkExtensionVariable;
        var linkExtensionConstant = this._linkExtensionConstant;
        var linkVariable = this._linkVariable;
        var linkConstant = this._linkConstant;        

        clearTimeout(this._timeout);
        var t = d3.transition().duration(750);
        this._linkExtension.transition(t).attr("d", this.checked ? linkExtensionVariable : linkExtensionConstant);
        this._link.transition(t).attr("d", this.checked ? linkVariable : linkConstant);
    }

    // Compute the maximum cumulative length of any node in the tree.
    _maxLength(d) {
        return d.data.length + (d.children ? d3.max(d.children, this._maxLength) : 0);
    }

    // Set the radius of each node by recursively summing and scaling the distance from the root.
    _setRadius(d, y0, k) {
        d.radius = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach((d) => {
            this._setRadius(d, y0, k);
        });
    }

    // get data from a data file and store in the tree structure
    _setUpData(d, nodes_data) {
        if (d.data.name == "") {
            d.data.c = 0;
            d.data.genes = [];
        } else {
            var node = nodes_data[d.data.name];
            d.data.c = node.g;
            d.data.genes = node.genes;
        }
        if (d.children) d.children.forEach((d) => {
            this._setUpData(d, nodes_data);
        });
    }

    // Set the color of each node by recursively inheriting.
    _setColor(d) {
        d.color = color(d.data.c);
        if (d.children) d.children.forEach(this._setColor);
    }

    _linkVariable(d) {
        return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }

    _linkConstant(d) {
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    _linkExtensionVariable(d) {
        return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
    }

    _linkExtensionConstant(d) {
        return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
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
