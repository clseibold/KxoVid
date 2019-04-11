<template>
	<v-container fluid v-if="!gettingSettings" class="pa-0">
		<v-container role="main" aria-labelledby="welcome" style="max-width: 700px;" v-if="!userSettings.introductionFinished">
			<div id="welcome" class="headline" style="text-align: center; margin-bottom: 8px;">Welcome to KxoVid!</div>
			<div class="subheading" style="margin-bottom: 4px;">KxoVid is a video sharing zite for ZeroNet, much like YouTube. Below is a brief guide on how KxoVid works and some of its features.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Channels</div>
			<div class="subheading">KxoVid has a system of Channels, much like YouTube does. One id can create multiple channels. Each channel has a unique page where the videos of that channel are featured. Channels are allowed to have a limited amount of customization, including toolbar color and background color. Within the next few weeks, more features will be added to channels, including playlists.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Categories</div>
			<div class="subheading">Videos and their associated information (description, comments, etc.) are stored in Categories. Each of these categories are Merged Zites. This allows you to choose which categories you want to see within KxoVid and which you don't. You can start exploring the different categories on KxoVid by going to the "Categories" page from the sidebar. See a category you like? Click it and it will automatically be downloaded to allow you to see videos from that category. Don't see a category you want? In ZeroHello, you can clone an existing category. Then, on the Categories page, you can add that category to the categories index so that other people can download it.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Subscriptions</div>
			<div class="subheading">You can subscribe to channels. This allows you to see all of the recent videos of all of your subscriptions from one page, the "Subscriptions" page. In the future you will be able to see these new videos from the ZeroHello news feed.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Google Cast Support</div>
			<div class="subheading" style="margin-bottom: 4px;">KxoVid is currently the <em>only</em> ZeroNet zite with Google Cast support. This allows you to cast videos to any Google Cast supported device within your network, including Google Homes and Chromecasts. For this to work, a Google JS Script must be downloaded from the clearnet. But <em>don't worry</em>, this file is <em>never</em> automatically downloaded unless you want it to. When you click the chromecast icon in the navigation bar, you are prompted to download this file for the current session. Afterwards, you are prompted on whether you want it automatically downloaded whenever you load this zite.</div>
			<div class="subheading">Casting works by sending the url of the file to the cast-supported device so that it can stream the file. However, this requires that a proxy or zeronet server be used. By default, KxoVid uses the <a href="https://0net.io/">0net.io</a> proxy. However, you can change this setting in the <a href="./?/device-settings" v-on:click.prevent="goto('device-settings')">Device Settings</a> page listed in the sidebar. If you want to use your own zeronet server, you must make sure the ZeroNet UI Server allows connections from your local network and that it uses the ip of the computer it's running on.</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>

			<div class="title" style="margin-bottom: 4px;">Channel Playlists</div>
			<div class="subheading">
				Channels can create playlists for their videos. You can see the playlists on a channel by clicking the playlists tab.
			</div>
			<v-divider style="margin-top: 8px; margin-bottom: 12px;"></v-divider>
			
			<v-btn color="primary" @click="login()">Sign In with ZeroId or KxoId</v-btn>
			<v-btn @click="register()">Register a KxoId</v-btn>
			<a href="./?/categories" @click.prevent="gotoCategories()">View Categories Index</a>
			<br>
			<a href="./?/" @click.prevent="continueToHome()">Continue to homepage</a>
		</v-container>
		<v-container role="main" aria-label="Homepage" v-else grid-list-xl class="hidden-sm-and-down">
			<v-layout row wrap>
				<v-flex xs12 sm4 md5 v-if="userInfo"> <!-- Recent Videos from Subscriptions -->
					<div class="title" style="text-align: center; margin-bottom: 20px; font-weight: 600;">Recent Videos from Subscriptions</div>
					<v-list two-line>
						<component :is="videoListItem" v-for="video in recentSubVideos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
						<v-list-tile v-if="recentSubVideos.length <= 0" style="margin-top: 16px;">
							<p>
								You currently have no subscriptions.
							</p>
						</v-list-tile>
					</v-list>
					<a href="./?/subscriptions" @click.prevent="goto('subscriptions')" v-if="recentSubVideos.length > 0">View All</a>
				</v-flex>
				<v-flex xs12 sm2 md2 v-if="!userInfo">
				</v-flex>
				<v-flex xs12 sm4 md5> <!-- New Videos -->
					<div class="title" style="text-align: center; margin-bottom: 20px; font-weight: 600;">New Videos</div>
					<v-list two-line>
						<component :is="videoListItem" v-for="video in recentVideos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
						<v-list-tile v-if="recentVideos.length <= 0" style="margin-top: 16px;">
							<p>
								It appears you have no categories with videos downloaded. Start
								exploring the different categories on KxoVid by going to the <a href="./?/categories" v-on:click.prevent="gotoCategories()">Categories</a> page
								from the sidebar.
							</p>
						</v-list-tile>
					</v-list>
					<a href="./?/search" @click.prevent="goto('search')" v-if="recentVideos.length > 0">View All</a>
				</v-flex>
				<v-flex xs12 sm4 md2> <!-- New Channels -->
					<div class="title" style="text-align: center; margin-bottom: 20px; font-weight: 600;">New Channels</div>
					<!--<div v-for="channel in recentChannels" style="padding-bottom: 8px; padding-left: 8px; padding-right: 8px;" class="secondary darken-1">
						<div class="subheading" style="text-align: right;"><a :href="'./?/channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id" @click.prevent="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">{{ channel.name }}</a></div>
						<v-divider style="margin-top: 8px;"></v-divider>
					</div>-->
					<v-list>
						<template v-for="channel in recentChannels">
							<v-list-tile :title="channel.name" v-bind:key="channel.channel_id + ',' + channel.directory" @click="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">
								<v-list-tile-content>
									<v-list-tile-title>{{ channel.name }}</v-list-tile-title>
									<v-list-tile-sub-title>{{ channel.about }}</v-list-tile-sub-title>
								</v-list-tile-content>
							</v-list-tile>
							<v-divider v-bind:key="channel.channel_id + ',' + channel.directory"></v-divider>
						</template>
					</v-list>
					<a href="./?/search" @click.prevent="goto('search')" v-if="recentChannels.length > 0" style="text-align: right;">View All</a>
				</v-flex>
			</v-layout>
		</v-container>
		<v-container role="main" aria-label="Homepage for mobile" v-if="userSettings.introductionFinished" class="hidden-md-and-up pa-0">
			<v-list two-line subheader>
				<div v-if="userInfo">
					<v-subheader style="font-weight: 600;">Recent Videos from Subscriptions</v-subheader>
					<component :is="videoListItem" v-for="video in recentSubVideos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
					<v-list-tile v-if="recentSubVideos.length <= 0" style="margin-top: 16px;">
						<p>
							You currently have no subscriptions.
						</p>
					</v-list-tile>
					<v-divider v-if="recentSubVideos.length <= 0"></v-divider>
				</div>

				<v-subheader style="font-weight: 600;">New Videos</v-subheader>
				<component :is="videoListItem" v-for="video in recentVideos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
				<v-list-tile v-if="recentVideos.length <= 0" style="margin-top: 16px;">
					<p>
						It appears you have no categories with videos downloaded. Start
						exploring the different categories on KxoVid by going to the <a href="./?/categories" v-on:click.prevent="gotoCategories()">Categories</a> page
						from the sidebar.
					</p>
				</v-list-tile>

				<v-subheader style="font-weight: 600;">New Channels</v-subheader>
				<template v-for="channel in recentChannels">
					<v-list-tile :title="channel.name" v-bind:key="channel.channel_id + ',' + channel.directory" @click="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">
						<v-list-tile-content>
							<v-list-tile-title>{{ channel.name }}</v-list-tile-title>
							<v-list-tile-sub-title>{{ channel.about }}</v-list-tile-sub-title>
						</v-list-tile-content>
					</v-list-tile>
					<v-divider v-bind:key="channel.channel_id + ',' + channel.directory"></v-divider>
				</template>
			</v-list>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");
	var moment = require("moment");
	var video_list_item = require("../vue_components/video_list_item.vue");

	module.exports = {
		props: ["gettingSettings", "userSettings", "userInfo", "langTranslation"],
		name: "home",
		data: () => {
			return {
				recentSubVideos: [],
				recentVideos: [],
				recentChannels: [],
				videoListItem: video_list_item
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/

			if (this.userInfo)
				self.getRecentSubVideos();
			self.getRecentVideos();
			self.getRecentChannels();
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
				if (self.userInfo)
					self.getRecentSubVideos();
				self.getRecentVideos();
				self.getRecentChannels();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			getRecentSubVideos: function() {
				var self = this;
				if (this.userInfo == null || this.userInfo.keyvalue == null || this.userInfo.keyvalue.subscriptions == null || this.userInfo.keyvalue.subscriptions == "")
					return;
				var subs = this.userInfo.keyvalue.subscriptions.split('|');
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

				var query = `SELECT videos.*, videos_json.directory, videos_json.site, videos_json.cert_user_id, channels.name as channel_name FROM videos
					LEFT JOIN json as videos_json USING (json_id)
					LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
					LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
					WHERE ${subsWhereQuery}
					ORDER BY date_added DESC
					LIMIT 8`;

				console.log(query);

                page.cmdp("dbQuery", [query])
                    .then((videos) => {
                        console.log(videos);
                        self.recentSubVideos = videos;
                    });
			},
			getRecentVideos: function() {
				var self = this;

				var query = `SELECT videos.*, videos_json.directory, videos_json.site, videos_json.cert_user_id, channels.name as channel_name FROM videos
					LEFT JOIN json as videos_json USING (json_id)
					LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
					LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
					ORDER BY date_added DESC
					LIMIT 8`;

                page.cmdp("dbQuery", [query])
                    .then((videos) => {
                        console.log(videos);
                        self.recentVideos = videos;
                    });
			},
			getRecentChannels: function() {
				var self = this;

				var query = `SELECT * FROM channels LEFT JOIN json USING (json_id) ORDER BY date_added DESC LIMIT 8`;
				page.cmdp('dbQuery', [query])
					.then((channels) => {
						self.recentChannels = channels;
					});
			},
			getVideoDate: function(video) {
                return moment(video.date_added).fromNow();
            },
			getCors: function(address, callback = null) {
                var self = this;
                this.pageNum = 0;
                if(page.siteInfo.settings.permissions.indexOf("Cors:" + address) < 0) {
                    page.cmd("corsPermission", address, function() {
                            if (callback != null) callback();
                        });
                } else {
                    if (callback != null) callback();
                }
			},
			goto: function(to) {
				Router.navigate(to);
			},
			login: function() {
				page.selectUser();
				this.$emit("setusersettings", { allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true });
				page.cmdp("userSetSettings", [{ allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true }]);
				Router.navigate('categories');
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
			},
			gotoCategories: function() {
				this.$emit("setusersettings", { allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true });
				page.cmdp("userSetSettings", [{ allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true }]);
				Router.navigate('categories');
			},
			continueToHome: function() {
				this.$emit("setusersettings", { allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true });
				page.cmdp("userSetSettings", [{ allowCasting: this.userSettings.allowCasting, castingServer: this.userSettings.castingServer, introductionFinished: true }]);
			},
			register: function() {
				page.cmdp("wrapperOpenWindow", ["/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P/?/create-id"]);
			}
		}
	}
</script>