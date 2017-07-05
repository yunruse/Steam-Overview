#!/usr/bin/env python3

__ver__ = '1.2'

import json
import os
from pathlib import Path
import sys
import time
import webbrowser

import steamfile

def _getPaths(log):
    logPath = lambda path: log("Trying '{}'…".format(path))
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
    
    if attempts == 0:
        log("Found Steam install path.")

    return paths

FORMAT = '''\
/* Steam Overview %s */

var lastRetrieved = {},
    libraries = {};''' % __ver__

slottableToDict = lambda obj: {key: getattr(obj, key, None) for key in obj.__slots__}

def _main(log):
    log('\nSTEAM OVERVIEW VERSION {}\n'.format(__ver__), prependTime=False)
    paths = _getPaths(log)
    
    libraries = []
    for path in paths:
        log("Finding games at '{}'… ".format(path))
        lib = steamfile.Library(path)
        
        if len(lib.games):
            libraries.append(lib)
            log('{} found, getting sizes'.format(len(lib.games)), end='')
            for game in lib.games:
                game.getSize()
                log('.', prependTime=False, end='')
            log()
            lib.getSize()
        else:
            log('No games found, ignoring')

    libraries.sort(key=lambda l: l.sizeTotal)
    
    log('Done, passing to `viewer/viewer.html`…')
    
    with open('libraries.js', 'w') as f:
        _json = json.dumps(libraries, indent=1, default=slottableToDict)
        f.write(FORMAT.format(time.time(), _json))
    
    viewer = Path(os.getcwd()) / 'viewer' / 'viewer.html'
    webbrowser.open_new_tab(viewer)

def Logger(*FILES, TIMEFORMAT='%H:%M:%S '):
    if not FILES:
        FILES = (sys.stdout, )
    def log(text='', prependTime=True, *args, **kwargs):
        if text and prependTime:
            text = time.strftime(TIMEFORMAT) + text
        for f in FILES:
            print(text, file=f, **kwargs)

    return log

if __name__ == '__main__':    
    with open('log.txt', 'w', encoding='utf8') as LOGFILE:
        log = Logger(sys.stdout, LOGFILE)
        try:
            _main(log)
        except Exception as e:
            errmsg = "\n\nINTERNAL ERROR (Give this to developer!):\n{}: {}".format(
                type(e).__name__, ', '.join(e.args) )
            log(errmsg, prependTime=False)
            input('The error will be logged in log.txt. Press any key to exit…')
            raise
