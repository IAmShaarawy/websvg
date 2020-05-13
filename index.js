const NONE = 1
const CHAMFER = 2
const FILLET = 3
let points = [
    { x: 100, y: 400, r: 10, type: NONE },
    { x: 100, y: 100, r: 80, type: FILLET },
    { x: 400, y: 100, r: 80, type: CHAMFER },
    { x: 400, y: 400, r: 50, type: FILLET },
    { x: 800, y: 200, r: 50, type: FILLET }];

function formPath(points) {

    var result = "";
    for (let i = 0; i < points.length; i++) {

        const currentPoint = points[i];

        if (i == 0) {
            result = result.concat(formStartPoint(currentPoint), " ");
            continue;
        }

        if (i == points.length - 1) {
            result = result.concat(formLine(currentPoint))
            continue;
        }

        if (currentPoint.type == NONE) {
            result = result.concat(formLine(currentPoint), " ")
            continue;
        }

        const prePoint = points[i - 1]
        const nextPoint = points[i + 1]

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

        throw `The current point type ${currentPoint.type} is not handled`
    }
    return result;
}

function formStartPoint(point) {
    return `M${point.x} ${point.y}`;
}

function formLine(point) {
    return `L${point.x} ${point.y}`;
}

function formatArc(p, radius, sweep) {
    return `A ${radius} ${radius} 0 0 ${sweep} ${p.x} ${p.y}`
}

function isValidChamferFillet(prePoint, currentPoint, nextPoint) {

    var preTotalradius = prePoint.r + currentPoint.r
    var nextTotalradius = currentPoint.r + nextPoint.r;

    const preTotalDistance = distanceBetweenTwoPoints(prePoint, currentPoint)
    const nextTotalDistance = distanceBetweenTwoPoints(currentPoint, nextPoint)

    const preRatio = (preTotalDistance - preTotalradius) / preTotalDistance
    const nextRatio = (nextTotalDistance - nextTotalradius) / nextTotalDistance

    return preRatio >= 0 && preRatio <= 1 && nextRatio >= 0 && nextRatio <= 1

}

function formChamfer(prePoint, currentPoint, nextPoint) {
    const startPoint = pointBetweenTwoPoints(prePoint, currentPoint, currentPoint.r)
    const endPoint = pointBetweenTwoPoints(nextPoint, currentPoint, currentPoint.r)
    return formLine(startPoint).concat(" ", formLine(endPoint))
}

function formFillet(prePoint, currentPoint, nextPoint) {
    const angle = angleBetweenTwoLines(prePoint, currentPoint, nextPoint)

    //this condition to avoid Fillet in straight lines
    if (angle == 180 || angle == 0) {
        return formLine(currentPoint)
    }

    const startPoint = pointBetweenTwoPoints(prePoint, currentPoint, currentPoint.r)
    const endPoint = pointBetweenTwoPoints(nextPoint, currentPoint, currentPoint.r)
    const isReversed = angle < 180 ? 0 : 1

    return formLine(startPoint).concat(" ", formatArc(endPoint, currentPoint.r, isReversed))
}

function angleBetweenTwoLines(line1Start, intersect, line2End) {
    let radian = Math.atan2(intersect.y - line2End.y, intersect.x - line2End.x) - Math.atan2(intersect.y - line1Start.y, intersect.x - line1Start.x);

    while (radian > Math.PI * 2) {
        radian = radian - (Math.PI * 2)
    }

    while (radian < 0) {
        radian = radian + (Math.PI * 2)
    }

    return Math.round(radian * (180 / Math.PI))
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
    return { x: newX, y: newY, ratio: ratio }
}

document.getElementById("pathId").setAttribute('d', formPath(points))