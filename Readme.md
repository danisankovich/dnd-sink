DND-Sink provides functionality useful for running and participating in a DND campaign.

Functionality includes music capabilities, dice rolling, stat generation, spell lookup, and condition lookup.

Music: Connect to a voice channel to stream music from youtube. The bot provides the ability to create and save playlists.

Spell Lookup: The bot can lookup any DND 5E spell up until Explorer's Guide to Wildemount.

Condition Lookup: The bot can provide info the the DND 5E conditions.

NPC Generator: the bot can generate an NPC

DND-Sink also comes with a dynamic dice roller and an included stat generator for new characters.

[Click Here](https://discord.com/oauth2/authorize?client_id=712699373183565915&permissions=36702208&scope=bot) to add the bot to your server

## Miscellaneous

* **!help** --> displays a link to the readme documentation for this bot.
* **!feedback \<CONTENT\>** --> Sends CONTENT as feedback to the bot owner. Maximum 250 characters.

## Music Commands
To use these commands you must be connected to a voice channel that the bot has access to.

 * **!play \<SONG NAME\>** --> add the provided song to the queue and start the player.
 * **!stop** --> stops the music and clears the queue
 * **!queue** --> displays the current queue
 * **!clear** --> clears all songs from the queue
 * **!remove \<SONG TITLE\>** --> remove the provided song from the queue. Must match a song in the queue
 * **!restart** --> restarts the current song
 * **!next** --> plays the next song
 * **!loop** --> toggles looping for the queue on and off
 * **!loopsong** --> toggles looping for the current song on and off
 * **!newplaylist \<PLAYLIST NAME\>** --> creates a playlist of \<PLAYLIST NAME\>
 * **!addsong \<PLAYLIST NAME\> \<SONG NAME\>** --> adds the selected song to the desired playlist you own
 * **!removesong \<PLAYLIST NAME \> \<Song Name\>** --> removes the selected song from the selected playlist
 * **!start \<PLAYLIST NAME\>** --> plays all songs in the selected playlist. You must be the playlist owner.
 * **!deleteplaylist \<PLAYLIST NAME\>** --> deletes the selected playlist
 * **!showplaylists** --> lists all playlists in your collection
 * **!showplaylistsongs \<PLAYLIST NAME\>** --> shows all songs in the selected playlist



## Dice Roller

In any channel where DND-Sink has access you can use the diceroller
**!roll \<STRING\>**
examples
* **!roll d20**  --> rolls a single d20
* **!roll 2d6 + 6** --> rolls two d6s and adds 6 to the value
* **!roll 2d6 - 1d4 + 1d20 + 4**  --> rolls 2d6s, a d4, a d20 and adds/subtracts all the values where appropriate
* **!adv \<string\> or !disadv \<string\>** --> rolls the dice string provided twice to simulate advantage and disadvantage

## Stat Generator

In any channel where DND-Sink has access you can use the stat generator
* **!stats 3d6** --> rolls 3d6 six times
* **!stats d20**  --> roles a single d20 six times
* **!stats 4d6** --> roles 4d6s and drops the lowest value six times
* **!stats 4d6\***  --> roles 4d6s and drops the lowest value six times. In any set if two ones are rolled a single dice is rolled in their place.

## Spell Lookup

you can look up spell information for DND 5E spells using the **!spell \<Spell Name\>** command.
ex.

 - **!spell thaumaturgy**
 - **!spell green-flame blade**
 - **!spell heal**

The bot currently supports all spells up to Explorer's Guide to Wildemount (EGW will be coming in a future release)

## Class Feature Lookup

You can look up information regarding each of the DND 5E class features
* **!\<CLASSNAME\> \<FEATURE\>** --> provides information on the supplied feature for the given class

ex.
* **!barbarian rage**
* **!bard college of lore**

(implemented: barbarian, bard, cleric)

To look up features of a subclass, search for the subclass as the feature

## Condition Lookup

You can look up information regarding each of the DND 5E conditions
* **!condition** --> provides basic information regarding conditions.
* **!condition \<Condition Name\>** --> Provides information about the provided condition.

## NPC Generator

* **!generate \<Race\>** --> Generates a random NPC of the given race.
Supports human, elf, tiefling, aasimar, gnome, halfling, dwarf, orc, half-elf, half-orc, and dragonborn. Supplying another race will select from this list.
