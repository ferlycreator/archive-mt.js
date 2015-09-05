Z['Control']['Zoom'] = Z.Control.Zoom = Z.Control.extend({

	options:{
		'id': 'CONTROL_ZOOM',
		'position' : Z.Control['top_right']
	},

	buildOn: function (map) {
		this._zoomControlContainer = Z.DomUtil.createElOn('div', 'display:inline-block;_zoom:1;*display:inline;');
        this._zoomInButton  = this._createButton('放大', 'control_zoom_button control_zoom_in', this._zoomIn);
		this._zoomLevelLabel = this._createZoomLevelLabel();
		this._zoomOutButton = this._createButton('缩小', 'control_zoom_button control_zoom_out', this._zoomOut);
		this._zoomSlider = this._createSlider();
		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);
		return this._zoomControlContainer;
	},

	_onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
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
		Z.DomUtil.addClass(zoomLevelLabel, 'control_zoomlevel_bg');
		this._zoomLevelNum = Z.DomUtil.createElOn('div', '', zoomLevelLabel);
		Z.DomUtil.addClass(this._zoomLevelNum, 'control_zoomlevel_num');
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
		Z.DomUtil.addClass(zoomDrop, 'control_zoomdrop');

		var zoom = Z.DomUtil.createElOn('div', '', zoomDrop);
		var zoomBar = Z.DomUtil.createElOn('div', '', zoom);
		Z.DomUtil.addClass(zoomBar, 'control_zoombar');
		var zoomBarBg = Z.DomUtil.createElOn('div', '', zoomBar);
		Z.DomUtil.addClass(zoomBarBg, 'control_zoombar_background');
		this._zoomBarSlider = Z.DomUtil.createElOn('div', '', zoomBar);
		Z.DomUtil.addClass(this._zoomBarSlider, 'control_zoom_slider');

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
		var level = this._map._maxZoomLevel - Math.round(offsetY/7.2);
		var top = (this._map._maxZoomLevel-level)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + top+'px');
        this._map.setZoomLevel(level);
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
		var sliderTop = (this._map._maxZoomLevel - this._map._zoomLevel)*7.2;
        Z.DomUtil.setStyle(this._zoomBarSlider, 'top: ' + sliderTop+'px');
	}
});

Z.Map.mergeOptions({
	'zoomControl': false,
	'zoomControlOptions' : {
		'id': 'MAP_CONTROL_ZOOM',
		'position' : Z.Control['top_right']
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['zoomControl']) {
		var zoomControlOptions = this['options']['zoomControlOptions'];
		if(!zoomControlOptions['id']) {
			zoomControlOptions['id'] = 'MAP_CONTROL_ZOOM';
		}
		if(!zoomControlOptions['position']) {
			zoomControlOptions['position'] = Z.Control['top_right'];
		}
		this.zoomControl = new Z.Control.Zoom(zoomControlOptions);
		this['addControl'](this.zoomControl);
		this.zoomControl.enable();
	}
});
