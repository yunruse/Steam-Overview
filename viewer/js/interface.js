function subtitleDisplay(message, isError) {
  
  if( (typeof message) == 'undefined' ){
    return;
  }
  
  if( (typeof isError) === 'undefined' || isError ){
    subtitle.classList.add('error');
  } else {
    subtitle.classList.remove('error')
  }
  subtitle.innerHTML = message;
}

function displayTimeSince() {
  var timeSince = (new Date().getTime() / 1000 ) - lastRetrieved,
      needsRerun = (timeSince >= 30 * 60),
      interval = 'now';
  
  if( timeSince >= 60){
    interval = roundDecimals(timeSince / 60, 0) + " minutes ago" + 
      (needsRerun ? " (please rerun <code>Steam Overview.py</code>)" : "");
  }
  
  subtitleDisplay("Last updated " + interval, needsRerun);
}

window.onload = function(){
  try{ libraries } catch(e) {
    subtitleDisplay("I couldn't find a libraries.js file. Did you run <code>Steam Overview.py</code>?");
    return;
  }
  try{ constructLibraryList(); } catch (e) {
    subtitleDisplay("Internal Javascript error:</br><code>" + e + "</code>");
    throw e;
  }
  displayTimeSince();
}