<template>
	<v-toolbar clipped-left app dark style="padding-right: 45px; padding-left: 45px;" color="primary">
		<v-toolbar-side-icon @click.stop="toggleDrawer()"></v-toolbar-side-icon>
		<v-toolbar-title href="./?/" style="cursor: pointer;" @click.prevent="goto('')">{{ ZiteName }} (beta)</v-toolbar-title>
		<v-spacer class="hidden-md-and-down"></v-spacer>
		<v-text-field class="hidden-md-and-down" solo flat light hide-details placeholder="Search" v-model="search" prepend-icon="search"></v-text-field>
		<v-spacer></v-spacer>
		<!--<v-toolbar-items style="margin-left: 10px;">-->
			<!--<v-btn flat>News</v-btn>-->
			<!--<v-btn flat @click="goto('plugins')">Plugin Store</v-btn>-->
		<!--</v-toolbar-items>-->
		<v-menu left offset-y dark>
			<v-btn icon slot="activator" class="hidden-xs-only">
		      <v-icon>apps</v-icon>
		    </v-btn>
		    <v-list>
		    	<v-subheader>Network Zites</v-subheader>
		    	<!--<v-list-tile @click="">
		    		<v-list-tile-title>KxoMail</v-list-tile-title>
		    	</v-list-tile>-->
				<v-list-tile href="/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P" @click="gotoLink('/1GTVetvjTEriCMzKzWSP9FahYoMPy6BG1P')">
		    		<v-list-tile-title>KxoNetwork</v-list-tile-title>
		    	</v-list-tile>
		    	<!--<v-list-tile @click="">
		    		<v-list-tile-title>KxoSoftware</v-list-tile-title>
		    	</v-list-tile>-->
		    	<v-list-tile href="/ZeroMedium.bit" @click="gotoLink('/ZeroMedium.bit')">
		    		<v-list-tile-title>ZeroMedium</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/ZeroExchange.bit" @click="gotoLink('/ZeroExchange.bit')">
		    		<v-list-tile-title>ZeroExchange</v-list-tile-title>
		    	</v-list-tile>
		    	<v-list-tile href="/1LqcxtENM69yBggxPYLaj87J4bqon5SVwU" @click="gotoLink('/1LqcxtENM69yBggxPYLaj87J4bqon5SVwU')">
		    		<v-list-tile-title>KxoHub (ZeroMe Hub)</v-list-tile-title>
		    	</v-list-tile>
		    	<v-divider></v-divider>
		    	<v-subheader>Partner Zites</v-subheader>
		    	<v-list-tile href="/1Ag6xidDHiPgWoDKhfSx4xFQr6WC3NqxZg" @click="gotoLink('/1Ag6xidDHiPgWoDKhfSx4xFQr6WC3NqxZg')">
		    		<v-list-tile-title>0Play Game Center</v-list-tile-title>
		    	</v-list-tile>
		    	<!--<v-list-tile @click="">
		    		<v-list-tile-title>ZeroNet Instant Messenger</v-list-tile-title>
		    	</v-list-tile>-->
		    </v-list>
		</v-menu>
		<v-btn v-if="isLoggedIn && userChannels && userChannels.length > 0" icon class="hidden-sm-and-down" @click="goto('upload')">
			<v-icon>cloud_upload</v-icon>
		</v-btn>
		<v-toolbar-items>
			<v-btn flat v-if="!isLoggedIn" @click="login()">Sign In</v-btn>
			<v-menu flat v-else offset-y>
				<!--<v-btn slot="activator" icon class="hidden-sm-and-up" style="margin-right: 25px;">
					<svg style="height: 55%;" v-bind:data-jdenticon-value="userInfo.auth_address" v-if="isLoggedIn"></svg>
				</v-btn>-->
				<v-btn slot="activator" flat>
					<svg style="height: 40%; width: auto; margin-top: auto; margin-bottom: auto; margin-right: 5px;" v-bind:data-jdenticon-value="userInfo.auth_address" v-if="isLoggedIn"></svg>
					<span class="hidden-xs-only">{{ userInfo.cert_user_id }}</span>
				</v-btn>
				<v-list>
					<v-list-tile v-for="channel in userChannels.slice(0, 5)" :key="channel.channel_id" @click="goto('channel/' + channel.directory.replace('data/users/', '') + '/' + channel.channel_id)">
						<v-list-tile-title>{{ channel.name }}</v-list-tile-title>
					</v-list-tile>
					<v-list-tile @click="goto('channel/create')"><v-list-tile-title>Create Channel</v-list-tile-title></v-list-tile>
					<v-divider></v-divider>
					<v-list-tile @click="goto('profile')"><v-list-tile-title>Profile</v-list-tile-title></v-list-tile>
					<v-list-tile @click="goto('settings')"><v-list-tile-title>Settings</v-list-tile-title></v-list-tile>
				</v-list>
			</v-menu>
		</v-toolbar-items>
	</v-toolbar>
</template>

<script>
	var Router = require("../libs/router.js");

	module.exports = {
		props: ["userInfo", "userChannels", "langTranslation"],
		name: "navbar",
		data: () => {
			return {
				ZiteName: "KxoVid",
				search: ""
			};
		},
		beforeMount: function() {
			var self = this;
			this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoVid"];
			});
			this.ZiteName = this.langTranslation["KxoVid"];
		},
		mounted: function() {
			var self = this;
		},
		updated: function() {
			//jdenticon();
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
			toggleDrawer: function() {
				this.$emit("toggle-drawer");
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
			}
		}
	}
</script>