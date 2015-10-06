var Symboling = {};
//有中心点的图形的共同方法
Symboling.Center = {
    _getRenderPoints:function(placement) {
        return [this._getCenterViewPoint()];
    }
};

/**
 * 获取symbolizer所需的数据
 */
Z.Marker.include(Symboling.Center, {
    _getRenderPath:function() {
        //Marker has nothing for svg
        return null;
    }
});
//----------------------------------------------------
Symboling.Ellipse = {
    _getRenderPath:function() {
        var domCenter = this._getCenterViewPoint();
        var size = this._getRenderSize();
        var start = (domCenter['left']-size['width'])+','+domCenter['top'];
        var path;
        if (Z.Browser.vml) {
            path = 'AL ' + start + ' ' + size['width'] + ',' + size['height'] +
                    ' 0,' + (65535 * 360) + ' x e';
        } else {
            path = 'M'+start+' a'+size['width']+','+size['height']+' 0,1,0,0,-0.9Z';
        }
        return path;
    }
};

Z.Ellipse.include(Symboling.Center,Symboling.Ellipse,{
    _getRenderSize:function() {
        var w = this.getWidth(),
            h = this.getHeight();
        var map = this.getMap();
        return map.distanceToPixel(w/2,h/2);
    }
});

Z.Circle.include(Symboling.Center,Symboling.Ellipse, {
    _getRenderSize:function() {
        var radius = this.getRadius();
        var map = this.getMap();
        return map.distanceToPixel(radius,radius);
    }
});
//----------------------------------------------------
Z.Sector.include(Symboling.Center,{
    _getRenderPath:function() {
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
            if (Z.Browser.vml) {
                return "M "+cx+','+cy+'AE ' + cx+','+cy + ' ' + r + ',' + r + ' '+65535 * startAngle+',' + (65535 * (endAngle-startAngle))+' x e';
            } else {
                return ["M", cx, cy, "L", x1, y1, "A", r, r, 0,
                +(endAngle - startAngle > 180), 0, x2, y2, "z"].join(' ');
            }
        }
        var domCenter = this._getCenterViewPoint();
        var size = this._getRenderSize();
        return sector_update(domCenter['left'],domCenter['top'],size['width'],this.getStartAngle(),this.getEndAngle());
    },

    _getRenderSize:function() {
        var radius = this.getRadius();
        var map = this.getMap();
        return map.distanceToPixel(radius,radius);
    }
});
//----------------------------------------------------
Z.Rectangle.include({
    _getRenderPoints:function(placement) {
        var domNw = this.getMap()._transformToViewPoint(this._getPNw());
        return [domNw];
    },

    _getRenderPath:function() {
        var map = this.getMap();
        var viewPoint = map._transformToViewPoint(this._getPNw());
        var size = this._getRenderSize();
        var start = viewPoint['left']+','+viewPoint['top'];
        var path = 'M'+start+' L'+(viewPoint['left']+size['width'])+','+viewPoint['top']+
            ' L'+(viewPoint['left']+size['width'])+','+(viewPoint['top']+size['height'])+
            ' L'+viewPoint['left']+','+(viewPoint['top']+size['height'])+
            ' '+Z.SVG.closeChar;
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path += ' e';
        }
        return path;
    },

    _getRenderSize:function() {
        var w = this.getWidth(),
            h = this.getHeight();
        var map = this.getMap();
        return map.distanceToPixel(w, h);
    }
});
//----------------------------------------------------
Symboling.Poly={
    _viewPointsToSvgPath:function(viewPoints,isClosePath,isHole) {
        var seperator=',';

        var coords = [];

        for ( var i = 0, len = viewPoints.length; i < len; i++) {
            coords.push(viewPoints[i]['left']+seperator+viewPoints[i]['top']);
        }
        if (coords.length === 0) {
            return 'M0 0';
        }
        var ret = null;
        if (!isHole) {
            ret = 'M'+coords.join(' L');
            if (isClosePath) {
                ret += Z.SVG.closeChar;
            }
        } else {
            //如果是空洞,则逆时针绘制
            ret = 'M'+coords.reverse().join(' L')+Z.SVG.closeChar;
        }

        return ret;
    },

    _getRenderPoints:function(placement) {
        var map = this.getMap();
        var points;
        if ('vertex' === placement) {
            points = this._transformToViewPoint(this._getPrjPoints());
        } else if ('line' === placement) {
            //var vertexes = this._transformToViewPoint(this._getPrjPoints());
            points = [];
            //TODO 获取线段中心点
        } else {
            var center = this.getCenter();
            var pcenter = this._getProjection().project(center);
            points = [map._transformToViewPoint(pcenter)];
        }
        return points;
    }
};

Z.Polyline.include(Symboling.Poly,{
    _getRenderPath:function() {
        var viewPoint = this._transformToViewPoint(this._getPrjPoints());
        var path = this._viewPointsToSvgPath(viewPoint,false,false);
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path += ' e';
        }
        return path;
    }
});

Z.Polygon.include(Symboling.Poly, {
    _getRenderPath:function() {
        var viewPoints = this._transformToViewPoint(this._getPrjPoints());
        var path = this._viewPointsToSvgPath(viewPoints,true,false);
        var holePathes = this._getHolePathes();
        if (Z.Util.isArrayHasData(holePathes)) {
            path += ' ' + holePathes.join(' ');
        }
        if (Z.Browser.vml) {
            //vml图形需要在末尾加个e表示图形结束
            path += ' e';
        }
        return path;
    },

    /**
     * 生成hole的SVG Path
     * @return {Array} [hole的SVG Path 数组]
     */
    _getHolePathes:function() {
        if (!this.hasHoles()) {
            return null;
        }
        var prjHoles = this._getPrjHoles();
        var result = [];
        for (var i=0,len=prjHoles.length;i<len;i++) {
            var holeViewPoints = this._transformToViewPoint(prjHoles[i]);
            result.push(this._viewPointsToSvgPath(holeViewPoints,true,true));
        }
        return result;
    }
});
