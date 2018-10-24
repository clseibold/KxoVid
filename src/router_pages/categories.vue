<template>
	<v-container fluid>
        <v-container style="max-width: 700px;">
            <div class="title" style="text-align: center;">Categories <a href="./?/categories/add" @click.prevent="goto('categories/add')" style="font-size: .5em;">Add Category to Index</a></div>
            <v-container grid-list-xl>
                <v-layout row wrap>
                    <v-flex xs12 sm6>
                        <div v-for="category in categories.slice(0, Math.round(categories.length / 2.0))" style="margin-bottom: 8px;">
                            <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                            {{ category.description.substring(0, 200) }}<br>
                            <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                            <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                            <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                            <v-divider style="margin-top: 8px;"></v-divider>
                        </div>
                    </v-flex>
                    <v-flex xs12 sm6>
                        <div v-for="category in categories.slice(Math.round(categories.length / 2.0))" style="margin-bottom: 8px;">
                            <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                            {{ category.description.substring(0, 200) }}<br>
                            <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                            <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                            <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                            <v-divider style="margin-top: 8px;"></v-divider>
                        </div>
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
            mergerDownloaded: function(address) {
                return this.downloaded[address];
            },
            getDownloaded: function() {
                var self = this;

                //self.downloaded = [];

                page.cmdp("mergerSiteList", [true])
                    .then((mergedZites) => {
                        console.log(mergedZites["1LaX9nRmY6v2PS2xrAg9M2iXcU2y5wbBQr"]);
                        self.downloaded = mergedZites;
                    });
            },
            getCategories: function() {
                var self = this;

                page.cmdp("dbQuery", ["SELECT * FROM category_hubs LEFT JOIN json USING (json_id)"])
                    .then((results) => {
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
            },
            deleteMerger: function(address) {
                var self = this;

                page.cmdp("mergerSiteDelete", [address])
                    .then(() => {
                        self.getDownloaded();
                    });
            }
		}
	}
</script>