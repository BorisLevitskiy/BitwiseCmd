(function() {

    var SEND_ANALYTICS_FOR_NON_PROD = false;

    window.bitwiseCmdAnalyticsHandler = function() {return false};

    if (!!navigator.doNotTrack) {
        console.log('Analytics tracking disabled by browser settings.');
        return;
    }

    var key = 'TrackAnalytics';
    var disableAnalytics = localStorage.getItem(key) === 'false' ||  window.location.hash.indexOf('-notrack') > -1

    if(disableAnalytics) {
        localStorage.setItem(key, "false");
        console.log('Analytics tracking disabled by local storage.');
        return;
    }

    if(window.location.host !== 'bitwisecmd.com' && !SEND_ANALYTICS_FOR_NON_PROD) {
        console.log("Analytics not tracked. Non-prod host. SEND_ANALYTICS_FOR_NON_PROD="+SEND_ANALYTICS_FOR_NON_PROD);
        return;
    }

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}

    gtag('js', new Date())
    gtag('config', 'G-H9EVNH8GNZ');

    window.bitwiseCmdAnalyticsHandler = function(evt) {
        gtag('event', evt.eventAction, evt);
        return true;
    }
})();


/*
<!-- Google tag (gtag.js) -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-H9EVNH8GNZ');
</script>
*/