<template>
	<v-container fluid v-if="category" style="padding: 0; height: 100%;" :class="getBackground">
        <v-container style="margin: 0; padding: 0;" fluid>
            <v-toolbar flat dense prominent extended :color="dark">
                <v-layout row style="max-width: 900px; margin-left: auto; margin-right: auto;">
                    <v-toolbar-title>
                        <v-avatar tile><!-- 80 -->
                            <svg v-bind:data-jdenticon-value="address + '-cat'"></svg>
                        </v-avatar>
                        {{ category.name }} Category
                        <em style="font-weight: normal; font-size: .7em;">({{ category.cert_user_id }})</em>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                        <v-btn slot="activator" icon>
                            <v-icon>search</v-icon>
                        </v-btn>
                        <span>Search Channel</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="isLoggedIn && !subscribed">
                        <v-btn slot="activator" icon @click="subscribe()">
                            <v-icon>person_add</v-icon>
                        </v-btn>
                        <span>Subscribe</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="isLoggedIn && subscribed">
                        <v-btn slot="activator" icon @click="unsubscribe()">
                            <v-icon>remove</v-icon>
                        </v-btn>
                        <span>Unsubscribe</span>
                    </v-tooltip>
                    <!--<div v-if="isLoggedIn">
                        <v-tooltip bottom>
                            <v-btn slot="activator" icon @click="goto('channel/settings/' + channel.channel_id)">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <span>Edit Channel</span>
                        </v-tooltip>
                    </div>-->
                </v-layout>
                <v-layout row slot="extension" class="grey darken-3">
                    <v-tabs show-arrows dark centered v-model="currentTab" style="max-width: 900px; margin-left: auto; margin-right: auto;">
                        <v-tab key="overview" ripple>Overview</v-tab>
                        <v-tab key="videos" ripple>Videos</v-tab>
                        <v-tab key="playlists" ripple>Playlists</v-tab>
                        <!--<v-tab>Discussion</v-tab>-->
                    </v-tabs>
                </v-layout>
            </v-toolbar>
        </v-container>
		<v-container style="max-width: 900px;" grid-list-xl>
            <v-tabs-items v-model="currentTab">
                <!-- Overview Tab -->
                <v-tab-item key="overview">
                    <v-layout row wrap fill-height>
                        <v-flex xs12 sm8>
                            <div class="title" style="margin-bottom: 20px;">Recent Videos</div>
                            <v-list two-line>
                                <component :is="videoListItem" v-for="video in recent_videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="false"></component>
                                <v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
                                    <p>This category does not currently have any videos. Be the first to <a href="./?/upload" v-on:click.prevent="goto('upload')">Upload</a></p>
                                </v-list-tile>
                            </v-list>
                        </v-flex>
                        <v-flex xs12 sm4>
                            <div class="title" style="text-align: center; margin-bottom: 20px;">About</div>
                            <p style="text-align: center;">{{ category.description }}</p>
                        </v-flex>
                    </v-layout>
                </v-tab-item>
                <!-- Videos Tab -->
                <v-tab-item key="videos">
                    <v-container style="max-width: 700px;">
                        <v-list two-line>
                            <component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="false"></component>
                            <v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
                                <p>
                                    This category does not currently have any videos. Be the first to <a href="./?/upload" v-on:click.prevent="goto('upload')">Upload</a>
                                </p>
                            </v-list-tile>
                        </v-list>
                    </v-container>
                </v-tab-item>
            </v-tabs-items>
		</v-container>
	</v-container>
</template>

<style>
    a {
        text-decoration: none;
    }
</style>

<script>
	var Router = require("../libs/router.js");
    var searchDbQuery = require("../libs/search.js");
    var moment = require("moment");
    var video_list_item = require("../vue_components/video_list_item.vue");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "category",
		data: () => {
			return {
                address: "",
                category: null,
                subscribed: false,
                recent_videos: [],
                videos: [],
                currentTab: 0,
                videoListItem: video_list_item,
                downloaded: false
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/

            this.subscribed = false;
            this.category = null;
            this.recent_videos = [];
            this.videos = [];
            this.currentTab = 0;
            
            this.address = Router.currentParams["address"];

            page.cmdp("mergerSiteList", [true])
                    .then((mergedZites) => {
                        for (var property in mergedZites) {
                            if (property == self.address) {
                                self.downloaded = true;
                                break;
                            }
                        }
                        
                        if (!self.downloaded) {
                            // Download and reload stuff
                            self.addMerger(self.address, function() {
                                self.getRecentVideos();
                                self.getVideos();
                            });
                        }
                    });

            var query = `
                SELECT * FROM category_hubs
                LEFT JOIN json USING (json_id)
                WHERE address="${ this.address }"
                LIMIT 1
                `;
            //console.log(query);
            page.cmdp("dbQuery", [query])
                .then((results) => {
                    //console.log(results);
                    self.category = results[0];
                });

            this.determineSubscriptionStatus();
            this.getRecentVideos();
            this.getVideos();

			this.$emit("setcallback", "update", function(userInfo) {
                self.determineSubscriptionStatus();
                self.getRecentVideos();
                self.getVideos();
			});
		},
		mounted: function() {
			var self = this;
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
            },
            /*toolbar_dark: function() {
                if (!this.channel) return true;

                if (this.channel.toolbar_color == "yellow") return false;
                return true;
            },
            content_dark: function() {
                if (!this.channel) return false;

                if (this.channel.background_color == "white") return false;
                else if (this.channel.background_color == "dark") return true;
            },
            getBackground: function() {
                switch (this.channel.background_color) {
                    case "white": return "";
                    case "dark": return "grey darken-4 grey--text text--lighten-5";
                    case "dark-blue": return "blue-grey darken-4 grey--text text--lighten-5";
                    case "light-blue": return "blue-grey lighten-4";
                    case "light-teal": return "teal lighten-5";
                    default: return "";
                }
            }*/
		},
		methods: {
            determineSubscriptionStatus: function() {
                if (!this.userInfo || !this.userInfo.keyvalue || !this.userInfo.keyvalue.subscriptions) {
                    this.subscribed = false;
                    return;
                }

                if (this.userInfo.keyvalue.subscriptions.indexOf(this.address + ",cat") != -1) {
                    this.subscribed = true;
                } else {
                    this.subscribed = false;
                }
            },
            getRecentVideos: function() {
                var self = this;

                var query = `
                    SELECT videos.*, videos_json.directory, videos_json.site, videos_json.cert_user_id, channels.name as channel_name FROM videos
                        LEFT JOIN json as videos_json USING (json_id)
                        LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
                        LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
                    WHERE videos_json.site="${ this.address }"
                    ORDER BY date_added DESC
                    LIMIT 8
                    `;
                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.recent_videos = results;
                    });
            },
            getVideos: function() {
                var self = this;

                var query = `
                    SELECT videos.*, videos_json.directory, videos_json.site, videos_json.cert_user_id, channels.name as channel_name FROM videos
                        LEFT JOIN json as videos_json USING (json_id)
                        LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
                        LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
                    WHERE videos_json.site="${ this.address }"
                    ORDER BY date_added DESC
                    `;
                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.videos = results;
                    });
            },
            getVideoDate: function(video) {
                return moment(video.date_added).fromNow();
            },
			getCors: function(address, callback = null) {
				console.log("Test");
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
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
            },
            subscribe: function() {
                if (!this.isLoggedIn) return;
                if (this.userInfo.auth_address == this.auth_address) return;

                var self = this;
                page.editData(userChannelIndexMerger, function(data) {
                    var subs = data["subscriptions"] || "";

                    var existing_subs = subs.split('|');
                    for (var i = 0; i < existing_subs.length; i++) {
                        var parts = existing_subs[i].split(',');
                        var address = parts[0];
                        var isCategory = parts[1] == "cat";

                        if (address == self.address && isCategory) {
                            // Already subscribed
                            return null;
                        }
                    }

                    // Append the subscription
                    if (subs != "") {
                        subs += "|";
                    }
                    subs += self.address + ",cat";

                    data["subscriptions"] = subs;
                    return data;
                }, function() {
                    self.subscribed = true;
                });
            },
            unsubscribe: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editData(userChannelIndexMerger, function(data) {
                    if (!data["subscriptions"] || data["subscriptions"] == "") return null;

                    var subs = data["subscriptions"];

                    data["subscriptions"] = subs.replace(new RegExp(self.address + "\\,cat", "g"), "").replace(/\|\|/g, "|").replace(/^\|/, "").replace(/\|$/, "");
                    return data;
                }, function() {
                    self.subscribed = false;
                });
            },
            addMerger: function(address, f = null) {
                var self = this;
                page.cmd("mergerSiteAdd", [address], f);
            }
		}
	}
</script>