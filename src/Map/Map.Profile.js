/** 实现Map的Profile功能 **/
/** Profile是地图当前状态的一个画像, 存储了地图 **/

//Layer的Profile
Z.Layer.include({
    /**
     * 返回Layer的JSON
     * @param  {Object} options 属性配置, 控制属性是否输出
     *                          options: 是否输出options, 不设置或者设置为true则输出, false则不输出
     *                          geometries: 图层geometry(如果有)的JSON配置(同Geometry.toJSON方法的配置), 设为false则不输出
     * @return {JSON}         图层的JSON
     */
    toJSON:function(options) {
        if (!options) {
            options = {};
        }
        var profile = {
            "type":this.type,
            "id":this.getId()
        };
        if (Z.Util.isNil(options['options']) || options['options']) {
            profile['options'] = this.config();
        }

        if (this instanceof Z.OverlayLayer) {
            if (Z.Util.isNil(options['geometries']) || options['geometries']) {
                var graphics = [];
                var geometries = this.getGeometries();
                for (var i = 0, len=geometries.length; i < len; i++) {
                    graphics.push(geometries[i].toJSON(options['geometries']));
                }
                profile['geometries'] = graphics;
            }
        }
        return profile;
    }
});

Z.Map.include({
    "PROFILE_VERSION" : "1.0.0",
    /**
     * 返回地图的JSON
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    toJSON:function(options) {
        if (!options) {
            options = {};
        }
        var profile = {
            "version":this["PROFILE_VERSION"]
        };
        var baseTileLayer = this.getBaseTileLayer();
        if (Z.Util.isNil(options['baseTileLayer']) || options['baseTileLayer']) {
            profile['baseTileLayer'] = baseTileLayer.toJSON(options['baseTileLayer']);
        }
        if (Z.Util.isNil(options['layers']) || options['layers']) {
            var layers;
            if (options['layers'] && options['layers']['includeInternalLayers']) {
                layers = this._getLayers(function(layer) {
                    if (baseTileLayer === layer) {
                        return false;
                    }
                    return true;
                });
            } else {
                layers = this.getLayers();
            }
            var layersJSON = [];
            for (var i = 0, len=layers.length; i < len; i++) {
                layersJSON.push(layers[i].toJSON(options['layers']));
            }
            profile["layers"] = layersJSON;
        }
        return profile;
    }
});
