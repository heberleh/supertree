
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





////////////////// STREAMGRAPH FUNCTIONS //////////////////////
// Check breakpoint
function breakCalc(x) {
    x <= 480 ? y = 'xs' : y = 'md';
    return y;
}

var breakpoint = breakCalc($(window).width());

$(window).resize(function () {
    var breakpoint = breakCalc($(window).width());
})

// change the height of the chart depending on the breakpoint
function breakHeight(bp) {
    bp == 'xs' ? y = 250 : y = 500;
    return y;
}

// function to group by multiple properties in underscore.js
_.groupByMulti = function (obj, values, context) {
    if (!values.length)
        return obj;
    var byFirst = _.groupBy(obj, values[0], context),
        rest = values.slice(1);
    for (var prop in byFirst) {
        byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
    }
    return byFirst;
};

// function to decide whether to pluralize the word "award" in the tooltip
function awardPlural(x) {
    x == 1 ? y = 'award' : y = 'awards';
    return y;
}

// funciton to determine the century of the datapoint when displaying the tooltip
function century(x) {
    x < 100 ? y = '19' + x : y = '20' + (x.toString().substring(1));
    return y;
}

// function to ensure the tip doesn't hang off the side
function tipX(x) {
    var winWidth = $(window).width();
    var tipWidth = $('.tip').width();
    if (breakpoint == 'xs') {
        x > winWidth - tipWidth - 20 ? y = x - tipWidth : y = x;
    } else {
        x > winWidth - tipWidth - 30 ? y = x - 45 - tipWidth : y = x + 10;
    }
    return y;
}