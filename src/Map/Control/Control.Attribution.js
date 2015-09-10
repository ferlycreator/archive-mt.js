Z['Control']['Attribution'] = Z.Control.Attribution = Z.Control.extend({

    /**
    * 异常信息定义
    */
    exceptionDefs: {
        'en-US':{
            'NEED_ID':'You must set id to Attribution Control.',
            'DUPLICATE_ID':'This Control id:[%1] already exists.'
        },
        'zh-CN':{
            'NEED_ID':'您需要为Attribution控件设置id。',
            'DUPLICATE_ID':'该控件id:[%1]已存在!'
        }
    },

	options:{
		'id': 'CONTROL_ATTRIBUTION',
		'position' : {
			'bottom': '0',
			'right': '0'
		},
		'content' : '<a href="www.gis.com" target="_blank" style="text-decoration:none;cursor: pointer;color: #6490C4; ">@ X-GIS</a>'
	},

	statics: {
		'control_attribution_bg' : 'display: inline-block; background-color: #FAF7F5; opacity: 0.8;'
	},

	buildOn: function (map) {
		this._attributionContainer = Z.DomUtil.createEl('div');
		Z.DomUtil.setStyle(this._attributionContainer, Z.Control.Attribution['control_attribution_bg']);
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
		'id': 'MAP_CONTROL_ATTRIBUTION',
		'position' : {
			'bottom': '0',
			'right': '0'
		}
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['attributionControl']) {
		var attributionControlOptions = this['options']['attributionControlOptions'];
		if(!attributionControlOptions['id']) {
			attributionControlOptions['id'] = 'MAP_CONTROL_ATTRIBUTION';
		}
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
