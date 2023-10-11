document.addEventListener("DOMContentLoaded", () => {
    const modeSwitch = document.getElementById("color_mode");

    chrome.storage.sync.get("mode", (result) => {
        modeSwitch.checked = result["mode"] ?? true;
    });

    modeSwitch.onclick = async function() {
        await chrome.runtime.sendMessage({mode: modeSwitch.checked});
    }
});