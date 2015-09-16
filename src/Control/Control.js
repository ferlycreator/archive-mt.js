/**
 * 组件类
 * @class maptalks.Control
 * @extends maptalks.Class
 * @author Maptalks Team
 */
Z['Control'] = Z.Control = Z.Class.extend({
    statics: {
        /**
         * @static
         * @cfg {Object} top_left 左上角
         */
        'top_left' : {'top': '40','left': '60'},
        /**
         * @static
         * @cfg {Object} top_right 右上角
         */
        'top_right' : {'top': '40','right': '60'},
        /**
         * @static
         * @cfg {Object} bottom_left 左下角
         */
        'bottom_left' : {'bottom': '20','left': '60'},
        /**
         * @static
         * @cfg {Object} bottom_right 右下角
         */
        'bottom_right' : {'bottom': '20','right': '60'}
    },

    /**
     * @cfg {Object} options 组件配置
     */
    options:{
        'position' : this['top_left']
    },

    /**
     * @constructor
     * @param {Object} options
     * @returns {maptalks.Control}
     */
    initialize: function (options) {
        this.setOption(options);
        return this;
    },

    /**
     * 将组件添加到指定的map上
     * @param {maptalks.Map} map对象
     * @returns {maptalks.Control}
     * @expose
     */
    addTo: function (map) {
        this.remove();
        this._map = map;
        this._controlContainer = map._panels.controlWrapper;

        this._container = Z.DomUtil.createEl('div');
        this._container.className = 'MAP_CONTROL';
        Z.DomUtil.setStyle(this._container, 'z-index: 3003');
        var controlDom = this._buildOn(map);
        if(controlDom) {
            this._updateContainerPosition();
            this._container.appendChild(controlDom);
            this._controlContainer.appendChild(this._container);
        }
        this._afterAdd();
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
     * 设置组件配置项
     * @param {Object} options
     * @expose
     */
    setOption: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
     * 获取组件配置项
     * @return {Object} options
     * @expose
     */
    getOption: function() {
        return this.options;
    },

    /**
     * 获取组件显示的位置
     * @return {Object} {'top': '40','left': '60'}
     * @expose
     */
    getPosition: function () {
        return this.options['position'];
    },

    /**
     * 设置组件显示位置
     * @param {Object} {'top': '40','left': '60'}
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

    /**
     * 获取组件容器
     * @return container dom
     * @expose
     */
    getContainer: function () {
        return this._container;
    },

    /**
     * 删除组件
     * @expose
     */
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

    }

});


Z.Map.include({
    /**
     * 添加control
     * @member maptalks.Map
     * @param {maptalks.Control} control
     * @expose
     */
    addControl: function (control) {
        control.addTo(this);
        return this;
    },

    /**
     * 删除control
     * @member maptalks.Map
     * @param {maptalks.Control} control
     * @expose
     */
    removeControl: function (control) {
        control.remove();
        return this;
    }

});