const NONE = 'none'
const CHAMFER = 'chamfer'
const FILLET = 'fillet'


function formPath(points) {

    var result = "";
    for (let i = 0; i < points.length; i++) {

        const currentPoint = points[i];

        if (![NONE, CHAMFER, FILLET].includes(currentPoint.type)) {
            throw `The current point type ${currentPoint.type} is not handled`
        }

        // if (i == points.length - 1) {
        //     result = result.concat(formLine(currentPoint))
        //     continue;
        // }

        if (currentPoint.type == NONE) {
            result = result.concat(formLine(currentPoint), " ")
            continue;
        }

        const prePoint = i == 0 ? points[points.length - 1] : points[i - 1]
        const nextPoint = i < points.length - 1 ? points[i + 1] : points[0]

        if (i == 0) {
            result = result.concat(formInitPoint(prePoint, currentPoint, nextPoint), " ")
            continue;
        }

        if (!isValidChamferFillet(prePoint, currentPoint, nextPoint)) {
            result = result.concat(formLine(currentPoint), " ")
            continue;
        }

        if (currentPoint.type == CHAMFER) {
            result = result.concat(formChamfer(prePoint, currentPoint, nextPoint), " ")
            continue
        }

        if (currentPoint.type == FILLET) {
            result = result.concat(formFillet(prePoint, currentPoint, nextPoint), " ")
            continue
        }
    }
    console.log(result);

    return result.concat(" Z");
}

function formStartPoint(point) {
    return `M${point.x} ${point.y}`;
}

function formLine(point) {
    return `L${point.x} ${point.y}`;
}

function formatArc(p, radius, sweep) {
    return `A${radius} ${radius} 0 0 ${sweep} ${p.x} ${p.y}`
}

function isValidChamferFillet(prePoint, currentPoint, nextPoint) {
    const tangentLength = tangentLinesLength(prePoint, currentPoint, nextPoint)
    return tangentLength
}

function formInitPoint(prePoint, currentPoint, nextPoint) {
    if (currentPoint.type == NONE) {
        return formStartPoint(currentPoint)
    }
    const touchPoints = touchCirclePoints(prePoint, currentPoint, nextPoint)
    const startPoint = touchPoints[0]
    const endPoint = touchPoints[1]

    if (currentPoint.type == CHAMFER) {
        return formStartPoint(startPoint).concat(" ", formLine(endPoint))
    }

    if (currentPoint.type == FILLET) {
        const isReversed = isArcReversed(prePoint, currentPoint, nextPoint) > 0 ? 0 : 1
        return formStartPoint(startPoint).concat(" ", formatArc(endPoint, currentPoint.r, isReversed))
    }

}

function formChamfer(prePoint, currentPoint, nextPoint) {
    const touchPoints = touchCirclePoints(prePoint, currentPoint, nextPoint)
    const startPoint = touchPoints[0]
    const endPoint = touchPoints[1]
    return formLine(startPoint).concat(" ", formLine(endPoint))
}

function formFillet(prePoint, currentPoint, nextPoint) {
    const angle = angleBetweenTwoLines(prePoint, currentPoint, nextPoint)

    //this condition to avoid Fillet in straight lines
    if (angle == 180 || angle == 0) {
        return formLine(currentPoint)
    }

    const touchPoints = touchCirclePoints(prePoint, currentPoint, nextPoint)
    const startPoint = touchPoints[0]
    const endPoint = touchPoints[1]

    const isReversed = isArcReversed(prePoint, currentPoint, nextPoint) > 0 ? 0 : 1

    return formLine(startPoint).concat(" ", formatArc(endPoint, currentPoint.r, isReversed))
}

function isArcReversed(prePoint, currentPoint, nextPoint) {
    if (currentPoint.r == 30) {
        console.log(prePoint.x - currentPoint.x > 0);
        console.log(currentPoint.y - prePoint.y > 0);
        console.log(currentPoint.x - nextPoint.x > 0);

    }


    return prePoint.x - currentPoint.x > 0 || currentPoint.y - prePoint.y > 0 || currentPoint.x - nextPoint.x > 0
}

function angleBetweenTwoLines(line1Start, intersect, line2End) {
    const angle = radianAngle(line1Start, intersect, line2End) * (180 / Math.PI)
    return angle;
}

function radianAngle(A, B, C) {
    var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

function distanceBetweenTwoPoints(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function pointBetweenTwoPoints(p1, p2, d) {
    const distance = distanceBetweenTwoPoints(p1, p2)
    const newDistance = distance - d
    const ratio = newDistance / distance
    const newX = ((1 - ratio) * p1.x) + (ratio * p2.x)
    const newY = ((1 - ratio) * p1.y) + (ratio * p2.y)
    return { x: newX, y: newY }
}

function tangentLinesLength(line1Start, intersect, line2End) {
    const angle = radianAngle(line1Start, intersect, line2End)
    if (angle == 0 || angle == Math.PI) {
        return 0
    }
    return intersect.r / Math.abs(Math.tan(angle / 2))
}

function touchCirclePoints(line1Start, intersect, line2End) {
    const tangentLength = tangentLinesLength(line1Start, intersect, line2End);
    return [
        pointBetweenTwoPoints(line1Start, intersect, tangentLength),
        pointBetweenTwoPoints(line2End, intersect, tangentLength)
    ]
}

let points = [
    { x: 100, y: 400, r: 30, type: FILLET },
    { x: 100, y: 100, r: 10, type: FILLET },
    { x: 400, y: 100, r: 20, type: FILLET },
    { x: 400, y: 300, r: 100, type: FILLET },
    { x: 600, y: 400, r: 40, type: FILLET },
    { x: 700, y: 200, r: 50, type: FILLET },
    { x: 1000, y: 400, r: 30, type: FILLET },
];

let points1 = [{ x: 800, y: 200, r: 100, type: FILLET },
{ x: 800, y: 800, r: 25, type: FILLET },
{ x: 850, y: 250, r: 100, type: FILLET }]

let points2 = [
    { x: 100, y: 300, r: 10, type: FILLET },
    { x: 0, y: 0, r: 50, type: FILLET },
    { x: 300, y: 100, r: 80, type: FILLET }]

let points3 = [
    { x: 0, y: 100, r: 0, type: FILLET },
    { x: 0, y: 200, r: 20, type: FILLET },
    { x: 100, y: 20, r: 10, type: FILLET },
    { x: 100, y: 0, r: 50, type: FILLET },]


let points4 = [{ x: 0, y: 50, r: 10, type: 'fillet' },
{ x: 0, y: 120, r: 50, type: FILLET },
{ x: 100, y: 20, r: 10, type: FILLET },
{ x: 100, y: 0, r: 50, type: FILLET },]



const runPoints = points
document.getElementById("pathId").setAttribute('d', formPath(runPoints))
// document.getElementById("helperPath").setAttribute('d', formPath(runPoints.map((i) => {
//     i.type = NONE
//     return i
// })))
// document.getElementById("pathId").setAttribute('d', "M200,300 Q400,50 600,300")