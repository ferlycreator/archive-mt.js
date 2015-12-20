Z.render.map={};

/**
 * 地图渲染类的父类, 不可实例化, 定义了地图渲染类中共用方法
 */
Z.render.map.Render = Z.Class.extend({

    panAnimation:function(moveOffset, t) {
        moveOffset = new Z.Point(moveOffset);
        var map = this.map;
        if (map.options['panAnimation']) {
            var duration;
            if (!t) {
                duration = map.options['panAnimationDuration'];
            } else {
                duration = t*(Math.abs(moveOffset.x)+Math.abs(moveOffset.y))/600;
            }
            var panMoveOffset = moveOffset.multi(0.5);
            Z.animation.animate(new Z.animation.pan({
                'distance': panMoveOffset,
                'duration' : duration
            }), map, function(frame) {
                if (!map._enablePanAnimation) {
                    map._onMoveEnd();
                    return true;
                }
                if (frame.state['end']) {
                    map._onMoveEnd();
                    return true;
                }
            }, this);
        } else {
            this.offsetPlatform(moveOffset);
            this._offsetCenterByPixel(new Z.Point(-moveOffset.x,-moveOffset.y));
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
