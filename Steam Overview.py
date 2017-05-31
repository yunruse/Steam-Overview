import os
import re
import shutil
import json

import file

__dir__ = ['isSteamLibrary', 'isSteamPath', 'getLibraryPaths', 'Game', 'Library', 'getLibraries']

def isSteamLibrary(path):
    '''Return True if the path is a valid Steam library.
    
    A valid Steam library contains a 'steamapps' directory, which itself contains a 'file'
    directory. As an empty library may not contain ACF files, and different OSes contain
    different files to indicate they are libraries, it is impossible pathto completely validate
    a library.'''
    
    steamapps = file.path(path, 'steamapps')
    return os.path.isdir(steamapps)

def isSteamBase(path):
    '''Return True if the path is a base Steam library. Implies isSteamLibrary(path) is True.
    
    A base Steam library is that which contains a 'libraryfolders.vdf' file in its /steamapps/.
    This is useful as it contains a list of other user libraries.'''
    
    path = file.path(path)
    folders = file.path(path, 'steamapps', 'libraryfolders.vdf')
    return isSteamLibrary(path) and os.path.isfile(folders)

def readSteamFile(path):
    '''Scrapes top-level information from Steam-formatted ACF or VDF file as dictionary.
    Any numerical indexes are placed into dict['_list'].'''
    
    info = {'_list': []}
    with open(path) as file:
        for line in file.readlines():
            result = re.findall(r'^\t"(.+?)"\t\t"(.+?)"', line)
            if not result:
                continue
            key, value = result[0]
            if key.isdigit():
                info['_list'].append(value)
            else:
                info[key] = value
    return info

_BASEPATHS = (
    'C:\Program Files\Steam\\', 'C:\Program Files (x86)\Steam\\',
    os.path.expanduser('~/Library/Application Support/Steam/'),
    os.path.expanduser('~/.steam/'), os.path.expanduser('~/.local/share/Steam'),
    '/'
)

def getLibraryPaths():
    '''Returns a list of library paths found, of which the first is the base.'''
    
    for base in _BASEPATHS:
        if isSteamBase(base):
            break
    else:
        return []

    paths = [base] + readSteamFile(file.path(base, 'steamapps', 'libraryfolders.vdf'))['_list']
    return [file.path(i) for i in paths]

class Game:
    __slots__ = ['id', 'directory', 'name', 'steamLastUpdate', 'size']
    
    def __init__(self, path):
        '''Game, given path to ACF reference.'''
        info = readSteamFile(path)
        
        self.id = info.get('appid', None)
        self.directory = info.get('installdir', None)
        self.name = info.get('name', self.directory)
        self.steamLastUpdate = info.get('LastUpdated', 0)
        self.size = int(info.get('SizeOnDisk', 0))

        if self.directory:
            gamepath = file.path(os.path.split(path)[0], 'common', self.directory)
            self.size = file.dirsize(gamepath)[0]
        else:
            self.path = self.actualSize = None
    
    def toDictionary(self):
        return {key: getattr(self, key, None) for key in self.__slots__}

    def __repr__(self):
        return '<Game, {}>'.format(repr(self.toDictionary()).replace('{','').replace('}',''))

class Library(list):
    __slots__ = ['path', 'sizeTotal', 'sizeUsed', 'sizeGames']

    def __init__(self, path):
        '''List of games, given path to library (NOT /steamapps).'''
        self.path = file.path(path)

        gamespath = file.path(path, 'steamapps')
        for i in os.listdir(gamespath):
            if i.startswith('appmanifest_') and i.endswith('.acf'):
                i = file.path(gamespath, i)
                self.append(Game(i))

        self.sizeTotal, self.sizeUsed, _ = shutil.disk_usage(path)
        self.sizeGames = sum(game.size for game in self)

    def __repr__(self):
        return '<Library, {} game{}>'.format(len(self), 's' if len(self) != 1 else '')

    def toDictionary(self):
        return {'path': self.path, 'sizeTotal': self.sizeTotal, 'sizeUsed': self.sizeUsed,
                'sizeGames': self.sizeGames, 'games': [game.toDictionary() for game in self]}

def getLibraries():
    return [Library(path) for path in getLibraryPaths()]

if __name__ == '__main__':
    print('Getting paths...')
    libraries = []
    paths = getLibraryPaths()
    for path in paths:
        print('Getting games at {}...'.format(path))
        lib = Library(path)
        if len(lib):
            libraries.append(lib.toDictionary())
        print('{} found.'.format(len(lib)))
    print('Done, dumping to `libraries.json`…')

    import time
    with open('libraries.json', 'w') as f:
        f.write('var lastRetrieved = {}, libraries = {}'.format(
            time.time(), json.dumps(libraries, indent=1)))

    print('Opening `viewer/viewer.html`…')
    import webbrowser
    viewer = file.path(os.getcwd(), 'viewer', 'viewer.html')
    webbrowser.open_new_tab(viewer)
