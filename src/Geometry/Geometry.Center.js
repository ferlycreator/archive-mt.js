Z.Geometry.Center={
    /**
     * 计算Geometry中心点在地图容器中的相对坐标
     * @return {[type]} [description]
     */
    _getCenterDomOffset:function() {
        var pcenter = this._getPCenter();
        if (!pcenter) {return null;}
        var map=this.getMap();
        if (!map) {
            return null;
        }
        return map._transformToOffset(pcenter);
    },

    /**
     * 返回Geometry的坐标
     * @return {Coordinate} 图形坐标
     * @expose
     */
    getCoordinates:function() {
        return this._coordinates;
    },

    /**
     * 设置新的坐标
     * @param {Coordinate} coordinates 新的坐标
     */
    setCoordinates:function(coordinates) {
        var center = new Z.Coordinate(coordinates);
        this._coordinates = center;
        if (!this._coordinates || !this.getMap()) {
            this._onPositionChanged();
            return;
        }
        var projection = this._getProjection();
        this._setPCenter(projection.project(this._coordinates));
        return this;
    },

    /**
     * 获取Marker的center
     * @return {Coordinate} Marker的center
     * @expose
     */
    getCenter:function() {
        return this._coordinates;
    },


    _getPCenter:function() {
        var projection = this._getProjection();
        if (!projection) {return null;}
        if (!this._pcenter) {
            if (this._coordinates) {
                this._pcenter = projection.project(this._coordinates);
            }
        }
        return this._pcenter;
    },

    /**
     * 设置投影坐标
     * @param {Coordinate} pcenter 投影坐标
     */
    _setPCenter:function(pcenter) {
        this._pcenter=pcenter;
        this._onPositionChanged();
    },

    /**
     * 修改投影坐标后调用该方法更新经纬度坐标缓存.
     * @return {[type]} [description]
     */
    _updateCache:function() {
        var projection = this._getProjection();
        if (this._pcenter && projection) {
            this._coordinates = projection.unproject(this._pcenter);
        }
    },

    _clearProjection:function() {
        this._pcenter = null;
    },

    _computeCenter:function(projection) {
        return this._coordinates;
    }
};