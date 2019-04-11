sprintf = (fmt = "", ...rest) => {
	var result = fmt;

	var i = 1;
	while (i < rest.length) {
		result.replace(/\w%\w/, rest[i]);
	}
}

// Prints to console
printf = (fmt = "", error = false, ...rest) => {
	var result = sprintf.apply(null, rest);

	if (error) console.error(result);
	else console.log(result);
}

editTableData = (zeroframe, mergerType, mergerAddress, auth_address, table, manageDataFunc, beforePublishCB = null) => {
	/*if (!zeroframe.siteInfo.cert_user_id) {
		return zeroframe.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
	} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
		return zeroframe.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
	}*/

	var data_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/data.json";
	var content_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/content.json";
	//var data_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + zeroframe.siteInfo.auth_address + "/data.json";
	//var content_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + zeroframe.siteInfo.auth_address + "/content.json";

	//var self = this;
	return zeroframe.cmdp("fileGet", { "inner_path": data_inner_path, "required": false })
		.then((data) => {
			data = JSON.parse(data);
			if (!data) {
				data = {};
			}

			if (!data[table]) data[table] = [];

			var date = Date.now();

			// date_added, data, tableData
			data[table] = manageDataFunc(date, data, data[table]);

			if (data[table] == null) {
				return { "err": "returned" };
			}

			/*data["questions"].push({
				"question_id": date,
				"title": title,
				"body": body,
				"tags": tags,
				"date_added": date
			});*/

			var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

			return zeroframe.cmdp("fileWrite", [data_inner_path, btoa(json_raw)])
				.then((res) => {
					if (res === "ok") {
						return zeroframe.cmdp("siteSign", { "inner_path": content_inner_path })
							.then((res) => {
								if (res === "ok") {
									if (beforePublishCB != null && typeof beforePublishCB === "function") beforePublishCB({ "date": date, "auth_address": auth_address });
									return zeroframe.cmdp("sitePublish", { "inner_path": content_inner_path, "sign": false })
										.then(() => {
											return { "date": date, "auth_address": auth_address };
										}).catch((err) => {
											console.log(err);
											return { "date": date, "auth_address": auth_address, "err": err };
										});
								} else {
									return zeroframe.cmdp("wrapperNotification", ["error", "Failed to sign user data."]);
								}
							});
					} else {
						return zeroframe.cmdp("wrapperNotification", ["error", "Failed to write to data file."]);
					}
				});
		});
}

editData = (zeroframe, mergerType, mergerAddress, auth_address, manageDataFunc, beforePublishCB = null) => {
	/*if (!zeroframe.siteInfo.cert_user_id) {
		return zeroframe.cmdp("wrapperNotification", ["error", "You must be logged in to make a post."]);
	} else if (!Router.currentParams["topicaddress"] && !mergerAddress) {
		return zeroframe.cmdp("wrapperNotification", ["error", "You must choose a topic to post to."]);
	}*/

	var data_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/data.json";
	var content_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/content.json";
	//var data_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + zeroframe.siteInfo.auth_address + "/data.json";
	//var content_inner_path = "merged-KxoVid/" + mergerAddress + "/data/users/" + zeroframe.siteInfo.auth_address + "/content.json";

	//var self = this;
	return zeroframe.cmdp("fileGet", { "inner_path": data_inner_path, "required": false })
		.then((data) => {
			data = JSON.parse(data);
			if (!data) {
				data = {};
			}

			var date = Date.now();
			
			data = manageDataFunc(data);

			if (data == null) {
				return { "err": "returned" };
			}

			/*data["questions"].push({
				"question_id": date,
				"title": title,
				"body": body,
				"tags": tags,
				"date_added": date
			});*/

			var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')));

			return zeroframe.cmdp("fileWrite", [data_inner_path, btoa(json_raw)])
				.then((res) => {
					if (res === "ok") {
						return zeroframe.cmdp("siteSign", { "inner_path": content_inner_path })
							.then((res) => {
								if (res === "ok") {
									if (beforePublishCB != null && typeof beforePublishCB === "function") beforePublishCB({ "date": date, "auth_address": auth_address });
									return zeroframe.cmdp("sitePublish", { "inner_path": content_inner_path, "sign": false })
										.then(() => {
											return { "date": date, "auth_address": auth_address };
										}).catch((err) => {
											console.log(err);
											return { "date": date, "auth_address": auth_address, "err": err };
										});
								} else {
									return zeroframe.cmdp("wrapperNotification", ["error", "Failed to sign user data."]);
								}
							});
					} else {
						return zeroframe.cmdp("wrapperNotification", ["error", "Failed to write to data file."]);
					}
				});
		});
}

makeCurOptional = (anything = false, audio = true, flac = true, video = true, zip = false, tar = false, doc = false, ...rest) => {
	if (anything) return ".+\\.[a-zA-Z0-9]+(.piecemap.msgpack)?";

	var result = ".+\\.(";

	if (audio) result += "mp3|ogg|webm|wav|wave|MP3|OGG|WEBM|WAV|WAVE";
	if (video) {
		if (!result.endsWith('|') && !result.endsWith('(')) result += "|";
		result += "mp4|MP4"
		if (!result.includes("ogg")) result += "|ogg|OGG";
		if (!result.includes("webm")) result += "|webm|WEBM";
	}

	if (zip) {
		if (!result.endsWith('|') && !result.endsWith('(')) result += "|";
		result += "zip|ZIP";
	}
	if (tar) {
		if (!result.endsWith('|') && !result.endsWith('(')) result += "|";
		result += "tar|TAR|gz|GZ";
	}
	if (doc) {
		if (!result.endsWith('|') && !result.endsWith('(')) result += "|";
		result += "doc|docx|pdf|csv|xls|xlsx|odt|ppt|pptx|txt|md";
	}

	for (var i = 0; i < rest.length; i++) {
		if (typeof rest[i] !== "string") continue;

		//console.log(rest[i], typeof rest[i]);
		if (!result.endsWith('|')) result += "|";
		result += rest[i] + "|" + rest[i].toUpperCase();
	}

	result += ")(.piecemap.msgpack)?";

	return result;
}

// TODO: Add flags for the filetypes to allow
checkOptional_inner = (zeroframe, mergerType, mergerAddress, auth_address, doSignPublish, f = null, curoptional = ".+\\.(mp4|ogg|webm|cast|MP4|OGG|WEBM|CAST)(.piecemap.msgpack)?") => {
    /*if (!app.userInfo || !app.userInfo.cert_user_id) {
        this.cmd("wrapperNotification", ["info", "Please login first."]);
        //page.selectUser(); // TODO: Check if user has data, if not, show the registration modal.
        return;
    }*/

	var data_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/data.json";
	var content_inner_path = (mergerType ? mergerType + '/' + mergerAddress + '/' : '') + "data/users/" + auth_address + "/content.json";
    /*var data_inner_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/data.json";
    var content_inner_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/content.json";*/

    // Verify that user has correct "optional" and "ignore" values
    zeroframe.cmd("fileGet", { "inner_path": content_inner_path, "required": false }, (data) => {
        if (!data) data = {};
        else data = JSON.parse(data);

        var changed = false;
        if (!data.hasOwnProperty("optional") || data.optional !== curoptional){
            data["optional"] = curoptional
            changed = true;
        }

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, "\t")));

        if (changed) {
            // Write (and Sign and Publish is doSignPublish)
            zeroframe.cmd("fileWrite", [content_inner_path, btoa(json_raw)], (res) => {
                if (res === "ok") {
                    if (f != null && typeof f === "function") f();
                    if (doSignPublish) {
                        zeroframe.cmd("siteSign", { "inner_path": content_inner_path }, () => {
                            zeroframe.cmd("sitePublish", { "inner_path": content_inner_path, "sign": false });
                        });
                    }
                } else {
                    zeroframe.cmd("wrapperNotification", ["error", "File write error: " + JSON.stringify(res)]);
                }
            });
        } else {
            if (f != null && typeof f === "function") f();
        }
    });
}

// TODO: Add flags for the filetypes to allow
uploadBigFile = (zeroframe, mergerType, mergerAddress, auth_address, file, f = null, checkOptF = checkOptional_inner, curoptional = ".+\\.(mp4|ogg|webm|cast|MP4|OGG|WEBM|CAST)(.piecemap.msgpack)?") => {
	var date_added = Date.now();
    var orig_filename_list = file.name.split(".");
    var filename = orig_filename_list[0].replace(/\s/g, "_").replace(/[^\x00-\x7F]/g, "").replace(/\'/g, "").replace(/\"/g, "").replace(/%20/g, "").replace(/%/g, "").replace(/\.([0-9]+)/g, "$1").replace(/\\/g, "").replace(/\(/g, "").replace(/\)/g, "").replace(/[^a-zA-Z0-9\.\-_+]/g, '') + "-" + date_added + "." + orig_filename_list[orig_filename_list.length - 1];

    var f_path = (mergerType ? mergerType + "/" + mergerAddress + "/" : "") + "data/users/" + auth_address + "/" + filename.toLowerCase();
    //var f_path = "merged-KxoVid/" + address + "/data/users/" + page.siteInfo.auth_address + "/" + filename.toLowerCase();

    checkOptF(zeroframe, mergerType, mergerAddress, auth_address, false, () => {
        zeroframe.cmd("bigfileUploadInit", [f_path, file.size], (init_res) => {
            var formdata = new FormData();
            formdata.append(file.name, file);

            var req = new XMLHttpRequest();

            req.upload.addEventListener("progress", console.log);
            req.upload.addEventListener("loadend", () => {
				console.log("Loadend");
				// Pin file so it is excluded from the automatized optional file cleanup
				zeroframe.cmd("optionalFilePin", { "inner_path": f_path });
				
                zeroframe.cmd("wrapperNotification", ["info", "Upload finished!"]);
                if (f !== null && typeof f === "function") f(f_path);
            });
            req.withCredentials = true;
            req.open("POST", init_res.url);
            req.send(formdata);
        });
    }, curoptional);
}
