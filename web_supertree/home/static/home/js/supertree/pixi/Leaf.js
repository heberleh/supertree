
//"rotate(" + (d.x - 90) + ")translate(" + (this._innerRadius + 4) + ",0)" +
//                                            (d.x < 180 ? "" :"rotate(180)");
// testing https://jsfiddle.net/henryheberle/9cn7s82u/

class Leaf extends Text{

    constructor(container, d){        
        let style = {fontFamily : 'Arial', fontSize: 10, fill : d.color, align : 'center'};
        super(d.data.name, style);        
        var p = project(d.x, d.y);
        this.rotation += p[2];
        this.x = p[0];
        this.y = p[1];
        container.addChild(this);
    }

}

// function createLeafText(root, txt, x){
//     let message = new Text(txt,style);
//     message.position.set(x,y);
//     root.addChild(message);
//     // setTransform (x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY)
//     message.setTransform (x-90, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY);
//     return message;
// }

// .attr("dy", ".31em")
// .attr("transform", (d) => {
//     return "rotate(" + (d.x - 90) + ")translate(" + (this._innerRadius + 4) + ",0)" + (d.x < 180 ? "" :
//         "rotate(180)");
// })
// .attr("text-anchor", function (d) {
//     return d.x < 180 ? "start" : "end";
// })



