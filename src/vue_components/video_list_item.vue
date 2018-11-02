<template>
    <div style="margin-bottom: 8px;">
        <div class="subheading"><a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id)">{{ video.title || "[Untitled]" }}</a></div>
        <div class="body-1">
            {{ video.description.substring(0, 150) }}
        </div>
        <small>Uploaded {{ getVideoDate }} <span v-if="showChannel">by <a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '')  + '/' + video.ref_channel_id)">{{ video.channel_name || "[Unnamed]" }} ({{ video.cert_user_id }})</a></span>
        	<br><span v-if="showCategory && category">On <a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }} Category</a></span>
       	</small>
        <v-divider style="margin-top: 8px;"></v-divider>
    </div>
</template>

<script>
    var Router = require("../libs/router.js");
    var moment = require("moment");

	module.exports = {
		props: ["video", "showChannel", "showCategory", "langTranslation"],
		name: "video-list-item",
		data: () => {
			return {
				category: null
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoVid"];
			});
            this.ZiteName = this.langTranslation["KxoVid"];*/

            this.getCategory();
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
			getCategory: function() {
				var self = this;

				console.log(this.video.site);

				var query = `
					SELECT * FROM category_hubs
					LEFT JOIN json USING (json_id)
					WHERE address="${ this.video.site }"
					`;
				page.cmdp("dbQuery", [query])
					.then((results) => {
						console.log("Categories: ", results);
						self.category = results[0];
					});
			},
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