<template>
	<v-container fluid>
		<v-container style="max-width: 700px;" v-if="userInfo && channel">
			<div class="title" style="text-align: center;">Settings for Channel "{{ channel.name }}"</div>
            <br>
            <v-text-field label="Name" v-model="name"></v-text-field>
            <v-text-field multi-line label="About" v-model="about"></v-text-field>
            <v-select label="Toolbar Color" :items="toolbar_colors" v-model="toolbar_color"></v-select>
            <v-btn ripple color="primary" @click="saveChannel()">Save</v-btn>
            <v-btn ripple dark color="red" @click="deleteChannel()">Delete</v-btn>
		</v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "channel-settings",
		data: () => {
			return {
                id: "",
                channel: null,
                name: "",
                about: "",
                toolbar_colors: ["dark", "blue", "red", "green", "yellow", "purple", "black", "indigo"],
                toolbar_color: ""
			};
		},
		beforeMount: function() {
			var self = this;

			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            this.id = Router.currentParams["id"];
		},
		mounted: function() {
            var self = this;
            
            this.getChannel();

			this.$emit("setcallback", "update", function(userInfo) {
                self.userInfo = userInfo;
                self.getChannel(userInfo);
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getChannel: function(userInfo = this.userInfo) {
                if (userInfo == null || userInfo.auth_address == null) return;
                
                var self = this;
                page.cmdp("dbQuery", ["SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE channel_id=" + this.id + " AND directory=\"data/users/" + userInfo.auth_address + "\" LIMIT 1"])
                .then((results) => {
                    self.channel = results[0];
                    self.name = self.channel.name;
                    self.about = self.channel.about;
                    self.toolbar_color = self.channel.toolbar_color == "" || self.channel.toolbar_color == null ? "dark" : self.channel.toolbar_color;
                });
            },
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
            saveChannel: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "channels", function(date_added, data, tableData) {
                    var actual_toolbar_color = self.toolbar_color == "dark" ? "" : self.toolbar_color;

                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].channel_id == self.id) {
                            tableData[i].name = self.name;
                            tableData[i].about = self.about;
                            tableData[i].toolbar_color = actual_toolbar_color;

                            return tableData;
                        }
                    }
                }, function ({ date_updated, auth_address }) {
                    Router.navigate('channel/' + auth_address + '/' + self.channel.channel_id);
                });
            },
            deleteChannel: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "channels", function(date_added, data, tableData) {
                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].channel_id == self.id) {
                            tableData.splice(i, 1);
                            return tableData;
                        }
                    }
                    return null;
                }, function ({ date_updated, auth_address }) {
                    Router.navigate('');
                });
            }
		}
	}
</script>