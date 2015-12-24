Z.render.map={};

/**
 * Common functions of map renders.
 */
Z.render.map.Render = Z.Class.extend({

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
            Z.animation.animate(new Z.animation.pan({
                'distance': distance,
                'duration' : duration
            }), map, function(frame) {
                if (!map._enablePanAnimation) {
                    map._panAnimating = false;
                    map._onMoveEnd();
                    return true;
                }
                if (frame.state['end']) {
                    map._panAnimating = false;
                    map._onMoveEnd();
                    return true;
                }
            }, this);
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
