Z['Control']['Toolbar'] = Z.Control.Toolbar = Z.Control.extend({

	options:{
		'position' : {
			'bottom': '0',
			'right': '0'
		}
	},

	statics: {

	},

	buildOn: function (map) {
		this._toolbarContainer = Z.DomUtil.createEl('div');
        Z.DomUtil.on(this._toolbarContainer, 'mousedown mousemove dblclick contextmenu', Z.DomUtil.stopPropagation);
		return this._toolbarContainer;
	}
});