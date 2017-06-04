#!/usr/bin/env python3

'''Steam-specific path and file functions.'''

import os
import re

import file

__dir__ = ('readSteamFile', 'isSteamLibrary', 'isSteamBase', 'getLibraryPaths')


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


def isSteamLibrary(path):
    '''Return True if the path is a valid Steam library, containing /steamapps/common/'''
    
    steamapps = file.path(path, 'steamapps', 'common')
    return os.path.isdir(steamapps)

def isSteamBase(path):
    '''Return True if the path is the base Steam library, containing /steamapps/libraryfolders.vdf'''
    
    path = file.path(path)
    folders = file.path(path, 'steamapps', 'libraryfolders.vdf')
    return isSteamLibrary(path) and os.path.isfile(folders)

# Steam base finder

if os.name == 'nt':
    import winreg
    
    def _finder():
        # Consult registry
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, 'Software\\Valve\\Steam') as key:
            yield winreg.QueryValueEx(key, 'SteamPath')[0]
        
        # Consult environment paths
        for i in ('ProgramFiles', 'ProgramFiles(x86)', 'ProgramW6432'):
            if i in os.environ:
                yield file.path(os.environ[i], 'Steam')
        
        # Try all drive letters
        for a in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
            a += ':/' #me_irl
            yield file.path(a, 'Program Files', 'Steam')
            yield file.path(a, 'Program Files (x86)', 'Steam')
     
else:
    _UNIXBASES = (
        '~/Library/Application Support/Steam/', #macOS
        '~/.local/share/Steam', #Most Linux distros
        '~/.steam/' #Some Linux distros
    )
    def _finder():
        for i in _UNIXBASES:
            yield os.path.expanduser(i)

def getSteamBase():
    for path in _finder():
        if isSteamBase(path):
            return path
    else:
        return None

def getLibraryPaths(base=None):
    '''Returns a list of paths to Steam libraries found. If 'base' is not provided it will be found.'''
    if base is None:
        base = getSteamBase()
        if base is None: #it feels wrong doing that twice
            return []

    vdfPath = file.path(base, 'steamapps', 'libraryfolders.vdf')
    try:
        vdf = readSteamFile(vdfPath)
    except FileNotFoundError:
        return []

    paths = [base] + vdf['_list']
    
    return [file.path(i) for i in paths]
