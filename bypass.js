(function() {
    // Core configuration
    const config = {
        appId: 'com.openinapp.browser', // Mock app bundle ID
        appStoreId: '1234567890',       // Mock App Store ID
        playStoreId: 'com.openinapp',   // Mock Play Store ID
        baseUrl: 'https://openinapp.com',
        universalLink: 'https://openinapp.com/open'
    };

    // Browser/Platform detection
    const browser = navigator.userAgent?.toLowerCase();
    const isInstagram = browser.includes('instagram');
    const isFacebook = browser.includes('facebook');
    const isIOS = /iphone|ipad|ipod/.test(browser);
    const isAndroid = /android/.test(browser);

    // Mock app presence
    function mockAppPresence() {
        // Add app-specific meta tags
        const metaTags = [
            { name: 'apple-itunes-app', content: `app-id=${config.appStoreId}, app-argument=${window.location.href}` },
            { name: 'google-play-app', content: `app-id=${config.playStoreId}` },
            { property: 'al:ios:url', content: `openinapp://${window.location.href}` },
            { property: 'al:ios:app_store_id', content: config.appStoreId },
            { property: 'al:ios:app_name', content: 'OpenInApp Browser' },
            { property: 'al:android:url', content: `openinapp://${window.location.href}` },
            { property: 'al:android:package', content: config.playStoreId },
            { property: 'al:android:app_name', content: 'OpenInApp Browser' }
        ];

        metaTags.forEach(tag => {
            const meta = document.createElement('meta');
            Object.keys(tag).forEach(key => meta[key] = tag[key]);
            document.head.appendChild(meta);
        });

        // Add universal links
        const linkTag = document.createElement('link');
        linkTag.rel = 'alternate';
        linkTag.href = config.universalLink;
        document.head.appendChild(linkTag);
    }

    // Force external browser opening
    function forceExternalBrowser() {
        // Add meta tag to force external browser
        const meta = document.createElement('meta');
        meta.name = 'instagram:open-external-url-with-in-app-browser';
        meta.content = 'false';
        document.head.appendChild(meta);

        // Add similar tags for other platforms
        document.head.innerHTML += `
            <meta name="facebook:open-external-url-with-in-app-browser" content="false">
            <meta name="twitter:open-external-url-with-in-app-browser" content="false">
            <meta name="snapchat:open-external-url-with-in-app-browser" content="false">
        `;
    }

    // Simulate app deep linking
    function simulateAppDeepLink() {
        const appUrl = isIOS ? 
            `openinapp://${window.location.href}` :
            `intent://${window.location.href}#Intent;scheme=openinapp;package=${config.playStoreId};end`;

        const storeUrl = isIOS ?
            `https://apps.apple.com/app/id${config.appStoreId}` :
            `https://play.google.com/store/apps/details?id=${config.playStoreId}`;

        // Try app deep link first
        window.location.href = appUrl;

        // Fallback to store after delay
        setTimeout(() => {
            if (!document.hidden) {
                window.location.href = storeUrl;
            }
        }, 500);
    }

    // Main bypass function
    function bypassInAppBrowser() {
        // 1. Mock app presence first
        mockAppPresence();

        // 2. Force external browser
        forceExternalBrowser();

        // 3. Try app/store redirect chain
        if (isInstagram || isFacebook) {
            simulateAppDeepLink();
        }

        // 4. Fallback to universal link
        setTimeout(() => {
            if (!document.hidden) {
                window.location.href = config.universalLink;
            }
        }, 1000);
    }

    // Execute bypass
    bypassInAppBrowser();
})();
