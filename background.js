var newMode;

chrome.storage.sync.get("mode", (result) => {
    newMode = result["mode"] ?? true;
});

chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (tab.url.includes("www.duolingo.com") && changeInfo.status == "complete" && !newMode) {
            try { // Prevents this error (idk why its even throwing this error but oh well): "Error in event handler: TypeError: chrome.declarativeNetRequest.updateDynamicRules(...) is not a function"
                // Execute content script if one does not already exist
                (async () => {
                    await chrome.tabs.sendMessage(tabId, {}, () => { if (chrome.runtime.lastError) { // If it throws an error saying "Could not establish connection. Receiving end does not exist." then this prevents that error and on top of that executes the script
                        chrome.scripting.executeScript({
                            target : {tabId : tabId},
                            files : [ "content_script.js" ]
                        });
                    }});
                })();
            } catch {}
        }

        if (changeInfo.url != undefined && tab.url.includes("duolingo.com/lesson") && changeInfo.status == "loading" && newMode) {
            chrome.scripting.executeScript({
                target : {tabId : tabId},
                files : [ "inject_scripts.js" ]
            });
        }
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.accessStorage == true) {
            if (request.set == true) {
                chrome.storage.sync.set({"IsTyping": request.IsTyping});
            }
            
            chrome.storage.sync.get("IsTyping", (result) => {
                sendResponse({"IsTyping": result["IsTyping"]});
            });
        }
        else if (request.accessStorage == false) {
            (async () => {
                const reload = await handleRedirects(request.sources);

                sendResponse({"reload": reload});
            })();
        }
        else if (request.mode != null) {
            chrome.storage.sync.set({"mode": request.mode});

            newMode = request.mode;

            if (request.mode == false) {
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: [1, 2]
                })
            }
        }

        return true;
    }
);

async function handleRedirects(sources) {
    for await (const src of sources) { // Get correct scripts
        const text = await (await fetch(src)).text();
        
        if (text.includes(".push([[2143]")) { // Type 1
            var type1 = src;
            
            const fileName = type1.slice(type1.lastIndexOf('/') + 1);
            const modifiedContent = text.replace(/{canToggleTyping:!1,isToggledToTyping:!1}/g, "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"); // Replace all instances of "{canToggleTyping:!1,isToggledToTyping:!1}" with "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"

            var modifiedType1 = await uploadToFirebase(fileName, modifiedContent);
        }
        else if (text.includes(".Translate]:{Container:")) { // Type 2
            var type2 = src;
            
            const fileName = type2.slice(type2.lastIndexOf('/') + 1);
            const match = text.matchFrom(/\?"-character":""\)\]\},[a-zA-Z]+\|\|!/, text.indexOf(".Translate]:{Container:")); // Search for “.Translate]:{Container:” and then the first following occurrence of “?"-character":"")]},x||!”
            const modifyIndex = match.index;
            const modifyWord = match[0];
            const modifiedContent = text.replaceAt(modifyIndex + modifyWord.length - 4, modifyIndex + modifyWord.length, "!"); // Replace last four characters with !
            
            var modifiedType2 = await uploadToFirebase(fileName, modifiedContent);
        }
    }

    if (modifiedType1 != null && modifiedType2 != null) {
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1, 2],
            addRules: [
                {
                    "id" : 1,
                    "priority": 1,
                    "action": {
                        "type": "redirect",
                        "redirect": { "url": modifiedType1 }
                    },
                    "condition": {
                        "urlFilter": type1,
                        "resourceTypes": ["script"]
                    }
                },
                {
                    "id" : 2,
                    "priority": 1,
                    "action": {
                        "type": "redirect",
                        "redirect": { "url": modifiedType2 }
                    },
                    "condition": {
                        "urlFilter": type2,
                        "resourceTypes": ["script"]   
                    }
                }
            ]
        })

        return true;
    }
    else {
        return false;
    }
}

async function uploadToFirebase(fileName, content) {
    const uploadURL = `https://firebasestorage.googleapis.com/v0/b/typelingo.appspot.com/o/${encodeURIComponent(fileName)}`;

    const headers = {
        'Content-Type': 'application/octet-stream',
    };

    const fileContent = new Blob([content], { type: 'application/javascript' });

    const response = await fetch(uploadURL, {
        method: 'POST',
        headers,
        body: fileContent,
    });
    
    if (response.ok) {
        return `${uploadURL}?alt=media`;
    } else {
        console.error('Failed to upload JavaScript file:', response.status, response.statusText);

        return "";
    }
}

String.prototype.replaceAt = function(startIndex, endIndex, replacement) {
    return this.substring(0, startIndex) + replacement + this.substring(endIndex);
}

String.prototype.matchFrom = function(regex, startpos) {
    var match = this.substring(startpos || 0).match(regex);
    match.index += (startpos || 0);
    return match;
}
