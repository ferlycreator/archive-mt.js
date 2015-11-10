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

    /**
     * @cfg {Object} options label属性
     */
    options: {
        'symbol': {
            'lineColor': '#ffffff',
            'lineWidth': 1,
            'lineOpacity': 0.9,
            'lineDasharray': null,
            'fill': '#4e98dd',
            'fillOpacity': 0.9,

            'textFaceName': 'arial',
            'textSize': 12,
            'textFill': '#ebf2f9',
            'textOpacity': 1,
            'textSpacing': 30,
            'textWrapWidth': 100,
            'textWrapBefore': false,
            'textWrapCharacter': '',
            'textLineSpacing': 8
        },
        'target': null,//Geometry or Coordinate
        'draggable': true,
        'content': '',
        'trigger': '',//click|hover
        'horizontalAlignment': 'middle',//left middle right
        'verticalAlignment': 'middle',//top middle bottom
        'dx': 0,
        'dy': 0
    },

    /**
     * 初始化Label
     * @constructor
     * @param {Object} options
     * @return {maptalks.Label}
     * @expose
     */
    initialize: function (options) {
        this.setOptions(options);
        var target = this.options['target'];
        if(!target)  {throw new Error(this.exceptions['NEED_TARGET']);}
        if(!(target instanceof Z.Geometry) && !(target instanceof Z.Coordinate)) {
            throw new Error(this.exceptions['INVALID_TARGET']);
        }
        this._target = target;
        this._refreshLabel();
        return this;
    },

    _refreshLabel: function() {
        this._setProperty();
        this._initLabel(this._target);
        return this;
    },

    /**
     * 获取label样式
     */
    getSymbol: function() {
        return this.options.symbol;
    },

    /**
     * 设置label样式
     */
    setSymbol: function(symbol) {
        this.options.symbol = symbol;
        this._setProperty();
        this._setLabelSymbol();
    },

    /**
     * 获取label内容
     */
    getContent: function() {
        return this.options['content'];
    },

    /**
     * 设置label内容
     */
    setContent: function(content) {
        this.options['content'] = content;
        this._setProperty();
        this._setLabelSymbol();
    },

    _setProperty: function() {
        this._textStyle = this._translateTextSymbol();
        this._strokeAndFill = this._translateMarkerSymbol();
        this._textContent = this.options['content'];
        this._labelSize = this._getLabelSize();
        var style = this.options.symbol;
        this._textSize = Z.StringUtil.stringLength(this._textContent, style['textFaceName'],style['textSize']);
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
        this.fire('show', {'target': this});
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
        /**
         * 触发label的remove事件
         * @event remove
         * @return {Object} params: {'target': this}
         */
        this.fire('remove', {'target': this});
    },

    /**
     * 将Label添加到对象上
     * @param {maptalks.Layer} layer
     */
    addTo: function (layer) {
        if(!layer) {return;}
        this._layer = layer;
        this._map = this._layer.getMap();
        this._layer.addGeometry(this._label);
        return this;
    },

    _initLabel: function(targetObj) {
        if(!targetObj || !this.options || !this.options['symbol']) {return;}
        if(targetObj instanceof Z.Coordinate) {
            this._center = targetObj;
            this._label = this._createLabel(this._center);
            if(this.options['draggable']) {
                var me = this;
                this._label.on('mousedown', function(){
                    me._label.options['draggable'] = true;
                    me._label.startDrag();
                });
            }
        } else {
            this._geometry = targetObj;
            if(!this._geometry) {throw new Error(this.exceptions['NEED_GEOMETRY']);}
            this._map = this._geometry.getMap();
            this._center = this._geometry.getCenter();
            this._label = this._createLabel(this._center);
            this._registerEvent();
        }
        if(this._label) {
            var me = this;
            this._label.on('mousedown mouseover mouseout click dblclick contextmenu dragstart dragend positionchanged', function(param){
                me.fire(param.type, param);
            });

            this._label.on('positionchanged', function(param){
                me._changeLabelCenter();
            });
        }
    },

    _changeLabelCenter: function() {
        var geometries = this._label.getGeometries();
        for(var i=0,len=geometries.length;i<len;i++) {
            var geometry = geometries[i];
            this._center = geometry.getCenter();
            break;
        }
    },

    _registerEvent: function() {
        this.hide();
        this._geometry.on('shapechanged positionchanged symbolchanged', Z.Util.bind(this._changeLabelPosition, this), this)
                      .on('remove', this.remove, this);
        var trigger = this.options['trigger'];
        var me = this;
        if(trigger === 'hover') {
            this._geometry.on('mouseover', function showLabel() {
                 me.show();
             }, this)
             .on('mouseout', function hideLabel() {
                setTimeout(function(){
                    me.hide();
                }, 1000);
             }, this);
        } else if(trigger === 'click') {
            this._geometry.on('click', function showLabel() {
                 me.show();
             }, this);
        } else {
            this.show();
        }
        if(this.options['draggable']) {
            var me = this;
            this._label.on('mousedown', function(){
                me._label.options['draggable'] = true;
                me._label.startDrag();
            });
            var linkerOptions = {
                linkSource:this._label,
                linkTarget:this._geometry,
                trigger: 'click',
                symbol:{
                    'lineColor' : '#646566',
                    'lineWidth' : 2,
                    'lineDasharray' : [10, 4],
                    'lineOpacity' : 1
                }
            };
            this._linker = new Z.Linker(linkerOptions);
            this._linker.addTo(this._map);
        }
        return this;
    },

    _changeLabelPosition: function(event) {
        var geometries = this._label.getGeometries();
        for(var i=0,len=geometries.length;i<len;i++) {
            var geometry = geometries[i];
            geometry.setCoordinates(this._geometry.getCenter());
        }
    },

    _createLabel: function(center) {
        this._textMarker = new Z.Marker(center);
        this._box = new Z.Marker(center);
        this._setLabelSymbol();
        return new Z.GeometryCollection([this._box,this._textMarker]);
    },

    _setLabelSymbol: function() {
        var dx=this.options['dx'],dy=this.options['dy'];
        var width = this._labelSize['width'];
        var height = this._labelSize['height'];
        var hAlign = this.options['horizontalAlignment'];
        if (hAlign === 'right') {
            dx += width/2;
        } else if (hAlign === 'middle') {
            dx += 0;
        } else {
            dx += -width/2;
        }

        var vAlign = this.options['verticalAlignment'];
        if (vAlign === 'top') {
            dy += -height/2;
        } else if (vAlign === 'middle') {
            dy += 0;;
        } else {
            dy += height/2;
        }
        this._strokeAndFill['markerDx'] = dx;
        this._strokeAndFill['markerDy'] = dy;
        this._strokeAndFill['markerWidth'] = width;
        this._strokeAndFill['markerHeight'] = height;
        this._box.setSymbol(this._strokeAndFill);
        this._textMarker.setSymbol(this._textStyle);
    },

    _getLabelSize: function() {
        var textRow = Z.StringUtil.splitTextToRow(this._textContent, this._textStyle);
        return textRow.size;
    },

    _translateTextSymbol: function() {
        var symbol = this.options.symbol;
        var result = {
            'textName': this.options['content'],
            'textFaceName': Z.Util.getValueOrDefault(symbol['textFaceName'],'arial'),
            'textSize': Z.Util.getValueOrDefault(symbol['textSize'],12),
            'textFill': Z.Util.getValueOrDefault(symbol['textFill'],'#ebf2f9'),
            'textOpacity': Z.Util.getValueOrDefault(symbol['textOpacity'],1),
            'textSpacing': Z.Util.getValueOrDefault(symbol['textSpacing'],0),
            'textWrapWidth': symbol['textWrapWidth'],
            'textWrapBefore': Z.Util.getValueOrDefault(symbol['textWrapBefore'],false),
            'textWrapCharacter': symbol['textWrapCharacter'],
            'textLineSpacing': Z.Util.getValueOrDefault(symbol['textLineSpacing'],8),
            'textHorizontalAlignment' : Z.Util.getValueOrDefault(this.options['horizontalAlignment'],'middle'),
            'textVerticalAlignment'   : Z.Util.getValueOrDefault(this.options['verticalAlignment'],'middle'),
            'textAlign'               : Z.Util.getValueOrDefault(symbol['textAlign'],'center'),
            'textDx': Z.Util.getValueOrDefault(this.options['dx'],0),
            'textDy': Z.Util.getValueOrDefault(this.options['dy'],0)
        };
        return result;
    },

    _translateMarkerSymbol:function() {
        var symbol = this.options.symbol;
        var result = {
            'markerType': 'square',
            'markerLineColor': Z.Util.getValueOrDefault(symbol['lineColor'],'#ffffff'),
            'markerLineWidth': Z.Util.getValueOrDefault(symbol['lineWidth'],1),
            'markerLineOpacity': Z.Util.getValueOrDefault(symbol['lineOpacity'],0.9),
            'markerLineDasharray': Z.Util.getValueOrDefault(symbol['lineDasharray'],null),
            'markerFill':  Z.Util.getValueOrDefault(symbol['fill'],'#4e98dd'),
            'markerFillOpacity':  Z.Util.getValueOrDefault(symbol['fillOpacity'],0.9),
            'markerDx': Z.Util.getValueOrDefault(this.options['dx'],0),
            'markerDy': Z.Util.getValueOrDefault(this.options['dy'],0)
        };
        return result;
     }

});
