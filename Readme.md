# DND-Sink

## Music Commands
To use these commands you must be connected to a voice channel that the bot has access to.

 * **!play \<YOUTUBE URL\>** (add the provided song to the queue and start the player)
 * **!stop** (stops the music and clears the queue)
 * **!queue** (displays the current queue)
 * **!clear** (clears all songs from the queue)
 * **!remove \<SONG TITLE\>** (remove the provided song from the queue. Must match a song in the queue)
 * **!restart** (restarts the current song)
 * **!next** (plays the next song)
 * **!loop** (toggles looping for the queue on and off)
 * **!loopsong** (toggles looping for the current song on and off)

## Dice Roller

In any channel where DND-Sink has access you can use the diceroller
**!roll \<STRING\>**
examples
* !roll d20  --> roles a single d20
* !roll 2d6 + 6 --> roles two d6s and adds 6 to the value
* !roll 2d6 - 1d4 + 1d20 + 4  --> rolls 2d6s, a d4, a d20 and adds/subtracts all the values where appropriate

Supports addition and subtraction. Any number and combination of dice can be used.

## Spell Lookup

you can look up spell information for DND 5E spells using the **!spell \<Spell Name\>** command.
ex.

 - !spell thaumaturgy
 - !spell green-flame blade
 - !spell heal

The bot currently supports all spells up to Explorer's Guide to Wildemount (EGW will be coming in a future release)
