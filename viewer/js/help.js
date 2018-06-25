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
    hintInterfaceDisplay(4, tutorialTimeStarted)
    tutorialTimeStarted = 0
    return
  }
  
  var timeStarted = (new Date).valueOf();
  tutorialTimeStarted = timeStarted;
  
  hintInterfaceDisplay(1, timeStarted)
  setTimeout(function() {hintInterfaceDisplay(2, timeStarted)},  3000)
  setTimeout(function() {hintInterfaceDisplay(3, timeStarted)},  8000)
  setTimeout(function() {hintInterfaceDisplay(4, timeStarted)}, 13000)
}

hintInterfaceDisplay = function(state, timeStarted){
  if( tutorialTimeStarted !== timeStarted ){ return; } // manually stopped
  
  var game = gameBindings.tutorialShown,
      others = gameBindings.tutorialShadowElements,
      pL = game.element.playLink
  
  // Shadow non-tutorial game
  classBool(state < 4, 'shadowed', others)
  // Make 'play link' smaller for instructional purposes
  classBool(state < 4, 'tutorialItem', [game.element])
  
  switch( state ){
    case 1:
      pL.innerText = "[Mouseover to see info]"
      break
    case 2:
      pL.innerText = "[Click to lock in]"
      break
    case 3:
      pL.innerText = "[See size in other libraries]"
      break
    default:
      pL.innerText = "Play..."
      isTutorialRunning = false
  }
  
  var doHighlight = state < 4,
      doLockIn = state == 2,
      doDisplayPotential = state < 4;
  gameHighlight(game, doHighlight, doLockIn, doDisplayPotential)
}