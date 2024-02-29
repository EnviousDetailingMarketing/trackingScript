// trackingScript.js

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function getCookie(name) {
  var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function setCookie(name, value, days) {
  var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

var userId = getCookie('user_id');
if (!userId) {
  userId = uuidv4();
  setCookie('user_id', userId, 365);
  document.getElementById('cookieCompliance').style.display = 'block';
}

function sendTrackingData() {
  // Get the user's IP address asynchronously
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      const userIp = data.ip; // Extracting the IP address from the response

      // Now that we have the IP, construct the rest of the tracking data
      var trackingData = new URLSearchParams();
      trackingData.append('userId', userId);
      trackingData.append('eventType', 'pageView');
      trackingData.append('referrer', document.referrer);
      trackingData.append('pageUrl', window.location.href);
      trackingData.append('IPAddress', userIp); // Add the IP address to the tracking data

      var utmSource = getCookie('__gtm_campaign_url');
      if (utmSource) {
        if (!trackingData.has('utmSource')) {
          trackingData.append('utmSource', utmSource);
        } else {
          trackingData.set('utmSource', utmSource);
        }
      }

      // Send the tracking data using Beacon API or fallback
      const beaconUrl = 'https://us-central1-envious-detailing-firestore.cloudfunctions.net/trackEvent';
      if (navigator.sendBeacon) {
        navigator.sendBeacon(beaconUrl, trackingData);
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', beaconUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(trackingData);
      }
    })
    .catch(error => console.error('Error fetching the user IP:', error));
}

// Trigger sendTrackingData as before
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendTrackingData);
} else {
  sendTrackingData();
}

