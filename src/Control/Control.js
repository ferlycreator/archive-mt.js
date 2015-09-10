Z['Control'] = Z.Control = Z.Class.extend({

    /**
    * 异常信息定义
    */
    exceptionDefs: {
        'en-US':{
            'NEED_ID':'You must set id to Control.'
        },
        'zh-CN':{
            'NEED_ID':'Control必须设置id。'
        }
    },

    statics: {
        'top_left' : {'top': '40','left': '60'},
        'top_right' : {'top': '40','right': '60'},
        'bottom_left' : {'bottom': '20','left': '60'},
        'bottom_right' : {'bottom': '20','right': '60'},
        'controls': {},
        'getControl': function(map, id) {
            if(!map) return null;
            var controls = Z.Control.controls;
            var mapId = map._container;
            var controlsInMap = controls[mapId];
            if(!controlsInMap) return null;
            for(var key in controlsInMap) {
                if(key==id) {
                    return controlsInMap[key];
                }
            }
            return null;
        }
    },

    options:{
        'position' : this['top_left']
    },

    initialize: function (options) {
        if(!options.id) {
            throw new Error(this.exceptions['NEED_ID']);
        }
        this.setOption(options);
        return this;
    },

    addTo: function (map) {
        var id = this.options['id'];
        if(!id) {throw new Error(this.exceptions['NEED_ID']);}
        this.remove();
        this._map = map;
        this._controlContainer = map._panels.controlWrapper;

        this._container = Z.DomUtil.createEl('div');
        this._container.className = 'MAP_CONTROL';
        Z.DomUtil.setStyle(this._container, 'z-index: 3003');
        var controlDom = this.buildOn(map);
        if(controlDom) {
            this._updateContainerPosition();
            this._container.appendChild(controlDom);
            this._controlContainer.appendChild(this._container);
        }
        this._afterAdd();

        var controls = Z.Control.controls;
        var mapId = this._map._container;
        var controlsInMap = controls[mapId];
        if(!controlsInMap) {
            controls[mapId] = {id: this};
        } else {
            controls[mapId][id] = this;
        }
        return this;
    },

    _updateContainerPosition: function(){
        var position = this.options['position'];
        if(position) {
            Z.DomUtil.setStyle(this._container, 'position:absolute');
        }
        if(position['top']) {
            Z.DomUtil.setStyle(this._container, 'top: '+ position['top']+'px');
        }
        if(position['right']) {
            Z.DomUtil.setStyle(this._container, 'right: '+ position['right']+'px');
        }
        if(position['bottom']) {
            Z.DomUtil.setStyle(this._container, 'bottom: '+ position['bottom']+'px');
        }
        if(position['left']) {
            Z.DomUtil.setStyle(this._container, 'left:'+ position['left']+'px');
        }
    },

    /**
    * @expose
    */
    setOption: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
    * @expose
    */
    getOption: function(options) {
        return this.options;
    },

    /**
    * @expose
    */
    getPosition: function () {
        return this.options['position'];
    },

    /**
    * @expose
    */
    setPosition: function (position) {
        var map = this._map;
        if (map) {
            map.removeControl(this);
        }
        this.options['position'] = position;
        if (map) {
            map.addControl(this);
        }
        this._updateContainerPosition();
        return this;
    },

    getContainer: function () {
        return this._container;
    },

    remove: function () {
        if (!this._map) {
            return this;
        }
        Z.DomUtil.removeDomNode(this._container);
        if (this._onRemove) {
            this._onRemove(this._map);
        }
        this._map = null;
        return this;
    },

    _afterAdd: function() {

    },

    _getInternalLayer: function(map, layerId, canvas) {
        if(!map) {return;}
        var layer = map.getLayer(layerId);
        if(!layer) {
            if(canvas) {
                layer = new Z.VectorLayer(layerId,{'render':'canvas'});
            } else {
                layer = new Z.VectorLayer(layerId);
            }
            map.addLayer(layer);
        }
        return layer;
    }

});

Z.Map.include({
    /*
    * 添加control
    * @expose
    */
    addControl: function (control) {
        control.addTo(this);
        return this;
    },

    /*
    * 根据id获取control
    * @expose
    */
    getControl: function (id) {
        return Z.Control.getControl(this, id);
    },

    /*
    * 删除control
    * @expose
    */
    removeControl: function (control) {
        control.remove();
        return this;
    }

});
