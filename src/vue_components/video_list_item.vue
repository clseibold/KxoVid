<template>
    <!--<div style="margin-bottom: 8px;">
        <div class="subheading" style="margin-bottom: 3px;"><a class="heading" :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id + '/v/' + video.video_id)">{{ video.title || "[Untitled]" }}</a></div>
		<div class="caption" style="margin-bottom: 3px;">
			<span v-if="showChannel"><a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '')  + '/' + video.ref_channel_id)">{{ video.channel_name || "[Unnamed]" }} ({{ video.cert_user_id }})</a> -</span> {{ getVideoDate }}
		</div>
        <div class="caption">
            {{ video.description.substring(0, 150) }}
        </div>
        <small style="font-size: .8em;">
			<span v-if="fileInfo">{{ (typeof fileInfo.peer_seed) != undefined && fileInfo.peer_seed != null ? fileInfo.peer_seed + " / " : "" }} {{ fileInfo.peer }} peers ({{ getSize }})</span>
        	<br><span v-if="showCategory && category">On <a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }} Category</a></span>
       	</small>
        <v-divider style="margin-top: 8px;"></v-divider>
    </div>-->
	<div :title="video.title || '[Untitled]'">
		<v-list-tile ripple @click="gotoVideo()">
			<v-list-tile-content>
				<v-list-tile-title>{{ video.title || "[Untitled]" }}</v-list-tile-title>
				<v-list-tile-title style="font-size: 14px;">
					<span v-if="showChannel"><!--<a :href="'./?/channel/' + video.directory.replace('data/users/', '') + '/' + video.ref_channel_id" @click.prevent="goto('channel/' + video.directory.replace('data/users/', '')  + '/' + video.ref_channel_id)">-->{{ video.channel_name || "[Unnamed]" }} ({{ video.cert_user_id }})<!--</a>--> -</span> {{ getVideoDate }}
				</v-list-tile-title>
				<v-list-tile-sub-title>
					{{ video.description.substring(0, 150) }}
				</v-list-tile-sub-title>
			</v-list-tile-content>
			<v-list-tile-action v-if="fileInfo">
				<v-list-tile-action-text>
					{{ (typeof fileInfo.peer_seed) != undefined && fileInfo.peer_seed != null ? fileInfo.peer_seed + " / " : "" }} {{ fileInfo.peer }}
				</v-list-tile-action-text>
				<v-icon v-if="edit && false">edit</v-icon>
			</v-list-tile-action>
		</v-list-tile>
		<v-divider></v-divider>
	</div>
</template>

<script>
    var Router = require("../libs/router.js");
    var moment = require("moment");

	module.exports = {
		props: ["video", "showChannel", "showCategory", "langTranslation", "edit"],
		name: "video-list-item",
		data: () => {
			return {
				category: null,
				fileInfo: null
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoVid"];
			});
            this.ZiteName = this.langTranslation["KxoVid"];*/

			this.getCategory();
			this.getFileInfo();
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
			},
			getSize: function() {
                if (!this.fileInfo) return "";

                var size = this.fileInfo.size / 1024; // KB
                var mb = false;
                if (size > 1024) {
                    size /= 1024;
                    mb = true;
                }

                var downloaded_size = this.fileInfo.bytes_downloaded / 1024; // KB
                var downloaded_mb = false;
                if (downloaded_size > 1024) {
                    downloaded_size /= 1024;
                    downloaded_mb = true;
                }

                return downloaded_size.toFixed(2) + (downloaded_mb ? " MB " : " KB ") + "/ " + size.toFixed(2) + (mb ? " MB" : " KB");
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
			getFileInfo: function() {
				var self = this;
				page.cmdp("optionalFileInfo", [this.video.video_file])
					.then((fileInfo) => {
						self.fileInfo = fileInfo;
					});
			},
			goto: function(to) {
                Router.navigate(to);
			},
			gotoVideo: function() {
				if (!this.edit) {
					this.goto('channel/' + this.video.directory.replace('data/users/', '') + '/' + this.video.ref_channel_id + '/v/' + this.video.video_id);
				} else {
					this.goto('channel/settings/' + this.video.ref_channel_id + '/v/' + this.video.video_id);
				}
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