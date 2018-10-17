<template>
    <div style="margin-bottom: 8px;">
        <div class="subheading"><a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id)">{{ video.title }}</a></div>
        <div class="body-1">
            {{ video.description.substring(0, 150) }}
        </div>
        <small>Uploaded {{ getVideoDate(video) }} <span v-if="showChannel">by {{ video.channel_name }}</span></small>
        <v-divider style="margin-top: 8px;"></v-divider>
    </div>
</template>

<script>
    var Router = require("../libs/router.js");
    var moment = require("moment");

	module.exports = {
		props: ["video", "showChannel", "langTranslation"],
		name: "video-list-item",
		data: () => {
			return {
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoVid"];
			});
            this.ZiteName = this.langTranslation["KxoVid"];*/
		},
		mounted: function() {
            var self = this;
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
            },
            getVideoDate: function() {
                return moment(this.video.date_added).fromNow();
            }
		},
		methods: {
			goto: function(to) {
                Router.navigate(to);
			},
			login: function() {
				page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				window.location = to;
            },
		}
	}
</script>