async function request_listener(details) {
	let filter = browser.webRequest.filterResponseData(details.requestId);
	let datalen = 0;
	let data = [];
	let src = details.url;

	filter.ondata = (event) => {
		let as_array = new Uint8Array(event.data);
		for (const b of as_array) {
			data[datalen] = b;
			datalen = datalen + 1;
		}
	};

	filter.onstop = (event) => {
		let orig_array = new Uint8Array(data);
		let decoder = new TextDecoder("utf-8");
		let text = decoder.decode(orig_array);
		let final_text = text;

		if (text.includes(".push([[2143]")) { // Type 1
			let modifiedContent = text;

			// Replace all instances of "{canToggleTyping:!1,isToggledToTyping:!1}" with "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"
			modifiedContent = modifiedContent.replace(
				/{canToggleTyping:!1,isToggledToTyping:!1}/g,
				"{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"
			);
			modifiedContent = modifiedContent.replaceFromTo('case"DECREMENT_ONE_HEART":{', 'break', '');

			final_text = modifiedContent;
		}
		else if (text.includes(".Translate]:{Container:")) { // Type 2
			// Search for “.Translate]:{Container:” and then the first following occurrence of “?"-character":"")]},y||!”
			const match = text.matchFrom(
				/\?"-character":""\)\]\},[a-zA-Z]+\|\|!/,
				text.indexOf(".Translate]:{Container:")
			);
			const modifyIndex = match.index;
			const modifyWord = match[0];

			// Replace last four characters with !
			final_text = text.replaceAt(
				modifyIndex + modifyWord.length - 4,
				modifyIndex + modifyWord.length,
				"!"
			);
		}

		let encoder = new TextEncoder("utf-8");
		filter.write(encoder.encode(final_text));
		filter.disconnect();
	};
}

let request_listener_filter = {
	urls: ["*://d35aaqx5ub95lt.cloudfront.net/js/*.js"]
};

browser.webRequest.onBeforeRequest.addListener(
	request_listener,
	request_listener_filter,
	["blocking"]
);

// --- String prototype helpers ---

String.prototype.replaceAt = function (startIndex, endIndex, replacement) {
	return this.substring(0, startIndex) + replacement + this.substring(endIndex);
}

String.prototype.replaceFromTo = function (startString, endString, replacement) {
	const modifyIndex1 = this.indexOf(startString);
	const modifyIndex2 = this.indexOf(endString, modifyIndex1);
	return this.replaceAt(modifyIndex1 + startString.length, modifyIndex2, replacement);
}

String.prototype.matchFrom = function (regex, startpos) {
	var match = this.substring(startpos || 0).match(regex);
	match.index += (startpos || 0);
	return match;
}

console.log("TypeLingo loaded successfully.")