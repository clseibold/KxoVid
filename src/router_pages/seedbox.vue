<template>
	<v-container fluid class="pa-0">
        <v-container style="max-width: 700px;" class="hidden-sm-and-down">
            <div class="title" style="text-align: center; margin-bottom: 20px;">SeedBox <span v-if="videos.length > 0">({{ videos.length }})</span></div>
			<v-list two-line>
				<component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
				<v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
					<p>
						You have not downloaded or watched any videos.
					</p>
				</v-list-tile>
			</v-list>
            <!--<div v-for="video in videos" :key="video.video_id" style="margin-bottom: 8px;">
                <div class="subheading"><a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id)">{{ video.title }}</a></div>
                <div class="body-1">
                    {{ video.description.substring(0, 150) }}
                </div>
                <small>Uploaded {{ getVideoDate(video) }} by {{ video.channel_name }}</small>
                <v-divider :dark="content_dark" style="margin-top: 8px;"></v-divider>
            </div>-->
        </v-container>
		<v-container class="hidden-md-and-up pa-0">
			<v-list two-line subheader>
				<v-subheader>SeedBox</v-subheader>
				<component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
				<v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
					<p>
						You have not downloaded or watched any videos.
					</p>
				</v-list-tile>
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
		props: ["userInfo", "langTranslation"],
		name: "home",
		data: () => {
			return {
				video_files: [],
				videos: [],
				downloaded: [],
				videoListItem: video_list_item,
				optionalTotal: 0, // Total number of merger zites to get optional files from
				optionalGotten: 0
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/

			/*page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
				.then((results) => {
					self.channels = results;
                });*/
            this.getDownloaded();
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
				/*page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
					.then((results) => {
						self.channels = results;
                    });*/
                self.getDownloaded();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			mergerDownloaded: function(address) {
                return this.downloaded[address];
            },
            getDownloaded: function() {
                var self = this;

                //self.downloaded = [];

                page.cmdp("mergerSiteList", [true])
                    .then((mergedZites) => {
                        console.log(mergedZites["1LaX9nRmY6v2PS2xrAg9M2iXcU2y5wbBQr"]);
                        self.downloaded = mergedZites;

                        for (let zite in self.downloaded) {
                        	self.optionalTotal++;
                        }

                        self.getVideos();
                    });
            },
            getVideos: function() {
            	var self = this;
            	this.video_files = [];
            	for (let zite in this.downloaded) {
	            	page.cmdp("optionalFileList", { "address": zite, "limit": 10 })
	            		.then((results) => {
	            			self.video_files.push(results.filter((video_file) => {
	            				return video_file.is_downloaded;
	            			}));
	            			self.optionalGotten++;
	            			/*var query = `SELECT * FROM videos
	            				WHERE `;*/

	            			if (self.optionalGotten == self.optionalTotal) {
	            				self.getVideosFromDatabase();
	            			}
	            		});
	            }
            },
            getVideosFromDatabase: function() {
            	//console.log(this.video_files);
            	var query = `SELECT videos.*, videos_json.directory, videos_json.site, videos_json.cert_user_id, channels.name as channel_name FROM videos
            		LEFT JOIN json as videos_json USING (json_id)
					LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
					LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id
					WHERE `;

            	var first = true;
            	for (var list of this.video_files) {
            		for (var video of list) {
            			if (!first) query += " OR ";
            			query += ` (videos_json.site='${video.address}' AND videos.video_file='${'merged-KxoVid/' + video.address + '/' + video.inner_path}')  `;
            			first = false;
            		}
            	}

            	query += " ORDER BY date_added DESC";

            	console.log(query);

            	var self = this;
            	page.cmdp("dbQuery", [query])
            		.then((results) => {
            			self.videos = results;
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
			gotoCategories: function() {
				Router.navigate('categories');
			},
			login: function() {
				page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				console.log(to);
				window.location = to;
			}
		}
	}
</script>