function upload_to_firebase(path, content){
	const url = `https://firebasestorage.googleapis.com/v0/b/typelingo.appspot.com/o/${encodeURIComponent(path)}`;
	
	const headers = {
	    'Content-Type': 'application/octet-stream',
	};

	const file_content = new Blob([content], { type: 'application/javascript' });

	let fetch_promise = fetch(url, {
	    method: 'POST',
	    headers,
	    body: file_content,
	});

	fetch_promise.then((response) => {
		if (!response.ok){
			console.log(`failed uploading ${path} to ${url}`);
		}else{
			console.log(`uploaded ${path} to ${url}`);
		}
	});
}

function request_listener(details) {
	console.log(details);
	let filter = browser.webRequest.filterResponseData(details.requestId);
	let datalen = 0;
	let data = [];
	let src = details.url;
	filter.ondata = (event) => {
		console.log(event);
		let as_array = new Uint8Array(event.data);
		//console.log(as_array);
		for(const b of as_array){
			data[datalen] = b;
			datalen = datalen + 1;
		}
		//console.log(data);
		//console.log(datalen);
	};
	filter.onstop = (event) => {
		console.log(event);
		let orig_array = new Uint8Array(data);

		let decoder = new TextDecoder("utf-8");
		let text = decoder.decode(orig_array);

		let final_text = text;

		if (text.includes(".push([[2143]")) { // Type 1
			var type1 = src;

			const fileName = type1.slice(type1.lastIndexOf('/') + 1);
			let modifiedContent = text;

			modifiedContent = modifiedContent.replace(/{canToggleTyping:!1,isToggledToTyping:!1}/g, "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"); // Replace all instances of "{canToggleTyping:!1,isToggledToTyping:!1}" with "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"
			modifiedContent = modifiedContent.replaceFromTo('case"DECREMENT_ONE_HEART":{', 'break', '');

			upload_to_firebase(fileName, modifiedContent);
			final_text = modifiedContent;
		}
		else if (text.includes(".Translate]:{Container:")) { // Type 2
			var type2 = src;

			const fileName = type2.slice(type2.lastIndexOf('/') + 1);
			const match = text.matchFrom(/\?"-character":""\)\]\},[a-zA-Z]+\|\|!/, text.indexOf(".Translate]:{Container:")); // Search for “.Translate]:{Container:” and then the first following occurrence of “?"-character":"")]},y||!”;
			const modifyIndex = match.index;
			const modifyWord = match[0];
			const modifiedContent = text.replaceAt(modifyIndex + modifyWord.length - 4, modifyIndex + modifyWord.length, "!"); // Replace last four characters with !

			upload_to_firebase(fileName, modifiedContent);
			final_text = modifiedContent;
		}

		let encoder = new TextEncoder("utf-8");
		modified_data = encoder.encode(final_text);

		filter.write(modified_data);
		filter.disconnect();
	}
	console.log(filter);
}

let request_listener_filter = {
	urls: ["*://d35aaqx5ub95lt.cloudfront.net/js/*.js"]
};

browser.webRequest.onBeforeRequest.addListener(request_listener, request_listener_filter, ["blocking"])

String.prototype.replaceAt = function(startIndex, endIndex, replacement) {
    return this.substring(0, startIndex) + replacement + this.substring(endIndex);
}

String.prototype.replaceFromTo = function(startString, endString, replacement) {
	const modifyIndex1 = this.indexOf(startString);
	const modifyIndex2 = this.indexOf(endString, modifyIndex1);
	return this.replaceAt(modifyIndex1 + startString.length, modifyIndex2, replacement)
}

String.prototype.matchFrom = function(regex, startpos) {
	var match = this.substring(startpos || 0).match(regex);
	match.index += (startpos || 0);
	return match;
}

console.log("TypeLingo loaded")
