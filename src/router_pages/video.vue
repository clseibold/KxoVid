<template>
	<v-container fluid v-if="channel" style="padding: 0;">
        <v-container style="margin: 0; padding: 0;" fluid>
            <v-toolbar dark flat dense :color="channel.toolbar_color || ''">
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
                        <v-btn icon @click="goto('channel/settings/' + channel.channel_id)">
                            <v-icon>edit</v-icon>
                        </v-btn>
                    </div>
                </v-layout>
                <!--<v-layout row slot="extension" class="grey darken-3">
                    <v-tabs show-arrows dark centered style="max-width: 900px; margin-left: auto; margin-right: auto;">
                        <v-tab>Overview</v-tab>
                        <v-tab>Videos</v-tab>
                        <v-tab>Playlists</v-tab>
                        <v-tab>Discussion</v-tab>
                    </v-tabs>
                </v-layout>-->
                <!--</div>-->
            </v-toolbar>
        </v-container>
		<v-container style="max-width: 90%;" grid-list-lg>
            <v-layout row wrap fill-height>
                <v-flex xs12 md9>
                    <div v-if="video">
                        <video style="width: 100%;" :src="video.video_file" controls></video>
                    </div>
                </v-flex>
                <v-flex xs12 md3>
                    <div class="title" style="margin-bottom: 15px;">{{video.title}}</div>
                    <!--<v-divider></v-divider>-->
                    <p class="body-1" v-if="video" v-html="descriptionMarkdown"></p>
                </v-flex>
            </v-layout>
			<!--<span class="headline">{{ channel.name }}</span>-->
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "video",
		data: () => {
			return {
                auth_address: "",
                id: "",
                channel: null,
                subscribed: false,
                video_id: "",
                video: null
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            this.auth_address = Router.currentParams["auth_address"];
            this.id = Router.currentParams["id"];
            this.video_id = Router.currentParams["videoid"];

            page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE channel_id=" + this.id + " AND directory=\"data/users/" + this.auth_address + "\" LIMIT 1"])
                .then((results) => {
                    self.channel = results[0];
                });

            this.determineSubscriptionStatus();
            this.getVideo();

			this.$emit("setcallback", "update", function(userInfo) {
                self.userInfo = userInfo;
                self.determineSubscriptionStatus();
                self.getVideo();
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
            descriptionMarkdown: function() {
                return md.render(this.video.description);
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
            getVideo: function() {
                var self = this;
                var query = "SELECT * FROM videos LEFT JOIN json USING (json_id) WHERE directory=\"data/users/" + this.auth_address + "\" AND ref_channel_id=" + this.id + " AND video_id=" + this.video_id + " LIMIT 1";
                console.log(query);

                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        console.log(results);
                        self.video = results[0];
                    });
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