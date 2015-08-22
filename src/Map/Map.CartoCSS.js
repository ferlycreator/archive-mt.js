/**
 * CartoCSS解析参考了CartoCSS.js
 * https://github.com/CartoDB/carto
 */

Z.Map.include({
    /**
     * 为地图载入CartoCSS样式
     * @param  {String|URL} css css样式或者mss文件链接
     */
    cartoCSS:function(css) {
        if (!Z.Util.isString(css) || css.length===0) {
            return;
        }
        if (!window['carto']) {
            //载入carto.js
           Z.loadModule('carto',function() {
                this._loadCartoCSS(css);
           },this);
        } else {
            this._loadCartoCSS(css);
        }

    },

    _loadCartoCSS:function(css) {
        var suffix = '.mss';
        var isMss=css.indexOf(suffix, css.length - suffix.length) !== -1;
        if (isMss) {
            Z.Util.Ajax.getResource(css,function(resource) {
                this._rendCartoCSS(resource);
            },this);
        } else {
            this._rendCartoCSS(css);
        }
    },

    _rendCartoCSS:function(cssContent) {
        var shader = new window['carto']['RendererJS']()['render'](cssContent);
        this.cartoCSSShader = shader;
        this._fireEvent('cartocssloaded');
    },

    /**
     * 根据输入的geometry获取cartoCSS中定义的样式
     * @param  {Geometry} geometry Geometry对象
     * @return {Object}          cartoCSS中定义的样式
     */
    _cartoCSSGeometry:function(geometry) {
        if (!this.cartoCSSShader || !geometry || !geometry.getLayer()) {
            return null;
        }
        var layerId = geometry.getLayer().getId();
        if (!layerId) {
            return null;
        }
        var layerShader = this.cartoCSSShader['findLayer']({'name':'#'+layerId});
        var symbol = layerShader['getStyle'](geometry.getProperties(), { 'zoom': this.getZoomLevel() });
        return symbol;
    }
});

Z.Map.mergeOptions({
    'enableCartoCSS' : true
});
