/**
 * label控件
 * @class maptalks.Label
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Label = Z.Class.extend({
    includes: [Z.Eventable],

    /**
     * @cfg {Object} exceptionDefs 异常信息定义
     */
    'exceptionDefs':{
        'en-US':{
            'NEED_TARGET':'You must set target to Label.',
            'INVALID_TARGET': 'Target must be geometry or coordinate.'
        },
        'zh-CN':{
            'NEED_TARGET':'你必须设置Label绑定的目标。',
            'INVALID_TARGET':'绑定目标只能是geometry或coordinate。'
        }
    },

    'defaultSymbol' : {
        "textFaceName": "arial",
        "textSize": 12,
        "textFill": "#000000",
        "textOpacity": 1,
        "textSpacing": 30,
        "textWrapWidth": null,
        "textWrapBefore": false,
        "textWrapCharacter": "",
        "textLineSpacing": 8,
        "textHorizontalAlignment": "middle",//left middle right
        "textVerticalAlignment": "middle", //top middle bottom
        "textAlign": "center",

        "markerType":"square",
        "markerLineColor": "#ff0000",
        "markerLineWidth": 2,
        "markerLineOpacity": 0.9,
        "markerLineDasharray": null,
        "markerFill": "#ffffff",
        "markerFillOpacity": 1
    },

    /**
     * @cfg {Object} options label属性
     */
    options: {
        'draggable': true,
        'autosizeBackground':true
    },

    /**
     * 初始化Label
     * @constructor
     * @param {Object} options
     * @return {maptalks.Label}
     * @expose
     */
    initialize: function (content, options) {
        var symbol = options['symbol'];
        this.setSymbol(symbol);
        delete options['symbol'];
        this.setOptions(options);
        options['symbol'] = symbol;
        this._content = content;
        /*if(!target)  {throw new Error(this.exceptions['NEED_TARGET']);}
        if(!(target instanceof Z.Geometry) && !(target instanceof Z.Coordinate)) {
            throw new Error(this.exceptions['INVALID_TARGET']);
        }*/
        return this;
    },

    /**
     * 获取label样式
     */
    getSymbol: function() {
        return this.options['symbol'];
    },

    /**
     * 设置label样式
     */
    setSymbol: function(symbol) {
        if (!symbol) {
            symbol = {};
        }
        var s = symbol;
        var d = this.defaultSymbol;
        var result = {};
        Z.Util.extend(result, d, s);
        this.options['symbol'] = result;
        this._refresh();
    },

    /**
     * 获取label内容
     */
    getContent: function() {
        return this._content;
    },

    /**
     * 设置label内容
     */
    setContent: function(content) {
        this._content = content;
        this._refresh();
    },



    /**
     * 设置属性
     * @param {Object} options
     * @expose
     */
    setOptions: function(options) {
        Z.Util.setOptions(this, options);
        return this;
    },

    /**
    * 隐藏label
    * @expose
    */
    hide: function() {
        this._label.hide();
        /**
         * 触发label的hide事件
         * @event hide
         * @return {Object} params: {'target': this}
         */
        this.fire('hide', {'target': this});
    },

    /**
    * 显示label
    * @expose
    */
    show: function() {
        this._label.show();
        /**
         * 触发label的show事件
         * @event show
         * @return {Object} params: {'target': this}
         */
        this.fire('show');
    },

    /**
    * 移除label
    * @expose
    */
    remove: function() {
        this._label.remove();
        if(this._linker) {
            this._linker.remove();
        }
        delete this._target;
        /**
         * 触发label的remove事件
         * @event remove
         * @return {Object} params: {'target': this}
         */
        this.fire('remove');
    },

    /**
     * 将Label添加到对象上
     * @param {maptalks.Geometry} geometry
     */
    addTo: function (geometry) {
        if(!geometry) {return this;}
        this._target = geometry;
        if (!geometry.getLayer()) {
            return this;
        }
        this._initLabel();
        geometry.getLayer().addGeometry(this._label);
        this._refresh();
        return this;
    },

    _getMap: function() {
        if (this._target) {
            return this._target.getMap();
        }
        return null;
    },

     _refresh:function() {
        if (!this._getMap()) {
            return;
        }
        var center = this._target.getCenter();
        this._label.setCoordinates(center);
        if (this.options['autosizeBackground']) {
            var symbol = this.options['symbol'];
            symbol['markerType'] = 'square';
            symbol['textName'] = this._content;
            var size = Z.StringUtil.splitTextToRow(this._content, symbol)['size'];
            //背景和文字之间的间隔距离
            var padding = new Z.Size(12,8);
            var boxAlignPoint = Z.StringUtil.getAlignPoint(size, symbol['textHorizontalAlignment'], symbol['textVerticalAlignment']);
            boxAlignPoint = boxAlignPoint.add(new Z.Point(Z.Util.getValueOrDefault(symbol['textDx'],0),Z.Util.getValueOrDefault(symbol['textDy'],0)));
            symbol['markerWidth'] = size['width']+padding['width'];
            symbol['markerHeight'] = size['height']+padding['height'];
            symbol['markerDx'] = boxAlignPoint['left']+size['width']/2;
            symbol['markerDy'] = boxAlignPoint['top']+size['height']/2;
            this._label.setSymbol(symbol);
        }
    },

    _initLabel: function() {
        var center = this._target.getCenter();
        this._label = this._createLabel(center);
        this._registerEvent();

        var linkerOptions = {
            "linkSource":this._label,
            "linkTarget":this._target,
            "trigger": 'click',
            "symbol":{
                'lineColor' : '#646566',
                'lineWidth' : 2,
                'lineDasharray' : [10, 4],
                'lineOpacity' : 1
            }
        };
        this._linker = new Z.Linker(linkerOptions);
        this._linker.addTo(this._target.getMap());
    },


    _registerEvent: function() {
        this.hide();
        var target = this._target;
        target.on('shapechanged positionchanged', Z.Util.bind(this._refresh, this), this)
                      .on('remove', this.remove, this);
        var trigger = this.options['trigger'];
        if(trigger === 'hover') {
            target.on('mouseover', function showLabel() {
                 this.show();
             }, this)
             .on('mouseout', function hideLabel() {
                setTimeout(function(){
                    this.hide();
                }, 1000);
             }, this);
        } else if(trigger === 'click') {
            target.on('click', function showLabel() {
                 this.show();
             }, this);
        } else {
            this.show();
        }

        return this;
    },

    _createLabel: function(center) {
        return new Z.Marker(center,{'draggable':this.options['draggable']});
    }
});
