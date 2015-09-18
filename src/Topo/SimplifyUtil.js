/**
 * 简化图形工具
 * @class maptalks.Simplify
 * @author mourner
 * @link https://github.com/mourner/simplify-js
 */
Z.Simplify={
	// square distance between 2 points
    getSqDist:function(p1, p2) {

        var dx = p1['left'] - p2['left'],
            dy = p1['top'] - p2['top'];

        return dx * dx + dy * dy;
    },

    // square distance from a point to a segment
    getSqSegDist:function(p, p1, p2) {

        var x = p1['left'],
            y = p1['top'],
            dx = p2['left'] - x,
            dy = p2['top'] - y;

        if (dx !== 0 || dy !== 0) {

            var t = ((p['left'] - x) * dx + (p['top'] - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2['left'];
                y = p2['top'];

            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p['left'] - x;
        dy = p['top'] - y;

        return dx * dx + dy * dy;
    },
    // rest of the code doesn't care about point format

    // basic distance-based simplification
    simplifyRadialDist:function(points, sqTolerance) {

        var prevPoint = points[0],
            newPoints = [prevPoint],
            point;

        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];

            if (this.getSqDist(point, prevPoint) > sqTolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) newPoints.push(point);

        return newPoints;
    },

    simplifyDPStep:function(points, first, last, sqTolerance, simplified) {
        var maxSqDist = sqTolerance,
            index;

        for (var i = first + 1; i < last; i++) {
            var sqDist = this.getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) this.simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) this.simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    },

    // simplification using Ramer-Douglas-Peucker algorithm
    simplifyDouglasPeucker:function(points, sqTolerance) {
        var last = points.length - 1;

        var simplified = [points[0]];
        this.simplifyDPStep(points, 0, last, sqTolerance, simplified);
        simplified.push(points[last]);

        return simplified;
    },

    // both algorithms combined for awesome performance
    simplify:function(points, tolerance, highestQuality) {

        if (points.length <= 2) return points;

        var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

        points = highestQuality ? points : this.simplifyRadialDist(points, sqTolerance);
        points = this.simplifyDouglasPeucker(points, sqTolerance);

        return points;
    }
};