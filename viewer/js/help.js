/* Automatic (and manual) tutorial */

var hintInterfaceState;

startTutorial = function(){
  hintInterfaceState = 1;
  hintInterfaceLoop();
}

hintInterfaceLoop = function(){
  if( gameBindingsLength === 0 ){
    return;
  }
  var hintBindingID = Math.min(3, Math.floor(gameBindingsLength / 2))
      game = gameBindings[hintBindingID];
  
  var timeToWait = hintInterfaceDisplay(game, hintInterfaceState);
  // carries out and returns time to wait
  if( timeToWait === "stop" ){ return; }
  setTimeout(hintInterfaceLoop, timeToWait);
  hintInterfaceState++;
}

hintInterfaceDisplay = function(game, state){
  var pL = game.element.playLink;
  
  classBool(game.element.playLink, 'smaller', state < 4)
  classBool(tutorialBox, 'visible', state == 4)
  
  classBool(game.element, 'locked', state == 2)
  classBool(game.barElement, 'locked', state == 2)
  
  classBool(game.element, 'hovered', state < 4)
  classBool(game.barElement, 'hovered', state < 4)
  
  switch( state ){
    case 1:
      pL.innerText = "[Mouseover to see info]";
      return 3000;
    case 2:
      pL.innerText = "[Click to lock in]";
      return 5000;
    case 3:
      pL.innerText = "[Scroll down to see size on other libraries]";
      return 5000;
    case 4:
      pL.innerText = "Play..."
      return "stop";
  }
}