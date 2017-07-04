function subtitleDisplay(message, isError) {
  
  if( (typeof message) == 'undefined' ){
    return;
  }
  
  classBool(isError, 'error', subtitle);
  subtitle.innerHTML = message;
}

function displayTimeSince() {
  var timeSince = (new Date().getTime() / 1000 ) - lastRetrieved
  
  if( timeSince >= 60){
    var minutes = roundDecimals(timeSince / 60, 0),
        timeText = "Last updated " + minutes + " minutes ago",
        needsRerun = (timeSince >= 30 * 60);
    if( needsRerun ){
      timeText += " (please rerun <code>Steam Overview.py</code>)"
    }
    subtitleDisplay(timeText, needsRerun)
  } else {
    // updated in last minute, do not display
    subtitle.classList.add('hidden')
  }
}

window.onload = function(){
  try{ libraries } catch(e) {
    subtitleDisplay("I couldn't find a libraries.js file. Did you run <code>Steam Overview.py</code>?", true);
    return;
  }
  try{ constructLibraryList(); } catch (e) {
    subtitleDisplay("Internal Javascript error:</br><code>" + e + "</code>", true);
    throw e;
  }
  displayTimeSince();
  setupTutorial()
}