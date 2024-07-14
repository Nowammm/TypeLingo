(async () => {
    let scripts = document.querySelectorAll('script');
    let scriptSources = [];

    scripts.forEach(element => {
        if (element.src.includes("d35aaqx5ub95lt.cloudfront.net")) {
            scriptSources.push(element.src);
        }
    });

    try {
        const response = await chrome.runtime.sendMessage({sources: scriptSources});

        if (response["reload"] == true) {
            window.location.reload();
        }
    }
    catch (error) {
        console.error("AN ERROR OCCURRED: " + error);
    }
})();