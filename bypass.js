(function() {
    // Core variables from original code
    const oia_base_url = 'https://nodeapi.openinapp.com/api/v1';
    const redirect_url = 'https://openinapp.com'.split('://')[1];
    const startTime = new Date();
    const id_oia = '6695025';
    const user_id_oia = '2777126';
    
    // Browser/OS detection from original code
    let browser = navigator.userAgent?.toLowerCase();
    browser = browser.includes('instagram') ? 'instagram' : 
             browser.includes('facebook') ? 'facebook' : 'other';
    
    const os = navigator.userAgent?.toLowerCase().includes('android') ? 'android' : 
              (navigator.userAgent?.toLowerCase().includes('iphone') || 
               navigator.userAgent?.toLowerCase().includes('ipad')) ? 'ios' : 'other';

    // Mock 301 redirect response
    function mock301Redirect(url) {
        // Create a fake XHR to simulate 301
        const xhr = new XMLHttpRequest();
        xhr.open('GET', window.location.href, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        // Force browser to see this as a 301 redirect
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Create meta refresh as backup
                const meta = document.createElement('meta');
                meta.httpEquiv = "refresh";
                meta.content = `0;url=${url}`;
                document.head.appendChild(meta);
                
                // Force location change
                window.location.replace(url);
            }
        };
        
        // Simulate network delay
        setTimeout(() => {
            xhr.abort();
            // Add history entry to make it look like a server redirect
            window.history.replaceState({}, '', url);
            window.location.replace(url);
        }, 10);
        
        xhr.send();
    }

    // Main bypass function
    function bypassInstagram() {
        let _Link = window.location.href;
        let _start = Date.now();
        let redirect_hit = false;

        if (os === 'android' && browser === 'instagram') {
            let ogLink = window.location.href;
            let link = '&link=' + encodeURIComponent(ogLink);
            
            // Construct redirect URL
            let fullUrl = `https://${redirect_url}?utm_source=inapp&utm_medium=${user_id_oia}&utm_campaign=Direct&utm_content=&uid=${id_oia}${link}`;
            
            // Create fake 301 redirect
            mock301Redirect(fullUrl);
            
            // Backup redirect chain
            setTimeout(() => {
                if (!redirect_hit) {
                    // Add history state to make it look like we came from elsewhere
                    window.history.pushState({}, '', ogLink);
                    window.location.replace(fullUrl);
                }
            }, 500);
        } else {
            // For non-Instagram browsers, use normal redirect
            window.location.replace(_Link);
        }

        // Final fallback
        setTimeout(() => {
            if (!redirect_hit && os === 'android' && browser === 'instagram') {
                let ogLink = window.location.href;
                let link = '&link=' + encodeURIComponent(ogLink);
                let fullUrl = `https://${redirect_url}?utm_source=inapp&utm_medium=${user_id_oia}&utm_campaign=Direct&utm_content=&uid=${id_oia}${link}`;
                
                // Try one last time with meta refresh
                document.head.innerHTML += `<meta http-equiv="refresh" content="0;url=${fullUrl}">`;
                window.location.replace(fullUrl);
            }
        }, 1000);
    }

    // Track analytics as in original
    async function trackRedirect() {
        try {
            await fetch(`${oia_base_url}/redirect/store-clicks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-HTTP-Status-Override': '301'
                },
                body: JSON.stringify({
                    utm_source: 'inapp',
                    utm_medium: user_id_oia,
                    utm_campaign: 'Direct',
                    uid: id_oia,
                    click_time_taken: Date.now() - startTime
                })
            });
        } catch (error) {
            console.error('Failed to track redirect:', error);
        }
    }

    // Initialize bypass with 301 redirect simulation
    trackRedirect();
    bypassInstagram();
})();
