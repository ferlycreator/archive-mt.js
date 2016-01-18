Z.D3Layer =  Z.Layer.extend({
    type : 'd3',

    options:{
        'render' : 'svg' //'svg/canvas'
    },

    /**
     * 构造函数
     * @param  {String} id 图层identifier
     */
    initialize:function(id, options) {
        this.setId(id);
        Z.Util.setOptions(this, options);
    },

    /**
     * 是否用Canvas渲染
     * @return {Boolean}
     * @expose
     */
    isCanvasRender:function() {
        if (this.options['render'] === 'canvas') {
            return true;
        }
        return false;
    },


    load:function() {
        if (!this._container) {
            this._initContainer();
            this._registerEvents();
        }
        return this;
    },

    getContext:function() {
        return this._container;
    },

    getSize:function() {
        return this.getMap().getSize();
    },

    _initContainer:function() {
        var map = this.getMap();
        if (this.isCanvasRender()) {
            var size = map.getSize();
            this._container = Z.Canvas.createCanvas(size['width'], size['height'], map.CanvasClass);
        } else {
            this._container = Z.SVG.createContainer();
            var layerContainer = Z.DomUtil.createEl('div');
            layerContainer.appendChild(this._container);
            Z.SVG.refreshContainer(map, this._container);
            map._panels.mapPlatform.appendChild(layerContainer);
        }
    },
    _registerEvents:function() {
        var map = this.getMap();
        var container = this._container;
        map.on('zoomend',function() {
            Z.SVG.refreshContainer(map, container);
            container.style.display = "";
        });
        map.on('zoomstart', function() {
            container.style.display = "none";
        });
        map.on('moveend',function() {
            Z.SVG.refreshContainer(map, container);
        });
    }
});
