Z.VectorLayer=Z.OverlayLayer.extend({

    baseDomZIndex:200,

    options:{
        'render':'dom' // possible values: dom - svg or vml, canvas
    },

    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id, options) {
        this.identifier = id;
        Z.Util.setOptions(this, options);
        //动态载入成员方法
        if ('dom' === this.options['render'].toLowerCase()) {
            Z.Util.extend(this, Z.Render.Dom);
        } else if ('canvas' === this.options['render'].toLowerCase()) {
            Z.Util.extend(this, Z.Render.Canvas);
        }
    },

    /**
     * 是否用Canvas渲染
     * @return {Boolean}
     * @expose
     */
    isCanvasRender:function() {
        //即不支持svg, 也不支持vml
        if (!Z.Browser.svg && !Z.Browser.vml) {
            return true;
        }
        return 'canvas' === this.options['render'].toLowerCase();
    }


});