/**
 * @class maptalks.Transformation
 * Class for Affine Transformation: transformation between projected coordinates and screen points.
 * Change the matrix for translate / rotate / scale effects.
 * parameter matrix is a 6-number array, for example:[0, 1, 1, 0, 3, 4].
 * the first 4 is the 2*2 2-dimension affine transformation matrix, such as:
 *                0  1
 *                1  0
 * the last 2 is the x, y offset, for example
 *                0  1
 *                1  0
 *                3  4
 * usually it can be regulated to a 3*3 matrix:
 *                0  1  0
 *                1  0  0
 *                3  4  1
 */
Z.Transformation = function(matrix) {
    this.matrix = matrix;
};

Z.Transformation.prototype = {
    /**
     * prj coordinate -> point
     * @member maptalks.Transformation
     */
    transform : function(coordinates, scale) {
        var matrix = this.matrix;
        var x,y;
        if (Z.Util.isArray(coordinates)) {
            x = coordinates[0];
            y = coordinates[1];
        } else {
            x = coordinates.x;
            y = coordinates.y;
        }
        // affine transformation
        var x_ = (x*matrix[0]+matrix[2])/scale;
        var y_ = (y*matrix[1]+matrix[3])/scale;
        return [x_, y_];
    },

    /**
     * point -> prj coordinate
     * @member maptalks.Transformation
     */
    untransform : function(point, scale) {
        var matrix = this.matrix;
        var x,y;
        if (Z.Util.isArray(point)) {
            x = point[0];
            y = point[1];
        } else {
            x = point.x;
            y = point.y;
        }
        //inverse matrix
        var x_ = (x*scale-matrix[2])/matrix[0];
        var y_ = (y*scale-matrix[3])/matrix[1];
        return [x_, y_];
    }
};
