<template>
	<v-container fluid v-if="channel" style="padding: 0;" :class="getBackground">
        <v-container style="margin: 0; padding: 0;" fluid>
            <v-toolbar :dark="toolbar_dark" flat dense :color="channel.toolbar_color || ''">
                <!--<div style="max-width: 900px; margin-top: 0; margin-bottom: 0; margin-left: auto; margin-right: auto; padding: 0;">-->
                <v-layout row style="max-width: 900px; margin-left: auto; margin-right: auto;">
                    <v-toolbar-title>
                        <v-avatar tile><!-- 80 -->
                            <svg v-bind:data-jdenticon-value="auth_address + '-' + id"></svg>
                        </v-avatar>
                        <span @click="goto('channel/' + auth_address + '/' + id)" style="cursor: pointer;">{{ channel.name }}</span>
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
                            <v-btn slot="activator" icon @click="">
                                <v-icon>edit</v-icon>
                            </v-btn>
                            <span>Edit Video</span>
                        </v-tooltip>
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
                <!-- Video -->
                <v-flex xs12 md9>
                    <div v-if="video && !isCasting">
                        <video ref="video" id="vid" style="width: 100%;" :src="video.video_file" controls></video>
                    </div>
                    <div v-if="video && isCasting">
                        {{ castMedia ? "Playing on" : "Connected to" }} {{ this.castSession.receiver.friendlyName }}<br>
                        <v-btn :dark="content_dark" icon @click="castVideo">
                            <v-icon v-if="!isCastPlaying">play_arrow</v-icon>
                            <v-icon v-if="isCastPlaying">pause</v-icon>
                        </v-btn>
                    </div>
                </v-flex>
                <!-- Video Description -->
                <v-flex xs12 md3>
                    <div class="title" style="margin-bottom: 15px;">{{video.title}}</div>
                    <p class="body-1" v-if="video" v-html="descriptionMarkdown"></p>
                    <div>
                        <v-btn small @click="pinVideo()">Pin &amp; Seed</v-btn>
                    </div>
                </v-flex>
                <!-- Comments -->
                <v-flex xs12 md9 v-if="channel && video">
                    <v-divider :dark="content_dark" style="margin-bottom: 8px;"></v-divider>
                    <div class="subheading">{{ comments ? comments.length : "" }} Comments</div>
                    <!--<v-divider :dark="content_dark" style="margin-top: 8px; margin-bottom: 8px;"></v-divider>-->
                    <div v-if="isLoggedIn">
                        <v-text-field :dark="content_dark" :loading="commentLoading" v-model="commentText" placeholder="Add a comment ..." multi-line rows="1" auto-grow></v-text-field>
                        <v-btn :loading="commentLoading" ripple color="primary" small style="float: right;" @click="uploadComment()">Comment</v-btn>
                        <div style="clear: both;"></div>
                        <v-divider :dark="content_dark" style="margin-top: 8px; margin-bottom: 8px;"></v-divider>
                    </div>
                    <div style="margin-bottom: 30px;">
                        <div v-for="comment in comments" style="margin-bottom: 12px;" :key="comment_id + '-' + comment.directory.replace('data/users/', '')">
                            <v-layout row>
                                <v-flex xs2 sm1 style="padding-left: 0; padding-right: 0;">
                                    <div>
                                        <svg v-bind:data-jdenticon-value="comment.directory.replace('data/users/', '')" style="width: 100%; max-width: 60px; margin-left: auto; margin-right: auto;"></svg>
                                    </div>
                                </v-flex>
                                <v-flex xs10 sm11>
                                    <a href="#" @click.prevent="" style="font-weight: bold;">{{ comment.cert_user_id }}</a>
                                    <div class="body-2">{{ comment.body }}</div>
                                    <small>{{ getDateFromNow(comment.date_added) }} {{ comment.date_updated ? "(edited)" : "" }}</small>
                                </v-flex>
                            </v-layout>
                        </div>
                    </div>
                </v-flex>
            </v-layout>
		</v-container>
	</v-container>
</template>

<style>
    video:focus {
        outline: none;
    }
</style>

<script>
	var Router = require("../libs/router.js");
    var searchDbQuery = require("../libs/search.js");
    var moment = require("moment");

	module.exports = {
		props: ["userSettings", "castingAllowed", "isCasting", "castSession", "userInfo", "langTranslation"],
		name: "video",
		data: () => {
			return {
                auth_address: "",
                id: "",
                channel: null,
                subscribed: false,
                video_id: "",
                video: null,
                commentText: "",
                commentLoading: false,
                comments: [],
                isCastPlaying: false,
                castMedia: null
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
            self.getComments();

			this.$emit("setcallback", "update", function(userInfo) {
                //self.userInfo = userInfo;
                self.determineSubscriptionStatus();
                self.getVideo();
                self.getComments();
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
                //return md.render(this.video.description);
                return this.video.description.replace(/\n/g, "<br>");
            },
            toolbar_dark: function() {
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
                    default: return "";
                }
            }
		},
		methods: {
            castVideo: function() {
                var self = this;

                //console.log(this.castSession);
                if (!this.isCastPlaying && !this.castMedia) {
                    onMediaDiscovered = (how, media) => {
                        //currentMedia = media;
                        console.log("Loaded media");
                        self.isCastPlaying = true;
                        self.castMedia = media;
                        self.castMedia.addUpdateListener(self.castUpdateListener);
                    }
                    onMediaError = (how, media) => {
                        //currentMedia = media;
                        console.log("Media Error", how);
                        page.cmdp("wrapperNotification", ["error", "Media load failed."]);
                    }

                    var address = self.userSettings.castingServer + '/14c5LUN73J7KKMznp9LvZWkxpZFWgE1sDz/' + this.video.video_file;
                    address = address.replace(/\/\//g, "/").replace(/http(s?):\//, "http$1://");
                    console.log(address);

                    var mediaInfo = new chrome.cast.media.MediaInfo(address, 'video/mp4');
                    var metadata = new chrome.cast.media.GenericMediaMetadata();
                    metadata.title = self.video.title;
                    metadata.subtitle = self.video.cert_user_id;
                    metadata.releaseDate = moment(self.video.date_added).toISOString();

                    mediaInfo.metadata = metadata;

                    var request = new chrome.cast.media.LoadRequest(mediaInfo);
                    this.castSession.loadMedia(request,
                        onMediaDiscovered.bind(this, 'loadMedia'),
                        onMediaError);
                } else if (!this.isCastPlaying && this.castMedia) {
                    this.castMedia.play(null, () => console.log("Played successfully."), () => console.log("Error playing."));
                    this.isCastPlaying = true;
                } else {
                    this.castMedia.pause(null, () => console.log("Paused successfully."), () => console.log("Error pausing."));
                    this.isCastPlaying = false;
                }

            },
            castUpdateListener: function(alive) {
                console.log(this.castMedia);
                if (!alive) {
                    this.isCastPlaying = false;
                    this.castMedia.removeUpdateListener(this.castUpdateListener);
                    this.castMedia = null;
                }

                if (this.castMedia.playerState == "PLAYING") {
                    this.isCastPlaying = true;
                } else if (this.castMedia.playerState == "PAUSED") {
                    this.isCastPlaying = false;
                }
            },
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
            getComments: function() {
                var self = this;
                var query = "SELECT * FROM comments LEFT JOIN json USING (json_id) WHERE ref_video_auth_address=\"" + this.auth_address + "\" AND ref_channel_id=" + this.id + " AND ref_video_id=" + this.video_id + " ORDER BY date_added DESC";

                console.log(query);

                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        console.log(results);
                        self.comments = results;
                    });
            },
            getDateFromNow: function(date_int) {
                return moment(date_int).fromNow();
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
            },
            uploadComment: function() {
                var self = this;

                console.log(self.video.site);

                self.commentLoading = true;
                page.editTableData(self.video.site, "comments", function(date, data, tableData) {
                    tableData.push({
                        "comment_id": date,
                        "ref_video_auth_address": self.auth_address,
                        "ref_channel_id": self.channel.channel_id,
                        "ref_video_id": self.video.video_id,
                        "body": self.commentText,
                        "date_added": date
                    });

                    return tableData;
                }, function({ id, auth_address }) {
                    self.commentLoading = false;
                    self.commentText = "";
                    self.getComments();
                });
            },
            pinVideo: function() {
                console.log(this.video.video_file);
                page.cmdp("optionalFilePin", [this.video.video_file.replace('merged-KxoVid/' + this.video.site + '/', ''), this.video.site]);
            }
		}
	}
</script>
