(function() {
    // Core configuration
    const config = {
        baseUrl: 'https://openinapp.com',
        appId: '6695025',
        userId: '2777126'
    };

    // Environment detection
    const browser = (() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('instagram')) return 'instagram';
        if (ua.includes('facebook')) return 'facebook';
        return 'other';
    })();

    const os = (() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
        return 'other';
    })();

    // App installation detection
    function detectAppNotInstalled() {
        const start = Date.now();
        return new Promise((resolve) => {
            setTimeout(() => {
                // If we haven't redirected after 500ms, assume app isn't installed
                if (Date.now() - start > 500) {
                    resolve(true);
                }
                resolve(false);
            }, 501);
        });
    }

    // Handle Android Instagram/Facebook redirect
    function handleSocialRedirect() {
        const redirectParams = new URLSearchParams({
            utm_source: 'inapp',
            utm_medium: config.userId,
            utm_campaign: 'Direct',
            uid: config.appId
        });

        if (browser === 'instagram' && os === 'android') {
            // Use the original redirect chain logic
            let ogLink = window.location.href;
            let productLink = '';
            
            // Construct redirect URL with proper parameters
            let fullUrl = `${config.baseUrl}?${redirectParams.toString()}&redirect_to=${encodeURIComponent(ogLink)}`;
            
            // Try the redirect
            window.location.replace(fullUrl);
        }
    }

    // Main redirect handler
    async function handleRedirect() {
        const start = Date.now();
        let redirectHit = false;

        // Try app-specific deep link first
        const appDeepLink = `${config.baseUrl}?${new URLSearchParams({
            utm_source: 'direct',
            utm_medium: config.userId,
            utm_campaign: 'app_open'
        })}`;

        // For Android
        if (os === 'android') {
            if (browser === 'instagram' || browser === 'facebook') {
                handleSocialRedirect();
            } else {
                // Try intent URL with fallback
                const intentUrl = `intent://${config.baseUrl.split('://')[1]}#Intent;` +
                                `scheme=https;` +
                                `package=com.openinapp;` +
                                `S.browser_fallback_url=${encodeURIComponent(appDeepLink)};` +
                                'end';
                window.location.replace(intentUrl);
            }
        }
        // For iOS
        else if (os === 'ios') {
            // Try universal link
            window.location.replace(appDeepLink);
            
            // Check if app isn't installed
            const appNotInstalled = await detectAppNotInstalled();
            if (appNotInstalled) {
                // Fallback to web URL
                const webFallbackUrl = `${config.baseUrl}?${new URLSearchParams({
                    utm_source: 'fallback',
                    utm_medium: config.userId,
                    utm_campaign: 'web_fallback'
                })}`;
                window.location.replace(webFallbackUrl);
            }
        }
        // For all other cases
        else {
            window.location.replace(appDeepLink);
        }

        // Fallback timeout from original code
        setTimeout(() => {
            if (!redirectHit) {
                const _Link = window.location.href;
                const _noapplink = window.location.href;
                const _start = Date.now();

                function noappfound() {
                    const _now = Date.now();
                    if (_now - _start > 500) {
                        if (os === 'android' && browser === 'instagram') {
                            handleSocialRedirect();
                        }
                        window.location.replace(_noapplink);
                    }
                }

                if (os === 'android' && browser === 'instagram') {
                    handleSocialRedirect();
                }
                
                window.location.replace(_Link);
                
                if (os === 'ios') {
                    setTimeout(noappfound, 501);
                }
            }
        }, 1000);
    }

    // Initialize
    handleRedirect();
})();
