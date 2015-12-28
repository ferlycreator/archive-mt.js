Z.Map.include({
	/**
     * 截图
     * @param  {Object} options 截图设置
     * @member maptalks.Map
     * @expose
     */
    snap:function(options) {
        var extent = options['extent'],
            zoom = options['zoom'];
        var format = options['format'];
        //optional host and port, if need another snap server to perform snapping.
        var host = options['host'];
        var url;
        if (host) {
            url = host+'/snap/';
        } else {
            url = this.prefix + 'snap/';
        }
        var profile = this.toJSON(options['profile']);
        if (extent) {
            profile.options['extent'] = extent;
        }
        if (!Z.Util.isNil(zoom)) {
            profile.options['zoom'] = zoom;
        }
        if (!format) {
            format = 'png';
        }
        var snapConfig = {
            "format" : format,
            "profile" : profile
        }
        var ajax = new Z.Util.Ajax(url, 0, JSON.stringify(snapConfig), function(responseText) {
            var result = JSON.parse(responseText);
            if (result['sucess']) {
                if (options['success']) {
                    options['success'](result);
                }
            } else {
                if (options['error']) {
                    options['error'](result);
                }
            }
        });
        ajax.post("text/plain");
    }
});
