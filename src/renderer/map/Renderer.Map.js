Z.renderer.map={};

/**
 * Common functions of map renders.
 */
Z.renderer.map.Renderer = Z.Class.extend({

    /**
     * get Transform Matrix for zooming
     * @param  {Number} scale  scale
     * @param  {Point} origin Transform Origin
     */
    getZoomMatrix:function(scale, origin) {
        var r = Z.Browser.retina?2:1;
        var mapTransOrigin = origin.multi(r);
        //matrix for layers to caculate points.
        var matrix = new Z.Matrix().translate(origin.x, origin.y)
            .scaleU(scale).translate(-origin.x,-origin.y);
        //matrix for this._context to draw layerImage.
        var retinaMatrix = new Z.Matrix().translate(mapTransOrigin.x, mapTransOrigin.y)
            .scaleU(scale).translate(-mapTransOrigin.x,-mapTransOrigin.y).scaleU(r);
        return [matrix, retinaMatrix];
    },

    panAnimation:function(distance, t) {
        distance = new Z.Point(distance);
        var map = this.map;
        if (map.options['panAnimation']) {
            var duration;
            if (!t) {
                duration = map.options['panAnimationDuration'];
            } else {
                duration = t;
            }
            map._panAnimating = true;
            var preDist = null;
            Z.Animation.animate({
                'distance' : distance
            }, {
                'easing' : 'out',
                'speed' : duration
            }, function(frame) {
                if (!map._enablePanAnimation) {
                    map._panAnimating = false;
                    map._onMoveEnd();
                    return true;
                }

                if (frame.state['playing'] && frame.styles['distance']) {
                    var dist =frame.styles['distance'];
                    dist = dist.round();
                    if (!preDist) {
                        preDist = dist;
                    }
                    var offset = dist.substract(preDist);
                    map.offsetPlatform(offset);
                    map._offsetCenterByPixel(offset.multi(-1));
                    preDist = dist;
                    map._fireEvent('moving');
                }
                if (!frame.state['playing']) {
                    map._panAnimating = false;
                    map._onMoveEnd();
                    return true;
                }
            });
        } else {
            map._onMoveEnd();
        }
    },

    /**
     * 获取地图容器偏移量或更新地图容器偏移量
     * @param  {Point} offset 偏移量
     * @return {this | Point}
     */
    offsetPlatform:function(offset) {
        if (!this.map._panels.mapPlatform) {
            return;
        }
        var mapPlatform = this.map._panels.mapPlatform;
        if (!offset) {
            return Z.DomUtil.offsetDom(mapPlatform);
        } else {
            var domOffset = Z.DomUtil.offsetDom(mapPlatform);
            Z.DomUtil.offsetDom(mapPlatform, domOffset.add(offset));
            return this;
        }
    },

    resetContainer:function() {
        this.map._resetMapViewPoint();
        if (this.map._panels.mapPlatform) {
            Z.DomUtil.offsetDom(this.map._panels.mapPlatform, new Z.Point(0,0));
        }
    },

    onZoomEnd:function() {
        this.resetContainer();
    }
});
