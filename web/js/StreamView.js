class StreamView {

    constructor(stream) {
        this._stream = stream;
        this._setUpDiagram();
        
        var maxValue = 0;
        this._selectedLabel = null;
        for (let label in stream.max_values){
            if (maxValue < stream.max_values[label]){
                maxValue = stream.max_values[label];
                this._selectedLabel = label;
            }
        }

        //this._sortByLabel(this._stream.data, this._selectedLabel);
        this._data = this._stream.data;
        this._setUpStack(this._data);
        this._chart(this._data);
    }


    _sortByLabel(data, attr){             
        data.sort(function(a,b){
            return ((a[attr] > b[attr]) ? -1 : ((a[attr] == b[attr]) ? 0 : 1));
        });        
    }

    _setUpStack(data){        
        var keys = this._stream.groupsLabels;
        var stack = d3.stack()
                    .keys(keys)
                    .order(d3.stackOrderInsideOut)
                    .offset(d3.stackOffsetSilhouette);
        this._series = stack(data);        
    }

    _filterByLabel(data, attr){
        var new_data = [];
        for (let i in data){        
            if(data[i][attr] > 0){
                new_data.push(data[i]);            
            }                
        }
        return new_data;
    }

    _setUpDiagram(){

        var width = document.getElementById('container').offsetWidth;
        width = width * .9;
        var plotSvg = document.getElementById('plotSvg');
        plotSvg.setAttribute("width", width);
        var height = Math.round(width / 2);
        plotSvg.setAttribute("height", height);

        this._svg = d3.select("#plotSvg");
        this._margin = {
                top: 100,
                right: 80,
                bottom: 200,
                left: 0
            };
        this._width = width - this._margin.left - this._margin.right,
        this._height = height - this._margin.top - this._margin.bottom;
    }

    _chart(data) {
        var keys = this._stream.groupsLabels;
        var max_values = this._stream.max_values;
        var svg = this._svg;
        var height = this._height;
        var width = this._width;
        var series = this._series;
        var margin = this._margin;

        svg.selectAll("*").remove();
        this._g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleLinear()
            .domain(d3.extent(data, function (d,i) {
                return i;
            }))
            .range([0, width]);

        var xAxis = d3.axisBottom(x);


        var min_y = d3.min(series, function (layer) {
            return d3.min(layer, function (d) {
                return d[0];
            });
        });
        var max_y = d3.max(series, function (layer) {
            return d3.max(layer, function (d) {
                return d[1];
            });
        });
        var y = d3.scaleLinear().domain([min_y,max_y]).range([height, 0]);;


        var z = d3.scaleOrdinal()
            .range(d3.schemeCategory10);

        var area = d3.area()
            .x(function (d,i) {                
                return x(i);
            })
            .y0(function (d) {
                return y(d[0]);
            })
            .y1(function (d) {
                return y(d[1]);
            })
            .curve(d3.curveBasis);

        this._g.selectAll("path")
            .data(series)
            .enter().append("path")
            .attr("d", area)
            .style("fill", function (d,i) {
                return z(keys[i]);
            });

        this._g.append("g")
            .call(xAxis);

        this._g.append("text")
            .attr("transform", "translate(" + 0 + "," + (height + margin.bottom / 2) + ")")
            .attr("font-size", 15)
            .attr("font-family", "sans-serif")
            .text("Stream graph of genes distributions.");

        z.domain(keys);
        var legend = this._g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width + 55)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z)
            .on("click", (d)=>{
                this._selectedLabel = d;                
                this._data = this._filterByLabel(this._data, d);                
                this._sortByLabel(this._data, d);
                this._setUpStack(this._data);
                this._chart(this._data);
            });

        legend.append("text")
            .attr("x", width + 50)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) {
                return d;
            });

    }
}