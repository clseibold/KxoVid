<template>
	<v-container fluid>
		<v-container role="main" aria-labelledby="title" style="max-width: 700px;" v-if="userInfo && channel && video">
            <div id="title" class="title" style="text-align: center; margin-bottom: 20px;">Edit Video: {{ channel.name }} > {{ video.title }}</div>

            <div role="form">
                <v-text-field v-model="title" label="Title"></v-text-field>
                <v-select v-model="selectedChannelId" :items="userChannelsSelect" label="Channel" single-line></v-select>
                <v-select v-model="selectedCategoryAddress" :items="categoriesSelect" label="Category" single-line disabled></v-select>
                <v-text-field v-model="description" label="Description" multi-line></v-text-field>

                <v-select v-model="tags" label="Tags (press enter to add tag)" chips tags></v-select>
                <v-select v-model="selectedPlaylists" :items="playlists" label="Playlists" multiple></v-select>
                <v-checkbox v-model="original" label="Original?"></v-checkbox>

                <v-btn ripple small @click="saveVideo()">Update</v-btn>
                <a :href="'./?/channel/settings/' + channel.channel_id" v-on:click.prevent="goto('channel/settings/' + channel.channel_id)">Channel Settings</a>
                <span style="margin-left: 5px; margin-right: 5px;">|</span>
                <a :href="'./?/channel/' + userInfo.auth_address + '/' + channel.channel_id + '/v/' + video_id" v-on:click.prevent="goto('channel/' + userInfo.auth_address + '/' + channel.channel_id + '/v/' + video_id)">View Video</a>
            </div>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["theme", "userChannels", "userInfo", "langTranslation"],
		name: "video-edit",
		data: () => {
			return {
                id: "",
                video_id: "",
                channel: null,
                video: null,
                title: "",
                description: "",
                selectedCategoryAddress: "",
                selectedChannelId: null,
                tags: [],
                playlists: [],
                selectedPlaylists: [],
                original: false,
                toolbar_color: "",
                background_color: "",
                userChannelsSelect: [],
                categoriesSelect: [],
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/

            this.channel = null;
            this.video = null;
            this.title = "";
            this.description = "";
            this.tags = [];
            this.original = false;
            
            this.id = Router.currentParams["id"];
            this.video_id = Router.currentParams["videoid"];

            this.userChannelsSelect = [];
            for (var i = 0; i < this.userChannels.length; i++) {
                this.userChannelsSelect.push({ text: this.userChannels[i].name, value: this.userChannels[i].channel_id });
            }

            this.getChannel();
            this.getVideo();
            this.getCategories();
            this.getPlaylists();

            this.$emit("setcallback", "update", function(userInfo) {
                self.getChannel();
                self.getVideo();
                self.getCategories();
                self.getPlaylists();

                for (var i = 0; i < this.userChannels.length; i++) {
                    self.userChannelsSelect.push({ text: self.userChannels[i].name, value: self.userChannels[i].channel_id });
                }
            });
		},
		mounted: function() {
            var self = this;
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getCategories: function() {
                var self = this;

                page.cmdp("mergerSiteList", [true])
                    .then((categories) => {
                        console.log(categories);
                        //console.log(categories);
                        var addresses = Object.keys(categories);
                        for (var i = 0; i < addresses.length; i++) {
                            if (addresses[i] == userChannelIndexMerger) continue;
                            self.categoriesSelect.push({ value: addresses[i], text: categories[addresses[i]].content.title });
                        }
                    });
            },
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
                if (this.userInfo == null || this.userInfo.auth_address == null) return;

                var self = this;
                var query = `SELECT * FROM channel_playlists
                    LEFT JOIN json USING (json_id)
                    WHERE ref_channel_id=${this.id} AND directory='data/users/${this.userInfo.auth_address}'`;
                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        console.log("Playlists: ", results);
                        for (var i = 0; i < results.length; i++) {
                            self.playlists.push({ value: results[i].playlist_id, text: results[i].name });
                        }
                    });
            },
            getVideo: function() {
                if (this.userInfo == null || this.userInfo.auth_address == null) return;

                var self = this;
                var query = `
                    SELECT * FROM videos
                        LEFT JOIN json USING (json_id)
                    WHERE ref_channel_id=${ this.id }
                        AND video_id=${ this.video_id }
                        AND directory="data/users/${ this.userInfo.auth_address }"
                    LIMIT 1
                    `;
                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.video = results[0];
                        self.title = self.video.title;
                        self.description = self.video.description;
                        self.selectedCategoryAddress = self.video.site;
                        self.selectedChannelId = self.video.ref_channel_id;
                        self.tags = self.video.tags.split('|');

                        console.log("Video Playlists: ", (self.video.channel_playlists || "").split("|").map(s => parseInt(s)));
                        self.selectedPlaylists = (self.video.channel_playlists || "").split("|").map(s => parseInt(s));

                        self.original = self.video.original;
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
            saveVideo: function() {
                if (!this.isLoggedIn) return;

                console.log("Saving video");

                var self = this;
                page.editTableData(this.video.site, "videos", function(date_added, data, tableData) {
                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].video_id == self.video_id && tableData[i].ref_channel_id == self.id) {

                            /*tableData[i].name = self.name;
                            tableData[i].about = self.about;
                            tableData[i].toolbar_color = actual_toolbar_color;
                            tableData[i].background_color = self.background_color;*/

                            tableData[i].title = self.title;
                            tableData[i].description = self.description;
                            tableData[i].tags = self.tags.join("|");
                            tableData[i].channel_playlists = self.selectedPlaylists.slice(1).join("|");
                            tableData[i].ref_channel_id = self.selectedChannelId;
                            tableData[i].original = self.original;

                            return tableData;
                        }
                    }
                }, function ({ date_updated, auth_address }) {
                    //Router.navigate('channel/' + self.userInfo.auth_address + '/' + self.channel.channel_id + '/v/' + self.video.video_id);
                    window.history.back();
                });
            }
		}
	}
</script>