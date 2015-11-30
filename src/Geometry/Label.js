/**
 * label控件
 * @class maptalks.Label
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Label = Z.Marker.extend({
    'defaultSymbol' : {
        "textFaceName": "arial",
        "textSize": 12,
        "textFill": "#000000",
        "textOpacity": 1,
        "textSpacing": 30,
        "textWrapWidth": null,
        "textWrapBefore": false,
        "textWrapCharacter": "\n",
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
        'draggable': false,
        'autosize':true
    },

    /**
     * 初始化Label
     * @constructor
     * @param {String} content Label文字内容
     * @param {Coordinate} coordinates Label坐标
     * @param {Object} options 配置, 与Marker的options配置相同
     * @return {maptalks.Label}
     * @expose
     */
    initialize: function (content, coordinates, options) {
        this._content = content;
        this._coordinates = new Z.Coordinate(coordinates);
        this._initOptions(options);
        this._registerEvent();
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

    setSymbol:function(symbol, noEvent) {
        if (!symbol || symbol === this.options['symbol']) {
           symbol = {};
        }
       var camelSymbol = this._prepareSymbol(symbol);
       var s = {};
       Z.Util.extend(s, this.defaultSymbol, camelSymbol);
       this._symbol = s;

        if (!noEvent) {
            this._onSymbolChanged();
        }
        return this;
    },

    _refresh:function() {
        if (this.options['autosize']) {
            var symbol = this.getSymbol();
            if (!symbol['markerType']) {
                symbol['markerType'] = 'square';
            }
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
            this.setSymbol(symbol,true);
        }
    },
    _registerEvent: function() {
        this.on('shapechanged symbolchanged', this._refresh, this);
        return this;
    }
});
