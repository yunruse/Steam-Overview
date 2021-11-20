var gameBindings = { "length": 0 };

function bindGame(game) {
  game.bindingID = gameBindings.length
  gameBindings[game.bindingID] = game
  gameBindings.length++

  game.element.onmouseover = game.barElement.onmouseover =
    function () { gameSelect(game, true, false) }
  game.element.onmouseout = game.barElement.onmouseout =
    function () { gameSelect(game, false, false) }
  game.element.onclick = game.barElement.onclick =
    function () { gameSelect(game, true, true) }
}

function gameSelect(game, didMouse, didClick) {
  // Disable manipulation during tutorial
  if (tutorialTimeStarted) { return; }

  var isLocked = (gameBindings['locked'] === game);
  var doLockIn = didClick;
  if (isLocked) {
    if (!didClick) { return; /* No clicky, no unlocky! */ }
    if (gameBindings['locked'] === game) {
      didMouse = true;
      gameBindings['locked'] = undefined;
    }
    doLockIn = false;
  }

  if (doLockIn) {
    var unlockGame = gameBindings['locked']
    if (unlockGame) {
      gameHighlight(unlockGame, false, false, false)
    }
    gameBindings['locked'] = game;
  }

  gameHighlight(game, didMouse, doLockIn, didClick)
}

function gameHighlight(game, doHighlight, doLockIn, doDisplayPotential) {
  try { game.barElement.classList }
  catch (e) { console.log(game) }

  var elements = [game.element, game.barElement]
  classBool(doHighlight, 'hovered', elements)
  classBool(doLockIn, 'locked', elements)

  if (!doDisplayPotential) { return; }

  for (i = 0; i < libraries.length; i++) {
    var lib = libraries[i],
      add = lib.element.additional,
      size = game.size;

    if (!doLockIn || lib.games.indexOf(game) !== -1) {
      /* Own library */
      size = 0;
    }

    var sizeLeft = lib.sizeFree - size
    tooMuch = sizeLeft < 0,
      factor = 100 / lib.sizeTotal,
      proportion = factor * size,
      leftenBy = 0, text = ""

    if (size > lib.sizeTotal) {
      leftenBy = lib.sizeUsed //size
      proportion = 100
      text = "Game too big for drive"
    } else {
      if (tooMuch) {
        leftenBy = -sizeLeft;
      }
      if (proportion > 0.2) {
        text = formatBytes(Math.abs(sizeLeft), 1)
          + (tooMuch ? " must be freed" : " would remain");
      }
    }

    if (size)
      classBool(tooMuch, 'tooMuch', [add])
    add.style.width = proportion + "%";
    add.style.left = factor * (lib.sizeUsed - leftenBy) + 0.01 + "%";
    add.innerText = text;
  }
}