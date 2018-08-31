#!/usr/bin/env python3

'''Steam Overview main script, handling input, error handling, logging and output.'''

__ver__ = '1.3'

import json
import os
from pathlib import Path
import sys
import time
import webbrowser

from steamfile import Drive, bytesize, shortcutGames, getLibraryPaths

# Games marked '~' will skip size-finding and use the size the game is when
# downloaded, because it's highly unlikely any changes will make that
# much of a difference. Change this if you get errors.
ESTIMATE_THRESHOLD_MiB = 256

# Watch out, below here be dragons.

def _getPaths(log):
    logPath = lambda path: log("Trying '{}'…", path)
    
    paths = getLibraryPaths(None, logPath)
    attempts = 0
    while len(paths) == 0:
        if attempts == 0:
            log("Couldn't automatically find Steam install directory.")
            print("Sorry about that. Please provide a path:")
        elif attempts == 1:
            print("Still couldn't find anything, sorry. The install directory should contain")
            print("the Steam program alongside 'steamapps/libraryfolders.vdf'.)")
        
        attempts += 1
        paths = getLibraryPaths(input("~ "), logPath)
    
    return paths

FORMAT = '''\
/* Steam Overview %s */

var lastRetrieved = {},
    libraries = {};''' % __ver__

# Used to JSONify Game and Drive objects
slottableToDict = lambda obj: {key: getattr(obj, key) for key in obj.__slots__}

def _main(log):
    log('''STEAM OVERVIEW VERSION {}\n''', __ver__)
    
    paths = _getPaths(log)
    
    if not paths:
        log('No steam install found!')
        return
    
    # Get steam-installed games
    
    drives = []
    def getDrive(path):
        '''Get drive at provided path, adding it to drives if nonexistent.'''
        base = path.drive or path.root
        for drv in drives:
            if drv.path == base:
                break
        else:
            drv = Drive(base)
            drives.append(drv)
        return drv
    
    for path in paths:
        log("Searching '{}'… ", path)
        path = Path(path)
        drv = getDrive(path)
        drv.appendLibrary(path)
    
    log("Searching user shortcuts…")
    
    userdata = Path(paths[0]) / 'userdata'
    shortcutsExist = False
    
    for userID in os.listdir(userdata):
        conf = userdata / userID / 'config' / 'shortcuts.vdf'
        if os.path.isfile(conf):
            for game in shortcutGames(conf):
                shortcutsExist = True
                # To ensure shortcut 
                path = Path(game.ID)
                drv = getDrive(path)
                drv.games.append(game)
    
    log("\nGetting game sizes...")
    if shortcutsExist:
        log("Games marked * are shortcuts and must have their size calculated.")
    if ESTIMATE_THRESHOLD_MiB:
        log("Games marked ~ have a size below {} MiB, and use Steam's estimate.",
            ESTIMATE_THRESHOLD_MiB)
    
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
            
            game.getSize()
            
            log('{:>10} {:1} {}',
                bytesize(game.size, digits=1, binary=True),
                symbol, game.name)
        
        # get drive size info
        drv.getSize()
    
    # sort drives by their size - typically, a smaller drive will
    # be an SSD and so the 'primary' drive
    drives.sort(key=lambda l: l.sizeTotal)
    
    log('\nPassing to `viewer/viewer.html`…')
    
    with open('libraries.js', 'w') as f:
        _json = json.dumps(drives, indent=1, default=slottableToDict)
        f.write(FORMAT.format(time.time(), _json))
    
    viewer = Path(os.getcwd()) / 'viewer' / 'viewer.html'
    webbrowser.open_new_tab(viewer)

class Logger:
    __slots__ = 'files'.split()
    def __init__(self, *files):
        if not files:
            files = (sys.stdout, )
        self.files = files
    
    def log(self, text='', *args, **kwargs):
        text = text.format(*args, **kwargs)
        for f in self.files:
            print(text, file=f)

if __name__ == '__main__':
    with open('log.txt', 'w', encoding='utf8') as f:
        log = Logger(sys.stdout, f).log
        try:
            _main(log)
        except Exception as e:
            log("\n\nINTERNAL ERROR (Give this to developer!):\n{}: {}",
                type(e).__name__, ', '.join(map(str, e.args)), prependTime=False)
            input('The error will be logged in log.txt. Press any key to exit…')
            raise
