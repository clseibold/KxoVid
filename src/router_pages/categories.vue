<template>
	<v-container fluid>
        <v-container style="max-width: 700px;">
            <div class="title" style="text-align: center;">Categories <a href="./?/categories/add" @click.prevent="goto('categories/add')" style="font-size: .5em;">Add Category to Index</a></div>

            <v-tabs show-arrows centered v-model="currentTab" style="max-width: 900px; margin-left: auto; margin-right: auto; margin-top: 20px;">
                <v-tab key="recommended" ripple>Recommended</v-tab>
                <v-tab key="all" ripple>All</v-tab>
                <v-tab key="official" ripple>Official</v-tab>
            </v-tabs>

            <v-container grid-list-xl>
                <v-tabs-items v-model="currentTab">
                    <v-tab-item key="recommended">
                        <v-layout row wrap>
                            <v-flex xs12 sm6>
                                <div v-for="category in recommended.slice(0, Math.round(recommended.length / 2.0))" style="margin-bottom: 8px;">
                                    <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                                    {{ category.description.substring(0, 200) }}<br>
                                    <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                                    <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                                    <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                                    <v-divider style="margin-top: 8px;"></v-divider>
                                </div>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <div v-for="category in recommended.slice(Math.round(recommended.length / 2.0))" style="margin-bottom: 8px;">
                                    <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                                    {{ category.description.substring(0, 200) }}<br>
                                    <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                                    <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                                    <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                                    <v-divider style="margin-top: 8px;"></v-divider>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-tab-item>
                    <v-tab-item key="all">
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
                    </v-tab-item>
                    <v-tab-item key="official">
                        <v-layout row wrap>
                            <v-flex xs12 sm6>
                                <div v-for="category in official.slice(0, Math.round(official.length / 2.0))" style="margin-bottom: 8px;">
                                    <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                                    {{ category.description.substring(0, 200) }}<br>
                                    <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                                    <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                                    <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                                    <v-divider style="margin-top: 8px;"></v-divider>
                                </div>
                            </v-flex>
                            <v-flex xs12 sm6>
                                <div v-for="category in official.slice(Math.round(official.length / 2.0))" style="margin-bottom: 8px;">
                                    <div style="text-align: center;"><a :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">{{ category.name }}</a></div>
                                    {{ category.description.substring(0, 200) }}<br>
                                    <small>{{ category.cert_user_id }}: {{ category.address }}</small><br>
                                    <a href="#" @click.prevent="deleteMerger(category.address)" v-if="mergerDownloaded(category.address)">Delete</a>
                                    <a href="#" @click.prevent="addMerger(category.address)" v-else>Download</a><br>
                                    <v-divider style="margin-top: 8px;"></v-divider>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-tab-item>
                </v-tabs-items>
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
                recommendedAddresses: [ "1PXdHUW5GDv6QjA5WYbDQGzF3Q24p4je95", "1CPhomLToaWAaYMkZt3xNEFjXADrBqp14Y", "18izgaM5UJgjQv2cPA9Rw5jrhmh8Up6eTN", "1MDB9Ad4Pyg5cogFx1HhE52cFhsqUmeNEd", "14KXCzQqSrSjzbk3CfKxHvCVAmJnAZwB4U", "14WZg7nWJHP2o2q4idZbbbipmNAYxyqYo6", "1Q7AL2WvrwBiT9gmk4ngw48AYCZ5wXqx48", "1GWaiBZpwRm3U3vtUYqUMrYRTbjgZva45V" ],
                categories: [],
                recommended: [],
                official: [],
                currentTab: 0
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

                page.cmdp("dbQuery", ["SELECT * FROM category_hubs LEFT JOIN json USING (json_id) ORDER BY name ASC"])
                    .then((results) => {
                        self.categories = results;

                        var official = [];
                        var recommended = [];
                        for (var i = 0; i < results.length; i++) {
                            let category = results[i];
                            if (category.cert_user_id == "krixano@kxoid.bit") {
                                official.push(category);
                            }
                            if (self.recommendedAddresses.includes(category.address)) {
                                recommended.push(category);
                            }
                        }
                        self.official = official;
                        self.recommended = recommended;
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