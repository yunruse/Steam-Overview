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
  setTimeout(hintInterface, 3000);
}

hintInterface = function(){
  if( gameBindingsLength === 0 ){
    return;
  }
  var hintBindingID = Math.min(3, Math.floor(gameBindingsLength / 2))
      game = gameBindings[hintBindingID],
      lC = game.element.classList,
      bC = game.barElement.classList;
  
  if( !lC.contains('locked') ){
    if( everBound ){
      // User input, cancel minitutorial
      return;
    }
    lC.add('locked');
    bC.add('locked');
    setTimeout(hintInterface, 4000);
  } else {
    if( gameBindings['locked'] == hintBindingID ){
      // User decided to click the item, don't remove locke
      return;
    }
    lC.remove('locked');
    bC.remove('locked');
    // Repeat if user doesn't respond
    setTimeout(hintInterface, 15000);
  }
}