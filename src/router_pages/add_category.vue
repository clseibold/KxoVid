<template>
	<v-container fluid>
        <v-container role="main" aria-labelledby="title" style="max-width: 700px;" v-if="userInfo">
            <div id="title" class="title" style="text-align: center;">Add Category/Hub</div>

            <div role="form">
	            <v-text-field v-model="name" label="Name"></v-text-field>
	            <v-text-field v-model="address" label="Address" @change="addressChanged()"></v-text-field>
	            <v-text-field v-model="description" label="Description" multi-line></v-text-field>

	            <v-btn ripple color="primary" @click="addHub()">Add</v-btn>
	       	</div>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "add-category",
		data: () => {
			return {
                name: "",
                address: "",
                description: "",
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
			if (!this.userInfo) {
				/*this.$parent.on('setUserInfo', function() {
					// TODO
				});*/
			}

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
            },
            addressChanged: function() {
                console.log("Test");
                this.address = this.address.replace(/(https?\:\/\/)?((.+)\.(com|bit|tk|net|org|io|zero)|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|zero\/|zero\:\/\/)(\:[0-9]+)?\/?/, "")
                    .replace(/^([0-9a-zA-Z]+)\/.*/, "$1").replace(/\//g, "");
            },
            addHub: function() {
                if (!this.isLoggedIn) return;

                var self = this;
                page.editTableData(userChannelIndexMerger, "category_hubs", function(date_added, data, tableData){
                    tableData.push({
                        "hub_id": date_added,
                        "name": self.name,
                        "address": self.address,
                        "description": self.description,
                        "date_added": date_added
                    });

                    return tableData;
                }, function ({ date_added, auth_address }) {
                    Router.navigate('categories');
                });
            }
		}
	}
</script>