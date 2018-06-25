/* Automatic (and manual) tutorial */

var tutorialTimeStarted;

setupTutorial = function(){
  if( gameBindings.length === 0 ){ tutorialBox.classList.add('hidden'); }
  var hintBindingID = Math.min(3, Math.floor(gameBindings.length / 2))
  gameBindings.tutorialShown = gameBindings[hintBindingID]
  
  otherGames = []
  for( var i = 0; i < gameBindings.length; i++ ){
    if( i == hintBindingID ){ continue }
    otherGames.push(gameBindings[i].element)
  }
  gameBindings.tutorialShadowElements = otherGames
  
  tutorialTimeStarted = 0
}

startTutorial = function(){  
  if( tutorialTimeStarted !== 0 ){
    hintInterfaceDisplay(3, tutorialTimeStarted)
    tutorialTimeStarted = 0
    return
  }
  
  var lockedGame = gameBindings['locked'];
  if( lockedGame ){
    gameBindings['locked'] = undefined;
    gameHighlight(lockedGame, false, false, true)
  }
  
  var timeStarted = (new Date).valueOf();
  tutorialTimeStarted = timeStarted;
  
  hintInterfaceDisplay(1, timeStarted)
  setTimeout(function() {hintInterfaceDisplay(2, timeStarted)},  3000)
  setTimeout(function() {hintInterfaceDisplay(3, timeStarted)},  8000)
}

hintInterfaceDisplay = function(state, timeStarted){
  if( tutorialTimeStarted !== timeStarted ){ return; } // manually stopped
  
  var game = gameBindings.tutorialShown,
      pL = game.element.playLink
  
  // Shadow non-tutorial game
  classBool(state < 3, 'shadowed', gameBindings.tutorialShadowElements)
  // Make 'play link' smaller for instructional purposes
  classBool(state < 3, 'tutorialItem', [game.element])
  
  var doHighlight = true,
      doLockIn = false,
      doDisplayPotential = true;
  
  switch( state ){
    case 1:
      doDisplayPotential = false
      pL.innerText = "[Mouse over to identify size]"
      break
    case 2:
      doLockIn = true
      pL.innerText = "[Click to see size in other libraries]"
      break
    default:
      doHighlight = false
      pL.innerText = "Play..."
      tutorialTimeStarted = 0;
  }
  gameHighlight(game, doHighlight, doLockIn, doDisplayPotential)
}