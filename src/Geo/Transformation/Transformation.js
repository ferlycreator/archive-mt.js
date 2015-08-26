/**
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
        var x_ = x*matrix[0]+y*matrix[2]+matrix[4];
        var y_ = x*matrix[1]+y*matrix[3]+matrix[5];
        return [x_*scale, y_*scale];
    },

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
        var x_ = x/matrix[0]+y/matrix[2]-matrix[4];
        var y_ = x/matrix[1]+y/matrix[3]-matrix[5];
        return [x_/scale, y_/scale];
    }
}