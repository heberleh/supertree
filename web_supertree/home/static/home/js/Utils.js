
// <!-- Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js -->
function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
        var n = s[t];
        switch (n) {
            case "(":
                var c = {};
                r.branchset = [c], e.push(r), r = c;
                break;
            case ",":
                var c = {};
                e[e.length - 1].branchset.push(c), r = c;
                break;
            case ")":
                r = e.pop();
                break;
            case ":":
                break;
            default:
                var h = s[t - 1];
                ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n))
        }
    }
    return r
}


function lgtLine(d){
    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
}

function lgtLine(d){
    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
}

//  lgtLineC(d.target.x, d.target.y, d.target.x, this._innerRadius);
// Like d3.svg.diagonal.radial, but with square corners.
function lgtLineC(startAngle, startRadius, endAngle, endRadius) {
    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
        s0 = Math.sin(startAngle),

        c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
        s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0 +
           "L" + endRadius * c1 + "," + endRadius * s1;
}