
// track a user as they scroll down the page and 
// populate the 'event_attr1' variable with 
// the percentage value they scrolled down the page (25, 50, 75, 100).

/*
 * Scroll tracking script
 * Based on v1.1.2 Scroll Tracking by AdSwerve, updated to work with Tealium
 * Original: https://adswerve.com/blog/a-better-mobile-ready-scroll-tracking-js-snippet-for-gtm/
 * Scope: DOM Ready
 * Conditions: any page needing scroll tracking
 */
 
(function tealScroll() {
 
  // Do we have a Tealium utag object available?
  if (typeof utag !== 'object') { throw new Error("utag not available!"); }
 
  //** OPTION 1 **
  // Configures how often script checks for the current milestone
  var threshold = 2000;
 
  //** OPTION 2 **
  // Configures milestones to track
  // Add in numbers (in order) of wanted %s
  var milestones = [25, 50, 75, 100];
 
  //** OPTION 3 **
  // Track 0% true or false
  // if true, milestones array above must start with 0
  // tracking 0% event can be useful for easier calculated metrics
  var trackZero = false;
 
  //
  //** DO NOT MODIFY BELOW THIS LINE! **
  //
 
  // Determine whether user wants to track 0% depth.
  var lowerBound;
  if (trackZero === true) {
    lowerBound = -1;
  }
  else {
    lowerBound = 0;
  }
 
  // Setup record of which milestones have fired.
  var milestonesFired = [];
 
  // The previous lower bound is set to 0 so data is not sent with no activity
  var pastMilestone = lowerBound;
 
  // Initialize our timeoutID
  var timeoutID;
 
  // Function to make value a string
  function formatLabel(i) {
    return milestones[i].toString();
    //return milestones[i].toString() + "%";
  }
 
  // setup the math functions
  var deepestScroll = lowerBound, max = Math.max, _round = Math.round;
 
  // Get the window height
  function getwinheight(W, D) {
    return W.innerHeight || (D.documentElement ? D.documentElement.clientHeight : D.body.clientHeight) || D.body.clientHeight;
  }
 
  // Get the scroll height from the top of the window
  function getscroll(W, D) {
    return W.pageYOffset || (D.documentElement ? D.documentElement.scrollTop : D.body.scrollTop) || D.body.scrollTop;
  }
 
  // Get the document height
  function getdocheight(D) {
    var b = D.body, e = D.documentElement;
    return D.height || max(
      max(b.scrollHeight, e.scrollHeight),
      max(b.offsetHeight, e.offsetHeight),
      max(b.clientHeight, e.clientHeight)
    );
  }
 
  // Calculate the percentage below the fold
  function currentPercentageBelowFold(window, document) {
    var window_height = getwinheight(window, document);
    var document_height = getdocheight(document);
    var scroll_overhead = getscroll(window, document);
 
    var pixels_below = (document_height - (window_height + scroll_overhead));
    var percent_scrolled = 100 * (pixels_below / document_height);
    return (percent_scrolled);
  }
 
  // Calculate the percentage above the fold
  function currentPercentageViewed(window, document) {
    return 100 - currentPercentageBelowFold(window, document);
  }
 
  function pushCleanupMilestones(index) {
    // Make sure you don't push the current depth as part of the cleanup.
    milestonesFired.push(milestones[index]);
    for (var j = 0; j < index; j++) {
      if (!milestonesFired.includes(milestones[j])) {
        // Make sure the cleanup milestones only fire once.
        milestonesFired.push(milestones[j]);
        var label = formatLabel(j);
        // Fire utag.link
        utag.link({
          tealium_event: 'user_scroll',
          scroll_threshold: label,
          scroll_units: 'percent',
          scroll_direction: 'vertical',
          // Set up variables to send to Google Universal Analytics
          event_type: 'Behavior',
          event_target: 'Scroll',
          event_attr1: label
        });
      }
    }
  }
 
  // Called if user passes into new milestone and is there beyond the threshold time limit
  function pushMilestone(index) {
    // Calls formatLabel function to create label to push to Tealium
    var label = formatLabel(index);
    pushCleanupMilestones(index);
    // Fire utag.link
    utag.link({
      tealium_event: 'user_scroll',
      scroll_threshold: label,
      scroll_unit: 'percent',
      scroll_direction: 'vertical',
      // Set up variables to send to Google Universal Analytics
      event_type: 'Behavior',
      event_target: 'Scroll',
      event_attr1: label
    });
  }
 
  // Whenever user scrolls, we fire this lengthly function to see if user past a milestone and
  // if yes then push that data to Tealium
  window.addEventListener("scroll", trackScroll);
  // mobile users don't scroll, they "touchmove", so track that as well.
  window.addEventListener("touchmove", trackScroll);
 
  function trackScroll() {
    // Make scrollDepth equal to percentage scrolled down web page
    var scrollDepth = currentPercentageViewed(window, document);
    // Counter for while loop
    var count = milestones.length;
    // Loops through each milestone to find if user has passed new milestone
    while (count) {
      // Decrease counter by 1
      count--;
      // Checks to see if current scrollDepth is over Milestone
      if (_round(scrollDepth) >= milestones[count] && deepestScroll < milestones[count]) {
        currentMilestone = deepestScroll = milestones[count];
        // Checks to see if currentMilestone is different than pastMilestone
        if (currentMilestone != pastMilestone) {
          // Makes pastMilestone equal to currentMilestone
          pastMilestone = currentMilestone;
          // Make index value equal to count
          var index = count;
          //Clears threshold timer if still in progress
          window.clearTimeout(timeoutID);
          // Start threshold timer to push to Tealium if user stays in milestone
          timeoutID = window.setTimeout(pushMilestone(index), threshold);
        }
        // Terminate while loop
        count = 0;
      }
 
    }
  }
 
})();
