(function() {
    function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
            var n = 16 * Math.random() | 0;
            return ("x" == e ? n : 3 & n | 8).toString(16)
        });
    }

    function manageCookie(name, value = null, days = null, domain = null) {
        if (value !== null) {
            // Set cookie
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
            // Get cookie
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                let [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
                if (cookieName === name) return decodeURIComponent(cookieValue);
            }
            return null;
        }
    }

    let userId = manageCookie("user_id");

    if (!userId) {
        userId = uuidv4();
        manageCookie("user_id", userId, 365, 'enviousdetailing.com');
        const cookieCompliance = document.getElementById("cookieCompliance");
        if (cookieCompliance) {
            cookieCompliance.style.display = "block";
        }
    }

    async function sendTrackingData() {
        const e = new URLSearchParams();
        e.append("userId", userId);
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
        if (navigator.sendBeacon) {
            navigator.sendBeacon(beaconUrl, e);
        } else {
            try {
                const response = await fetch(beaconUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: e.toString()
                });
                if (!response.ok) throw new Error('Network response was not ok');
            } catch (error) {
                console.error('Error sending tracking data:', error);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendTrackingData);
    } else {
        sendTrackingData();
    }
})();
