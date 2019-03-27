<template>
	<v-container fluid v-if="channel" style="padding: 0; height: 100%;" :class="getBackground">
        <v-container style="margin: 0; padding: 0;" fluid>
            <v-toolbar :dark="toolbar_dark" flat dense prominent extended :color="channel.toolbar_color || ''">
                <!--<div style="max-width: 900px; margin-top: 0; margin-bottom: 0; margin-left: auto; margin-right: auto; padding: 0;">-->
                <v-layout row style="max-width: 900px; margin-left: auto; margin-right: auto;">
                    <v-toolbar-title>
                        <v-avatar tile><!-- 80 -->
                            <svg v-bind:data-jdenticon-value="auth_address + '-' + id"></svg>
                        </v-avatar>
                        {{ channel.name }}
                        <em style="font-weight: normal; font-size: .7em;">({{ channel.cert_user_id }})</em>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-tooltip bottom>
                        <v-btn slot="activator" icon>
                            <v-icon>search</v-icon>
                        </v-btn>
                        <span>Search Channel</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="isLoggedIn && userInfo.auth_address != auth_address && !subscribed">
                        <v-btn slot="activator" icon @click="subscribe()">
                            <v-icon>person_add</v-icon>
                        </v-btn>
                        <span>Subscribe</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="isLoggedIn && userInfo.auth_address != auth_address && subscribed">
                        <v-btn slot="activator" icon @click="unsubscribe()">
                            <v-icon>remove</v-icon>
                        </v-btn>
                        <span>Unsubscribe</span>
                    </v-tooltip>
                    <div v-if="isLoggedIn && userInfo.auth_address == auth_address">
                        <v-tooltip bottom>
                            <v-btn slot="activator" icon @click="goto('channel/settings/' + channel.channel_id)">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <span>Edit Channel</span>
                        </v-tooltip>
                    </div>
                </v-layout>
                <v-layout row slot="extension" class="grey darken-3">
                    <v-tabs show-arrows dark centered v-model="currentTab" style="max-width: 900px; margin-left: auto; margin-right: auto;">
                        <v-tab key="overview" ripple>Overview</v-tab>
                        <v-tab key="videos" ripple>Videos</v-tab>
                        <v-tab key="playlists" ripple>Playlists</v-tab>
                        <!--<v-tab>Discussion</v-tab>-->
                    </v-tabs>
                </v-layout>
                <!--</div>-->
            </v-toolbar>
        </v-container>
		<v-container style="max-width: 900px;" grid-list-xl>
            <v-tabs-items v-model="currentTab">
                <!-- Overview Tab -->
                <v-tab-item key="overview">
                    <v-layout row wrap fill-height>
                        <v-flex xs12 sm8>
                            <div class="title" style="margin-bottom: 20px;">Recent Videos</div>
                            <v-list :dark="content_dark" :light="content_light" two-line>
                                <component :is="videoListItem" v-for="video in recent_videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="false" :show-category="true"></component>
                                <v-list-tile v-if="recent_videos.length <= 0" style="margin-top: 16px;">
                                    <p>
                                        Looks like there are no videos! Remember that this page will only list videos the user has uploaded <em>in categories that you have merged/downloaded.</em>
                                    </p>
                                </v-list-tile>
                            </v-list>
                        </v-flex>
                        <v-flex xs12 sm4>
                            <div class="title" style="text-align: center; margin-bottom: 20px;">About</div>
                            <p style="text-align: center;">{{ channel.about }}</p>
                        </v-flex>
                    </v-layout>
                </v-tab-item>
                <!-- Videos Tab -->
                <v-tab-item key="videos">
                    <v-container style="max-width: 700px;">
                        <v-list :dark="content_dark" :light="content_light" two-line>
                            <component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="false" :show-category="true"></component>
                            <v-list-tile v-if="recent_videos.length <= 0" style="margin-top: 16px;">
                                <p>
                                    Looks like there are no videos! Remember that this page will only list videos the user has uploaded <em>in categories that you have merged/downloaded.</em>
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
		props: ["userInfo", "langTranslation", "theme"],
		name: "channel",
		data: () => {
			return {
                auth_address: "",
                id: "",
                channel: null,
                subscribed: false,
                recent_videos: [],
                videos: [],
                currentTab: 0,
                videoListItem: video_list_item
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/

            this.channel = null;
            this.subscribed = false;
            this.recent_videos = [];
            this.videos = [];
            this.currentTab = 0;
            
            this.auth_address = Router.currentParams["auth_address"];
            this.id = Router.currentParams["id"];

            page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE channel_id=" + this.id + " AND directory=\"data/users/" + this.auth_address + "\" LIMIT 1"])
                .then((results) => {
                    self.channel = results[0];
                });

            this.determineSubscriptionStatus();
            this.getRecentVideos();
            this.getVideos();

			this.$emit("setcallback", "update", function(userInfo) {
                //self.userInfo = userInfo;
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
            toolbar_dark: function() {
                if (!this.channel) return true;

                if (this.channel.toolbar_color == "yellow") return false;
                return true;
            },
            content_dark: function() {
                if (!this.channel || this.channel.background_color == "" || !this.channel.background_color) return this.theme == "dark";

                if (this.channel.background_color != "white") return true;
                else return this.theme == "dark";
            },
            content_light: function() {
                if (!this.channel || this.channel.background_color == "" || !this.channel.background_color) return this.theme != "dark";

                if (this.channel.background_color == "white") return true;
                else return this.theme != "dark";
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
            }
		},
		methods: {
            determineSubscriptionStatus: function() {
                if (!this.userInfo) return;

                if (this.userInfo.keyvalue.subscriptions.indexOf(this.auth_address + "," + this.id) != -1) {
                    this.subscribed = true;
                } else {
                    this.subscribed = false;
                }
            },
            getRecentVideos: function() {
                var self = this;

                page.cmdp("dbQuery", ["SELECT * FROM videos LEFT JOIN json USING (json_id) WHERE directory=\"data/users/" + this.auth_address + "\" AND ref_channel_id=" + this.id + " ORDER BY date_added DESC LIMIT 8"])
                    .then((results) => {
                        console.log(results);
                        self.recent_videos = results;
                    });
            },
            getVideos: function() {
                var self = this;

                page.cmdp("dbQuery", ["SELECT * FROM videos LEFT JOIN json USING (json_id) WHERE directory=\"data/users/" + this.auth_address + "\" AND ref_channel_id=" + this.id + " ORDER BY date_added DESC"])
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
                        var auth_address = parts[0];
                        var channel_id = parts[1];

                        if (auth_address == self.auth_address && channel_id == self.id) {
                            // Already subscribed
                            return null;
                        }
                    }

                    // Append the subscription
                    if (subs != "") {
                        subs += "|";
                    }
                    subs += self.auth_address + "," + self.id;

                    data["subscriptions"] = subs;
                    return data;
                }, function() {
                    self.subscribed = true;
                });
            },
            unsubscribe: function() {
                if (!this.isLoggedIn) return;
                if (this.userInfo.auth_address == this.auth_address) return;

                var self = this;
                page.editData(userChannelIndexMerger, function(data) {
                    if (!data["subscriptions"] || data["subscriptions"] == "") return null;

                    var subs = data["subscriptions"];

                    data["subscriptions"] = subs.replace(new RegExp(self.auth_address + "\\," + self.id, "g"), "").replace(/\|\|/g, "|").replace(/^\|/, "").replace(/\|$/, "");
                    return data;
                }, function() {
                    self.subscribed = false;
                });
            }
		}
	}
</script>