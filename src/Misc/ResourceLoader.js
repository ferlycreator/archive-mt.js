Z.ResourceLoader=Z.Class.extend({

		includes:Z.Eventable,

		defaultIconImg : null,


		initialize:function(urls) {
			this.imgUrls = urls;
			this.resourcesCache={};
			this.defaultIconUrl = "/engine/images/marker.png";
		},

		load:function(successFn, invoker) {
			this.successFn = successFn;
			this.successFnInvoker = invoker;
			if (!this.defaultIconImg) {
				var _this = this;
				this.defaultIconImg = new Image();
				this.defaultIconImg.onload=function() {
					_this.loadImages();
				};
				this.defaultIconImg.src=Z.host +this.defaultIconUrl;				
			} else {
				this.loadImages();
			}						
		},
		addResource:function(url) {
			if (!Z.Util.isString(url)) {
				return;
			}
			if (!this.imgUrls) {this.imgUrls = [];}
			if (this.resourcesCache[url]) {
				return;
			}
			this.imgUrls.push(url);
		},
		loadImages:function() {
			function onResourceLoad(image) {
				if (!image) {
					image = this;
				}
				if (!(image instanceof Image)) {
					image = this;
				}
				if (image && image["in"]) {
					_this.resourcesCache[image["in"]] = image;
				}				
				_this.check();
			}
			function onResourceFail() {
				_this.resourcesCache[this["in"]] = this.defaultIconImg;
			}

			if (!this.imgUrls || !Z.Util.isArray(this.imgUrls)) {
				this.onComplete();
				return;
			}
			var _this = this;
			var hasNew = false;
			for (var i = 0, len=this.imgUrls.length;i<len;i++) {
				if (!this.imgUrls[i]) {continue;}
				if (this.resourcesCache[this.imgUrls[i]]) {continue;}
				hasNew = true;
				var image = new Image();
				//防止绝对地址变成了相对地址
				image["in"] = this.imgUrls[i];
				image.onload=onResourceLoad;
				image.onerror=onResourceFail;
				image.onabort=onResourceFail;
				image.src=this.imgUrls[i];
				if (image["complete"]) {
					onResourceLoad(image);
				}
			}
			if (!hasNew) {
				this.check();
			}
			
		},
		getImage:function(url) {
			if (!this.resourcesCache || !url) {
				return this.defaultIconImg;
			}
			var img = this.resourcesCache[url];
			if (!img) {
				img = this.defaultIconImg;
			}
			return img;
		},
		check:function() {
			var allLoaded = true;
			for (var u in this.resourcesCache) {
				if (!this.resourcesCache[u]["complete"]) {
					allLoaded = false;
					break;
				}
			}
			if (allLoaded) {
				this.onComplete();
				
			}
		},
		onComplete:function() {
			if (this.completeExecutor) {
				clearTimeout(this.completeExecutor);
			}
			var _this = this;
			this.completeExecutor=setTimeout(function() {
				//_this.executeListeners("loadcomplete");
				if (_this.successFn) {
					if (this.successFnInvoker) {
						_this.successFn.call(this.successFnInvoker);
					} else {
						_this.successFn();
					}
				}
			},10);
		}
});
