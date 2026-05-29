chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.url != undefined && tab.url.includes("duolingo.com/lesson") && changeInfo.status == "loading") {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["inject_scripts.js"]
            });
        }
    }
);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        (async () => {
            const reload = await handleRedirects(request.sources);
            sendResponse({ "reload": reload });
        })();
        return true;
    }
);

async function handleRedirects(sources) {
    let type1, type2, modifiedType1, modifiedType2;

    for (const src of sources) {
        const text = await (await fetch(src)).text();

        if (text.includes(".push([[2143]")) {
            type1 = src;
            let modifiedContent = text;

            // Replace all instances of "{canToggleTyping:!1,isToggledToTyping:!1}" with "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"
            modifiedContent = modifiedContent.replace(
                /{canToggleTyping:!1,isToggledToTyping:!1}/g,
                "{canToggleTyping:!0,isToggledToTyping:e.typingEnabled}"
            );
            modifiedContent = modifiedContent.replaceFromTo('case"DECREMENT_ONE_HEART":{', 'break', '');

            await chrome.storage.local.set({ type1: modifiedContent, type1_url: src });
            modifiedType1 = contentToDataURL(modifiedContent);
        }
        else if (text.includes(".Translate]:{Container:")) {
            type2 = src;

            // Search for “.Translate]:{Container:” and then the first following occurrence of “?"-character":"")]},y||!”
            const match = text.matchFrom(
                /\?"-character":""\)\]\},[a-zA-Z]+\|\|!/,
                text.indexOf(".Translate]:{Container:")
            );
            const modifyIndex = match.index;
            const modifyWord = match[0];

            // Replace last four characters with !
            const modifiedContent = text.replaceAt(
                modifyIndex + modifyWord.length - 4,
                modifyIndex + modifyWord.length,
                "!"
            );

            await chrome.storage.local.set({ type2: modifiedContent, type2_url: src });
            modifiedType2 = contentToDataURL(modifiedContent);
        }
    }

    // Fall back to storage if one type wasn't found in this pass
    if (!modifiedType1 || !modifiedType2) {
        const stored = await chrome.storage.local.get(["type1", "type2", "type1_url", "type2_url"]);
        if (!modifiedType1 && stored.type1) {
            modifiedType1 = contentToDataURL(stored.type1);
            type1 = stored.type1_url;
        }
        if (!modifiedType2 && stored.type2) {
            modifiedType2 = contentToDataURL(stored.type2);
            type2 = stored.type2_url;
        }
    }

    if (modifiedType1 && modifiedType2) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [1, 2],
            addRules: [
                {
                    id: 1,
                    priority: 1,
                    action: { type: "redirect", redirect: { url: modifiedType1 } },
                    condition: { urlFilter: type1, resourceTypes: ["script"] }
                },
                {
                    id: 2,
                    priority: 1,
                    action: { type: "redirect", redirect: { url: modifiedType2 } },
                    condition: { urlFilter: type2, resourceTypes: ["script"] }
                }
            ]
        });
        return true;
    } else {
        return false;
    }
}

function contentToDataURL(content) {
    const encoded = btoa(unescape(encodeURIComponent(content)));
    return `data:application/javascript;base64,${encoded}`;
}

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