const admins = [1,127118]
const banned = []
const jailBricks = {}
const regexMatch = /([^"]+)(?:\"([^\"]+)\"+)?/

function isAdmin(player) {
    return admins.includes(player.userId)
}

function parseCommand(caller, args) {
    let match = args.split(" ")

    if (!match) return caller.message(V2( `Incorrect use of command.` ))

    let value = match.pop()
    let user = match.join(" ")

    if (!user || !value) 
        return caller.message(V2( `User or value was not found.` ))

    return [ user, value ]
}

function getPlayersFromCommand(caller, args) {
    switch (args) {
        case ":me": {
            return [ caller ]
        }
        case ":all": {
            return Game.players
        }
        case ":others": {
            let others = []
            for (let player of Game.players) {
                if (player !== caller)
                    others.push(player)
            }
            return others
        }
        default: {
            args = args.toLowerCase()
            for (let player of Game.players) {
                if (player.username.toLowerCase().indexOf(args) === 0) {
                    const victim = Game.players.find(v => v.username === player.username)
                    return [ victim ]
                }
            }
        }
        return []
    }
}

function V2(message) {
    return `[#ff0000][V2]: [#ffffff]${message}`
}

function loadCommands(cmd,cb) {
    return Game.commands(cmd, isAdmin, (player, args) => {
        cb(player, args)
    })
}

function freeze(caller, victim) {
    new Outfit(victim)
        .body("#0091ff")
        .set()
    victim.frozen = true
    victim.setSpeed(0)
    victim.setJumpPower(0)
    return victim.message(V2( `You were frozen by ${caller.username}.` ))
}

function newBalloon(player) {
    const balloon = new Tool("balloon")
    balloon.model = 84038
    balloon.equipped(p => {
        p.setJumpPower(12)
    })
    balloon.unequipped(p => {
        p.setJumpPower(5)
    })
    player.equipTool(balloon)
}

function newWand(player) {
    const wand = new Tool("wand")
    wand.model = 7109
    wand.equipped(p => {
        p.message(`[#009ac4][Wand]: [#ffffff]This wand has magic powers when activated...`)
    })
    wand.on("activated", _ => {
        Game.setEnvironment({
            skyColor: String(Math.random() * 99999999),
            ambient: String(Math.random() * 99999999)
        })
    })
    player.equipTool(wand)
}

function cyclops(player) {
    player.setScale(new Vector3(2, 2, 2))
    new Outfit(player)
        .face(34345)
        .body("#0091ff")
        .hat1(1)
        .hat2(1)
        .hat3(1)
        .set()
}

function weedify(player) {
    new Outfit(player)
        .face(420)
        .body("#00ff00")
        .hat1(42599)
        .hat2(1)
        .hat3(1)
        .set()
}

function snowman(player) {
    new Outfit(player)
        .face(6361)
        .body("#ffffff")
        .hat1(88877)
        .hat2(27948)
        .hat3(1)
        .set()
}

function zombie(player) {
    new Outfit(player)
        .face(76559)
        .head("#0d9436")
        .torso("#694813")
        .leftArm("#0d9436")
        .rightArm("#0d9436")
        .leftLeg("#694813")
        .rightLeg("#694813")
        .hat1(1)
        .hat2(1)
        .hat3(1)
        .set()
}

function basil(player) {
    new Outfit(player)
        .face(94126)
        .body("#000000")
        .hat1(1937)
        .hat2(1)
        .hat3(1)
        .set()
}

function creeper(player) {
    new Outfit(player)
        .face(33349)
        .body("#00ff00")
        .hat1(1)
        .hat2(1)
        .hat3(1)
        .set()
}

async function reset(player) {
    await player.setAvatar(player.userId)
    player.setScale(new Vector3(
        1,
        1,
        1
    ))
    player.setSpeed(4)
    player.setJumpPower(5)
}

class Jail {
    constructor(player) {
        this.player = player
    }

    bar(x, y, z = 0) {
        jailBricks[this.player.userId].push(new Brick(new Vector3(
            this.player.position.x - x,
            this.player.position.y - y,
            this.player.position.z - z
        ), new Vector3(0.5,0.5,7)))
    }
    
    bases(x, y, z = 0) {
        jailBricks[this.player.userId].push(new Brick(new Vector3(
            this.player.position.x - x,
            this.player.position.y - y,
            this.player.position.z - z
        ), new Vector3(5, 5, 0.5)))
    }
}

function jail(player) {
    const middleOffset = 0.2
    const endOffset = 2.5
    const topOffset = 7
    
    player.setSpeed(0)
    player.setJumpPower(0)

    jailBricks[player.userId] = []

    let cage = new Jail(player)

    cage.bases(endOffset, endOffset)
    cage.bases(endOffset, endOffset, -topOffset)

    cage.bar(endOffset, endOffset)
    cage.bar(-2, -2)

    cage.bar(-2, endOffset)
    cage.bar(endOffset, -2)

    cage.bar(endOffset, middleOffset)
    cage.bar(middleOffset, endOffset)

    cage.bar(-2, middleOffset)
    cage.bar(middleOffset, -2)

    for (let players of Game.players) {
        players.loadBricks(jailBricks[player.userId])
    }
}

function free(player) {
    if (jailBricks[player.userId]) {
        for (let bricks of jailBricks[player.userId]) {
            bricks.destroy()
        }
        delete jailBricks[player.userId]
        player.setSpeed(4)
        player.setJumpPower(5)
    }
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

Game.on("playerLeave", player => {
    if (jailBricks[player.userId]) {
        return free(player)
    }
})

const commands = {
    kill: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach((victim) => {
            victim.kill()
        })
    },
    kick: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match) return

        let user = match[1] && match[1].trim()
        let reason = match[2]

        getPlayersFromCommand(caller, user).forEach((victim) => {
            victim.kick(reason)
        })
    },
    mute: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach((victim) => {
            (victim.muted) ? caller.message(V2(`You unmuted ${victim.username}.`)) : caller.message(V2(`You muted ${victim.username}`))
            victim.muted = !victim.muted
        })
    },
    vchat: (caller, args) => {
        for (let id of admins) {
            const admin = Game.players.find(a => a.userId === id)
            if (!admin)
                continue
            admin.message(`[#ff0000][${caller.username}]: [#ffffff]${args}`)
        }
    },
    ban: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match) return

        let user = match[1] && match[1].trim()
        let reason = (match[2]) ? match[2] : "You are banned from this server."

        getPlayersFromCommand(caller, user).forEach(victim => {
            banned.push(victim.userId)
            caller.message( V2( `You banned [#ff0000]${victim.username}[#ffffff].` ) )
            victim.kick(reason)
        })
    },
    admin: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            if (admins.includes( victim.userId )) {
                victim.message( V2( `Your admin was taken away by [#ff0000]${caller.username}[#ffffff].` ) )
                caller.message( V2( `You took away [#ff0000]${victim.username}[#ffffff]'s admin.` ) )
                return admins.splice(admin.indexOf( victim.userId ))
            }

            victim.message( V2( `You were given admin by [#ff0000]${player.username}[#ffffff].` ) )
            caller.message( V2( `You gave[#ff0000] ${victim.username} [#ffffff]admin.` ) )
            return admins.push( victim.userId )
        })
    },
    tp: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match) return

        let user = match[1] && match[1].trim()
        let coords = match[2].split(",")

        getPlayersFromCommand(caller, user).forEach(victim => {
            let target = getPlayersFromCommand(caller, coords)[0]
            if (!target) {
                victim.setPosition(new Vector3(
                    Number(coords[0]),
                    Number(coords[1]),
                    Number(coords[2])
                ))
            } else {
                victim.setPosition( target.position )
            }
        })
    },
    speed: (caller, args) => {
        let parsed = parseCommand(caller, args)
        
        let user = parsed[0]
        let speed = Number(parsed[1])

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setSpeed(speed)
        })
    },
    jump: (caller, args) => {
        let parsed = parseCommand(caller, args)
        
        let user = parsed[0]
        let jumpPower = Number(parsed[1])

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setJumpPower(jumpPower)
        })
    },
    [["size","scale"]]: (caller, args) => {
        let parsed = parseCommand(caller, args)

        let user = parsed[0]
        let scale = parsed[1].splice(",")

        let parsedScale = (scale.length === 1) ? new Vector3(
            Number( scale[0] ),
            Number( scale[0] ),
            Number( scale[0] )
        ) : new Vector3(
            Number( scale[0] ),
            Number( scale[1] ),
            Number( scale[2] )
        )

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setScale(parsedScale)
        })
    },
    weather: (_, args) => {
        try {
            return Game.setEnvironment({
                weather: args
            })
        } catch{}
    },
    freeze: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            freeze(caller, victim)
        })
    },
    thaw: async (player,args) => {
        getPlayersFromCommand(caller, args).forEach(victim => { // thaw as function?
            if (!victim.frozen) continue

            await victim.setAvatar(victim.userId)
            victim.setSpeed(4)
            victim.setJumpPower(5)
            victim.message(V2( `You were thawed by ${caller.username}.` ))
        })
    },
    balloon: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return newBalloon(player)
        return newBalloon(victim)
    },
    tpme: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        return victim.setPosition(player.position)
    },
    ambient: (_,args) => {
        try {
            return Game.setEnvironment({
                ambient: args
            })
        } catch {}
    },
    sky: (_,args) => {
        try {
            return Game.setEnvironment({
                skyColor: args
            })
        } catch {}
    },
    cyclops: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return cyclops(player)
        return cyclops(victim)
    },
    weed: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return weedify(player)
        return weedify(victim)
    },
    zombie: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return zombie(player)
        return zombie(victim)
    },
    basil: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return basil(player)
        return basil(victim)
    },
    creeper: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return creeper(player)
        return creeper(victim)
    },
    snowman: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return snowman(player)
        return snowman(victim)
    },
    jail: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        if (jailBricks[victim.userId])
            return player.message(V2(`${victim.username} is already jailed!`))
        player.message(V2(`You jailed ${victim.username}.`))
        return jail(victim)
    },
    free: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return
        if (!jailBricks[victim.userId])
            return player.message(V2(`${victim.username} is already freed!`))
        player.message(V2(`You freed ${victim.username}.`))
        return free(victim)
    },
    [["broadcast","b"]]: (player,args) => {
        return Game.topPrintAll(`[#ff0000]${player.username}: [#ffffff]${args}`, 5)
    },
    hat: (player,args) => {
        const message = args.split(" ")
        const victim = findPlayer(message[0])
        if (!victim) {
            if (isNaN(Number(args)))
                return
            return new Outfit(player)
                .hat1(Number(args))
                .set()
        }
        if (isNaN(Number(message[1])))
            return
        return new Outfit(victim)
            .hat1(Number(message[1]))
            .set()
    },
    reset: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return reset(player)
        return reset(victim)
    },
    tool: (player,args) => {
        const message = args.split(" ")
        const victim = findPlayer(message[0])
        if (!victim) {
            if (isNaN(Number(args)))
                return
            const newTool = new Tool("Tool")
            newTool.model = Number(args)
            return player.equipTool(newTool)
        }
        if (isNaN(Number(message[1])))
            return
        const newTool = new Tool("Tool")
        newTool.model = Number(message[1])
        return victim.equipTool(newTool)
    },
    wand: (player,args) => {
        const victim = findPlayer(args)
        if (!victim)
            return newWand(player)
        return newWand(victim)
    },
    greset: () => {
        Game.setEnvironment({
            ambient: "0",
            skyColor: "#71b1e6"
        })
    }
}

Game.setMaxListeners(100)

for (let cmds of Object.keys(commands)) {
    loadCommands(cmds.split(","),commands[cmds])
}
