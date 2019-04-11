<template>
	<v-container fluid>
        <v-container style="max-width: 700px;">
            <div class="title">Device Settings</div>
            <div class="subheading">Google Cast</div>
            <p>Note that you must be on ZeroNet Version rev3620 for casting to work. Additinally, casting requires a Google script file to be downloaded. You can allow this for one session (you are prompted when the cast button is clicked) or when you first load the zite by clicking the checkbox below.</p>
            <v-checkbox v-model="allowCasting" :value="userSettings.allowCasting" label="Allow Casting on Zite Load"></v-checkbox>
            <v-text-field v-model="castingServer" :value="userSettings.castingServer" label="ZeroNet Proxy/server to stream from (on Google Cast device)"></v-text-field>
            <v-btn @click="save">Save</v-btn>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userSettings", "userInfo", "langTranslation"],
		name: "device-settings",
		data: () => {
			return {
                channels: [],
                allowCasting: false,
                castingServer: "https://core.0net.io/"
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            console.log("UserSettings: ", this.userSettings);

            
            this.allowCasting = this.userSettings.allowCasting != null ? this.userSettings.allowCasting : false;
            this.castingServer = this.userSettings.castingServer == "" ? "https://core.0net.io/" : this.userSettings.castingServer;
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
                self.allowCasting = self.userSettings.allowCasting != null ? self.userSettings.allowCasting : false;
                self.castingServer = self.userSettings.castingServer == "" ? "https://core.0net.io/" : self.userSettings.castingServer;
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
            },
            save: function() {
                /*this.$parent.$set(this.$parent.userSettings, "allowCasting", this.allowCasting);
                this.$parent.$set(this.$parent.userSettings, "castingServer", this.castingServer);*/
                this.$emit('setusersettings', { allowCasting: this.allowCasting, castingServer: this.castingServer, introductionFinished: this.userSettings.introductionFinished });
                page.cmdp("userSetSettings", [{ allowCasting: this.allowCasting, castingServer: this.castingServer, introductionFinished: this.userSettings.introductionFinished }]);
                page.cmdp("wrapperNotification", ["info", "You must refresh for the changes to take effect."]);
            }
		}
	}
</script>