/**
 * 地图放大缩小控件
 * @class maptalks.Control.Zoom
 * @extends maptalks.Control
 * @author Maptalks Team
 */
Z['Control']['Zoom'] = Z.Control.Zoom = Z.Control.extend({

    /**
     * @cfg {Object} options zoom控件属性
     */
    options:{
        'position' : Z.Control['top_right']
    },

    _buildOn: function (map) {
        this._zoomControlContainer = Z.DomUtil.createElOn('div', 'display:inline-block;_zoom:1;*display:inline;');
        this._zoomInButton  = this._createButton('放大', 'maptalks-control-zoom-button maptalks-control-zoom-in', this._zoomIn);
        this._zoomLevelLabel = this._createZoomLevelLabel();
        this._zoomOutButton = this._createButton('缩小', 'maptalks-control-zoom-button maptalks-control-zoom-out', this._zoomOut);
        this._zoomSlider = this._createSlider();
        this._updateDisabled();
        map.on('_zoomend', this._updateDisabled, this);
        return this._zoomControlContainer;
    },

    _onRemove: function (map) {
        map.off('_zoomend', this._updateDisabled, this);
    },

    disable: function () {
        this._disabled = true;
        this._updateDisabled();
        return this;
    },

    enable: function () {
        this._disabled = false;
        this._updateDisabled();
        return this;
    },

    _zoomIn: function (e) {
        if (!this._disabled) {
            this._map.zoomIn();
            this._updateSliderPosition();
        }
    },

    _zoomOut: function (e) {
        if (!this._disabled) {
            this._map.zoomOut();
            this._updateSliderPosition();
        }
    },

    _createButton: function (title, className, fn) {
        var link = Z.DomUtil.createElOn('a', '', this._zoomControlContainer);
        Z.DomUtil.addClass(link, className);
        link['title'] = title;
        link['href'] = '#';
        Z.DomUtil.on(link, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation)
                 .on(link, 'mouseover', this._showSlider, this)
                 .on(link, 'mouseout', this._hideSlider, this)
                 .on(link, 'click', Z.DomUtil.stop)
                 .on(link, 'click', fn, this);
        return link;
    },

    _createZoomLevelLabel: function() {
        var zoomLevelLabel = Z.DomUtil.createElOn('div', '', this._zoomControlContainer);
        Z.DomUtil.addClass(zoomLevelLabel, 'maptalks-control-zoomlevel-bg');
        this._zoomLevelNum = Z.DomUtil.createElOn('div', '', zoomLevelLabel);
        Z.DomUtil.addClass(this._zoomLevelNum, 'maptalks-control-zoomlevel-num');
        this._updateZoomLevel();
        Z.DomUtil.on(zoomLevelLabel, 'mousedown mousemove click, dblclick contextmenu', Z.DomUtil.stopPropagation)
                 .on(zoomLevelLabel, 'mouseover', this._showSlider, this)
                 .on(zoomLevelLabel, 'mouseout', this._hideSlider, this);
        return zoomLevelLabel;
    },


    _updateZoomLevel: function() {
        this._zoomLevelNum['innerHTML'] = this._map._zoomLevel;
    },

    _createSlider: function() {
        var zoomDrop = Z.DomUtil.createElOn('div', 'display: none');
        Z.DomUtil.addClass(zoomDrop, 'maptalks-control-zoomdrop');

        var zoom = Z.DomUtil.createElOn('div', '', zoomDrop);
        var zoomBar = Z.DomUtil.createElOn('div', '', zoom);
        Z.DomUtil.addClass(zoomBar, 'maptalks-control-zoombar');
        var zoomBarBg = Z.DomUtil.createElOn('div', '', zoomBar);
        Z.DomUtil.addClass(zoomBarBg, 'maptalks-control-zoombar-background');
        this._zoomBarSlider = Z.DomUtil.createElOn('div', '', zoomBar);
        Z.DomUtil.addClass(this._zoomBarSlider, 'maptalks-control-zoom-slider');

        Z.DomUtil.on(zoomDrop, 'mousemove dblclick contextmenu', Z.DomUtil.stopPropagation)
                 .on(zoomDrop, 'mouseover', this._showSlider, this)
                 .on(zoomDrop, 'mouseout', this._hideSlider, this)
                 .on(zoomDrop, 'click', Z.DomUtil.stop)
                 .on(zoomDrop, 'click', this._slider, this)
                 .on(zoomDrop, 'mousedown', Z.DomUtil.stop);
        if(this.options['position']['bottom']&&this.options['position']['bottom'] > 0) {
            this._zoomControlContainer.insertBefore(zoomDrop, this._zoomControlContainer.firstChild);
        } else {
            this._zoomControlContainer.appendChild(zoomDrop);
        }
        return zoomDrop;
    },


    _slider: function(event) {
        var offsetY = event['offsetY'];
        if(offsetY<=7.2) offsetY = 0;
        var level = this._map.getMaxZoom() - Math.round(offsetY/7.2);
        var top = (this._map.getMaxZoom()-level)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + top+'px');
        this._map.setZoom(level);
    },

    _showSlider: function() {
        Z.DomUtil.setStyle(this._zoomSlider, 'display: block');
    },

    _hideSlider: function() {
        Z.DomUtil.setStyle(this._zoomSlider, 'display: none');
    },

    _updateDisabled: function () {
        if (this._disabled) {
            Z.DomUtil.setStyle(this._zoomInButton, 'display: none');
            Z.DomUtil.setStyle(this._zoomOutButton, 'display: none');
        } else {
            Z.DomUtil.setStyle(this._zoomInButton, 'display: display:inline-block;_zoom:1;*display:inline;');
            Z.DomUtil.setStyle(this._zoomOutButton, 'display: display:inline-block;_zoom:1;*display:inline;');
        }
        this._updateSliderPosition();
    },

    _updateSliderPosition: function() {
        this._updateZoomLevel();
        var sliderTop = (this._map.getMaxZoom() - this._map._zoomLevel)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + sliderTop+'px');
    }
});

Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [zoomControl="false"] 是否显示zoom控件
     * @member maptalks.Map
     */
    'zoomControl': false,
    /**
     * @cfg {Object}  zoomControlOptions zoom控件设置
     * @member maptalks.Map
     */
    'zoomControlOptions' : {
        'position' : Z.Control['top_right']
    }
});

Z.Map.addOnLoadHook(function () {
    if (this.options['zoomControl']) {
        var zoomControlOptions = this['options']['zoomControlOptions'];
        if(!zoomControlOptions['position']) {
            zoomControlOptions['position'] = Z.Control['top_right'];
        }
        this.zoomControl = new Z.Control.Zoom(zoomControlOptions);
        this['addControl'](this.zoomControl);
        this.zoomControl.enable();
    }
});
