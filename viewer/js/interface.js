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
  setTimeout(hintInterfaceLoop, 3000);
}

// Hint interface animation

var hintInterfaceState = 1;

hintInterfaceLoop = function(){
  if( gameBindingsLength === 0 ){
    return;
  }
  var hintBindingID = Math.min(3, Math.floor(gameBindingsLength / 2))
      game = gameBindings[hintBindingID];
   
  if( everBound ){
    // interaction - cancel tutorial
    hintInterfaceDisplay(game, 0);
    return;
  }
  
  var timeToWait = hintInterfaceDisplay(game, hintInterfaceState);
  // carries out and returns time to wait
  setTimeout(hintInterfaceLoop, timeToWait);
  hintInterfaceState++;
}

hintInterfaceDisplay = function(game, state){
  var lC = game.element.classList,
      bC = game.barElement.classList;
  
  switch( state ){
    case 3:
      lC.remove('locked');
      bC.remove('locked');
      return 2000;
    case 2:
      lC.add('locked');
      bC.add('locked');
      return 2000;
    case 1:
      lC.add('hovered');
      bC.add('hovered');
      return 2000;
    default:
      lC.remove('locked');
      bC.remove('locked');
      lC.remove('hovered');
      bC.remove('hovered');
      everBound = true;
  }
}