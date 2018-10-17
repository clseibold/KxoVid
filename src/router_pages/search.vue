<template>
	<v-container fluid>
        <v-container style="max-width: 700px;">
            <div v-for="video in videos" :key="video.video_id" style="margin-bottom: 8px;">
                <div class="subheading"><a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id)">{{ video.title }}</a></div>
                <div class="body-1">
                    {{ video.description.substring(0, 150) }}
                </div>
                <small>Uploaded {{ getVideoDate(video) }} by {{ video.channel_name }}</small>
                <v-divider :dark="content_dark" style="margin-top: 8px;"></v-divider>
            </div>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
    var searchDbQuery = require("../libs/search.js");
    var moment = require("moment");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "home",
		data: () => {
			return {
                searchQuery: "",
                videos: []
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            if (Router.currentParams["searchquery"]) {
                this.searchQuery = Router.currentParams["searchquery"].replace(/%20/g, " ");
            }

            self.getVideos();
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
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

                var searchSelects = [
                    { col: "title", score: 5 },
                    { col: "description", score: 4 },
                    { col: "tags", score: 2 },
                ];

                var query = searchDbQuery(this, this.searchQuery || "", {
                    orderByScore: true,
                    id_col: "video_id",
                    select: "videos.*, videos_json.directory, videos_json.cert_user_id, channels.name as channel_name",
                    searchSelects: searchSelects,
                    table: "videos",
                    join: `LEFT JOIN json as videos_json USING (json_id)
                            LEFT JOIN json as channels_json ON channels_json.directory=videos_json.directory AND channels_json.site="1HmJfQqTsfpdRinx3m8Kf1ZdoTzKcHfy2F"
                            LEFT JOIN channels ON channels.channel_id=videos.ref_channel_id AND channels.json_id=channels_json.json_id`,
                    afterOrderBy: "date_added DESC"
                });

                console.log(query);

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