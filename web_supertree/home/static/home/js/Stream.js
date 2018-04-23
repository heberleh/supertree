


class Stream{

    constructor(data){
        // read the file
        this._data = this._parse(data);
        // parse the file...

        // return data.
    }

    _parse(data) {

        // this filters and groups the data
        // based on the filters provided in the .chart div (see the html file)
        var filter;
        var searchObj = {};
        searchObj[column] = filterBy;

        if (column == "none") {
            filter = data;
        } else {
            filter = _.where(data, searchObj);
        }

        var categories = _.chain(filter)
            .countBy(groupBy)
            .pairs()
            .sortBy(1).reverse()
            .pluck(0)
            .value();

        var sort = _.sortBy(filter, categories);

        // group by
        var group = _.groupByMulti(sort, ['year', groupBy])

        var newData = [];

        // it is necessary to add an extra year to the data (as well as duplicate the data for the final year)
        // so that the chart does not get cut off on the right side
        for (var i = 1954; i < 2018; i++) {

            var currYear = group[i];

            // no data for a year
            if (currYear == undefined) {
                currYear = {};
            }

            categories.forEach(function (area) {

                var obj = {};
                if (currYear[area] == undefined) {
                    // if the year does not have any in a particular category
                    obj.key = area;
                    obj.value = 0;
                    obj.date = moment(i.toString())._d;
                } else {
                    obj.key = currYear[area][0][groupBy];
                    obj.value = currYear[area].length;
                    obj.date = moment(currYear[area][0].year)._d;
                }

                newData.push(obj);
            });

        }

        data = newData; // you could just return newData, but this way seems cleaner to me
        return data;
    }
}