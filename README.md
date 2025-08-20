# TypeLingo
**Get the Typelingo Extension:**  
* [Chrome Web Store](https://chromewebstore.google.com/detail/typelingo/lkfdecookegdklhpafhikjebeflcgepc)  
* [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/typelingo)

Duolingo typing restored! Get back the ability to type your responses.

Introducing the ultimate solution for Duolingo learners who crave a seamless language learning experience! If you've ever found yourself frustrated by the tedious task of searching for words in the word bank, worry no more.

With just a click, this extension brings back the precious ability to type your responses in Duolingo's "Write this in English" exercise. Say farewell to the word bank's limitations and embrace the keyboard's full potential!

**The extension isn't functioning correctly?**

Try fully exiting Duolingo, then relaunch.

If that proves futile, wait until a bug fix is available.

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
