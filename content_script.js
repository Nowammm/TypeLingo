let isTransformed = false;
let isTyping = false;
let toggleButtonIcon;
let toggleButtonText;
let currentTextArea;
let currentWordBank;
let addedWords = [];
let checked = false;
let canCheck = false;

Start();
setInterval(Update, 100);

// For detection of the content script's existence from the background script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        sendResponse({});

        return true;
    }
)

function Start() {
    // Lesson finished
    WaitForElement(".WOZnx._275sd._1ZefG._2ugbF.U1P3s._40EaN").then((element) => {
        if (GetElementWithClass("_3fGeO") != null) GetElementWithClass("_3fGeO").remove() // Remove toggle button
    });
    
}

function Update() {
    if (!IsCorrectExercise()) Reset();

    if (IsCorrectExercise() && !isTransformed && GetElementWithClass("PEm85") == null) {
        isTransformed = true;
        
        currentWordBank = GetElementWithData('word-bank');
    
        AddKeyboard();
    
        WaitForElement("[data-test='player-next']").then((element) => {
            element.removeEventListener("click", (event) => CheckButton(event));
            element.addEventListener("click", (event) => CheckButton(event));
        });
    
        // Skip button
        WaitForElement('._2XF-t').then((element) => {
            element.addEventListener("click", () => { GetElementWithClass("_3fGeO").remove(); checked = true; });
        });
    }
};

window.addEventListener("keydown", (event) => {
    if (!IsCorrectExercise()) {
        Reset();

        return;
    }

    if (isTyping && event.key != "Enter") {
        event.stopPropagation();
    }

    if (event.key == "Enter") {
        if (checked) {
            Reset();
        }
        else {
            KeyboardCheck();
        }
    }
    
    if (event.key == " ") {
        WarningSystem();
    }
}, true);

function Reset() {
    isTransformed = false;
    toggleButtonIcon = null;
    toggleButtonText = null;
    currentTextArea = null;
    currentWordBank = null;
    addedWords = [];
    checked = false;
    isTyping = false;
    canCheck = false;
}

function CheckButton(event) {
    if (checked || !IsCorrectExercise()) {
        Reset();
    }
    else {
        KeyboardCheck();
    }
}

function SetExerciseStyle() {
    if (isTyping) { // Use keyboard
        currentTextArea.style.display = "flex";
        currentWordBank.style.display = "none";

        currentTextArea.children[0].focus();

        // Remove added words
        const addedWordsButtons = GetElementWithClass("_1Ga4w").querySelectorAll("button");
        addedWords = [];
        addedWordsButtons.forEach(element => {
            addedWords.push(element.getAttribute("data-test"));
            element.click();
        })
    }
    else { // Use word bank
        currentTextArea.style.display = "none";
        currentWordBank.style.display = "block";

        // Add back added words
        addedWords.forEach(data => {
            GetElementWithData(data).click();
        })
    }

    // Save
    (async () => {
        try {
            const response = await chrome.runtime.sendMessage({accessStorage: true, set: true, IsTyping: isTyping});
        }
        catch (error) {
            console.error("AN ERROR OCCURRED WITH SAVING (Try refreshing the page): " + error);
        }
    })();
}

function AddKeyboard() {
    if (!IsCorrectExercise() || currentTextArea != null || GetElementWithClass("_3fGeO") != null) return;
    
    // Toggle button
    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "_3fGeO");

    const newButton = document.createElement("button");
    newButton.setAttribute("class", "_1eJKW _16r-S _29cJe");
    newButton.setAttribute("data-test", "player-toggle-keyboard");
        
    const newImg = document.createElement("img");
    newImg.setAttribute("class", "_13_rw _1fHYG");
    newImg.setAttribute("src", IsInLightMode() ? "https://d35aaqx5ub95lt.cloudfront.net/images/05087a35a607783111e11cb81d1fcd33.svg" : "https://d35aaqx5ub95lt.cloudfront.net/images/e786c05c2a908e9f919f51fb14fc950c.svg"); // Keyboard icon
    toggleButtonIcon = newImg;
    
    const newSpan = document.createElement("span");
    newSpan.setAttribute("class", "_5_1uD _2Rt1l _1fHYG");
    newSpan.textContent = "Use keyboard";
    toggleButtonText = newSpan;

    newButton.appendChild(newImg);
    newButton.appendChild(newSpan);
    newDiv.appendChild(newButton);

    // Put div inside the skip and check buttons' parent
    document.getElementById('session/PlayerFooter').firstChild.appendChild(newDiv)

    // Wait for skip button and then reposition button
    WaitForElement(`[data-test="player-skip"]`).then(() => {
        newDiv.after(newDiv.previousElementSibling);
    });

    newButton.addEventListener("click", ToggleButtonClicked);

    // Text area
    const newTextAreaDiv = document.createElement("div");
    newTextAreaDiv.setAttribute("class", "PEm85");
    
    const newTextArea = document.createElement("div");
    newTextArea.setAttribute("contenteditable", "true");
    newTextArea.setAttribute("style", "cursor: text");
    newTextArea.setAttribute("data-test", "challenge-translate-input");
    newTextArea.setAttribute("autocapitalize", "off");
    newTextArea.setAttribute("autocomplete", "off");
    newTextArea.setAttribute("autocorrect", "off");
    newTextArea.setAttribute("spellcheck", "false");
    newTextArea.setAttribute("class", "KqSeh _3zGeZ _394fY RpiVp");
    newTextArea.setAttribute("data-gramm", "false");
    newTextArea.setAttribute("dir", "ltr");
    newTextArea.setAttribute("lang", "en");
    newTextArea.setAttribute("placeholder", "Type in English");

    const styleSheetContent = `
        [contentEditable=true]:empty:before {
            content: attr(placeholder);
            color: rgb(${getComputedStyle(document.documentElement).getPropertyValue('--color-hare')});
        }
    `;
    AppendStyleSheet("textarea-placeholder", styleSheetContent);
    
    newTextAreaDiv.appendChild(newTextArea);
    // Put div inside the word bank and textarea parent
    GetElementWithData('word-bank').parentElement.appendChild(newTextAreaDiv)
            
    newTextArea.addEventListener("input", () => { EnableCheck(newTextArea.value != ""); });

    currentTextArea = newTextAreaDiv;
    
    // Load
    (async () => {
        try {
            const response = await chrome.runtime.sendMessage({accessStorage: true, set: false});
        
            if (response["IsTyping"] == true) {
                ToggleButtonClicked();
            }
            else {
                SetExerciseStyle();
            }
        }
        catch (error) {
            console.error("AN ERROR OCCURRED WITH LOADING (Try refreshing the page): " + error);

            ToggleButtonClicked();
        }
    })();
}

function ToggleButtonClicked() {
    isTyping = !isTyping;
    
    SetExerciseStyle();
    
    if (isTyping) {
        toggleButtonIcon.setAttribute("src", IsInLightMode() ? "https://d35aaqx5ub95lt.cloudfront.net/images/c9419412ddecf0c0b2fe03771997af21.svg" : "https://d35aaqx5ub95lt.cloudfront.net/images/b8172c10b8715137fd6992ac32a50002.svg");
        toggleButtonText.textContent = "Use word bank";

        EnableCheck(currentTextArea.children[0].textContent != "");
    }
    if (!isTyping) {
        toggleButtonIcon.setAttribute("src", IsInLightMode() ? "https://d35aaqx5ub95lt.cloudfront.net/images/05087a35a607783111e11cb81d1fcd33.svg" : "https://d35aaqx5ub95lt.cloudfront.net/images/e786c05c2a908e9f919f51fb14fc950c.svg");
        toggleButtonText.textContent = "Use keyboard";

        EnableCheck(GetElementWithClass("LhRk3 WOZnx _275sd _1ZefG notranslate _6Nozy _1O290 _2HRY_ _2N8UY _2mDNn") != null);
    }
}

function EnableCheck(value) {
    const checkButton = GetElementWithData("player-next");
        
    if (value == true) {
        // Enable check button
        checkButton.setAttribute("aria-disabled", "false");
        checkButton.setAttribute("class", "_30qMV _2N_A5 _36Vd3 _16r-S _2orIw _3PphB _9C_ii");
    }
    else {
        // Disable check button
        checkButton.setAttribute("aria-disabled", "true");
        checkButton.setAttribute("class", "_33Jbm _30qMV _2N_A5 _36Vd3 _16r-S _2orIw _3PphB _9C_ii");
    }
}

function IsInLightMode() {
    return document.documentElement.getAttribute("data-duo-theme") == "light";
}

function WarningSystem() {
    const textAreaText = currentTextArea.children[0].textContent;
    
    let wordBankWords = [];
    GetElementsWithData("challenge-tap-token-text").forEach(element => {
        if (element.className != "_1rl91 WOZnx _275sd _1ZefG notranslate _6Nozy _1O290 _2HRY_ _2N8UY") { // Is not added word
            wordBankWords.push([element.textContent, element.parentElement]);
        }
    });
    
    const originalTextArray = textAreaText.trim().replace(/\s+/g, ' ').split(" ");
    const cleanedTextArray = textAreaText.trim().replace(/[,?!]/g, '').replace(/\s+/g, ' ').split(" ");
    let newText = "";
    
    for (let i = 0; i < cleanedTextArray.length; i++) {
        const textWord = cleanedTextArray[i];
        const [word, button] = SearchWordInBank(textWord, wordBankWords, []);

        let additive = "&nbsp;";
        if (i == cleanedTextArray.length - 1) { // Last word
            additive = "";
        }
        
        if (word == null) { // Word doesn't exist
            newText += "<span style='color: red; display: inline-block;'>" + originalTextArray[i] + additive + "</span>";
        }
        else {
            newText += originalTextArray[i] + additive;
        }
    }
    
    currentTextArea.children[0].innerHTML = newText;
    SetEndOfContentEditable(currentTextArea.children[0]);
}

function SetEndOfContentEditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange) // Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange(); // Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
        range.collapse(false); // Collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); // Get the selection object (allows you to change selection)
        selection.removeAllRanges(); // Remove any selections already made
        selection.addRange(range); // Make the range you have just created the visible selection
    }
    else if(document.selection) // IE 8 and lower
    { 
        range = document.body.createTextRange(); // Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement); // Select the entire contents of the element with the range
        range.collapse(false); // Collapse the range to the end point. false means collapse to end rather than the start
        range.select(); // Select the range (make it the visible selection)
    }
}

function KeyboardCheck() {
    if (GetElementWithData("player-next").ariaDisabled == "false" && GetElementWithClass("_3fGeO") != null) GetElementWithClass("_3fGeO").remove()
    if (GetElementWithData("player-next").ariaDisabled == "true" || !IsCorrectExercise() || checked) return;
    checked = true;
    
    if (isTyping == true && currentTextArea.children[0].textContent != "") {
        const textAreaText = currentTextArea.children[0].textContent;
        
        let wordBankWords = [];
        GetElementsWithData("challenge-tap-token-text").forEach(element => {
            if (element.className != "_1rl91 WOZnx _275sd _1ZefG notranslate _6Nozy _1O290 _2HRY_ _2N8UY") { // Is not added word
                wordBankWords.push([element.textContent, element.parentElement]);
            }
        });
        
        const correctWords = WordBankCheck(textAreaText, wordBankWords);
        for (const [word, button] of correctWords) {
            button.click();
        }
        
        // If there are no correct words then click the first word in the word bank so it can check
        if (Object.keys(correctWords).length == 0) {
            GetElementWithClass("_1rl91 WOZnx _275sd _1ZefG notranslate _6Nozy _1O290 _2HRY_ _2N8UY").click();
        }
    }
}

function SearchWordInBank(textWord, wordBank, result) {
    const normalizedTextWord = ReplaceSpecialCharacters(textWord).toLowerCase();
    const words = [];
    
    // Check the word with the period
    if (textWord.includes('.')) {
        for (const [word, button] of wordBank) {
            const normalizedWord = ReplaceSpecialCharacters(word).toLowerCase();

            if (normalizedTextWord === normalizedWord && !result.some(([_, but]) => but === button)) {
                words.push([word, button]);
                break;
            }
        }
    }

    // Check the word without periods
    const wordWithoutPeriods = normalizedTextWord.replace(/\./g, '');

    for (const [word, button] of wordBank) {
        const normalizedWord = ReplaceSpecialCharacters(word).toLowerCase();

        if (wordWithoutPeriods === normalizedWord && !result.some(([_, but]) => but === button)) {
            words.push([word, button]);
            break;
        }
    }

    // Check the word with apostrophes
    if (textWord.includes("'")) {
        const splitWords = normalizedTextWord.split(/(?=')/g);
            
        for (const splitWord of splitWords) {
            for (const [word, button] of wordBank) {
                const normalizedWord = ReplaceSpecialCharacters(word).toLowerCase();

                if (splitWord === normalizedWord && !result.some(([_, but]) => but === button)) {
                    words.push([word, button]);
                    break;
                }
            }
        }
    }

    // Check the word with hyphen
    if (textWord.includes("-")) {
        const splitWords = normalizedTextWord.split("-");
            
        for (const splitWord of splitWords) {
            for (const [word, button] of wordBank) {
                const normalizedWord = ReplaceSpecialCharacters(word).toLowerCase();

                if (splitWord === normalizedWord && !result.some(([_, but]) => but === button)) {
                    words.push([word, button]);
                    break;
                }
            }
        }
    }

    return words;
}

function WordBankCheck(text, wordBank) {
    const cleanedText = text
        .trim()
        .replace(/[,?!]/g, '')
        .replace(/\s+/g, ' ');

    const textArray = cleanedText.split(" ");
    const result = [];
    
    for (const textWord of textArray) {
        const words = SearchWordInBank(textWord, wordBank, result);
        words.forEach(foundWord => {
            const [word, button] = foundWord;
            
            result.push([word, button]);
        });
    }
    
    return result;
}

// HTML Utility Functions
    
function GetElementWithSameData(element) {
    return document.querySelector(`[data-test="` + element.getAttribute("data-test") + `"]`);
}

function GetElementWithData(dataTest) {
    return document.querySelector(`[data-test="` + dataTest + `"]`);
}

function GetElementsWithData(dataTest) {
    return document.querySelectorAll(`[data-test="` + dataTest + `"]`);
}

function GetElementWithClass(className) {
    return document.getElementsByClassName(className)[0];
}

function GetWordBankButton(word) {
    return document.querySelector(`[data-test="` + word + `-challenge-tap-token" i]`);
}

function IsCorrectExercise() {
    if (GetElementWithData("challenge-header") == null || GetElementWithData("challenge-header").children[0] == null) return false;

    return GetElementWithData("challenge-header").children[0].textContent == "Write this in English";
}

// Appends CSS content to the head of the site
function AppendStyleSheet(id, content) {
    if (!document.querySelector("#" + id)) {
        var head = document.head || document.getElementsByTagName("head")[0];
        
        head.appendChild(CreateStyleElement(id, content));
    }
}

// Creates the style element
function CreateStyleElement(id, content) {
    var style = document.createElement("style");
    //style.type = "text/css";
    style.id = id;

    if (style.styleSheet) {
        style.styleSheet.cssText = content;
    } else {
        style.appendChild(document.createTextNode(content));
    }
    return style;
}

// General Utility Functions

function ReplaceSpecialCharacters(text) {
    const specialCharacters = {
      'á': 'a',
      'à': 'a',
      'ä': 'a',
      'â': 'a',
      'ã': 'a',
      'å': 'a',
      'æ': 'ae',
      'ç': 'c',
      'é': 'e',
      'è': 'e',
      'ë': 'e',
      'ê': 'e',
      'í': 'i',
      'ì': 'i',
      'ï': 'i',
      'î': 'i',
      'ñ': 'n',
      'ó': 'o',
      'ò': 'o',
      'ö': 'o',
      'ô': 'o',
      'õ': 'o',
      'ø': 'o',
      'œ': 'oe',
      'ß': 'ss',
      'ú': 'u',
      'ù': 'u',
      'ü': 'u',
      'û': 'u',
      'ÿ': 'y',
      'Á': 'A',
      'À': 'A',
      'Ä': 'A',
      'Â': 'A',
      'Ã': 'A',
      'Å': 'A',
      'Æ': 'AE',
      'Ç': 'C',
      'É': 'E',
      'È': 'E',
      'Ë': 'E',
      'Ê': 'E',
      'Í': 'I',
      'Ì': 'I',
      'Ï': 'I',
      'Î': 'I',
      'Ñ': 'N',
      'Ó': 'O',
      'Ò': 'O',
      'Ö': 'O',
      'Ô': 'O',
      'Õ': 'O',
      'Ø': 'O',
      'Œ': 'OE',
      'Ú': 'U',
      'Ù': 'U',
      'Ü': 'U',
      'Û': 'U',
      'Ÿ': 'Y'
    };
  
    return text.replace(/[áàäâãåæçéèëêíìïîñóòöôõøœßúùüûÿÁÀÄÂÃÅÆÇÉÈËÊÍÌÏÎÑÓÒÖÔÕØŒÚÙÜÛŸ]/g, char => specialCharacters[char]);
}

function WaitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
             return resolve(document.querySelector(selector));
        }
    
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function WaitForElements(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelectorAll(selector));
        }
    
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelectorAll(selector));
                observer.disconnect();
            }
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function WaitFor(condition, callback) {
    if (!condition) {
        window.setTimeout(WaitFor.bind(null, condition, callback), 100);
    }
    else {
        callback();
    }
}
