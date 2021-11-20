function subtitleDisplay(message, isError) {

  if ((typeof message) == 'undefined') {
    return;
  }

  classBool(false, 'error', [subtitle]);
  classBool(isError, 'error', [btnReload]);
  subtitle.innerHTML = message;
}

function formatTime(seconds) {
  if (seconds >= 24 * 60 * 60) {
    return "more than a day"
  } else if (seconds >= 60 * 60) {
    return roundDecimals(seconds / (60 * 60), 0) + " hours"
  } else if (seconds >= 60) {
    return roundDecimals(seconds / 60, 0) + " minutes"
  } else {
    return roundDecimals(seconds, 0) + " seconds"
  }
}

function displayTimeSince() {
  var timeSince = (new Date().getTime() / 1000) - lastRetrieved

  var timeText = "Last updated " + formatTime(timeSince) + " ago",
    needsRerun = (timeSince >= 30 * 60);
  subtitleDisplay(timeText, needsRerun)
}

window.onload = function () {
  try { libraries } catch (e) {
    subtitleDisplay("I couldn't find a libraries.js file. Did you run <code>Steam Overview.py</code>?", true);
    return;
  }
  try { constructLibraryList(); } catch (e) {
    subtitleDisplay("Internal Javascript error:</br><code>" + e + "</code>", true);
    throw e;
  }
  displayTimeSince();
  setupTutorial()
}