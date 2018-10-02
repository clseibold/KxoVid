<template>
	<v-container fluid>
		<p>NOTE: The below is just for debug testing:</p>
		<strong>Channels</strong><br>
		<div v-for="channel in channels" :key="channel.channel_id"><a href="#" @click.prevent="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">{{ channel.name }}</a></div>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "home",
		data: () => {
			return {
				channels: []
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/

			page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
				.then((results) => {
					self.channels = results;
				});
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
				page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id)"])
					.then((results) => {
						self.channels = results;
					});
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
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