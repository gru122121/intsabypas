(function() {
    const detectBrowser = () => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        return {
            isInstagram: ua.includes('Instagram'),
            isFacebook: ua.includes('FBAN') || ua.includes('FBAV'),
            isSnapchat: ua.includes('Snapchat'),
            isSafari: /^((?!chrome|android).)*safari/i.test(ua),
            isChrome: /chrome|crios/i.test(ua),
            isIOS: /iPad|iPhone|iPod/.test(ua) && !window.MSStream,
            isAndroid: /android/i.test(ua),
            iOSVersion: (() => {
                const match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
                return match ? parseInt(match[1], 10) : 0;
            })()
        };
    };

    const tryMultipleRedirects = (urls, delay = 100) => {
        let i = 0;
        const tryNext = () => {
            if (i < urls.length) {
                window.location.href = urls[i];
                i++;
                setTimeout(() => {
                    if (!document.hidden) {
                        tryNext();
                    }
                }, delay);
            }
        };
        tryNext();
    };

    const browserInfo = detectBrowser();
    const targetUrl = 'https://instabypass.vercel.app';
    
    try {
        if (browserInfo.isInstagram) {
            if (browserInfo.isIOS) {
                // Multiple methods for different iOS versions
                const redirectMethods = [
                    `x-safari-${targetUrl}`,
                    `x-safari-https://${targetUrl.replace('https://', '')}`,
                    `safari-https://${targetUrl.replace('https://', '')}`,
                    `x-web-search://?${targetUrl}`,
                    `com-apple-mobilesafari-tab:${targetUrl}`,
                    `googlechrome://${targetUrl.replace('https://', '')}`,
                    `chrome-open-url:${targetUrl}`,
                    `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`,
                    `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(targetUrl)}`
                ];
                
                tryMultipleRedirects(redirectMethods);
                
            } else if (browserInfo.isAndroid) {
                // Multiple methods for Android
                const androidMethods = [
                    `intent://${targetUrl.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;end`,
                    `googlechrome://navigate?url=${encodeURIComponent(targetUrl)}`,
                    `chrome://navigate?url=${encodeURIComponent(targetUrl)}`,
                    `intent://navigate?url=${encodeURIComponent(targetUrl)}#Intent;scheme=googlechrome;end`,
                    `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`
                ];
                
                tryMultipleRedirects(androidMethods);
            }
            
            // Fallback message after attempts
            setTimeout(() => {
                if (!document.hidden) {
                    document.getElementById('status').innerText = 
                        'If automatic redirect fails, please copy the link and open in your browser manually.';
                }
            }, 2000);
            
        } else if (browserInfo.isSafari) {
            document.getElementById('status').innerText = 
                'This page works best when opened from Instagram. Please open the link in Instagram first.';
        } else {
            document.getElementById('status').innerText = 
                'This tool is designed to bypass Instagram\'s in-app browser. Please open the link from Instagram.';
        }
    } catch (error) {
        console.error('Redirect failed:', error);
        document.getElementById('status').innerText = 
            'An error occurred. Please try opening this link from Instagram.';
    }
})();
