# Introduction

This is an extension for Vortex that tries to restore the binding between a mod and the archive it was installed from after that connection was severed somehow.

## The problem

Mod and archive are connected through the archive id that is randomly generated the moment Vortex "gets to know" the archive.
Now if, for example, you move downloads around, Vortex will not know it's the same file being moved. It will instead consider the old archive deleted and a new archive (with the same name) created - which then gets a new id. Any bindings to mods will then be lost and Vortex will consider the archive as a new, not yet installed, mod.

## The solution

The way this extension works is by finding all mods that are bound to archives that no longer exist, then use a search based on the file name for archives that could be the origin.
At least mods that were downloaded from Nexus Mods should have fairly unique names so this way of matching should work fine.
