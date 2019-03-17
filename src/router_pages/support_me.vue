<template>
	<v-container fluid>
        <v-container style="max-width: 700px">
            <div class="title" style="margin-bottom: 8px; text-align: center;">Supporting Me</div>
            <p class="body-1">
                You can help support me (Krixano) by becomming a <a href="https://www.patreon.com/krixano">patreon supporter</a>, donating Bitcoin (to 12gAes6NzDS9E2q6Q1UXrpUdbPS6nvuBPu) or <a href="#">Namecoin</a>, and subscribing to the <a href="./?/channel/1Jqrw1mySvE2sd3uaxTMdCBaYtVMJohcC2/1538205673322" @click.prevent="goto('channel/1Jqrw1mySvE2sd3uaxTMdCBaYtVMJohcC2/1538205673322')">official KxoVid channel</a> as well as my <a href="./?/channel/1Jqrw1mySvE2sd3uaxTMdCBaYtVMJohcC2/1538185680443" @click.prevent="goto('channel/1Jqrw1mySvE2sd3uaxTMdCBaYtVMJohcC2/1538185680443')">personal channel</a>.
            </p>
			<div class="title" style="margin-top: 10px; margin-bottom: 8px; text-align: center;">Contributors</div>
			<p>Thanks to Ivanq/GitCenter, ZeroLSTN, Thunder, Glightstar, and DaniellMesquita for ideas, bug reports, testing, and helping out with the programming.</p>
			<br>
			<p><strong>Version:</strong> 0.5</p>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "support-me",
		data: () => {
			return {
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