<template>
    <v-list :dark="dark == 'dark'" dense>
        <v-list-tile :class="{ 'menu-item-active': routerIsActive('') }" href="./?/" @click.prevent="goto('')">
            <v-list-tile-action>
                <v-icon>home</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Home</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        <v-list-tile href="" @click.prevent="">
            <v-list-tile-action>
                <v-icon>equalizer</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Trending</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        <v-list-tile :class="{ 'menu-item-active': routerIsActive('categories') }" href="./?/categories" @click.prevent="goto('categories')" v-if="!isLoggedIn">
            <v-list-tile-action>
                <v-icon>change_history</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>Categories</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>

        <div v-if="isLoggedIn">
            <v-list-tile :class="{ 'menu-item-active': routerIsActive('subscriptions') }" href="./?/subscriptions" @click.prevent="goto('subscriptions')">
                <v-list-tile-action>
                    <v-icon>subscriptions</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>Subscriptions</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :class="{ 'menu-item-active': routerIsActive('categories') }" href="./?/categories" @click.prevent="goto('categories')">
                <v-list-tile-action>
                    <v-icon>change_history</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>Categories</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
            <!--<v-divider style="margin-top: 12px;"></v-divider>
            <v-subheader>Library</v-subheader>
            <v-list-tile href="" @click.prevent="">
                <v-list-tile-action>
                    <v-icon>access_time</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>Watch Later</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-list-tile href="" @click.prevent="">
                <v-list-tile-action>
                    <v-icon>thumb_up</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title>Liked videos</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>-->
            <div v-if="subscriptions && subscriptions.length > 0">
                <v-divider style="margin-top: 12px;"></v-divider>
                <v-subheader>Subscriptions</v-subheader>
                <v-list-tile v-for="channel in subscriptions" :key="channel.directory.replace('data/users/', '') + '-' + channel.channel_id" :class="{ 'menu-item-active': channelIsActive(channel.directory.replace('data/users/', ''), channel.channel_id) }" :href="'./?/channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id" @click.prevent="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">
                    <v-list-tile-avatar>
                        <svg width="40px" height="40px" v-bind:data-jdenticon-value="channel.directory.replace('data/users/', '') + '-' + channel.channel_id"></svg>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ channel.name }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-for="category in category_subscriptions" :key="category.directory.replace('data/users/', '') + '-' + category.hub_id" :href="'./?/category/' + category.address" @click.prevent="goto('category/' + category.address)">
                    <v-list-tile-avatar>
                        <svg width="40px" height="40px" v-bind:data-jdenticon-value="category.address + '-cat'"></svg>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ category.name }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </div>
            <div v-if="userChannels && userChannels.length > 0">
                <v-divider style="margin-top: 12px;"></v-divider>
                <v-subheader>Your Channels</v-subheader>
                <v-list-tile v-for="channel in userChannels" :key="channel.channel_id" :class="{ 'menu-item-active': channelIsActive(channel.directory.replace('data/users/', ''), channel.channel_id) }" :href="'./?/channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id" @click.prevent="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">
                    <v-list-tile-avatar>
                        <svg width="40px" height="40px" v-bind:data-jdenticon-value="channel.directory.replace('data/users/', '') + '-' + channel.channel_id"></svg>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ channel.name }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </div>
        </div>

        <v-divider style="margin-top: 12px; margin-bottom: 12px;"></v-divider>
        <v-list-tile :class="{ 'menu-item-active': routerIsActive('device-settings') }" href="./?/device-settings" @click.prevent="goto('device-settings')">
            <v-list-tile-title>Device Settings</v-list-tile-title>
        </v-list-tile>
        <v-list-tile :class="{ 'menu-item-active': routerIsActive('support-me') }" href="./?/support-me" @click.prevent="goto('support-me')">
            <v-list-tile-title>Support Me</v-list-tile-title>
        </v-list-tile>
    </v-list>
</template>

<style>
    .menu-item-active {
        background-color: lightgray;
    }
    .theme--dark .menu-item-active {
        background-color: #505050;
    }
</style>


<script>
	var Router = require("../libs/router.js");

	module.exports = {
		props: ["theme", "userInfo", "userChannels", "langTranslation"],
		name: "nav-drawer",
		data: () => {
			return {
                subscriptions: [],
                category_subscriptions: []
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoVid"];
			});
            this.ZiteName = this.langTranslation["KxoVid"];*/
		},
		mounted: function() {
            var self = this;
            
            self.getSubscriptions();
            
            this.$emit("setcallback", "navDrawerUpdate", function(userInfo) {
                //self.userInfo = userInfo;
                self.getSubscriptions(userInfo);
			});
		},
		updated: function() {
            //jdenticon();
            /*switch (this.$vuetify.breakpoint.name) {
                case 'xs': this.value = false;
                case 'sm': this.value = false;
                case 'md': this.value = false;
                case 'lg': this.value = null;
                case 'xl': this.value = null;
            }*/
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
            }
		},
		methods: {
            getSubscriptions: function(userInfo = this.userInfo) {
                if (userInfo == null || userInfo.cert_user_id == null) return;
                if (!userInfo.keyvalue.subscriptions || userInfo.keyvalue.subscriptions == "") {
                    this.subscriptions = [];
                    return;
                }

                var subs = userInfo.keyvalue.subscriptions.split("|");
                var query = "SELECT * FROM channels LEFT JOIN json USING (json_id) WHERE ";
                var query2 = "SELECT * FROM category_hubs LEFT JOIN json USING (json_id) WHERE ";
                var added = 0;
                var added2 = 0;
                for (var i = 0; i < subs.length; i++) {
                    if (subs[i] == "" || subs[i] == "undefined") continue;

                    var parts = subs[i].split(",");
                    var auth_address = parts[0];
                    var channel_id = parts[1];

                    if (channel_id == "cat") { // For category subscriptions
                        if (added2 != 0) query2 += " OR ";
                        query2 += "address=\"" + auth_address + "\"";
                        ++added2;
                    } else {
                        if (added != 0) query += " OR ";
                        query += "(directory=\"data/users/" + auth_address + "\" AND channel_id=" + channel_id + ")";
                        ++added;
                    }
                }

                console.log(query);

                var self = this;
                page.cmdp("dbQuery", [query])
                    .then((results) => {
                        self.subscriptions = results;
                    });

                // For category subscriptions
                page.cmdp("dbQuery", [query2])
                    .then((results) => {
                        console.log(results);
                        self.category_subscriptions = results;
                    });
            },
			goto: function(to) {
                Router.navigate(to);
			},
			login: function() {
				page.selectUser();
				return false;
			},
			gotoLink: function(to) {
				window.location = to;
            },
            routerIsActive: function(route) {
                return Router.currentRoute == route;
            },
            channelIsActive: function(auth_address, id) {
                return Router.currentRoute == "channel/:auth_address/:id" && Router.currentParams["auth_address"] && Router.currentParams["id"] && Router.currentParams["auth_address"] == auth_address && Router.currentParams["id"] == id;
            }
		}
	}
</script>