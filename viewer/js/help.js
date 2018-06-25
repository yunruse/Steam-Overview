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
  for (var i = 0; i < others.length; i++ ){
    classBool(state < 4, 'shadowed', others[i])
  }
  // Make 'play link' smaller for instructional purposes
  classBool(state < 4, 'smaller', game.element.playLink)
  classBool(state < 4, 'hovered', tutorialBox)
  
  classBool(state < 4, 'tutorialItem', [game.element])
  
  switch( state ){
    case 1:
      game.element.onmouseover()
      pL.innerText = "[Mouseover to see info]"
      break
    case 2:
      game.element.onclick()
      pL.innerText = "[Click to lock in]"
      break
    case 3:
      game.element.onclick()
      pL.innerText = "[Scroll down to see size on other libraries]"
      break
    default:
      game.element.onmouseout()
      pL.innerText = "Play..."
      isTutorialRunning = false
  }
}