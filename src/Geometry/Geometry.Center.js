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
        return map._untransformToOffset(pcenter);
    },

    /**
     * 返回Geometry的坐标
     * @return {Coordinate} 图形坐标
     * @expose
     */
    getCoordinates:function() {
        return this.coordinates;
    },

    /**
     * 设置新的坐标
     * @param {Coordinate} coordinates 新的坐标
     */
    setCoordinates:function(coordinates) {
        var center = new Z.Coordinate(coordinates);
        this.coordinates = center;
        if (!this.coordinates || !this.getMap()) {return;}
        var projection = this._getProjection();
        this.setPCenter(projection.project(this.coordinates));
        return this;
    },

    /**
     * 获取Marker的center
     * @return {Coordinate} Marker的center
     * @expose
     */
    getCenter:function() {
        return this.coordinates;
    },


    getPCenter:function() {
        var projection = this._getProjection();
        if (!projection) {return null;}
        if (!this.pcenter) {
            if (this.coordinates) {
                this.pcenter = projection.project(this.coordinates);
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
        var projection = this._getProjection();
        if (this.pcenter && projection) {
            this.coordinates = projection.unproject(this.pcenter);
        }
    },

    clearProjection:function() {
        this.pcenter = null;
    },

    computeCenter:function(projection) {
        return this.coordinates;
    }
};