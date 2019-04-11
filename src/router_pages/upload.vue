<template>
	<v-container fluid>
        <v-container role="main" aria-labelledby="title" style="max-width: 700px;" v-if="userInfo">
            <div id="title" class="title" style="text-align: center; margin-bottom: 20px;">Upload Video</div>

            <div v-if="userChannels.length > 0" role="form">
                <v-text-field v-model="title" label="Title"></v-text-field>
                <v-select v-model="selectedChannelId" :items="userChannelsSelect" label="Channel" single-line autocomplete></v-select>
                <v-select v-model="selectedCategoryAddress" :items="categoriesSelect" label="Category" single-line autocomplete :hint="categoryHint" persistent-hint></v-select>
                <v-text-field v-model="description" label="Description" multi-line></v-text-field>

                <v-select v-model="tags" label="Tags (press enter to add tag)" chips tags></v-select>
                <v-checkbox v-model="original" label="Original?"></v-checkbox>
                <v-checkbox v-model="vr" label="360 (VR) Video?"></v-checkbox>


                <input class="file-input" ref="fileInput" type="file" accept="video/mp4,video/webm,video/ogg,.cast" id="fileUpload"><br>
                <v-btn :loading="loading" ripple color="primary" @click="uploadVideo()">Upload</v-btn>
            </div>
            <div v-else>
                <p>
                    You must create at least one channel first before you can upload a video. <a href="./?/channel/create" v-on:click.prevent="goto('channel/create')">Create a channel here</a>.
                </p>
            </div>
        </v-container>
        <v-container role="main" aria-label="User must be logged in" v-if="!userInfo">
            <div class="title" style="text-align: center;">Upload Video</div>

            <p>You must be logged in to upload a video.</p>
        </v-container>
	</v-container>
</template>

<script>
	var Router = require("../libs/router.js");
	var searchDbQuery = require("../libs/search.js");

	module.exports = {
		props: ["userInfo", "userChannels", "langTranslation"],
		name: "upload",
		data: () => {
			return {
                title: "",
                description: "",
                tags: [],
                original: false,
                vr: false,
                userChannelsSelect: [],
                selectedChannelId: null,
                categoriesSelect: [],
                selectedCategoryAddress: null,
                loading: false,
                categoryHint: `Don't see desired category? Download more from the <a herf="./?/categories" onclick="Router.navigate('categories'); event.preventDefault();">Categories Page</a>`
			};
		},
		beforeMount: function() {
			var self = this;
			/*this.$parent.$on("setLanguage", function(langTranslation) {
				self.ZiteName = langTranslation["KxoId"];
			});
            this.ZiteName = this.langTranslation["KxoId"];*/
            
            this.userChannelsSelect = [];
            for (var i = 0; i < this.userChannels.length; i++) {
                this.userChannelsSelect.push({ text: this.userChannels[i].name, value: this.userChannels[i].channel_id });
            }

            this.getCategories();
		},
		mounted: function() {
			var self = this;

			this.$emit("setcallback", "update", function(userInfo) {
                setTimeout(function() {
                    self.userChannelsSelect = [];
                    for (var i = 0; i < self.userChannels.length; i++) {
                        self.userChannelsSelect.push({ text: self.userChannels[i].name, value: self.userChannels[i].channel_id });
                    }
    
                    self.getCategories();
                }, 100);
			});
		},
		computed: {
			isLoggedIn: function() {
				if (this.userInfo == null) return false;
				return this.userInfo.cert_user_id != null;
			}
		},
		methods: {
            getCategories: function() {
                var self = this;

                page.cmdp("mergerSiteList", [true])
                    .then((categories) => {
                        console.log(categories);
                        //console.log(categories);
                        var addresses = Object.keys(categories);
                        for (var i = 0; i < addresses.length; i++) {
                            if (addresses[i] == userChannelIndexMerger) continue;
                            self.categoriesSelect.push({ value: addresses[i], text: categories[addresses[i]].content.title });
                        }
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
            uploadVideo: function() {
                var self = this;

                if (!this.selectedChannelId || !this.selectedCategoryAddress) {
                    page.cmd("wrapperNotification", ["error", "You must select a Channel and a Category."]);
                    return;
                }

                if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
					alert("The File APIs are not fully supported in this browser.");
					return;
                }
                
                var that = this;
				var fileUpload = self.$refs.fileInput;
                var files = fileUpload.files;

                if (files.length <= 0) {
                    page.cmd("wrapperNotification", ["error", "You must select a video file to upload."]);
                    return;
                }
                
                if (!files) {
                    self.loading = false;
					return;
				}

                var accepted = false;
                for (let fX in files) {
					let fY = files[fX];

					if (!fY || typeof fY !== "object" || (!fY.type.match("video/mp4|video/ogg|video/webm") && !fY.name.match(/\.cast$/gm))) { // |audio|video      || !fY.name.match(/\.IMAGETYPE$/gm)
						//page.cmd("wrapperNotification", ["error", "That file type is not supported."]);
						continue;
                    }
                    
                    accepted = true;
                    self.loading = true;

					//let reader = new FileReader();
					/*reader.onload = function(event) {
							let f_data = btoa(event.target.result);
							let file_type = fY.type;
*/
							page.uploadBigFile(self.selectedCategoryAddress, fY, (output_url) => {
									console.log("Uploaded video!");
									fileUpload.value = null;
									self.saveVideo(output_url);
								});
						//};
					//reader.readAsBinaryString(fY);
                }
                
                if (!accepted) {
                    page.cmd("wrapperNotification", ["error", "That file type is not supported."]);
                    self.loading = false;
                }
            },
            saveVideo: function(output_url) {
                var self = this;

                if (!this.selectedChannelId || !this.selectedCategoryAddress) return;

                page.editTableData(self.selectedCategoryAddress, "videos", function(date, data, tableData) {
                    tableData.push({
                        "video_id": date,
                        "ref_channel_id": self.selectedChannelId,
                        "title": self.title,
                        "description": self.description,
                        "tags": self.tags.join("|"),
                        "original": self.original || false,
                        "vr": self.vr || false,
                        "video_file": output_url,
                        "date_added": date
                    });

                    return tableData;
                }, function({ date, auth_address }) {
                    self.loading = false;
                    Router.navigate("channel/" + self.userInfo.auth_address + "/" + self.selectedChannelId + "/v/" + date);
                });
            }
		}
	}
</script>