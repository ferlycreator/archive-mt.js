Z.Sector.SVG=Z.Circle.SVG.extend({
    initialize:function(geometry) {
        this.geometry = geometry;
    },

    createSVGObj:function() {
        if (!this.geometry) {
            return null;
        }
        /**
         * 计算扇形的svg path定义
         */
        function sector_update(cx, cy, r, startAngle, endAngle) {
            var rad = Math.PI / 180;
            var x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad);
                //变成整数
            x1 = Z.Util.canvasRound(x1),
            x2 = Z.Util.canvasRound(x2),
            y1 = Z.Util.canvasRound(y1),
            y2 = Z.Util.canvasRound(y2),
            r = (0.5 + r) << 0;
            //notice there is no "roation" variable
            if (startAngle > endAngle) {
                startAngle -= endAngle;
                endAngle = 360;
            }

            if (Z.Browser.svg) {
                 return ["M", cx, cy, "L", x1, y1, "A", r, r, 0,
            +(endAngle - startAngle > 180), 0, x2, y2, "z"].join(' ');
            } else if (Z.Browser.vml) {
                return "M "+cx+','+cy+'AE ' + cx+','+cy + ' ' + r + ',' + r + ' '+65535 * startAngle+','
                + (65535 * (endAngle-startAngle))+' x e';
                /*return ["M", cx, cy, "AL", cx, cy, r, r, 65535 * startAngle,
            65535 * endAngle,  'x e'].join(' ');*/
            }
        }
        var geometry = this.geometry;
        var domCenter = geometry._getCenterDomOffset();
        var pr = this.getPixelSize();
        var ret = {
            type : "path",
            path : sector_update(domCenter['left'],domCenter['top'],pr['width'],geometry.getStartAngle(),geometry.getEndAngle())
        };
        return ret;
    }
});