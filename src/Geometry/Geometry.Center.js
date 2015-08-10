Z.Geometry.Center={
    /**
     * 计算Geometry中心点在地图容器中的相对坐标
     * @return {[type]} [description]
     */
    getCenterDomOffset:function() {
        var pcenter = this.getPCenter();
        if (!pcenter) {return null;}
        var map=this.getMap();
        if (!map) {
            return null;
        }
        return map.untransformToOffset(pcenter);
    },

    /**
     * 获取Marker的center
     * @return {Coordinate} Marker的center
     * @export
     */
    getCenter:function() {
        return this.center;
    },

    /**
     * 设置新的center
     * @param {Coordinate} center 新的center
     * @export
     */
    setCenter:function(center){
        this.center = center;
        if (!this.center || !this.getMap()) {return;}        
        var projection = this.getProjection();
        this.setPCenter(projection.project(this.center));
        return this;
    },

    getPCenter:function() {
        var projection = this.getProjection();
        if (!projection) {return null;}
        if (!this.pcenter) {            
            if (this.center) {
                this.pcenter = projection.project(this.center);
            }
        }
        return this.pcenter;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pcenter 投影坐标
     */
    setPCenter:function(pcenter) {
        this.pcenter=pcenter;
        this.onPositionChanged();
    },
    
    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    updateCache:function() {
        var projection = this.getProjection();
        if (this.pcenter && projection) {
            this.center = projection.unproject(this.pcenter);
        }
    },

    clearProjection:function() {
        this.pcenter = null;
    },

    computeCenter:function(projection) {
        return this.center;
    }
};