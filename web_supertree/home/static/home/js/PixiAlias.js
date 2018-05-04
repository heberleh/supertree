// PIXI Alias
let Text = PIXI.Text;
let Graphics = PIXI.Graphics;

function colorToHex(c){    
    return parseInt(c.slice(1), 16);
};


function createCircle(root, x, y, radius, color = 0x9966FF) {
    let circle = new Graphics();
    circle.beginFill(color);
    circle.drawCircle(x, y, radius);
    circle.endFill();
    root.addChild(circle);
    return circle;
}

function createLine(root, x0, y0, x1, y1, line_width=1, color = 0x9966FF, alpha=1) {
    let line = new Graphics();
    line.lineStyle(line_width, color, alpha);
    line.moveTo(x0, y0);
    line.lineTo(x1, y1);
    root.addChild(line);
    return line;
}

function createLeafText(root, txt, x, y, style={fontFamily : 'Arial', fontSize: 10, fill : 0xff1010, align : 'center'}){
    let message = new Text(txt,style);
    message.position.set(x,y);
    root.addChild(message);
}

// testing https://jsfiddle.net/henryheberle/9cn7s82u/
function project(x, y) {
    let angle = (x - 90) / 180 * Math.PI;
    return [y * Math.cos(angle), y * Math.sin(angle), angle];
}

function createLGTEdge(root, x0, y0, x1, y1, line_width=1., color = 0x9966FF, alpha=0.5){
    let p0 = project(x0, y0);
    let p1 = project(x1, y1);
    let line = new Graphics();
    line.lineStyle(line_width, color, alpha);  
    line.moveTo(p0[0], p0[1]);                  
    line.lineTo(p1[0], p1[1]); // source point    
    line.endFill();
    //line.hitArea = line; 
    line.interactive = true;
    line.hitArea = line.getBounds();
    line.on('mouseover', function() {
        console.log("over");
        line.lineStyle(line_width, color, 1); 
    });

    line.on('mouseout', function() {
        console.log("out");
        line.alpha = alpha;
    });    
    
    root.addChild(line);
    return line;
}

function createTreeEdge(root, x0, y0, x1, y1, line_width=1.5, color = 0x9966FF, alpha=1){
    let p0 = project(x0, y0);
    let p1 = project(x1, y1);
    let line = new Graphics();
    line.lineStyle(line_width, color, alpha);  
    line.moveTo(p0[0], p0[1]);
    // create an arc
    // (cx, cy, radius, startAngle, endAngle, anticlockwise)  
    if (p0[0] !== p1[0]){
        if(x1 > x0 ) {
            line.arc(0, 0, y0, p0[2], p1[2]);
        }else{
            line.arc(0, 0, y0, p0[2], p1[2], true);
        }        
    }                        
    line.lineTo(p1[0], p1[1]); // source point   
    line.endFill(); 
    root.addChild(line);
    return line;
}

// return "M" + y0 * c0 + "," + y0 * s0 +

// // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
// rx = y0

// C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
//     const currX = x;
//     const currY = y;
//     this.bezierCurveTo(
//         currX + command.cp1.x,
//         currY + command.cp1.y,
//         currX + command.cp2.x,
//         currY + command.cp2.y,
//         x = command.end.x,
//         y = command.end.y
//     );
// break;
    // // A y0,y0 0 0 1 y0*c1,y0*s1
    // // A y0,y0 0 0 0 y0*c1,y0*s1
    // (x1 === x0 ? "" : "A" + y0 + "," + y0 + " 0 0 " + 
    // (x1 > x0 ? 1 : 0) + " " + y0 * c1 + "," + y0 * s1) +

    // "L" + y1 * c1 + "," + y1 * s1;