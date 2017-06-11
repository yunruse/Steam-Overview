#!/usr/bin/env python3

__ver__ = '1.1'
PRODUCTION = True

import os
import re
import shutil
import json

import file
import steamfile

if __name__ == '__main__':
    import time
    import webbrowser

class Game:
    __slots__ = ['id', 'directory', 'name', 'size']
    
    def __init__(self, path):
        '''Game, given path to ACF reference.'''
        info = steamfile.readSteamFile(path)
        
        self.id = info.get('appid', None)
        self.directory = info.get('installdir', None)
        self.name = info.get('name', self.directory)
        self.size = int(info.get('SizeOnDisk', 0))

        if 'installdir' in info:
            steamapps = os.path.split(path)[0]
            dirpath = file.path(steamapps, 'common', self.directory)
            self.size = file.dirsize(dirpath).totalSize

class Library:
    __slots__ = ['games', 'path', 'sizeTotal', 'sizeUsed', 'sizeFree', 'sizeGames']
    
    def __init__(self, path):
        '''List of games, given path to library (NOT /steamapps).'''
        self.path = file.path(path)
        self.games = []
        
        gamespath = file.path(path, 'steamapps')
        for i in os.listdir(gamespath):
            if i.startswith('appmanifest_') and i.endswith('.acf'):
                i = file.path(gamespath, i)
                self.games.append(Game(i))

        self.games.sort(key=lambda g: g.size, reverse=True)
        
        self.sizeTotal, self.sizeUsed, _ = shutil.disk_usage(path)
        self.sizeFree = self.sizeTotal - self.sizeUsed
        
        self.sizeGames = sum(game.size for game in self.games)

# Main program

def _getPaths(log):
    paths = steamfile.getLibraryPaths()
    attempts = 0
    while len(paths) == 0:
        # Slightly conversational because if you're here, something's wrong
        if attempts == 0:
            log("Couldn't automatically find Steam install directory.")
            print("Sorry about that. Please provide a path:")
        elif attempts <= 2:
            print("Sorry, I couldn't find anything there. Are you sure you have Steam")
            print("installed? Please check you have libraryfolders.vdf at your path.")
        
        attempts += 1
        paths = getLibraryPaths(input("~ "))
    
    if attempts == 0:
        log("Found Steam installed at '{}'".format(paths[0]))

    return paths

FORMAT = '''\
/* Steam Overview {} */

var lastRetrieved = {},
    libraries = {};'''

slottableToDict = lambda obj: {key: getattr(obj, key, None) for key in obj.__slots__}

def _main():
    log('\nSTEAM OVERVIEW VERSION {}\n'.format(__ver__), prependTime=False)
    log('Looking for Steam install directory...')
    paths = _getPaths(log)

    libraries = []
    for path in paths:
        log('Finding games at {}...'.format(path))
        lib = Library(path)
        if len(lib.games):
            libraries.append(lib)
            log('{} found.'.format(len(lib.games)))
        else:
            log('No games found, ignoring.')
    
    log('Done, passing to `viewer/viewer.html`...')
    
    with open('libraries.js', 'w') as f:
        _json = json.dumps(libraries, indent=1, default=slottableToDict)
        f.write(FORMAT.format(__ver__, time.time(), _json))
    
    viewer = file.path(os.getcwd(), 'viewer', 'viewer.html')
    webbrowser.open_new_tab(viewer)

if __name__ == '__main__':    
    import time
    import webbrowser

    with open('log.txt', 'w') as _log:
        def log(text, prependTime=True):
            if prependTime:
                text = time.strftime('%H:%M:%S ') + text
            print(text)
            print(text, file=_log)
        
        try:
            _main()
        except Exception as e:
            print("\nINTERNAL ERROR (Give this to developer!):\n{}: {}".format(
                type(e).__name__, ', '.join(e.args) ))
            raise
