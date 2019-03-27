<template>
	<v-container fluid>
		<v-container style="max-width: 700px;" v-if="userInfo && channel">
            <div class="title" style="text-align: center; margin-bottom: 20px;">Channel Settings: {{ channel.name }}</div>

            <v-tabs show-arrows :dark="theme == 'dark'" centered v-model="currentTab" style="max-width: 900px; margin-left: auto; margin-right: auto; margin-bottom: 8px;">
                <v-tab key="general" ripple>General</v-tab>
                <v-tab key="videos" ripple>Videos</v-tab>
                <v-tab key="playlists" ripple>Playlist Management</v-tab>
                <v-tab key="comment_moderations" ripple>Comment Moderations</v-tab>
                <!--<v-tab>Discussion</v-tab>-->
            </v-tabs>
            <v-tabs-items v-model="currentTab">
                <v-tab-item key="general">
                    <v-text-field label="Name" v-model="name"></v-text-field>
                    <v-text-field multi-line label="About" v-model="about"></v-text-field>
                    <v-select label="Toolbar Color" :items="toolbar_colors" v-model="toolbar_color"></v-select>
                    <v-select label="Background Color" :items="background_colors" v-model="background_color"></v-select>

                    <v-btn ripple color="primary" @click="saveChannel()">Save</v-btn>
                    <v-btn ripple dark color="red" @click="deleteChannel()">Delete</v-btn>
                    <a :href="'./?/channel/' + userInfo.auth_address + '/' + channel.channel_id" v-on:click.prevent="goto('channel/' + userInfo.auth_address + '/' + channel.channel_id)">View Channel</a>
                </v-tab-item>
                <v-tab-item key="videos">
                    <v-list two-line>
                        <component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="false" :show-category="true" :edit="true"></component>
                        <v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
                            <p>
                                Looks like there are no videos! <span v-if="isLoggedIn"><a href="./?/upload" v-on:click.prevent="goto('upload')">Upload some here!</a></span>
                            </p>
                        </v-list-tile>
                    </v-list>
                </v-tab-item>
                <v-tab-item key="playlists">
                    <div v-for="playlist in playlists" style="margin-bottom: 8px;">
                        <strong>{{ playlist.name || "[Untitled]" }}</strong> | <a href="#" @click.prevent="deletePlaylist(playlist)">Delete</a>
                    </div>
                    <v-text-field placeholder="Playlist Name" v-model="playlistName"></v-text-field>
                    <v-btn ripple color="primary" @click="addPlaylist()">Add a Playlist</v-btn>
                </v-tab-item>
                <v-tab-item key="comment_moderations">
                </v-tab-item>
            </v-tabs-items>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
    var searchDbQuery = require("../libs/search.js");
    var video_list_item = require("../vue_components/video_list_item.vue");

	module.exports = {
		props: ["theme", "userInfo", "langTranslation"],
		name: "channel-settings",
		data: () => {
			return {
                id: "",
                channel: null,
                name: "",
                about: "",
                toolbar_colors: ["dark", "blue", "red", "green", "yellow", "purple", "black", "indigo"],
                toolbar_color: "",
                background_colors: ["white", "dark", "dark-blue", "light-blue", "light-teal"],
                background_color: "",
                currentTab: 0,
                playlists: [],
                playlistName: "",
                videos: [],
                videoListItem: video_list_item
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            this.id = Router.currentParams["id"];
		},
		mounted: function() {
            var self = this;
            
            this.getChannel();
            this.getPlaylists();
            this.getVideos();

			this.$emit("setcallback", "update", function(userInfo) {
                self.getChannel();
                self.getPlaylists();
                self.getVideos();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getChannel: function() {
                if (this.userInfo == null || this.userInfo.auth_address == null) return;
                
                var self = this;
                page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE channel_id=" + this.id + " AND directory=\"data/users/" + this.userInfo.auth_address + "\" LIMIT 1"])
                .then((results) => {
                    self.channel = results[0];
                    self.name = self.channel.name;
                    self.about = self.channel.about;
                    self.toolbar_color = self.channel.toolbar_color == "" || self.channel.toolbar_color == null ? "dark" : self.channel.toolbar_color;
                    self.background_color = self.channel.background_color == "" || self.channel.background_color == null ? "white" : self.channel.background_color;
                });
            },
            getPlaylists: function() {
                var self = this;

                var query = `
                    SELECT * FROM channel_playlists
                    LEFT JOIN json USING (json_id)
                    WHERE directory="data/users/${ this.userInfo.auth_address }"
                    AND ref_channel_id=${ this.id }`;

                page.cmdp("dbQuery", [query])
                    .then((playlists) => {
                        self.playlists = playlists;
                        console.log(playlists);
                    });
            },
            getVideos: function() {
                var self = this;

                page.cmdp("dbQuery", ["SELECT * FROM videos LEFT JOIN json USING (json_id) WHERE directory=\"data/users/" + this.userInfo.auth_address + "\" AND ref_channel_id=" + this.id + " ORDER BY date_added DESC LIMIT 8"])
                    .then((results) => {
                        console.log(results);
                        self.videos = results;
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
            saveChannel: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "channels", function(date_added, data, tableData) {
                    var actual_toolbar_color = self.toolbar_color == "dark" ? "" : self.toolbar_color;
                    //var actual_toolbar_color = self.toolbar_color == "dark" ? "" : self.toolbar_color;

                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].channel_id == self.id) {
                            tableData[i].name = self.name;
                            tableData[i].about = self.about;
                            tableData[i].toolbar_color = actual_toolbar_color;
                            tableData[i].background_color = self.background_color;

                            return tableData;
                        }
                    }
                }, function ({ date_updated, auth_address }) {
                    Router.navigate('channel/' + auth_address + '/' + self.channel.channel_id);
                });
            },
            deleteChannel: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "channels", function(date_added, data, tableData) {
                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].channel_id == self.id) {
                            tableData.splice(i, 1);
                            return tableData;
                        }
                    }
                    return null;
                }, function ({ date_updated, auth_address }) {
                    Router.navigate('');
                });
            },
            addPlaylist: function() {
                var self = this;

                if (this.playlistName == "") {
                    page.cmdp("wrapperNotification", ["error", "Playlist must have a name."]);
                    return;
                }

                page.editTableData(userChannelIndexMerger, "channel_playlists", function(date, data, tableData) {
                    tableData.push({
                        "playlist_id": date,
                        "ref_channel_id": self.channel.channel_id,
                        "name": self.playlistName,
                        "date_added": date
                    });

                    return tableData;
                }, function() {
                    self.playlistName = "";
                    self.getPlaylists();
                });
            },
            deletePlaylist: function(playlist) {
                var self = this;

                page.editTableData(userChannelIndexMerger, "channel_playlists", function(date, data, tableData) {
                    var changed = false;
                    for (var i = 0; i < tableData.length; i++) {
                        var obj = tableData[i];

                        if (playlist.playlist_id == obj.playlist_id) {
                            changed = true;
                            tableData.splice(i, 1);
                            break;
                        }
                    }

                    if (!changed) return null;
                    return tableData;
                }, function() {
                    self.getPlaylists();
                });
            }
		}
	}
</script>