/*
IDEAS

- balloon
- tool
- hat
- wand
    - sky
    - ambient
    - random colors
- broadcast
- jail
- snowman
- creeper
- zombie
- cyclops
    - size and face
- weed
- basil
    - random outfit

- 

*/


const admins = [1]
const banned = []

function isAdmin(player) {
    return admins.includes(player.userId)
}

function findPlayer(sub) {
    for (let player of Game.players) {
        if (player.username.toLowerCase().indexOf(String(sub).toLowerCase()) === 0) {
            const victim = Game.players.find(v => v.username === player.username)
            return victim
        }
    }
}

function V2(message) {
    return `[#ff0000][V2]: [#ffffff]${message}`
}

function loadCommands(cmd,cb) {
    return Game.command(cmd, isAdmin, (player, args) => {
        cb(player, args)
    })
}

Game.on("playerJoin", player => {
    player.on("initialSpawn", () => {
        player.frozen = false

        if (banned.includes(player.userId)) 
            return player.kick("You are banned from this server!")
        if (admins.includes(player.userId))
            player.centerPrint(V2("You are an admin!"), 3)
    })
})



// Game.command("kill", isAdmin, (player, args) => {
//     const victim = findPlayer(args)
//     if (!victim)
//         return
//     return victim.kill()
// })

// Game.command("kick", isAdmin, (player, args) => {

// })

const commands = {
    kill: ($, args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        return victim.kill()
    },
    kick: ($,args) => {
        const a = args.split(" ")
        const victim = findPlayer(String(a.splice(0,1)))
        if (!victim)
            return
        if (!a.length)
            return victim.kick()
        return victim.kick(a.join(" "))
    },
    mute: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        (victim.muted) ? player.message(V2(`You unmuted ${victim.username}.`)) : player.message(V2(`You muted ${victim.username}`))
        return victim.muted = !victim.muted
    },
    vchat: ($,args) => {
        for (let userId of admins) {
            const admin = Game.players.find(a => a.userId === userId)
            admin.message(`[#ff0000][${admin.username}]: [#ffffff]${args}`)
        }
    },
    ban: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        banned.push(victim.userId)
        player.message(V2(`You banned [#ff0000]${victim.username}[#ffffff].`))
        return victim.kick("You are banned from this server.")
    },
    admin: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        if (admins.includes(victim.userId)) {
            admins.splice(admins.indexOf(victim.userId), 1)
            return player.message(V2(`You took away [#ff0000]${victim.username}[#ffffff]'s admin.`))
        }
        admins.push(victim.userId)
        victim.message(V2("You are now an admin."))
        return player.message(V2(`You gave[#ff0000] ${victim.username} [#ffffff]admin.`))
    },
    tp: (player,args) => {
        if (args.indexOf(",") > -1) {
            const coords = args.split(",")
            if (coords[0],coords[1],coords[2])
                return player.setPosition(new Vector3(
                    Number(coords[0]),
                    Number(coords[1]),
                    Number(coords[2])
                ))
        
            else {
                const victim = findPlayer(args)
                if (!victim)
                    return
                return player.setPosition(victim.setPosition)
            }    
        }
    },
    speed: (player,args) => {
        const a = args.split(" ")
        const victim = findPlayer(a[0])
        return (victim) ? victim.setSpeed(Number(a[1])) : player.setSpeed(Number(a[0]))
    },
    jump: (player,args) => {
        const a = args.split(" ")
        const victim = findPlayer(a[0])
        return (victim) ? victim.setJumpPower(Number(a[1])) : player.setJumpPower(Number(a[0]))
    }
}


for (let cmds of Object.keys(commands)) {
    loadCommands(cmds,commands[cmds])
}