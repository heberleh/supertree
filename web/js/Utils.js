
// <!-- Copyright 2011 Jason Davies https://github.com/jasondavies/newick.js -->
function parseNewick(a) {
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
        var n = s[t];
        switch (n) {
            case "(":
                var c = {};
                r.branchSet = [c], e.push(r), r = c;
                break;
            case ",":
                var c = {};
                e[e.length - 1].branchSet.push(c), r = c;
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

function colorToHex(c){    
    return parseInt(c.slice(1), 16);
};

function rgbToHex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
     ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
     ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function project(x, y) {
    let angle = (x - 90) / 180 * Math.PI;
    return [y * Math.cos(angle), y * Math.sin(angle), angle]; //new x, new y, angle
}

function anyIntersection(a,b){   
    for(let e of a){              
        if (b.has(e)){           
            return true;
        }
    }
    return false;
}