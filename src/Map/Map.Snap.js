Z.Map.include({
	/**
     * 截图
     * @param  {Object} options 截图设置
     * @member maptalks.Map
     * @expose
     */
    snap:function(options) {
        if (!options) {
            options = {
                "extent"    : this.getExtent(),
                "zoom"      : this.getZoom(),
                "format"    : "png"
            };
        }
        var extent = options['extent'] || this.getExtent(),
            zoom = options['zoom']  || this.getZoom(),
            format = options['format'] || "png";
        //optional host and port, if need another snap server to perform snapping.
        var host = options['host'];
        var url;
        if (host) {
            url = host+'/snapservice/';
        } else {
            var prefixUrl = new Z.Url(Z.prefix);
            var prefixHost = prefixUrl.getHost();
            var prefixPort = prefixUrl.getPort();
            url = 'http://'+ prefixHost + ':' + prefixPort + '/snapservice/';
        }
        var profile = this.toJSON(Z.Util.extend({}, options['profile'], {'clipExtent':extent}));
        profile['extent'] = extent;
        profile.options['zoom'] = zoom;

        var snapConfig = {
            "format" : format,
            "profile" : profile
        }
        var ajax = new Z.Util.Ajax(url, 0, JSON.stringify(snapConfig), function(responseText) {
            var result = JSON.parse(responseText);
            if (result['success']) {
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
        return this;
    }
});
