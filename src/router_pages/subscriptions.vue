<template>
	<v-container fluid class="pa-0">
        <v-container style="max-width: 700px;" class="hidden-sm-and-down">
            <div class="title" style="text-align: center; margin-bottom: 20px;">Subscriptions</div>
			<v-list two-line>
				<component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
				<v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
					<p>
						There are no videos from your subscriptions. Either you have no subscriptions, or there are no videos in the <a href="./?/categories" v-on:click.prevent="">Categories</a> you have downloaded.
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
				<v-subheader>Subscriptions</v-subheader>
				<component :is="videoListItem" v-for="video in videos" :key="video.video_id + '-' + video.directory" :video="video" :show-channel="true" :show-category="true"></component>
				<v-list-tile v-if="videos.length <= 0" style="margin-top: 16px;">
					<p>
						There are no videos from your subscriptions. Either you have no subscriptions, or there are no videos in the <a href="./?/categories" v-on:click.prevent="">Categories</a> you have downloaded.
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

			/*page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
				.then((results) => {
					self.channels = results;
                });*/
            this.getVideos();
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
				/*page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
					.then((results) => {
						self.channels = results;
                    });*/
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
            getVideos: function() {
                var self = this;
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
					ORDER BY date_added DESC`;

                page.cmdp("dbQuery", [query])
                    .then((videos) => {
                        console.log(videos);
						self.videos = videos;
						console.log(self.videos);
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