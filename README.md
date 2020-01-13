# Cheats' V2 Commands

## *Not finished yet*

#### Thanks to Dragonian for improving the commands

This is an admin script which will only work with Node-Hill.

How to use:
- Download the `commands.js` file and place it in your `user_scripts` folder that is in your Node-Hill game folder.
- Put your user id in the `admins` array:
    - `const admins = [1,2002,3843]`
- Now host your game and execute commands.


Command instructions:
- You do not need to use full player's usernames
- Commands are *not* case sensitive


## Special ways of getting players
- :all -> returns every player in the game
- :others -> returns every player other than you in the game
- :random -> returns random player in the game
- :admins -> returns all other admins in the game
- :me -> returns yourself

## Commands
- /kill player: kills the player
- /kick player ?message: kicks the player with the message provided.
- /mute player: mutes the player.
    -  */mute is a toggable command*
- /vhcat message: messages all the admins in the server.
- /ban player: bans the player from the game. *resets when the server is turned off*
- /admin player: gives the player admin.
    -  */admin is a toggable command*
- /tp player victim|x,y,z: teleports you to a player or the coordinates in x,y,z fashion.
    - `/tp :me :random`
    - `/tp :random 0,0,0`
- /speed player num: sets your speed or the player's speed
- /jump player num: sets your jump power or the player's jump power.
- /size|scale player num|x,y,z: sets the player's, or your, scale in x,y,z fashion or just one number.
    - `/scale cheats 2`
    - `/size :all 1,2,3`
- /weather sun|snow|rain: sets the game's weather.
- /freeze player: freezes the player.
- /thaw player: thaws the player.
- /balloon player: gives the player a balloon.
- /ambient hex|num: changes the game's ambient.
- /sky hex|num: changes the game's sky color.
- /cyclops player: turns you or the player into a cyclops.
- /weed player: weedifies you or the player.
- /zombie player: turns you or the player into a zombie.
- /basil player: gives you basil and outfit.
- /creeper player: turns you or the player into a creeper.
- /jail player: puts the player in jail.
- /free player: frees the player if they are in jail.
- /broadcast|b message: broadcasts your message throughout the server at the top of the screen.
- /hat player hatId: gives you or the player a hat with a specified id.
- /reset player: resets everything about you or the player.
- /tool player toolId: gives you or the player a tool with a specified id.
- /wand player: gives you or the player a magic wand.
- /greset|gr: resets the game's sky color and ambient.
- /av|avatar: player victim|userId
    - `/av :me 127118`
    - `/avatar cheats :random`
- /score player amount: sets the player's score to the amount
- /heal player amount: heals the player by amount
- /damage player amount: damages the player by amount
- /loopkill player: Loop kills the player
    -  */loopkill is a toggable command*. 
- /btools player: gives the player btools
- /admins: lists the admins in the game
- /speech player text: sets the player's speech as text
- /respawn player: respawns the player
- /team player "name": creates a team setting the player to that team
    - `/team :all "brick-hillians"`
- /shutdown: shuts down the server
- /smite player: hits the player with a lightning bolt
    - *currently broken*
