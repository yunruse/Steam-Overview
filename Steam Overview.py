#!/usr/bin/env python3

'''Steam Overview main script, handling input, error handling, logging and output.'''

__ver__ = '1.3'

import json
import os
from pathlib import Path
import sys
import time
from datetime import datetime
import webbrowser

import steamfile

# A game's actual size will only differ from Steam's estimate if files are
# added or removed - mods or installers being removed being the main changes.
# So below this size, we deem it too unlikely these changes will make enough
# of a difference to warrant calculating them.
ESTIMATE_THRESHOLD_MiB = 256

def _getPaths(log):
    logPath = lambda path: log("Trying '{}'…", path)
    
    paths = steamfile.getLibraryPaths(None, logPath)
    attempts = 0
    while len(paths) == 0:
        # Slightly conversational because if you're here, something's wrong
        if attempts == 0:
            log("Couldn't automatically find Steam install directory.")
            print("Sorry about that. Please provide a path:")
        elif attempts == 1:
            print("Still couldn't find anything, sorry. The install directory should contain")
            print("the Steam program alongside 'steamapps/libraryfolders.vdf'.)")
        
        attempts += 1
        paths = steamfile.getLibraryPaths(input("~ "), logPath)
    
    return paths

FORMAT = '''\
/* Steam Overview %s */

var lastRetrieved = {},
    libraries = {};''' % __ver__

slottableToDict = lambda obj: {key: getattr(obj, key, None) for key in obj.__slots__}

def _main(log):
    log('''
       STEAM OVERVIEW VERSION {}
       Games marked * are shortcuts and must have their size calculated.
       Games marked ~ have a size below {} MiB, and use Steam's estimate.
       If this is inaccurate, change it in `Steam Overview.py`.
''', __ver__, ESTIMATE_THRESHOLD_MiB, prependTime=False)
    
    paths = _getPaths(log)

    if not paths:
        log('No steam install found!')
        return

    # Get steam installed games

    def getDrive(path):
        base = path.drive or path.root
        for drv in drives:
            if drv.path == base:
                break
        else:
            drv = steamfile.Drive(base)
            drives.append(drv)
        return drv
        
    drives = []
    for path in paths:
        log("Finding games at '{}'… ", path)
        path = Path(path)
        drv = getDrive(path)
        drv.appendLibrary(path)

    # Get shortcut games too
    
    log("Finding games at user shortcuts…")

    shortcutGames = {}

    userdata = Path(paths[0]) / 'userdata'
    for userID in os.listdir(str(userdata)):
        conf = userdata / userID / 'config' / 'shortcuts.vdf'
        shortcutGames.update(steamfile.shortcutGames(conf))

    for exe, game in shortcutGames.items():
        path = Path(exe)
        drv = getDrive(path)
        drv.games.append(game)        

    # Filter drives, get actual sizes

    drives = [drv for drv in drives if len(drv.games)]

    
    for drv in drives:
        log()
        log('{} has {} games:', drv.path, len(drv.games))
        drv.games.sort(key=lambda game: game.sizeEstimate, reverse=True)
        
        for count, game in enumerate(drv.games, start=1):
            e = game.sizeEstimate
            symbol = ''
            
            if e == 0:
                # steam shortcut
                symbol = '*'
            elif e < ESTIMATE_THRESHOLD_MiB * 1024 * 1024:
                # auto-skip
                symbol = '~'
                game.size = e
            
            if not game.size:
                game.getSize()
            log('{:>10} {:1} {}',
                steamfile.bytesize(game.size, digits=1, binary=True),
                symbol, game.name)
        # get drive size info
        drv.getSize()
    
    drives.sort(key=lambda l: l.sizeTotal)

    log()
    log('Done, passing to `viewer/viewer.html`…')
    
    with open('libraries.js', 'w') as f:
        _json = json.dumps(drives, indent=1, default=slottableToDict)
        f.write(FORMAT.format(time.time(), _json))
    
    viewer = Path(os.getcwd()) / 'viewer' / 'viewer.html'
    webbrowser.open_new_tab(viewer)

class Logger:
    __slots__ = 'files starttime lastline'.split()
    def __init__(self, *files):
        if not files:
            files = (sys.stdout, )

        self.files = files
        self.starttime = time.time()

    def log(self, text='', *args, prependTime=True, end='\n', **kwargs):        
        if text and prependTime:
            text = '{:06.03f} '.format(time.time() - self.starttime) + text
        text = text.format(*args, **kwargs)
        for f in self.files:
            print(text, file=f, end=end)
        

if __name__ == '__main__':
    with open('log.txt', 'w', encoding='utf8') as LOGFILE:
        log = Logger(sys.stdout, LOGFILE).log
        try:
            _main(log)
        except Exception as e:
            log("\n\nINTERNAL ERROR (Give this to developer!):\n{}: {}",
                type(e).__name__, ', '.join(e.args), prependTime=False)
            input('The error will be logged in log.txt. Press any key to exit…')
            raise
