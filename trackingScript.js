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


// Function to send tracking data
function sendTrackingData() {
  var data = new URLSearchParams();
  data.append('userId', userId);
  data.append('eventType', 'pageView');
  data.append('referrer', document.referrer);
  data.append('pageUrl', window.location.href);

   // Check for __gtm_campaign_url cookie and include it as utmSource if it exists
  var utmSource = getCookie('__gtm_campaign_url');
  if (utmSource) {
    data.append('utmSource', utmSource);
  }

  // Check for __gtm_campaign_url cookie and include it as utmSource if it exists
  var utmSource = getCookie('__gtm_campaign_url');
  if (utmSource) {
    data.append('utmSource', utmSource);
  }

  // Check for Send Beacon support
  if (navigator.sendBeacon) {
    const beaconUrl = 'https://us-central1-envious-detailing-firestore.cloudfunctions.net/trackEvent';
    navigator.sendBeacon(beaconUrl, data);
  } else {
    // Fallback for browsers that do not support Send Beacon
    var xhr = new XMLHttpRequest();
    xhr.open('POST', beaconUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
  }
}

// Call sendTrackingData on page load
document.addEventListener('DOMContentLoaded', function() {
  sendTrackingData();
});
