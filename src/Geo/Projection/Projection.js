
Z.Projection={
    getInstance:function(projection) {
        if (!projection) {return this.getDefault();}
        var instance = null;
        if (Z.Util.isString(projection)) {
            for (var p in Z.ProjectionInstance) {
                if (Z.ProjectionInstance.hasOwnProperty(p)) {
                    if ((''+projection).toUpperCase() === Z.ProjectionInstance[p].srs) {
                        instance = Z.ProjectionInstance[p];
                        break;
                    }
                }
            }
        } else {
            instance = projection;
        }

        if (instance) {
            Z.Util.extend(instance,Z.Projection.Util);
        } else {
            instance = this.getDefault();
        }
        return instance;
    },

    getDefault:function() {
        return Z.Util.extend(Z.ProjectionInstance.EPSG3857,Z.Projection.Util);
    }
};

/**
 * 所有的Projection类共有的工具方法
 * @type {Object}
 */
Z.Projection.Util={
    /**
     * 计算一组坐标的投影坐标
     * @param  {[type]} points [description]
     * @return {[type]}        [description]
     */
    projectPoints:function(points) {
        return Z.Util.eachInArray(points, this, this.project);
    },

    /**
     * 计算一组投影坐标的经纬度坐标
     * @param  {[type]} points [description]
     * @return {[type]}           [description]
     */
    unprojectPoints:function(points) {
        return Z.Util.eachInArray(points, this, this.unproject);
    }
};

Z.ProjectionInstance={};
