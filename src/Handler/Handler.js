/**
 * 操作类
 * @class maptalks.Handler
 * @extends maptalks.Class
 * @mixins maptalks.Eventable
 * @author Maptalks Team
 */
Z.Handler = Z.Class.extend({
	includes: Z.Eventable,

    /**
     * @constructor
     * @param {maptalks.Map} map
     */
	initialize: function (map) {
		this.map = map;
	},

	/**
	 * 激活Handler
	 */
	enable:function(){
		this.addHooks();
	},

	/**
	 * 取消激活Handler
	 */
	disable:function(){
		this.removeHooks();
	}
});