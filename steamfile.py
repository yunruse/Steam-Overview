#!/usr/bin/env python3

'''Steam-specific path and file functions.'''

import collections
import os
from pathlib import Path
import re
import sys
import string

__dir__ = ('readSteamFile', 'isSteamLibrary', 'isSteamBase', 'getLibraryPaths')

size = collections.namedtuple('size', 'totalSize fileCount')
def dirsize(path):
    '''Get bytes used by directory and amount of files.
    
    > dirsize('/path/to/directory/')
    size(134240, 27)
    > dirsize('/path/to/file.txt')
    size(5836, 1)
    > dirsize('notanactualfile')
    size(0, 0)'''
    
    if not os.path.exists(path):
        return size(0, 0)
    elif os.path.isfile(path):
        try:
            return size(os.lstat(path).st_size, 1)
        except os.error:
            return size(0, 1)
    
    totalSize = 0
    seen = set()
    
    for dirpath, dirs, files in os.walk(path):
        for file in files:
            file = os.path.join(dirpath, file)
            
            try:
                stat = os.lstat(file)
            except os.error:
                continue
            
            if stat.st_ino in seen:
                continue
            else:
                seen.add(stat.st_ino)
            
            totalSize += stat.st_size
    
    return size(totalSize, len(seen))

STEAMENTRY = re.compile(r'^\t"(.+?)"\t\t"(.+?)"')

def readSteamFile(path):
    '''Scrapes top-level information from Steam-formatted ACF or VDF file as dictionary.
    
    Any numerical indexes are placed into dict['_list'].'''
    
    info = {'_list': []}
    with open(str(path), encoding='utf8') as file:
        for line in file.readlines():
            result = STEAMENTRY.findall(line)
            if not result:
                continue
            key, value = result[0]
            if key.isdigit():
                info['_list'].append(value)
            else:
                info[key] = value
    return info

def isSteamBase(path):
    '''Return True if the path is the base Steam library, containing /steamapps/libraryfolders.vdf'''
    
    return (Path(path) / 'steamapps' / 'libraryfolders.vdf').is_file()

def isSteamLibrary(path):
    '''Return True if the path is a valid Steam library, containing /steamapps/common/'''
    
    return isSteamBase(path) or (Path(path) / 'steamapps' / 'common').is_dir()

#
# extremely OS-dependant steamBaseFinder()
# 

if os.name == 'nt':
    registryPath = None
    driveLetters = []
    
    try:
        import winreg
    except ModuleNotFoundError:
        pass
    else:
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Software\\Valve\\Steam') as key:
                registryPath = winreg.QueryValueEx(key, 'SteamPath')[0]
        except FileNotFoundError:
             pass
    
    try:
        from ctypes import windll
    except ModuleNotFoundError:
        pass
    else:
        def _doesDriveExist(letter):
            return (windll.kernel32.GetLogicalDrives() >> (ord(letter.upper()) - 65) & 1) != 0

        driveLetters = [a + ':/' for a in string.ascii_uppercase if _doesDriveExist(a)]
    
    
    def steamBaseFinder():
        if registryPath is not None:
            yield registryPath
        
        progfileKeys = ('ProgramFiles', 'ProgramFiles(x86)', 'ProgramW6432')
        for i in progfileKeys:
            if i in os.environ:
                yield Path(os.environ[i]) / 'Steam'
        
        for a in driveLetters:
            a = Path(a)
            yield a / 'Steam'
            yield a / 'Program Files' / 'Steam'
            yield a / 'Program Files (x86)' / 'Steam'
     
else:
    _UNIXBASES = (
        '~/Library/Application Support/Steam/', #macOS
        '~/.local/share/Steam', #Most Linux distros
        '~/.steam/' #Some Linux distros
    )
    def steamBaseFinder():
        for i in _UNIXBASES:
            yield Path(i).expanduser()

def getSteamBase(log=lambda path: None):
    for path in steamBaseFinder():
        log(str(path))
        if path and isSteamBase(path):
            return path
    else:
        return None

def getLibraryPaths(base=None, log=lambda path: None):
    '''Returns a list of paths to Steam libraries found. If 'base' is not provided it will be found.'''
    if base is None:
        base = getSteamBase(log)
        if base is None: #it feels wrong doing that twice
            return []
    
    try:
        vdf = readSteamFile(Path(base) / 'steamapps' / 'libraryfolders.vdf')
    except FileNotFoundError:
        return []
    
    return [base] + [Path(i) for i in vdf['_list']]
