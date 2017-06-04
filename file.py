'''Path and file functions.'''

import sys
import os
import collections
import re

# Path functions

def _fixpath(path):
    '''Fix path to internal format.'''
    path = path.replace('\\', '/')
    path = re.sub(r'(^|/)\./', '', path)
    return path

def relpath(path, start=''):
    if start == path:
        return ''
    else:
        return path(os.path.relpath(path, start))

def path(path, *paths):
    path = _fixpath(path)
    if paths:
        path = os.path.join(path, *paths)
    if os.path.isabs(path):
        # If not relative, fix out any '..'
        path = os.path.abspath(path)
    return _fixpath(path)

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
