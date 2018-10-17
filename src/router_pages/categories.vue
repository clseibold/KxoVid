<template>
	<v-container fluid>
        <v-container style="max-width: 700px;">
            <div class="title" style="text-align: center;">Categories <a href="./?/categories/add" @click.prevent="goto('categories/add')" style="font-size: .5em;">Add Category to Index</a></div>
            <v-container grid-list-xl>
                <v-layout row wrap>
                    <v-flex xs12 sm6>
                        <v-card v-for="category in categories.slice(0, Math.round(categories.length / 2.0))" @click.native="addMerger(category.address)" style="cursor: pointer; margin-bottom: 8px;">
                            <div style="text-align: center;"><strong style="color: blue;">{{ category.name }}</strong></div>
                            <div style="text-align: center;">
                                {{ category.description.substring(0, 200) }}<br>
                                <small>{{ category.cert_user_id }}: {{ category.address }}</small>
                            </div>
                        </v-card>
                    </v-flex>
                    <v-flex xs12 sm6>
                        <v-card v-for="category in categories.slice(Math.round(categories.length / 2.0))" @click.native="addMerger(category.address)" style="cursor: pointer; margin-bottom: 8px;">
                            <div style="text-align: center;"><strong style="color: blue;">{{ category.name }}</strong></div>
                            <div style="text-align: center;">
                                {{ category.description.substring(0, 200) }}<br>
                                <small>{{ category.cert_user_id }}: {{ category.address }}</small>
                            </div>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "langTranslation"],
		name: "categories",
		data: () => {
			return {
                downloaded: [],
                categories: []
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
            
            this.getDownloaded();
            this.getCategories();

			this.$emit("setcallback", "update", function(userInfo) {
                self.getDownloaded();
                self.getCategories();
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getDownloaded: function() {
                var self = this;

                self.downloaded = [];
            },
            getCategories: function() {
                var self = this;

                page.cmdp("dbQuery", ["SELECT * FROM category_hubs LEFT JOIN json USING (json_id)"])
                    .then((results) => {
                        console.log(results);
                        self.categories = results;
                    });
            },
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
            addMerger: function(address) {
                var self = this;
                
                page.cmd("mergerSiteAdd", [address], function() {
                    self.getDownloaded();
                });
            }
		}
	}
</script>