(function() {
    function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
            var n = 16 * Math.random() | 0;
            return ("x" == e ? n : 3 & n | 8).toString(16)
        });
    }

    function getCookie(e) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let [name, value] = cookie.split('=').map(c => c.trim());
            if (name === e) return decodeURIComponent(value);
        }
        return null;
    }

    function setCookie(e, n, t, domain) {
        let expires = "";
        if (t) {
            const date = new Date();
            date.setTime(date.getTime() + (t * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        let cookieString = `${e}=${encodeURIComponent(n)}${expires}; path=/`;
        if (domain) {
            cookieString += `; domain=${domain}`;
        }
        document.cookie = cookieString;
    }

    let userId = getCookie("user_id");
    console.log("Existing user_id cookie:", userId);

    if (!userId) {
        userId = uuidv4();
        setCookie("user_id", userId, 365, 'envious-detailing.webflow.io');
        console.log("New user_id set:", userId);
        if (document.getElementById("cookieCompliance")) {
            document.getElementById("cookieCompliance").style.display = "block";
        }
    } else {
        console.log("Using existing user_id:", userId);
    }

    function sendTrackingData() {
        const e = new URLSearchParams();
        e.append("userId", userId);
        e.append("eventType", "pageView");
        e.append("referrer", document.referrer);
        e.append("pageUrl", window.location.href);

        const n = getCookie("_la");
        const t = getCookie("_lo");
        if (n && t) {
            e.append("la", n);
            e.append("lo", t);
        }

        const r = getCookie("__gtm_campaign_url");
        if (r) {
            if (e.has("utmSource")) {
                e.set("utmSource", r);
            } else {
                e.append("utmSource", r);
            }
        }

        const beaconUrl = "https://us-central1-envious-detailing-firestore.cloudfunctions.net/trackEvent";
        if (navigator.sendBeacon) {
            navigator.sendBeacon(beaconUrl, e);
        } else {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", beaconUrl, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(e);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", sendTrackingData);
    } else {
        sendTrackingData();
    }
})();
