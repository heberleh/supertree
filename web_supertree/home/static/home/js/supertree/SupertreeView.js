class SupertreeView {

    constructor(diagram_div, supertree, stream) {
        this._outerRadius = 1000 / 2;
        this._innerRadius = this._outerRadius - 170;

        this.stream = stream;
        this._diagram_div = diagram_div;
        this.supertree = supertree;
        this.supertree.hierarchy;

        console.log("Supertree", this.supertree.hierarchy);

        // let colors = d3.shuffle(d3.schemeCategory20);
        // console.log(colors);
        // let colors = [
        //     "#9467bd",
        //     "#8c564b",
        //     "#ffbb78",
        //     "#c7c7c7",
        //     "#f7b6d2",
        //     "#2ca02c",
        //     "#c5b0d5",
        //     "#9edae5",
        //     "#dbdb8d",
        //     "#bcbd22",
        //     "#ff7f0e",
        //     "#7f7f7f",
        //     "#c49c94",
        //     "#1f77b4",
        //     "#aec7e8",
        //     "#d62728",
        //     "#98df8a",
        //     "#17becf",
        //     "#e377c2",
        //     "#ff9896"
        //   ];

        let colors = [
            "#17becf",
            "#ff7f0e",
            "#d62728",
            "#c49c94",
            "#98df8a",
            "#e377c2",
            "#2ca02c",
            "#ff9896",
            "#8c564b",
            "#9467bd",
            "#1f77b4",
            "#c5b0d5",
            "#7f7f7f",
            "#f7b6d2",
            "#c7c7c7",
            "#ffbb78",
            "#bcbd22",
            "#aec7e8",
            "#9edae5",
            "#dbdb8d"
        ];

        console.log("Groups labels", supertree.groupsLabels);
        this._treeGroupColorMap = this._updateTreeGroupColors(supertree.groupsLabels, colors);
        this._setColor(this.supertree.hierarchy);
        this._treeLayoutCluster = this._setUpTreeLayoutCluster();
        this._treeLayoutCluster(this.supertree.hierarchy);

        this._setRadius(this.supertree.hierarchy,
            this.supertree.hierarchy.data.length = 0,
            this._innerRadius / this._maxLength(this.supertree.hierarchy)
        );

        this._min_dist = 16;
        this._max_dist = 20;

        // [d3.rgb("#007AFF"), d3.rgb('#FFF500')]
        //['#fc8d59','#ffffbf','#99d594']
        //#7fc97f #beaed4 #fdc086
        let color_list = ['#1b9e77', '#7570b3', '#d95f02'];
        this.colorLGTrange = [];
        for (let i in color_list) {
            this.colorLGTrange.push(d3.rgb(color_list[i]));
        }

        this.colorLGTColorInterpolation = d3.interpolateRgb; // d3.interpolateHsl; //interpolateHsl interpolateHcl interpolateRgb

        this._setUpView();
        // /createLine(this._diagram_container, 50,50,200,200);

        // setUpLinkExtensions();....
        //this._setUpLinkExtension();


        this._setUpLabels();
        this._setUpGenomeBars();

        console.log("number of lgts", supertree.lgts.length);

        //this.supertree.lgts = this._setUpLGTs(supertree.lgts);
        console.log("number of lgts -> nodes", this.supertree.lgts.length);
        console.log("lgts", this.supertree.lgts);
        this._updateLGTS();

        this._setUpLinks();

        // this._setUpInternalNode();

        // VIEW FILTERS
        this.globalLGTsAlpha = 1;
        this.globalGenomesAlpha = 0.3;
        this.globalGenomeLabelAlpha = 1.0;
        this.setUpGraphicalSlidersFilters();
        this.setUpGenomeAlpha();
        this.setUpGenomeLabelsAlpha();

        // LGT FILTERS
        this._setUpNumericalLGTAttributes(supertree.lgts);
        this._addAttributeLGTGenesScores();

        // GENE FILTERS
        this.numericalGeneAttributes = {};
        this._addGeneAttributeNumberOfGenomes();
        this._addAttributeGenesScores();        

        //FILTERS SLIDERS
        this.setUpNumericalSlidersFilters();

        this._setUpGroupsLegend();
        // Visual color for Numeric attributes
        this._setUpColorSelectionMenu();

    }

    _setUpGroupsLegend() {

        console.log("legenda");
        let svg = d3.select("#groups_legend").append("svg");
        let ordinal = this.groupsColorMap;
        console.log("ordinal", ordinal);

        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(20,20)");

        console.log("group labels", this.supertree.groupsLabels);
        let legendOrdinal = d3.legendColor()
            .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
            .shapePadding(10)
            //use cellFilter to hide the "e" cell
            .cellFilter(function (d) {
                return d.label !== "e"
            })
            .scale(ordinal);

        svg.select(".legendOrdinal")
            .call(legendOrdinal);
    }

    _setUpNumericalLGTAttributes(lgts) {
        let first = lgts[0];
        this.numericalLGTAttributes = {};
        let numericAttributes = [];
        let values = {};

        for (let name in first.attributes) {
            if (first.attributes[name].type == 'numeric') {
                numericAttributes.push(name);
                values[name] = new Set();
            }
        }

        lgts.forEach(function (e) {
            for (let i in numericAttributes) {
                let name = numericAttributes[i];
                values[name].add(e.attributes[name].value);
            }
        });

        for (let i in numericAttributes) {
            this._addNumericalLGTAttribute(numericAttributes[i], [...values[numericAttributes[i]]]);
        }
    }

    _addNumericalLGTAttribute(name, values) {
        let dict = {};
        dict.min = d3.min(values);
        dict.max = d3.max(values);
        dict.selMin = dict.min;
        dict.selMax = dict.max;
        dict.values = values;
        this.numericalLGTAttributes[name] = dict;
    }

    _addNumericalGeneAttribute(name, values) {
        let dict = {};
        dict.min = d3.min(values);
        dict.max = d3.max(values);
        dict.selMin = dict.min;
        dict.selMax = dict.max;
        dict.values = values;
        this.numericalGeneAttributes[name] = dict;
    }


    _addAttributeLGTGenesScores() {
        // create genes' scores        
        //console.log('genes', genes);
        let scores = {};
        let values = new Set();

        let name_max = "max_gene_score";
        let name_min = "min_gene_score";
        this.supertree.lgts.forEach(e => {
            let e_scores = [];
            //e.genes.forEach(g => {
            e.genes.forEach(g => {
                let src_v = this.supertree.getGroupsDistribution(g)[e.source.data.c] / this.supertree.totals_in_groups[e.source.data.c];
                let trg_v = this.supertree.getGroupsDistribution(g)[e.target.data.c] / this.supertree.totals_in_groups[e.target.data.c];

                let value = Math.trunc(Math.abs(src_v - trg_v) * 100);

                values.add(value);
                e_scores.push(value);
            });
            e.attributes[name_max] = {
                'type': 'numeric',
                'value': d3.max(e_scores)
            };
            e.attributes[name_min] = {
                'type': 'numeric',
                'value': d3.min(e_scores)
            };
        });

        let values_list = [...values];
        this._addNumericalLGTAttribute(name_max, values_list);
        this._addNumericalLGTAttribute(name_min, values_list);
    }


    _addAttributeMaybe() {
        for (let i in data) {
            let clusters_percentages = data[i];
            let min_value = Infinity;
            let max_value = -Infinity;
            let score = 0;

            for (let c in clusters_percentages) {
                if (clusters_percentages[c] > 0.0000000000 && clusters_percentages[c] < min_value)
                    min_value = clusters_percentages[c];
                if (clusters_percentages[c] > max_value)
                    max_value = clusters_percentages[c];
            }
            if (min_value != Number.POSITIVE_INFINITY) {
                score = max_value - min_value;
            }

            score = parseInt(Math.trunc((score * 100)));
            // all attribute values
            values.add(score);
            scores[genes[i]] = score;
        }

        let name_max = "max_gene_score";
        let name_min = "min_gene_score";
        // create attribute
        let values_list = [...values];
        this._addNumericalLGTAttribute(name_max, values_list);
        this._addNumericalLGTAttribute(name_min, values_list);

        // store values for each lgt edge as a new attribute       
        this.supertree.lgts.forEach(function (e) {
            let vl = [];
            e.genes.forEach(function (g) {
                vl.push(scores[g]);
            });
            // complete storing in the e.attributes

        });
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

    // colors = ["#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059","#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87","#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80","#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100","#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F","#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09","#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66","#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C","#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81","#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00","#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700","#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329","#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C"]

    _updateTreeGroupColors(labels, color_scheme = d3.shuffle(d3.schemeCategory20)) {
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
        this.supertree.hierarchy.links().filter(function (d) {
            return !d.target.children;
        }).forEach(function (d) {
            createTreeEdge(root, d.target.x, d.target.y, d.target.x, radius, 1.5, colorToHex(d.target.color));
        });
    }

    _setUpLinks() {
        let container = this._diagram_container;
        this.supertree.hierarchy.links().forEach(function (d) {
            d.graphics = new TreeEdge(d);
            container.addChild(d.graphics);
        });
    }

    // _setUpInternalNode() {
    //     let container = this._diagram_container;
    //     this.supertree.hierarchy.links().filter(function (d) {
    //         return d.target.children;
    //     }).forEach(function (d) {            
    //         d.internalNodeSprite = new InternalNodeSprite(d);
    //         container.addChild(d.internalNodeSprite);
    //     });
    // }

    _setUpLabels() {
        let container = this._diagram_container;
        let superTreeView = this;
        console.log("number of leaves", this.supertree.hierarchy.leaves().length);
        this.supertree.hierarchy.leaves().forEach(function (d) {

            d.graphics = new Leaf(d);
            d.graphics.superTreeView = superTreeView;
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
        //     .data(this.supertree.hierarchy.leaves())
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
        d.color = colorToHex(this._treeGroupColorMap(d.data.c));
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

    _updateLGTS() {

        // if (this._lgts_container){
        //     this._diagram_container.removeChild(this._lgts_container);
        //     this._lgts_container.destroy();
        // }

        this._lgts_container = new PIXI.Container();
        this._diagram_container.addChild(this._lgts_container);

        let container = this._lgts_container;
        // console.log("LGTs container", container);

        this.supertree.lgts.forEach((d) => {
            d.lateralEdgeSprite = new LateralEdgeSprite(container, d, this);
        });

        this.updateEdgesVisibilityByNumericLGTFilter();


        // {
        //     "id": <string id>,
        //     "name": <string name>,
        //     "data": {
        //         "coords": [
        //             <coord x from>,
        //             <coord y from>,
        //             <coord x to>,
        //             <coord y to>
        //         ]
        //     }
        // }
        let edges_for_bundling = [];
        let id = 0;

        this.supertree.lgts.forEach(d => {
            let p0 = project(d.source.x, d.source.y);
            let p1 = project(d.target.x, d.target.y);
            edges_for_bundling.push({
                "id": id,
                "name": "",
                "data": {
                    "coords": [p0[0], p0[1], p1[0], p1[1]]
                }
            });
            id += 1;
        });

    }

    updateEdgesVisibilityByNumericLGTFilter() {

        this.supertree.lgts.forEach((d) => {
            let visible = true;
            for (let name in this.numericalLGTAttributes) {
                if (!d.enabled ||
                    d.attributes[name].value < this.numericalLGTAttributes[name].selMin ||
                    d.attributes[name].value > this.numericalLGTAttributes[name].selMax) {
                    visible = false;
                    break;
                }
            }
            d.lateralEdgeSprite.sprite.visible = visible;
        });
    }


    updateLGTsDefaultAlpha() {

        this.supertree.lgts.forEach((d) => {
            d.lateralEdgeSprite.setDefaultAlpha(this.globalLGTsAlpha);
            d.lateralEdgeSprite.highlightOff();
        });
        //this._treeapp.renderer.render(this._stage);
    }

    updateGenomesDefaultAlpha() {
        this.supertree.hierarchy.leaves().forEach(d => {
            d.genomeSprite.alpha = this.globalGenomesAlpha;
        });
    }

    updateGenomesLabelsDefaultAlpha() {
        this.supertree.hierarchy.leaves().forEach(d => {
            d.graphics.alpha = this.globalGenomeLabelAlpha;
        });
    }

    setUpNumericalSlidersFilters() {

        // LGT FILTERS
        for (let name in this.numericalLGTAttributes) {

            let id = name + "inputNumericFilter";

            let row = d3.select("#numericalLGTFilters")
                .append("div").attr("class", "row mt-2 mb-2");

            row.append("div").classed("col-md-3", true).append("p").text(name + ":");

            row.append("div").classed("col-md-8", true)
                .append("input")
                .attr("id", id)
                .attr("type", "text")
                .style("width", "100%")
                .style("height", "100%");

            let att = this.numericalLGTAttributes[name];
            let slider = $("#" + id).slider({
                id: id + "_slider",
                min: att.min,
                max: att.max,
                range: true,
                value: [att.selMin, att.selMax],
                ticks: att.values
            });

            slider.on('change', () => {
                let value = slider.data('slider').getValue();
                att.selMin = value[0];
                att.selMax = value[1];
                this.updateEdgesVisibilityByNumericLGTFilter();
            });
        }

        // GENES FILTERS
        for (let name in this.numericalGeneAttributes) {
            console.log("attribute gne name: ", name);

            let id = name + "inputNumericFilter";

            let row = d3.select("#numericalGenesFilters")
                .append("div").attr("class", "row mt-2 mb-2");

            row.append("div").classed("col-md-3", true).append("p").text(name + ":");

            row.append("div").classed("col-md-8", true)
                .append("input")
                .attr("id", id)
                .attr("type", "text")
                .style("width", "100%")
                .style("height", "100%");

            let att = this.numericalGeneAttributes[name];
            let slider = $("#" + id).slider({
                id: id + "_slider",
                min: att.min,
                max: att.max,
                range: true,
                value: [att.selMin, att.selMax],
                ticks: att.values
            });

            slider.on('change', () => {
                let value = slider.data('slider').getValue();
                att.selMin = value[0];
                att.selMax = value[1];
                this.updateEdgesVisibilityByNumericGeneFilter();

            });
        }
    }

    setUpGraphicalSlidersFilters() {
        let name = "alpha";
        let id = name + "inputNumericFilter";

        let row = d3.select("#visualAttributes")
            .append("div")
            .classed("row", true);


        row.append("div").classed("col-md-3", true)
            .append("p")
            .text(name + ":");

        row.append("div").classed("col-md-8", true)
            .append("input")
            .attr("id", id)
            .attr("type", "text")
            .style("width", "100%")
            .style("height", "100%");

        let slider = $("#" + id).slider({
            id: id + "_slider",
            min: 0,
            max: 1,
            step: 0.05,
            value: this.globalLGTsAlpha
        });

        slider.on('change', () => {
            // console.log("alpha changed");

            this.globalLGTsAlpha = slider.data('slider').getValue();
            this.updateLGTsDefaultAlpha();
        });

        /////////////////////////////////////////////////
        // alpha for genome boxes


    }

    setUpGenomeAlpha() {
        let name = "alpha-genomes";
        let id = name + "inputNumericFilter";

        let row = d3.select("#visualAttributes")
            .append("div")
            .classed("row", true);


        row.append("div").classed("col-md-3", true)
            .append("p")
            .text(name + ":");

        row.append("div").classed("col-md-8", true)
            .append("input")
            .attr("id", id)
            .attr("type", "text")
            .style("width", "100%")
            .style("height", "100%");

        let slider = $("#" + id).slider({
            id: id + "_slider",
            min: 0,
            max: 1,
            step: 0.05,
            value: this.globalGenomesAlpha
        });

        slider.on('change', () => {
            this.globalGenomesAlpha = slider.data('slider').getValue();
            this.updateGenomesDefaultAlpha();
        });
    }

    setUpGenomeLabelsAlpha() {
        let name = "alpha-genomes-labels";
        let id = name + "inputNumericFilter";

        let row = d3.select("#visualAttributes")
            .append("div")
            .classed("row", true);


        row.append("div").classed("col-md-3", true)
            .append("p")
            .text(name + ":");

        row.append("div").classed("col-md-8", true)
            .append("input")
            .attr("id", id)
            .attr("type", "text")
            .style("width", "100%")
            .style("height", "100%");

        let slider = $("#" + id).slider({
            id: id + "_slider",
            min: 0,
            max: 1,
            step: 0.05,
            value: this.globalGenomesAlpha
        });

        slider.on('change', () => {
            this.globalGenomeLabelAlpha = slider.data('slider').getValue();
            this.updateGenomesLabelsDefaultAlpha();
        });
    }

    _setUpColorSelectionMenu() {
        let row = d3.select("#visualAttributes").append("div")
            .classed("row", true);

        row.append("div").classed("col-md-3", true)
            .append("p")
            .text("Edges' color:");

        // <select name="carlist" form="carform">
        //   <option value="volvo">Volvo</option>
        //   <option value="saab">Saab</option>
        //   <option value="opel">Opel</option>
        //   <option value="audi">Audi</option>
        // </select>
        let select = row.append("div").classed("col-md-8", true)
            .append("select")
            .attr("id", "color-selection")
            .style("width", "100%")
            .style("height", "100%");

        for (let name in this.numericalLGTAttributes) {
            select.append("option").attr('value', name).text(name);
        }
        select.on('change', (d) => {
            this.selectedColorAttribute = select.node().value; // attribute name
        });

    }

    set selectedColorAttribute(name) {
        this.selectedColorAttributeName = name;
        this.updateLGTsColor();
    }

    updateLGTsColor() {
        let name = this.selectedColorAttributeName;
        let colorScale = d3.scaleLinear()
            .domain([this.numericalLGTAttributes[name].min, d3.median(this.numericalLGTAttributes[name].values), this.numericalLGTAttributes[name].max]).interpolate(this.colorLGTColorInterpolation)
            .range(this.colorLGTrange);

        let count = 0;
        LineSprite.resetCanvas();
        this.supertree.lgts.forEach(function (e) {
            e.lateralEdgeSprite.color = colorToHex(rgbToHex(colorScale(parseFloat(e.attributes[name].value))));
            // if (count < 10){                
            //     console.log("color ", colorToHex(rgbToHex(colorScale(parseFloat(e.attributes[name].value)))));
            //     count+=1;
            // }
        });
        //this._lgts_container.updateTransform();        
    }

    highlightLeaves(names) {
        this.supertree.hierarchy.leaves().forEach(function (d) {
            if (names.includes(d.data.name)) {
                d.graphics.setSelected(true);
            } else {
                d.graphics.setSelected(false);
            }
        });
    }

    highlightLeavesFromGenes(genes) {
        for (let i in genes) {
            this.highlightLeaves(this.supertree.forest[genes[i]].species);
        }
    }

    ////// main gene filter methods //////
    updateLGTsVisibilityByGeneFilter(gene) {
        this.supertree.lgts.forEach((d) => {
            if (d.genes.includes(gene)) {
                d.lateralEdgeSprite.selected = true;
                d.lateralEdgeSprite.sprite.visible = true;
            } else {
                d.lateralEdgeSprite.selected = false;
            }
        });
    }

    filterLGTsFromGenes(genes) {
        for (let i in genes) {
            this.updateLGTsVisibilityByGeneFilter(genes[i]);
        }
    }

    _addGeneAttributeNumberOfGenomes() {
        let values = new Set();

        let name = "N_Genomes";

        for (let gene_index in this.supertree.forest) {
            let gene = this.supertree.forest[gene_index];
            let value = Object.values(this.supertree.getGroupsDistribution(gene_index)).reduce(function (a, b) {
                return a + b;
            });

            values.add(value);
            gene.attributes[name] = {
                'type': 'numeric_list_at_least',
                'value': value
            };
        }

        this._addNumericalGeneAttribute(name, [...values]);
    }

    updateEdgesVisibilityByNumericGeneFilter() {
        this._selected_genes = [];

        for (let gene_index in this.supertree.forest) {
            let gene = this.supertree.forest[gene_index];
            let selected = true;
            for (let name in this.numericalGeneAttributes) {
                if (gene.attributes[name].value < this.numericalGeneAttributes[name].selMin ||
                    gene.attributes[name].value > this.numericalGeneAttributes[name].selMax) {
                    selected = false;
                    break;
                }
            }
            gene.filtered = selected;
        }

        this.supertree.lgts.forEach(lgt => {
            lgt.enabled = lgt.genes_array.some(gene => {
                return this.supertree.forest[gene].filtered;
            });
        });

        this.updateEdgesVisibilityByNumericLGTFilter();
    }

    _entropy(prob_vector) {
        let entropy = 0;
        for (let i = 0; i < prob_vector.length; i++) {
            if (prob_vector[i] > 0) {
                entropy += prob_vector[i] * Math.log2(prob_vector[i]);
            }
        }
        return -1 * entropy;
    }

    _addAttributeGenesScores() {
        // create genes' scores        
        //console.log('genes', genes);
        let scores = {};
        let values_mean = new Set();
        let values_max_min = new Set();
        let values_entropy = new Set();
        let values_std = new Set();

        let name_mean = "class_Mean";
        let name_std = "class_Std";
        let name_max_min = "class_MaxMin";
        let name_entropy = "class_Entropy_10";

        for (let gene_index in this.supertree.forest) {
            let gene = this.supertree.forest[gene_index];

            let distr_values = Object.values(this.supertree.getGroupsDistribution(gene_index));

            let total = distr_values.reduce(function (a, b) {
                return a + b;
            });

            let probs = [];

            for (let i = 0; i < distr_values.length; i++) {
                probs.push(distr_values[i] / total);
            }
            if (gene_index < 5) {
                console.log("classes", d3.max(distr_values), d3.min(distr_values));
                console.log("probs", probs);
            }

            let mean = total / distr_values.length;
            values_mean.add(mean);

            let max_min = d3.max(distr_values) - d3.min(distr_values);
            values_max_min.add(max_min);

            let entropy = Math.trunc(10 * this._entropy(probs));
            values_entropy.add(entropy);

            let std = d3.deviation(distr_values);
            values_std.add(std);

            gene.attributes[name_mean] = {
                'type': 'numeric',
                'value': mean
            };

            gene.attributes[name_max_min] = {
                'type': 'numeric',
                'value': max_min
            };

            gene.attributes[name_entropy] = {
                'type': 'numeric',
                'value': entropy
            };

            gene.attributes[name_std] = {
                'type': 'numeric',
                'value': std
            };
        }

        console.log(values_entropy, values_max_min, values_mean);
        this._addNumericalGeneAttribute(name_entropy, [...values_entropy]);
        this._addNumericalGeneAttribute(name_max_min, [...values_max_min]);
        this._addNumericalGeneAttribute(name_mean, [...values_mean]);
        this._addNumericalGeneAttribute(name_std, [...values_std]);
    }

    listGenes(genes) {
        let text = d3.select("#gene_list")
            .selectAll('p')
            .data(genes);

        text.exit().remove();

        text.enter().append('p');

        text.text(function (d) {
                return d;
            })
            .on("click", (d) => {
                this.highlightLeavesFromGenes([d]);
                this.filterLGTsFromGenes([d]);
            });
    }

    _setUpGenomeBars() {
        let container = this._diagram_container;
        let superTreeView = this;
        console.log("number of leaves", this.supertree.hierarchy.leaves().length);
        this.supertree.hierarchy.leaves().forEach(function (d) {
            d.genomeSprite = new GenomeSprite(container, d, superTreeView);
        });
    }

    get groupsColorMap() {
        return this._treeGroupColorMap;
    }

    addSearchBox(){

        // $('#exact').click(function () {
        //     search('#search_text');
        // });
    
        // $('#search_text')[0].oninput = function () {
        //     search('#search_text');
        // };
    
        // $('#find').click(function () {
        //     search('#search_text')
        // });
        // $('#keep').click(keep);
        // $('#clear').click(function(){clear_visibility(true)});
    
    }

}