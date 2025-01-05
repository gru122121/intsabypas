// Browser escape configuration
const bypassConfig = {
  baseUrl: 'https://openinapp.com',
  redirectDelay: 500,
  maxAttempts: 3
};

// Detect environment
const browserInfo = {
  isInApp: () => {
    const ua = navigator.userAgent.toLowerCase();
    return {
      instagram: ua.includes('instagram'),
      facebook: ua.includes('facebook'),
      twitter: ua.includes('twitter'),
      linkedin: ua.includes('linkedin'),
      isInAppBrowser: ua.includes('wv') || // Android WebView
                     /\{.*\}.*safari/i.test(ua) // iOS WebView
    };
  },
  
  platform: () => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    return 'desktop';
  }
};

// Bypass methods
const bypassMethods = {
  // Method 1: Intent URL scheme bypass
  intentUrlBypass: (url) => {
    const intentUrl = `intent://${url.split('://')[1]}#Intent;` +
                     `scheme=https;` +
                     `package=com.openinapp;` +
                     `S.browser_fallback_url=${encodeURIComponent(url)};` +
                     `end`;
    window.location.replace(intentUrl);
  },

  // Method 2: Timeout-based redirect chain
  timeoutChainBypass: (url) => {
    const start = Date.now();
    
    // Try app scheme
    window.location.replace(`openinapp://${url.split('://')[1]}`);
    
    setTimeout(() => {
      // If we're still here after delay, try universal link
      if (Date.now() - start < bypassConfig.redirectDelay + 100) {
        window.location.replace(url);
      }
    }, bypassConfig.redirectDelay);
  },

  // Method 3: iframe escape attempt
  iframeBypass: (url) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      window.location.replace(url);
    }, 100);
  },

  // Method 4: Window open chain
  windowOpenBypass: (url) => {
    const newWin = window.open('about:blank');
    if (newWin) {
      newWin.location.replace(url);
      window.location.replace(url);
    }
  }
};

// Main bypass handler
class BrowserBypass {
  constructor() {
    this.attempts = 0;
    this.successfulEscape = false;
  }

  async attemptEscape(targetUrl) {
    const browser = browserInfo.isInApp();
    const platform = browserInfo.platform();
    
    // Track attempt
    this.attempts++;
    
    // Different strategies based on browser/platform
    if (platform === 'android') {
      if (browser.instagram || browser.facebook) {
        // Try intent URL first for social apps
        bypassMethods.intentUrlBypass(targetUrl);
        await this.verifyRedirect();
      } else {
        // Try timeout chain for other Android browsers
        bypassMethods.timeoutChainBypass(targetUrl);
      }
    } 
    else if (platform === 'ios') {
      if (browser.isInAppBrowser) {
        // iOS WebView needs special handling
        bypassMethods.windowOpenBypass(targetUrl);
        await this.verifyRedirect();
        
        if (!this.successfulEscape) {
          bypassMethods.iframeBypass(targetUrl);
        }
      } else {
        // Regular iOS Safari can use universal links
        bypassMethods.timeoutChainBypass(targetUrl);
      }
    }
    else {
      // Desktop browsers - direct redirect
      window.location.replace(targetUrl);
    }
  }

  async verifyRedirect() {
    return new Promise(resolve => {
      const start = Date.now();
      
      const check = setInterval(() => {
        if (document.hidden || !document.hasFocus()) {
          this.successfulEscape = true;
          clearInterval(check);
          resolve(true);
        }
        
        if (Date.now() - start > bypassConfig.redirectDelay) {
          clearInterval(check);
          resolve(false);
        }
      }, 50);
    });
  }

  async execute(targetUrl) {
    while (!this.successfulEscape && this.attempts < bypassConfig.maxAttempts) {
      await this.attemptEscape(targetUrl);
      
      // Small delay between attempts
      if (!this.successfulEscape) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }
}

// Initialize and execute bypass
const bypass = new BrowserBypass();
bypass.execute(bypassConfig.baseUrl);

// Backup direct redirect
setTimeout(() => {
  if (!bypass.successfulEscape) {
    window.location.replace(bypassConfig.baseUrl);
  }
}, bypassConfig.redirectDelay * bypassConfig.maxAttempts);
