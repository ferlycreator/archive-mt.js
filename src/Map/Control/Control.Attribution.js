/**
 * 版权信息组件
 * @class maptalks.Control.Attribution
 * @extends maptalks.Control
 * @author Maptalks Team
 */
Z.Control.Attribution = Z.Control.extend({

    /**
     * @cfg {Object} options 版权信息控件属性
     */
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


	_buildOn: function (map) {
		this._attributionContainer = Z.DomUtil.createEl('div');
		Z.DomUtil.setStyle(this._attributionContainer, Z.Control.Attribution['maptalks-control-attribution-bg']);
        Z.DomUtil.on(this._attributionContainer, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation);
        this._update();
		return this._attributionContainer;
	},

	/**
	 * 设置版权信息内容
	 * @param {String} content 版权信息内容
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
    /**
     * @cfg {Boolean} [attributionControl="false"] 是否显示版权信息
     * @member maptalks.Map
     */
	'attributionControl' : false,
	/**
     * @cfg {Object}  attributionControlOptions 版权信息参数
     * @member maptalks.Map
     */
	'attributionControlOptions' : {
		'position' : {
			'bottom': '0',
			'right': '0'
		},
        'content' : '<a href="www.gis.com" target="_blank" style="text-decoration:none;cursor: pointer;color: #6490C4; ">@ X-GIS</a>'
	}
});

Z.Map.addOnLoadHook(function () {
	if (this.options['attributionControl']) {
		var attributionControlOptions = this.options['attributionControlOptions'];
		if(!attributionControlOptions['position']) {
			attributionControlOptions['position'] = {
				'bottom': '0',
				'right': '0'
			};
		}
		this.attributionControl = new Z.Control.Attribution(attributionControlOptions);
		this.addControl(this.attributionControl);
	}
});
