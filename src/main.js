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
	linkify: true,
	breaks: true,
});

jdenticon = require("jdenticon");
jdenticon.config = {
	replaceMode: "observe"
};

require('babel-polyfill');

var ZeroFrame = require("./libs/ZeroFrame.js");
Router = require("./libs/router.js");
var searchDbQuery = require("./libs/search.js");

var Vue = require("vue/dist/vue.min.js");
//Vue = require("vue/dist/vue.min.js");
//var Vue = require("vue/dist/vue.common.js");

var Vuetify = require("vuetify");
var VueZeroFrameRouter = require("./libs/vue-zeroframe-router.js");

require("./libs/util.js");

/*Clappr = require("clappr");
PlaybackRatePlugin = require("clappr-playback-rate-plugin").default;
ClapperVideo360 = require("clappr-video360");*/

//var { sanitizeStringForUrl, sanitizeStringForUrl_SQL, html_substr, sanitizeHtmlForDb } = require("./util.js");

Vue.use(VueZeroFrameRouter.VueZeroFrameRouter);
Vue.use(Vuetify);

// Vue Components
var Navbar = require("./vue_components/navbar.vue");
var NavDrawer = require("./vue_components/nav-drawer.vue");

var app = new Vue({
	el: "#app",
	template: `<div><v-app role="application" :dark="theme == 'dark'">
			<v-navigation-drawer role="navigation" app clipped fixed light width="225" hide-overlay v-model="drawer" :dark="theme == 'dark'" style="padding-bottom: 50px;">
				<component ref="nav_drawer" :is="nav_drawer" v-model="drawer" v-on:setcallback="setCallback" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :user-channels="userChannels" :lang-translation="langTranslation" :theme="theme"></component>
			</v-navigation-drawer>
			<component ref="navbar" role="banner" :is="navbar" v-on:toggle-drawer="toggleDrawer" v-on:setcallback="setCallback" :theme="theme" :user-settings="userSettings" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :user-channels="userChannels" :lang-translation="langTranslation" v-on:startcasting="startCasting" v-on:stopcasting="stopCasting"></component>
			<v-content>
				<component ref="view" :is="currentView" v-on:setcallback="setCallback" v-on:get-user-info="getUserInfo()" :theme="theme" :getting-settings="gettingSettings" :user-settings="userSettings" v-on:setusersettings="setUserSettings" :casting-allowed="castingAllowed" :is-casting="isCasting" :cast-session="castSession" :user-info="userInfo" :site-info="siteInfo" :getting-user-info="gettingUserInfo" :user-channels="userChannels" :lang-translation="langTranslation" v-on:stopcasting="stopCasting"></component>
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
		theme: "",
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

			if (!chrome || !chrome.cast) {
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

				// Update FeedFollow info with subscriptions
				var subs = that.userInfo.keyvalue.subscriptions.split('|');
                var subsWhereQuery = "";

                for (var i = 0; i < subs.length; i++) {
                    var auth_address = subs[i].split(',')[0];
                    var channel_id = subs[i].split(',')[1];

                    if (channel_id == "cat") { // TODO
                    	if (i == subs.length - 1) {
                    		// Remove the "OR" at the end of the query
                    		subsWhereQuery = subsWhereQuery.substring(0, subsWhereQuery.length - 4); // TODO: Kinda hacky
                    	}
                    	continue;
                    }
                    
                    subsWhereQuery += " (ref_channel_id=" + channel_id + " AND videos_json.directory=\"data/users/" + auth_address + "\") ";
                    if (i != subs.length - 1) {
                        subsWhereQuery += " OR ";
                    }
				}
				
				//console.log("Subs Query: ", subsWhereQuery);

				var querySubs = `SELECT
						'video_' || REPLACE(videos_json.directory, 'data/users/', '') || '_' || videos.video_id AS event_uri,
						'article' AS type,
						videos.date_added AS date_added,
						channels.name || ': ' || videos.title AS title,
						videos.description AS body,
						'?/channel/' || REPLACE(videos_json.directory, 'data/users/', '') || '/' || videos.ref_channel_id || '/v/' || videos.video_id AS url
					FROM videos
					LEFT JOIN json AS videos_json USING (json_id)
					LEFT JOIN json AS channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
					LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
					WHERE ${subsWhereQuery}`;

				var queryCommentsOnVideos = `SELECT
						'comment_' || REPLACE(comments_json.directory, 'data/users/', '') || '_' || comments.comment_id  AS event_uri,
						'article' AS type,
						comments.date_added AS date_added,
						comments_json.cert_user_id || ' commented on your video' AS title,
						comments.body AS body,
						'?/channel/' || comments.ref_video_auth_address || '/' || comments.ref_channel_id || '/v/' || comments.ref_video_id AS url
					FROM comments
					LEFT JOIN json AS comments_json USING (json_id)
					LEFT JOIN json AS videos_json ON videos_json.directory=('data/users/' || comments.ref_video_auth_address)
					LEFT JOIN videos ON videos.video_id=comments.ref_video_id AND videos.ref_channel_id=comments.ref_channel_id
					WHERE comments.ref_video_auth_address='${that.userInfo.auth_address}'`;

					console.log(queryCommentsOnVideos);

				//console.log("Follow Query: ", querySubs);
				page.cmdp("feedFollow", [{"Subscriptions": [querySubs, ""], "CommentsOnVideos": [queryCommentsOnVideos, ""]}])
					.then((result) => console.log("FeedFollow: ", result));

				/*page.cmdp("dbQuery", [queryCommentsOnVideos])
					.then((results) => console.log("Comments Results: ", results));*/

				page.cmd("mergerSiteList", [], function(sites) {
					if(Object.keys(sites).indexOf("1GDLfuB3PTpbM8v4zFCwkBuVv6KHWamucQ") != -1) {
						page.checkOptional("1GDLfuB3PTpbM8v4zFCwkBuVv6KHWamucQ", true, null);
					}
				});

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
			if (!chrome || !chrome.cast) return;
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
				app.$set(app.userSettings, "castingServer", settings.castingServer || "https://core.0net.io/");
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
				console.log("Server Info: ", serverInfo);
				self.serverInfo = serverInfo;
				app.serverInfo = serverInfo;

				app.theme = serverInfo.user_settings.theme || "light";
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
				console.log("Site Info: ", siteInfo);
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
				printf(makeCurOptional(false, false, false, true, false, false, false, "cast"));
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
		return this.cmdp("certSelect", { accepted_domains: ["kxoid.bit", "zeroid.bit"] });
    }

    signout() {
    	return this.cmdp("certSelect", { accepted_domains: [""] });
    }

    unimplemented() {
        return page.cmdp("wrapperNotification", ["info", "Unimplemented!"]);
	}

	checkOptional(address, doSignPublish, f) {
		checkOptional(this, "merged-KxoVid", address, page.siteInfo.auth_address, doSignPublish, f, makeCurOptional(false, false, false, true, false, false, false, "cast"));
    }

	uploadBigFile(address, file, f = null) {
		uploadBigFile(this, "merged-KxoVid", address, page.siteInfo.auth_address, file, f, makeCurOptional(false, false, false, true, false, false, false, "cast"));
	}

	editTableData(mergerAddress, table, manageDataFunc, beforePublishCB = null) {
		if (!page.siteInfo.cert_user_id) {
			return page.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
			return page.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}

		editTableData(this, "merged-KxoVid", mergerAddress, page.siteInfo.auth_address, table, manageDataFunc, () => {
			app.getUserInfo();
			beforePublishCB();
		});
	}

	editData(mergerAddress, manageDataFunc, beforePublishCB = null) {
		if (!page.siteInfo.cert_user_id) {
			return page.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
		} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
			return page.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
		}
	
		editData(this, "merged-KxoVid", mergerAddress, page.siteInfo.auth_address, manageDataFunc, () => {
			app.getUserInfo();
			beforePublishCB();
		});
	}
}

page = new ZeroApp();

var Home = require("./router_pages/home.vue");

var CreateChannel = require("./router_pages/create_channel.vue");
var Channel = require("./router_pages/channel.vue");
var ChannelSettings = require("./router_pages/channel_settings.vue");

var Categories = require("./router_pages/categories.vue");
var Category = require("./router_pages/category_channel.vue");
var AddCategory = require("./router_pages/add_category.vue");

var Upload = require("./router_pages/upload.vue");
var Video = require("./router_pages/video.vue");
var VideoEdit = require("./router_pages/video_edit.vue");

var Playlist = require("./router_pages/playlist.vue");

var Subscriptions = require("./router_pages/subscriptions.vue");
var Search = require("./router_pages/search.vue");

var Seedbox = require("./router_pages/seedbox.vue");
var DeviceSettings = require("./router_pages/device_settings.vue");
var SupportMe = require("./router_pages/support_me.vue");

VueZeroFrameRouter.VueZeroFrameRouter_Init(Router, app, [
	{ route: "search/:searchquery", component: Search },
	{ route: "search", component: Search },
	{ route: "support-me", component: SupportMe },
	{ route: "seedbox", component: Seedbox },
	{ route: "device-settings", component: DeviceSettings },
	{ route: "subscriptions", component: Subscriptions },
	{ route: "upload", component: Upload },
	{ route: "category/:address", component: Category },
	{ route: "categories/add", component: AddCategory },
	{ route: "categories", component: Categories },
	{ route: "channel/create", component: CreateChannel },
	{ route: "channel/settings/:id/v/:videoid", component: VideoEdit },
	{ route: "channel/settings/:id", component: ChannelSettings },
	{ route: "channel/:auth_address/:id/p/:playlistid", component: Playlist },
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