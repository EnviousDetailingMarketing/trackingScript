(function() {
    function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
            var n = 16 * Math.random() | 0;
            return ("x" == e ? n : 3 & n | 8).toString(16)
        });
    }

    function manageCookie(name, value = null, days = null, domain = null) {
        if (value !== null) {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            let cookieString = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
            if (domain) {
                cookieString += `; domain=${domain}`;
            }
            document.cookie = cookieString;
        } else {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                let [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
                if (cookieName === name) return decodeURIComponent(cookieValue);
            }
            return null;
        }
    }

    function getUserId() {
        let userId = manageCookie("user_id");
        if (!userId) {
            userId = uuidv4();
            manageCookie("user_id", userId, 365, 'envious-detailing.webflow.io');
            const cookieCompliance = document.getElementById("cookieCompliance");
            if (cookieCompliance) {
                cookieCompliance.style.display = "block";
            }
        }
        return userId;
    }

    function getSessionId() {
        let sessionId = manageCookie("session_id");
        if (!sessionId) {
            sessionId = uuidv4();
            manageCookie("session_id", sessionId, 0.5, 'enviousdetailing.com'); // 0.5 days = 12 hours
        }
        return sessionId;
    }

    const userId = getUserId();
    const sessionId = getSessionId();

    async function sendTrackingData(maxRetries = 3) {
        const e = new URLSearchParams();
        e.append("userId", userId);
        e.append("sessionId", sessionId);
        e.append("eventType", "pageView");
        e.append("referrer", document.referrer);
        e.append("pageUrl", window.location.href);

        const la = manageCookie("_la");
        const lo = manageCookie("_lo");
        if (la && lo) {
            e.append("la", la);
            e.append("lo", lo);
        }

        const gtmCampaignUrl = manageCookie("__gtm_campaign_url");
        if (gtmCampaignUrl) {
            e.append("utmSource", gtmCampaignUrl);
        }

        const beaconUrl = "https://us-central1-envious-detailing-firestore.cloudfunctions.net/trackEvent";

        const sendRequest = async () => {
            if (navigator.sendBeacon) {
                return navigator.sendBeacon(beaconUrl, e);
            } else {
                const response = await fetch(beaconUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: e.toString()
                });
                if (!response.ok) throw new Error('Network response was not ok');
            }
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await sendRequest();
                break; // Exit loop if request is successful
            } catch (error) {
                if (attempt === maxRetries) {
                    console.error('Error sending tracking data after retries:', error);
                } else {
                    console.warn(`Retry ${attempt} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, Math.min(2 ** attempt * 1000, 30000))); // Exponential backoff with cap
                }
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => sendTrackingData(3));
    } else {
        sendTrackingData(3);
    }
})();
