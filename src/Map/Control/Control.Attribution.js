Z['Control']['Attribution'] = Z.Control.Attribution = Z.Control.extend({

	options:{
		'position' : {
			'bottom': '0',
			'right': '0'
		},
		'content' : '<a href="www.gis.com" target="_blank" style="text-decoration:none;cursor: pointer;color: #6490C4; ">@ X-GIS</a>'
	},

	statics: {
		'maptalks-control-attribution-bg' : 'display: inline-block; background-color: #FAF7F5; opacity: 0.8;'
	},

	buildOn: function (map) {
		this._attributionContainer = Z.DomUtil.createEl('div');
		Z.DomUtil.setStyle(this._attributionContainer, Z.Control.Attribution['maptalks-control-attribution-bg']);
        Z.DomUtil.on(this._attributionContainer, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation);
        this._update();
		return this._attributionContainer;
	},

	/**
	* @expose
	*/
	setContent: function (content) {
		this.options['content'] = content;
		this._update();
		return this;
	},

	_update: function () {
		if (!this._map) { return; }
		this._attributionContainer.innerHTML = this.options['content'];
	}
});

Z.Map.mergeOptions({
	'attributionControl' : false,
	'attributionControlOptions' : {
		'position' : {
			'bottom': '0',
			'right': '0'
		}
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['attributionControl']) {
		var attributionControlOptions = this['options']['attributionControlOptions'];
		if(!attributionControlOptions['position']) {
			attributionControlOptions['position'] = {
				'bottom': '0',
				'right': '0'
			};
		}
		this.attributionControl = new Z.Control.Attribution(attributionControlOptions);
		this['addControl'](this.attributionControl);
	}
});
