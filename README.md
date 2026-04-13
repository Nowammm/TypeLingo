<div align="center">

# TypeLingo

**Stop hunting through word banks. Start typing.**

[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/lkfdecookegdklhpafhikjebeflcgepc?style=flat-square&logo=google-chrome&logoColor=white&label=Chrome%20Users)](https://chromewebstore.google.com/detail/typelingo/lkfdecookegdklhpafhikjebeflcgepc)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/lkfdecookegdklhpafhikjebeflcgepc?style=flat-square)](https://chromewebstore.google.com/detail/typelingo/lkfdecookegdklhpafhikjebeflcgepc)
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/lkfdecookegdklhpafhikjebeflcgepc?style=flat-square&label=Chrome%20Version)](https://chromewebstore.google.com/detail/typelingo/lkfdecookegdklhpafhikjebeflcgepc)

[![Mozilla Add-on Users](https://img.shields.io/amo/users/typelingo?style=flat-square&logo=firefox-browser&logoColor=white&label=Firefox%20Users)](https://addons.mozilla.org/en-US/firefox/addon/typelingo)
[![Mozilla Add-on Rating](https://img.shields.io/amo/rating/typelingo?style=flat-square)](https://addons.mozilla.org/en-US/firefox/addon/typelingo)
[![Mozilla Add-on Version](https://img.shields.io/amo/v/typelingo?style=flat-square&label=Firefox%20Version)](https://addons.mozilla.org/en-US/firefox/addon/typelingo)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/nowam)

[Install for Chrome](https://chromewebstore.google.com/detail/typelingo/lkfdecookegdklhpafhikjebeflcgepc) | [Install for Firefox](https://addons.mozilla.org/en-US/firefox/addon/typelingo)

</div>

# What is TypeLingo?

Frustrated by the word bank? This extension restores the ability to type in Duolingo translation exercises, letting you focus on the language, not the interface.

**Why use it?**
* Forces you to recall words from memory rather than recognizing them in a list.
* Significantly speeds up lesson completion.
* Lightweight and easy to toggle.

**Experiencing issues?**

Refresh the Duolingo tab or restart your browser. If a recent Duolingo update breaks functionality, a patch will be released as soon as possible.

# Building the source code
This is mainly done for development purposes. If you just want to use the extension normally, please install it through the store.

Keep in mind, if the extension receives an update, you will need to build it once more.

### Guide for Chrome

---

* Download the source code and unzip the file (Save the folder somewhere safe because if the folder gets deleted, the extension gets deleted from the browser as well).
* Navigate to the **"Manage extensions"** menu (Or go to `chrome://extensions`).
* Enable developer mode on the top right.
* Click **"Load unpacked"** and select the extension's folder. Make sure that the root folder is the folder that contains all of the files.
* Relaunch Duolingo if needed to ensure the extension takes effect.

### Guide for Firefox

---

Adding the extension like this is *temporary* - if you restart Firefox, you will need to add it once again.

#### Method 1: For Development (Recommended)

This method is best for actively developing the extension.

* Go to `about:debugging#/runtime/this-firefox` in your Firefox address bar.
* Click **"Load Temporary Add-on..."** and select the `firefox/src/manifest.json` file.
* Relaunch Duolingo if needed to ensure the extension takes effect.

#### Method 2: From a Packaged Build

This method is for testing a build of the extension as a packaged file.

* Open a Unix terminal (e.g., WSL terminal on Windows) and navigate to the firefox directory within the unzipped source code folder. For example: `cd /mnt/c/path/to/your/unzipped/folder/TypeLingo/firefox`
* Run the build script: `bash build_podman.sh`
* Go to `about:debugging#/runtime/this-firefox` in your Firefox address bar.
* Click **"Load Temporary Add-on..."** and select the zip file that was created by the build script.
* Relaunch Duolingo if needed to ensure the extension takes effect.
