// For casting ability
//require("./libs/cast_sender_v1.js");

version = "0.1";
/*ziteLanguages = [
	"CS", "DA", "DE", "EN", "ES", "EO", "FR", "HU", "IT", "KO", "NL", "PL", "PT", "PT-BR", "RU", "TR", "UK", "ZH", "ZH-TW"
];*/

var defaultLang = require("./default-lang.js");

waitingForResponse = false;
permissionaddress = "12F5SvxoPR128aiudte78h8pY7mobroG6V"; // aka public address of kxoid.
base64_publickey = "BOVHKzLh7FHFKCx0DjPj7BCFkuVH0Qcf95uh4Ns69LCRGiUkF+4tbe+IhbilIO8AfRDztBZ4y7ELtfOYPLrx2TA=";
certname = "kxoid.bit";

userChannelIndexMerger = "1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F";

var MarkdownIt = require("markdown-it");
md = new MarkdownIt({
	html: false,
	linkify: true
});

jdenticon = require("jdenticon");
jdenticon.config = {
	replaceMode: "observe"
};

require('babel-polyfill');

var ZeroFrame = require("./libs/ZeroFrame.js");
var Router = require("./libs/router.js");
var searchDbQuery = require("./libs/search.js");

var Vue = require("vue/dist/vue.min.js");
//Vue = require("vue/dist/vue.min.js");
//var Vue = require("vue/dist/vue.common.js");

var Vuetify = require("vuetify");
var VueZeroFrameRouter = require("./libs/vue-zeroframe-router.js");

//var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr, sanitizeHtmlForDb } = require("./util.js");

Vue.use(VueZeroFrameRouter.VueZeroFrameRouter);
Vue.use(Vuetify);

// Vue Components
var Navbar = require("./vue_components/navbar.vue");
var NavDrawer = require("./vue_components/nav-drawer.vue");

var app = new Vue({
	el: "#app",
	template: `<div><v-app>
			<v-navigation-drawer app clipped fixed light width="225" hide-overlay v-model="drawer" style="padding-bottom: 50px;">
				<component ref="nav_drawer" :is="nav_drawer" v-model="drawer" v-on:setcallback="setCallback" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :user-channels="userChannels" :lang-translation="langTranslation"></component>
			</v-navigation-drawer>
			<component ref="navbar" :is="navbar" v-on:toggle-drawer="toggleDrawer" v-on:setcallback="setCallback" :user-settings="userSettings" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :user-channels="userChannels" :lang-translation="langTranslation" v-on:startcasting="startCasting" v-on:stopcasting="stopCasting"></component>
			<v-content>
				<component ref="view" :is="currentView" v-on:setcallback="setCallback" v-on:get-user-info="getUserInfo()" :getting-settings="gettingSettings" :user-settings="userSettings" v-on:setusersettings="setUserSettings" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :getting-user-info="gettingUserInfo" :user-channels="userChannels" :lang-translation="langTranslation" v-on:stopcasting="stopCasting"></component>
			</v-content>
		</v-app></div>`,
	data: {
		navbar: Navbar,
		nav_drawer: NavDrawer,
		currentView: null,
		siteInfo: {
			privatekey: null,
			cert_user_id: null,
			auth_address: null,
			settings: null,
		},
		userInfo: {
		    keyvalue: {
    		    ko_interface: false,
    		    cs_interface: false,
    		    subscriptions: []
    		},
		    cert_user_id: null,
			auth_address: null,
			privatekey: null,
		},
		userChannels: [],
		gettingUserInfo: true,
		langTranslation: defaultLang,
		updateCallback: null,
		navDrawerUpdateCallback: null,
		updateSiteInfoCallback: null,
		castingAllowed: false, // For Chromecast support
		isCasting: false,
		castSession: null,
		drawer: null,
		userSettings: {
			allowCasting: false,
			castingServer: "",
			introductionFinished: false
		},
		gettingSettings: true
	},
	beforeMount: function() {
		if (chrome) {
			this.castingAllowed = true;
		}
	},
	methods: {
		setUserSettings: function(settings) {
			console.log("Set User Settings");
			this.$set(this.userSettings, "allowCasting", settings.allowCasting);
			this.$set(this.userSettings, "castingServer", settings.castingServer);
			this.$set(this.userSettings, 'introductionFinished', settings.introductionFinished);
		},
		startCasting: function() {
			var self = this;

			var startCasting = () => {
				chrome.cast.requestSession(function(castSession) {
					self.isCasting = true;
					self.castSession = castSession;
					console.log(castSession);
				}, (err) => {
					console.log("Failed: ", err);
				});
			}

			if (!chrome.cast) {
				page.cmd("wrapperConfirm", ["Download file from internet to allow Casting?", "Yes"], (confirmed) => {
					if (confirmed) {
						var script = document.createElement("script");
						script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
						document.head.appendChild(script);
						//document.getElementsByTagName("head").innerHTML += '<script src="//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"></script>';
						setTimeout(function() {
							self.initializeCasting(function() {
								startCasting();
							});
						}, 1000);
						page.cmd("wrapperConfirm", ["Automatically allow Casting when you visit the zite?", "Yes"], (confirmed) => {
							if (confirmed) {
								page.cmd("userSetSettings", [{ allowCasting: true, castingServer: self.userSettings.castingServer, introductionFinished: self.userSettings.introductionFinished }]);
								self.setUserSettings({ allowCasting: true, castingServer: self.userSettings.castingServer, introductionFinished: self.userSettings.introductionFinished });
							}
						});
					}
				});
			} else {
				startCasting();
			}
		},
		stopCasting: function() {
			this.castSession.stop();
			this.isCasting = false;		  
		},
		toggleDrawer: function() {
			this.drawer = !this.drawer;
		},
		getUserInfo: function(f = null) {
			console.log(this.siteInfo);
            if (this.siteInfo == null || this.siteInfo.cert_user_id == null) {
                this.userInfo = null;
				//this.$emit("setuserinfo", this.userInfo);
				//this.$emit("update");
				app.callCallback("update", this.userInfo);
				app.callCallback("navDrawerUpdate", this.userInfo);
                return;
            }

            var that = this;

            if (f !== null && typeof f === "function") f();

            page.cmd("dbQuery", ["SELECT key, value FROM keyvalue LEFT JOIN json USING (json_id) WHERE cert_user_id=\"" + this.siteInfo.cert_user_id + "\" AND directory=\"data/users/" + this.siteInfo.auth_address + "\""], (rows) => {
                var keyvalue = {};

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    
                    keyvalue[row.key] = row.value;
                }
				
				if (that.userInfo != null) {
					that.$set(that.userInfo, 'privatekey', that.siteInfo.privatekey);
					that.$set(that.userInfo, 'cert_user_id', that.siteInfo.cert_user_id);
					that.$set(that.userInfo, 'auth_address', that.siteInfo.auth_address);
					that.$set(that.userInfo, 'keyvalue', keyvalue);
				} else {
					that.userInfo = {
						privatekey: that.siteInfo.privatekey,
						cert_user_id: that.siteInfo.cert_user_id,
						auth_address: that.siteInfo.auth_address,
						keyvalue: keyvalue
					};
				}

				console.log(keyvalue);

				if (that.userInfo.keyvalue.ko_interface) {
					page.cmdp("fileGet", { "inner_path": "languages/ko.json", "required": false }).then((data) => {
						data = JSON.parse(data);
						console.log("langdata: ", data);
						if (data) {
							app.langTranslation = data;
							app.$emit("setLanguage", data);
						}
					});
				} else if (that.userInfo.keyvalue.cs_interface) {
					page.cmdp("fileGet", { "inner_path": "languages/cs.json", "required": false }).then((data) => {
						data = JSON.parse(data);
						console.log("langdata: ", data);
						if (data) {
							app.langTranslation = data;
							app.$emit("setLanguage", data);
						}
					});
				}

				console.log("Keyvalue: ", that.userInfo.keyvalue);

				that.gettingUserInfo = false;
				//that.$emit("setUserInfo", that.userInfo); // TODO: Not sure if I need this if I can pass in a function callback instead
				//that.$emit("update", that.userInfo);
				app.$refs.view.$forceUpdate();
				app.$refs.nav_drawer.$forceUpdate();
				app.callCallback("update", that.userInfo);
				app.callCallback("navDrawerUpdate", that.userInfo);
				if (f !== null && typeof f === "function") f();
			});
			
			page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE cert_user_id=\"" + this.siteInfo.cert_user_id + "\" AND directory=\"data/users/" + this.siteInfo.auth_address + "\""])
				.then((results) => {
					console.log(results);
					app.userChannels = results;
				});
		},
		/*importZite: function(zite) {
			this.ziteToImport = zite;
			Router.navigate('import-zite');
		},*/
		setCallback: function(name, callback) {
			console.log("Setting '" + name + "Callback' callback to ", callback);
			this[name + "Callback"] = callback;
		},
		callCallback: function(name, ...params) {
			if (!this[name + "Callback"]) return;
			this[name + "Callback"](...params);
			this.$emit(name);
		},
		setSiteInfo: function(siteInfo) {
			//this.siteInfo = siteInfo;
			this.$set(this.siteInfo, 'privatekey', siteInfo.privatekey || false);
			this.$set(this.siteInfo, 'settings', siteInfo.settings);
			this.$set(this.siteInfo, 'cert_user_id', siteInfo.cert_user_id);
			this.$set(this.siteInfo, 'auth_address', siteInfo.auth_address);
			this.getUserInfo();

			console.log(this.siteInfo.cert_user_id);
		},
		initializeCasting: function(onSuccess = null) {
			var self = this;

			console.log("Initializing casting");

			var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
			var apiConfig = new chrome.cast.ApiConfig(sessionRequest, function(e) {
				// sessionListener
				console.log(e);
			}, function(e) {
				// receiverListener
				console.log(e);
				if( e !== chrome.cast.ReceiverAvailability.AVAILABLE) {
					//self.castingAllowed = false;
				}
			});
			chrome.cast.initialize(apiConfig, function() {
				// onInitSuccess
				console.log("Initialized casting: success!");
				if (onSuccess) {
					onSuccess();
				}
			}, function() {
				// onFailed
			});
		}
	}
});

class ZeroApp extends ZeroFrame {
	onOpenWebsocket() {
		var self = this;

		this.cmdp("userGetSettings")
			.then((settings) => {
				app.gettingSettings = false;
				app.$set(app.userSettings, "allowCasting", settings.allowCasting || false);
				app.$set(app.userSettings, "castingServer", settings.castingServer || "https://0net.io/");
				app.$set(app.userSettings, 'introductionFinished', settings.introductionFinished || false);
				if (settings.allowCasting) {
					var script = document.createElement("script");
					script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
					document.head.appendChild(script);
					setTimeout(app.initializeCasting, 1000);
				}
			});

		this.cmdp("serverInfo", {})
			.then((serverInfo) => {
				console.log(serverInfo);
				self.serverInfo = serverInfo;
				app.serverInfo = serverInfo;
				return this.cmdp("fileGet", { "inner_path": "languages/" + self.serverInfo.language + ".json", "required": false })
			}).then((data) => {
				data = JSON.parse(data);
				console.log("langdata: ", data);
				if (data) {
					app.langTranslation = data;
					app.$emit("setLanguage", data);
				}
				return this.cmdp("siteInfo", {});
			}).then((siteInfo) => {
				console.log(siteInfo);
				this.siteInfo = siteInfo;
				app.setSiteInfo(siteInfo);
				//app.siteInfo = siteInfo;
				
				if(siteInfo.settings.permissions.indexOf("Merger:KxoVid") == -1) {
					page.cmd("wrapperPermissionAdd", ["Merger:KxoVid"], function() {
						page.addUserChannelIndexMerger();
					});
				} else {
					page.addUserChannelIndexMerger();
				}

				//app.callCallback("updateSiteInfo", siteInfo);
				if(siteInfo.address!="14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz"&&!siteInfo.settings.own){self.cmdp("wrapperNotification",["warning","Note: This was cloned from another zite. You<br>\ncan find the original zite at this address:<br>\n 14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz."]);}
				
			});
	}

	addUserChannelIndexMerger() {
		page.cmd("mergerSiteList", [], function(sites) {
			if(Object.keys(sites).indexOf(userChannelIndexMerger) === -1) {
				page.cmd("mergerSiteAdd", [userChannelIndexMerger], function() {
					app.getUserInfo();
					app.callCallback("update");
					app.callCallback("navDrawerUpdate");
				});
			} else {
				app.getUserInfo();
				app.callCallback("update");
				app.callCallback("navDrawerUpdate");
			}
		});
	}

	onRequest(cmd, message) {
		Router.listenForBack(cmd, message);
		if (cmd === "setSiteInfo") {
			if (message.params.address == "14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz") {
				this.siteInfo = message.params;
				//app.siteInfo = message.params;
				console.log("onRequest SiteInfo: ", message.params);
				app.setSiteInfo(message.params);
				//app.getUserInfo();
			}
		}

		if (message.params.event && message.params.event[0] === "file_done") {
			//app.getUserInfo();
			//app.$emit("update");
			app.callCallback("update");
			app.callCallback("navDrawerUpdate");
		}
	}

	selectUser() {
		return this.cmdp("certSelect", { accepted_domains: ["kxoid.bit"] });
    }

    signout() {
    	return this.cmdp("certSelect", { accepted_domains: [""] });
    }

    unimplemented() {
        return page.cmdp("wrapperNotification", ["info", "Unimplemented!"]);
	}

	checkOptional(address, doSignPublish, f) {
        if (!app.userInfo || !app.userInfo.cert_user_id) {
            this.cmd("wrapperNotification", ["info", "Please login first."]);
            //page.selectUser(); // TODO: Check if user has data, if not, show the registration modal.
            return;
        }

        var data_inner_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/data.json";
        var content_inner_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/content.json";

        // Verify that user has correct "optional" and "ignore" values
        page.cmd("fileGet", { "inner_path": content_inner_path, "required": false }, (data) => {
            if (!data) data = {};
            else data = JSON.parse(data);

            var curoptional = ".+\\.(mp4|ogg|webm)(.piecemap.msgpack)?";
            var changed = false;
            if (!data.hasOwnProperty("optional") || data.optional !== curoptional){
                data["optional"] = curoptional
                changed = true;
            }

            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));

            if (changed) {
                // Write (and Sign and Publish is doSignPublish)
                page.cmd("fileWrite", [content_inner_path, btoa(json_raw)], (res) => {
                    if (res === "ok") {
                        if (f != null && typeof f === "function") f();
                        if (doSignPublish) {
                            page.cmd("siteSign", { "inner_path": content_inner_path }, () => {
                                page.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false });
                            });
                        }
                    } else {
                        page.cmd("wrapperNotification", ["error", "File write error: " + JSON.stringify(res)]);
                    }
                });
            } else {
                if (f != null && typeof f === "function") f();
            }
        });
    }

	uploadBigFile(address, file, f = null) {
		var date_added = Date.now();
        var orig_filename_list = file.name.split(".");
        var filename = orig_filename_list[0].replace(/\s/g, "_").replace(/[^\x00-\x7F]/g, "").replace(/\'/g, "").replace(/\"/g, "").replace(/%20/g, "").replace(/\.([0-9]+)/g, "$1") + "-" + date_added + "." + orig_filename_list[orig_filename_list.length - 1];

        var f_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/" + filename;

        page.checkOptional(address, false, () => {
            page.cmd("bigfileUploadInit", [f_path, file.size], (init_res) => {
                var formdata = new FormData();
                formdata.append(file.name, file);

                var req = new XMLHttpRequest();

                req.upload.addEventListener("progress", console.log);
                req.upload.addEventListener("loadend", () => {
					console.log("Loadend");
					// Pin file so it is excluded from the automatized optional file cleanup
					page.cmd("optionalFilePin", { "inner_path": f_path });
					
                    page.cmd("wrapperNotification", ["info", "Upload finished!"]);
                    if (f !== null && typeof f === "function") f(f_path.replace(/%/g, ""));
                });
                req.withCredentials = true;
                req.open("POST", init_res.url);
                req.send(formdata);
            });
        });
	}

	editTableData(mergerAddress, table, manageDataFunc, beforePublishCB = null) {
		if (!page.siteInfo.cert_user_id) {
			return page.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
			return page.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}
	
		var data_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + page.siteInfo.auth_address + "/data.json";
		var content_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + page.siteInfo.auth_address + "/content.json";
	
		//var self = this;
		return page.cmdp("fileGet", { "inner_path": data_inner_path, "required": false })
			.then((data) => {
				data = JSON.parse(data);
				if (!data) {
					data = {};
				}
	
				if (!data[table]) data[table] = [];
	
				var date = Date.now();
	
				// date_added, data, tableData
				data[table] = manageDataFunc(date, data, data[table]);
	
				if (data[table] == null) {
					return { "err": "returned" };
				}
	
				/*data["questions"].push({
					"question_id": date,
					"title": title,
					"body": body,
					"tags": tags,
					"date_added": date
				});*/
	
				var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));
	
				return page.cmdp("fileWrite", [data_inner_path, btoa(json_raw)])
					.then((res) => {
						if (res === "ok") {
							return page.cmdp("siteSign", { "inner_path": content_inner_path })
								.then((res) => {
									if (res === "ok") {
										app.getUserInfo();
										if (beforePublishCB != null && typeof beforePublishCB === "function") beforePublishCB({ "date": date, "auth_address": page.siteInfo.auth_address });
										return page.cmdp("sitePublish", { "inner_path": content_inner_path, "sign": false })
											.then(() => {
												return { "date": date, "auth_address": page.siteInfo.auth_address };
											}).catch((err) => {
												console.log(err);
												return { "date": date, "auth_address": page.siteInfo.auth_address, "err": err };
											});
									} else {
										return page.cmdp("wrapperNotification", ["error", "Failed to sign user data."]);
									}
								});
						} else {
							return page.cmdp("wrapperNotification", ["error", "Failed to write to data file."]);
						}
					});
			});
	}

	editData(mergerAddress, manageDataFunc, beforePublishCB = null) {
		if (!page.siteInfo.cert_user_id) {
			return page.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
			return page.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}
	
		var data_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + page.siteInfo.auth_address + "/data.json";
		var content_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + page.siteInfo.auth_address + "/content.json";
	
		//var self = this;
		return page.cmdp("fileGet", { "inner_path": data_inner_path, "required": false })
			.then((data) => {
				data = JSON.parse(data);
				if (!data) {
					data = {};
				}

				var date = Date.now();
				
				data = manageDataFunc(data);

				if (data == null) {
					return { "err": "returned" };
				}
	
				/*data["questions"].push({
					"question_id": date,
					"title": title,
					"body": body,
					"tags": tags,
					"date_added": date
				});*/
	
				var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));
	
				return page.cmdp("fileWrite", [data_inner_path, btoa(json_raw)])
					.then((res) => {
						if (res === "ok") {
							return page.cmdp("siteSign", { "inner_path": content_inner_path })
								.then((res) => {
									if (res === "ok") {
										app.getUserInfo();
										if (beforePublishCB != null && typeof beforePublishCB === "function") beforePublishCB({ "date": date, "auth_address": page.siteInfo.auth_address });
										return page.cmdp("sitePublish", { "inner_path": content_inner_path, "sign": false })
											.then(() => {
												return { "date": date, "auth_address": page.siteInfo.auth_address };
											}).catch((err) => {
												console.log(err);
												return { "date": date, "auth_address": page.siteInfo.auth_address, "err": err };
											});
									} else {
										return page.cmdp("wrapperNotification", ["error", "Failed to sign user data."]);
									}
								});
						} else {
							return page.cmdp("wrapperNotification", ["error", "Failed to write to data file."]);
						}
					});
			});
	}
}

page = new ZeroApp();

var Home = require("./router_pages/home.vue");
var CreateChannel = require("./router_pages/create_channel.vue");
var Channel = require("./router_pages/channel.vue");
var ChannelSettings = require("./router_pages/channel_settings.vue");
var Categories = require("./router_pages/categories.vue");
var AddCategory = require("./router_pages/add_category.vue");
var Upload = require("./router_pages/upload.vue");
var Video = require("./router_pages/video.vue");
var Subscriptions = require("./router_pages/subscriptions.vue");
var Search = require("./router_pages/search.vue");

var DeviceSettings = require("./router_pages/device_settings.vue");
var SupportMe = require("./router_pages/support_me.vue");

VueZeroFrameRouter.VueZeroFrameRouter_Init(Router, app, [
	{ route: "search/:searchquery", component: Search },
	{ route: "support-me", component: SupportMe },
	{ route: "device-settings", component: DeviceSettings },
	{ route: "subscriptions", component: Subscriptions },
	{ route: "upload", component: Upload },
	{ route: "categories/add", component: AddCategory },
	{ route: "categories", component: Categories },
	{ route: "channel/create", component: CreateChannel },
	{ route: "channel/settings/:id", component: ChannelSettings },
	{ route: "channel/:auth_address/:id/v/:videoid", component: Video },
	{ route: "channel/:auth_address/:id", component: Channel },
	{ route: "", component: Home }
]);

// ---------------------------------
/*
window['__onGCastApiAvailable'] = function(isAvailable) {
	if (isAvailable) {
	  initializeCastApi();
	  //app.$set(app, "castingAllowed", true);
	  //app.castingAllowed = true;
	}
};

initializeCastApi = function() {
	cast.framework.CastContext.getInstance().setOptions({
		receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
		autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
	  });
};

window.__onGCastApiAvailable = function(isAvailable){
    if(! isAvailable){
        return false;
    }

    var castContext = cast.framework.CastContext.getInstance();

    castContext.setOptions({
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    });

    var stateChanged = cast.framework.CastContextEventType.CAST_STATE_CHANGED;
    castContext.addEventListener(stateChanged, function(event){
		console.log(event);
		console.log("Create Cast stuff!");
		console.log('https://0net.io/' + document.getElementById('vid').src.replace('http://127.0.0.1:43110/', ''));
        var castSession = castContext.getCurrentSession();
        var media = new chrome.cast.media.MediaInfo('https://0net.io/' + document.getElementById('vid').src.replace('http://127.0.0.1:43110/', ''), 'video/mp4');
        var request = new chrome.cast.media.LoadRequest(media);

        castSession && castSession
            .loadMedia(request)
            .then(function(){
                console.log('Success');
            })
            .catch(function(error){
                console.log('Error: ' + error);
            });
    });
};
*/