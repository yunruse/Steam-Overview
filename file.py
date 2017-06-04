#!/usr/bin/env python3

'''Generic path and file functions for whole filesystem.'''

import sys
import os
import collections
import re

# Path functions

def _fixpath(_path, sep='/'):
    '''Fixes dot problems with path and changes separator.'''
    if os.path.isabs(_path):
        _path = os.path.abspath(_path)
    else:
        _path = os.path.relpath(_path)
    return _path.replace(os.sep, '/')

def path(_path, *paths, sep='/'):
    if paths:
        _path = _fixpath(_path, sep)
        _path = os.path.join(_path, *paths)
    
    return _fixpath(_path, sep)

def relpath(path, start=''):
    if start == path:
        return ''
    else:
        return path(os.path.relpath(path, start))

# File sizes

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
