/**
 * 导航控件
 * @class maptalks.Control.Nav
 * @extends maptalks.Control
 * @author Maptalks Team
 */
Z.Control.Nav = Z.Control.extend({

    /**
     * @cfg {Object} options 导航控件属性
     */
    options:{
        'position' : Z.Control['top_left']
    },

    buildOn: function (map) {
        return null;
    }

});

Z.Map.mergeOptions({
    /**
     * @cfg {Boolean} [navControl="false"] 是否显示导航控件
     * @member maptalks.Map
     */
    'navControl' : false
});

Z.Map.addOnLoadHook(function () {
    if (this.options['navControl']) {
        this.navControl = new Z.Control.Nav();
        this.addControl(this.navControl);
    }
});
