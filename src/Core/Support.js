(function(){
    //解析host地址，插入css和vml定义
    var head= document.getElementsByTagName('head')[0];

    var headChildren = head.childNodes;
    var viewPortMeta = null;
    for (var i=0, len = headChildren.length;i<len;i++) {
    if ("meta" === headChildren[i].nodeName.toLowerCase()) {
        var metaName = (headChildren[i].getAttribute?headChildren[i].getAttribute("name"):null);
        if ("viewport" === metaName) {
            viewPortMeta = headChildren[i];
        }
    }
    }

    //根据script查找
    Z.host = '';
    var scriptTags = document.getElementsByTagName('script');
    var regex = /(?:\/engine).*[\/]maptalks(?:\.min)?\.js/;
    for (var i=0, len = scriptTags.length;i<len;i++) {
        var src = (scriptTags[i].getAttribute?scriptTags[i].getAttribute("src"):null);
        if (src !== null && src.match(regex)) {
            Z.host = src.split(regex)[0];
            if (!Z.host) {
                Z.host = window.location.protocol + '\/\/' + window.location.host;
            }
            break;
        }
    }

    if (Z.Browser.mobile) {
        if (viewPortMeta === null) {
            viewPortMeta=Z.DomUtil.createEl('meta');
            viewPortMeta.setAttribute("viewport");
            viewPortMeta.setAttribute("content","user-scalable=no");
            head.appendChild(viewPortMeta);
        } else {
            var viewPortContent = viewPortMeta.getAttribute("content");
            if (viewPortContent.indexOf("user-scalable=no") < 0) {
                viewPortMeta.setAttribute("content",viewPortContent+",user-scalable=no");
            }
        }
    }
    //ie插入vml定义
    if (Z.Browser.ielt9) {
        //chrome frame meta标签
        var cfMeta = Z.DomUtil.createEl('meta');
        cfMeta.setAttribute("http-equiv","X-UA-Compatible");
        cfMeta.setAttribute("content","IE=edge,chrome=1");
        head.appendChild(cfMeta);
        //<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    }
    if (!window['JSON']) {
        var script = document.createElement("script");
        script['type'] = "text/javascript";
        script['src'] = "lib/json3.min.js";
        head.appendChild(script);
    }
})();
