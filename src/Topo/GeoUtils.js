/**
 * 空间计算工具类
 * @class maptalks.GeoUtils
 * @author Maptalks Team
 */
Z['GeoUtils']=Z.GeoUtils={
    /**
     *
     * @param {maptalks.Point} p
     * @param {maptalks.Point} p1
     * @param {maptalks.Point} p2
     */
    distanceToSegment: function(p, p1, p2) {
        var x = p.left,
            y = p.top,
            x1 = p1.left,
            y1 = p1.top,
            x2 = p2.left,
            y2 = p2.top;

        var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
        if (cross <= 0) {
            // P->P1
            return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        }
        var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (cross >= d2) {
            // P->P2
            return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
        }
        var r = cross / d2;
        var px = x1 + (x2 - x1) * r;
        var py = y1 + (y2 - y1) * r;
        // P->P(px,py)
        return Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
    },

    /**
     * 判断点坐标是否在面中
     * @param {maptalks.Polygon} 面对象
     * @param {maptalks.Coordinate} 点对象
     * @return {Boolean} true：点在面中
     */
    pointInsidePolygon: function(p, points) {
        var i, j, p1, p2,
            len = points.length;
        var c = false;

        for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];

            if (((p1.top > p.top) !== (p2.top > p.top)) &&
                (p.left < (p2.left - p1.left) * (p.top - p1.top) / (p2.top - p1.top) + p1.left)) {
                c = !c;
            }
        }

        return c;
    },

    _isPointOnPath:function(point, geo, tolerance) {
            //检查类型
            if(!point || !geo){
                return -1;
            }
            if (Z.Util.isNil(tolerance)) {
                tolerance = 0;
            } else {
                tolerance = Math.abs(tolerance);
            }
            //首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
            var extent = geo._getPrjExtent();
            extent = Z.Extent.expand(extent,tolerance);
            if(!this.isPointInRect(point, extent)){
                return -1;
            }
            var pts = geo._getPrjPoints();
            //判断点是否在线段上，设点为Q，线段为P1P2 ，
            //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
            //var pts = polyline.getPath();
            for(var i = 0; i < pts.length - 1; i++){
                var curPt = pts[i];
                var nextPt = pts[i + 1];
                var cond_x = (point.x >= Math.min(curPt.x, nextPt.x)-tolerance && point.x <= Math.max(curPt.x, nextPt.x)+tolerance),
                    cond_y = (point.y >= Math.min(curPt.y, nextPt.y)-tolerance && point.y <= Math.max(curPt.y, nextPt.y)+tolerance);
                var precision = null;
                if (curPt.x === nextPt.x) {
                    if (cond_y) {
                        precision = curPt.x - point.x;
                    }
                } else if (curPt.y === nextPt.y) {
                    if (cond_x) {
                        precision = curPt.y - point.y;
                    }
                } else {
                    //首先判断point是否在curPt和nextPt之间，即：此判断该点是否在该线段的外包矩形内
                    if ( cond_x && cond_y ){
                        //判断点是否在直线上公式
                         //根据数学,求出直接的表达示:y=kx+b
                        var k = (curPt.y-nextPt.y)/(curPt.x-nextPt.x);
                        var b = curPt.y-k*curPt.x;
                        if (Math.abs(nextPt.x-curPt.x) - Math.abs(nextPt.y-curPt.y) > 0) {
                            //将点的x坐标代入表达示中,判断该点是否在直线上
                            var py = point.x*k+b;
                            precision = point.y-py;
                        } else {
                            var px = (point.y-b)/k;
                            precision = point.x-px;
                        }

                        //console.log(precision);
                        // var precision = (curPt.x - point.x) * (nextPt.y - point.y) -
                        //     (nextPt.x - point.x) * (curPt.y - point.y);

                    }
                }
                // console.log(precision);
                if(precision !== null && precision <= tolerance && precision >= -tolerance){//实质判断是否接近0
                    return i;
                }
            }

            return -1;
        },

        /**
         * 判断点坐标是否在矩形范围中
         * @param {maptalks.Point} 点对象
         * @param {maptalks.Extent} 矩形范围
         * @return {Boolean} true：点在范围中
         */
        isPointInRect:function(point, extent) {
            if (!point || !(extent instanceof Z.Extent)) {
                return false;
            }
            return (point.x >= extent['xmin'] && point.x <= extent['xmax'] && point.y >= extent['ymin'] && point.y <= extent['ymax']);
        },

        /**
        * 判断点是否多边形内
        * @param {maptalks.Coordinate} point 点对象
        * @param {maptalks.Polyline} polygon 多边形对象
        * @return {Boolean} 点在多边形内返回true,否则返回false
        */
        isPointInPolygon: function(point, polygon) {
            var pts = polygon.getRing();//获取多边形点
            //下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
            //基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
            //在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。
            var N = pts.length;
            var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
            var intersectCount = 0;//cross points count of x
            var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
            var p1, p2;//neighbour bound vertices
            var p = point; //测试点
            p1 = pts[0];//left vertex
            for(var i = 1; i <= N; ++i){//check all rays
                if(Z.Coordinate(p, p1)){
                    return boundOrVertex;//p is an vertex
                }

                p2 = pts[i % N];//right vertex
                if(p.y < Math.min(p1.y, p2.y) || p.y > Math.max(p1.y, p2.y)){//ray is outside of our interests
                    p1 = p2;
                    continue;//next ray left point
                }

                if(p.y > Math.min(p1.y, p2.y) && p.y < Math.max(p1.y, p2.y)){//ray is crossing over by the algorithm (common part of)
                    if(p.x <= Math.max(p1.x, p2.x)){//x is before of ray
                        if(p1.y == p2.y && p.x >= Math.min(p1.x, p2.x)){//overlies on a horizontal ray
                            return boundOrVertex;
                        }

                        if(p1.x == p2.x){//ray is vertical
                            if(p1.x == p.x){//overlies on a vertical ray
                                return boundOrVertex;
                            }else{//before ray
                                ++intersectCount;
                            }
                        }else{//cross point on the left side
                            var xinters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;//cross point of lng
                            if(Math.abs(p.x - xinters) < precision){//overlies on a ray
                                return boundOrVertex;
                            }

                            if(p.x < xinters){//before ray
                                ++intersectCount;
                            }
                        }
                    }
                }else{//special case when ray is crossing through the vertex
                    if(p.y == p2.y && p.x <= p2.x){//p crossing over p2
                        var p3 = pts[(i+1) % N]; //next vertex
                        if(p.y >= Math.min(p1.y, p3.y) && p.y <= Math.max(p1.y, p3.y)){//p.y lies between p1.y & p3.y
                            ++intersectCount;
                        }else{
                            intersectCount += 2;
                        }
                    }
                }
                p1 = p2;//next ray left point
            }

            if(intersectCount % 2 == 0){//偶数在多边形外
                return false;
            } else { //奇数在多边形内
                return true;
            }
        }
};
