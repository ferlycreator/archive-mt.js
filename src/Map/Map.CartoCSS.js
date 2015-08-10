Z.Map.include({
    cartoCSS:function(css) {
        if (!Z.Util.isString(css) || css.length===0) {
            return;
        }
        if (!window['carto']) {
            //载入carto.js
           Z.loadModule('carto',function() {
                this.loadCartoCSS(css);
           },this);
        } else {
            this.loadCartoCSS(css);
        }
        
    },

    loadCartoCSS:function(css) {
        var suffix = '.mss';
        var isMss=css.indexOf(suffix, css.length - suffix.length) !== -1;
        if (isMss) {
            Z.Util.Ajax.getResource(css,function(resource) {
                this.rendCartoCSS(resource);
            },this);
        } else {
            this.rendCartoCSS(css);
        }
    },

    rendCartoCSS:function(cssContent) {
        var shader = new window['carto']['RendererJS']()['render'](cssContent);
        this.cartoCSSShader = shader;
        this.fireEvent('cartocssloaded');
    },

    /**
     * 根据输入的geometry获取cartoCSS中定义的样式
     * @param  {Geometry} geometry Geometry对象
     * @return {Object}          cartoCSS中定义的样式
     */
    cartoCSSGeometry:function(geometry) {
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
