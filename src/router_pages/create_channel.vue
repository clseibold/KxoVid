<template>
	<v-container fluid>
		<v-container role="main" aria-labelledby="title" style="max-width: 700px;" v-if="userInfo">
			<div id="title" class="title" style="text-align: center;">Create Channel for {{ userInfo.cert_user_id }}</div>
            <br>
            <div role="form">
	            <v-text-field label="Name" v-model="name"></v-text-field>
	            <v-text-field multi-line label="About" v-model="about"></v-text-field>
				<v-select label="Toolbar Color" :items="toolbar_colors" v-model="toolbar_color"></v-select>
				<v-select label="Background Color" :items="background_colors" v-model="background_color"></v-select>
	            <v-btn ripple color="primary" @click="createChannel()">Create</v-btn>
	        </div>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "create-channel",
		data: () => {
			return {
                name: "",
				about: "",
				toolbar_colors: ["dark", "blue", "red", "green", "yellow", "purple", "black", "indigo"],
				toolbar_color: "dark",
				background_colors: ["white", "dark", "dark-blue", "light-blue", "light-teal"],
				background_color: "white"
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
			this.ZiteName = this.langTranslation["KxoId"];*/
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
				console.log("Test");
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
            createChannel: function() {
				if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "channels", function(date_added, data, tableData) {
					var actual_toolbar_color = self.toolbar_color == "dark" ? "" : self.toolbar_color;
					
					tableData.push({
                        "channel_id": date_added,
                        "name": self.name,
						"about": self.about,
						"toolbar_color": actual_toolbar_color,
						"background_color": self.background_color,
                        "date_added": date_added
                    });
                    return tableData;
                }, function ({ date, auth_address }) {
					Router.navigate('channel/' + auth_address + "/" + date);
                });
            }
		}
	}
</script>