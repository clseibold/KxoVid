<template>
	<v-container fluid>
		<v-container style="max-width: 700px;" v-if="auth_address">
			<svg width="80" height="80" style="float: left; margin-bottom: 15px;" v-bind:data-jdenticon-value="auth_address"></svg>
			<div style="float: right; width: calc(100% - 90px); height: 80px; margin-bottom: 15px;">
				<strong style="font-size: 1.2em;">{{ username }}</strong>
				<p>{{ auth_address }}</p>
			</div>
			<div style="clear: both;"></div>

			<div>
				<v-divider></v-divider>
			</div>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "profile",
		data: () => {
			return {
				username: "",
				auth_address: "",
				corsZites: [
					{ title: "Important Zites", searchType: "Zites", address="1MiS3ud9JogSQpd1QVmM6ETHRmk5RgJn6E" },
				],
			};
		},
		beforeMount: function() {
			var self = this;

			this.getProfile();

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
				self.userInfo = userInfo;
                self.getProfile(userInfo);
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			getProfile: function(userInfo = this.userInfo) {
				console.log(Router.currentParams["username"]);
				if (!Router.currentParams["username"] || Router.currentParams["username"] == "") {
					if (userInfo) {
						this.auth_address = userInfo.auth_address;
						this.username = userInfo.cert_user_id.replace("@kxoid.bit", "");
					}
					return;
				}

				this.username = Router.currentParams["username"];

				var self = this;
				page.cmd("dbQuery", ["SELECT * FROM ids WHERE username='" + this.username + "' LIMIT 1"], (results) => {
					console.log(results);
					self.auth_address = results[0].address;
				});
			},
			getCorsAndDb: function(address, doGetResults = false, callback = null) {
				console.log("Test");
                var self = this;
                this.pageNum = 0;
                if(page.siteInfo.settings.permissions.indexOf("Cors:" + address) < 0) {
                    page.cmd("corsPermission", address, function() {
                    		if (doGetResults)
                            	self.getResults();
                            if (callback != null) callback();
                        });
                } else {
                    if (doGetResults)
                    	self.getResults();
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