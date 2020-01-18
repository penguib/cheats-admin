const admins = [1,127118],
      banned = [],
      jailBricks = {},
      regexMatch = /([^"]+)(?:\"([^\"]+)\"+)?/;
      teamRegex = /t\:[^\:]+\:/

function isAdmin(player) {
    return admins.includes(player.userId)
}

function btools(player) {
    let brickSize = 1

    let create = new Tool("Create")
    create.on("activated", p => {
        let rotX = Math.sin(p.rotation.z),
            rotY = Math.cos(p.position.z);
        let brick = new Brick(new Vector3(
            p.position.x + (rotX + (Math.sign(rotX) * 2)),
            p.position.y + (rotY + (Math.sign(rotY) * 2)),
            0), new Vector3(
                brickSize,
                brickSize,
                brickSize), "#ff0000")
        brick.name = "btools"
        Game.newBrick(brick)
    })
    
    let destroy = new Tool("Destroy")
    destroy.on("activated", p => {
        for (let bricks of world.bricks) {
            if (Game.pointDistance3D(p.position, bricks.position) <= 10 && bricks.name === "btools") {
                return bricks.destroy()
            }
        }
    })

    let sizeInc = new Tool("Size+")
    sizeInc.on("activated", p => {
        if (brickSize >= 10) {
            brickSize = 10
            return p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${brickSize}.`)
        }
        brickSize++
        p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${brickSize}.`)
    })

    let sizeDec = new Tool("Size-")
    sizeDec.on("activated", p => {
        if (brickSize <= 1) {
            brickSize = 1
            return p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${brickSize}.`)
        }
            brickSize--
            p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${brickSize}.`)
    })
    
    player.addTool(create)
    player.addTool(destroy)
    player.addTool(sizeInc)
    player.addTool(sizeDec)
}

function heal(player,amt) {
    amt = Number(amt)
    let health = (amt + player.health >= player.maxHealth) ? player.maxHealth : amt + player.health
    player.setHealth(health)
}

function damage(player,amt) {
    player.setHealth(player.health - Number(amt))
}

function loopkill(player) {
    player.loopkill = !player.loopkill

    let loop = setInterval(() => {
        if (!player.loopkill) return clearInterval(loop)
        if (player.alive) 
            player.kill()
    }, 100);
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
        case ":random": {
            let randomIndex = Math.floor( Math.random() * Game.players.length )
            return [ Game.players[ randomIndex ] ]
        }
        case ":admins": {
            let _admins = []
            for (let ids of admins) {
                let user = Game.players.find(v => v.userId === ids)
                if (!user) continue
                _admins.push(user)
            }
            return _admins
        }
        case ":nonadmins": {
            let nonAdmins = []
            for (let players of Game.players) {
                if (admins.includes(players.userId)) continue
                nonAdmins.push(players)
            }
            return nonAdmins
        }
        case String(args.match(teamRegex)): {
            let match = String(args.match(teamRegex)).toLowerCase()

            let teamName = match.split(":")[1]

            if (!world.teams.find(n => n.name.toLowerCase().indexOf(teamName) === 0) || !world.teams.length) {
                caller.message(V2("Team was not found."))
                return []
            }
                
            let members = []

            for (let players of Game.players) {
                if (!players.team) continue
                if (players.team.name.toLowerCase().indexOf(teamName) === 0) {
                    members.push(players)
                }
            }

            return members
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
        caller.message(V2("User was not found."))
        return []
    }
}

function V2(message) {
    return `[#ff0000][V2]: [#ffffff]${message}`
}

function loadCommands(cmd,cb) {
    return Game.commands(cmd, isAdmin, (caller, args) => {
        cb(caller, args)
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

function playerStats(player) {
    return {
        "speed":player.speed,
        "jump":player.jumpPower,
    }
}

async function smite(player) {
    let endOffset = 0.5
    let speed = playerStats(player).speed

    let lightning = new Brick(new Vector3(
        player.position.x - endOffset,
        player.position.y - endOffset,
        0
    ), new Vector3(1, 1, 1000), "#e3f542")

    lightning.setCollision( false )

    await player.setSpeed(0)
    player.setHealth(player.health - 50)
    Game.newBrick(lightning)

    await sleep(500)

    lightning.destroy()
    player.setSpeed(speed)
}

async function jail(player) {
    const middleOffset = 0.2
    const endOffset = 2.5
    const topOffset = 7
    
    await player.setSpeed(0)
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
        player.loopKill = false

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
                return admins.splice(admins.indexOf( victim.userId ))
            }

            victim.message( V2( `You were given admin by [#ff0000]${caller.username}[#ffffff].` ) )
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
        let match = parseCommand(caller, args)
        
        if (!match) return

        let user = match[0]
        let speed = Number(match[1])

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setSpeed(speed)
        })
    },
    jump: (caller, args) => {
        let match = parseCommand(caller, args)
        
        if (!match) return
        
        let user = match[0]
        let jumpPower = Number(match[1])

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setJumpPower(jumpPower)
        })
    },
    [["size","scale"]]: (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match) return

        let user = match[0]
        let scale = match[1].split(",")

        if (scale.length === 2 || scale.length > 3) return

        for (let num of scale) {
            if (isNaN( num )) return
        }

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
            Game.setEnvironment({
                weather: args
            })
        } catch{}
    },
    freeze: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            freeze(caller, victim)
        })
    },
    thaw: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(async victim => { // thaw as function?
            if (!victim.frozen) return
            await victim.setAvatar(victim.userId)
            victim.setSpeed(4)
            victim.setJumpPower(5)
            victim.message(V2( `You were thawed by ${caller.username}.` ))
        })
    },
    balloon: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            newBalloon(victim)
        })
    },
    ambient: (_, args) => {
        try {
            Game.setEnvironment({
                ambient: args
            })
        } catch {}
    },
    sky: (_, args) => {
        try {
            Game.setEnvironment({
                skyColor: args
            })
        } catch {}
    },
    cyclops: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            cyclops(victim)
        })
    },
    weed: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            weedify(victim)
        })
    },
    zombie: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            zombie(victim)
        })
    },
    basil: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            basil(victim)
        })
    },
    creeper: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            creeper(victim)
        })
    },
    snowman: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            snowman(victim)
        })
    },
    jail: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            if (jailBricks[ victim.userId ]) return 
            jail( victim )
            caller.message(V2( `You jailed ${victim.username}.` ))
        })
    },
    free: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            if (!jailBricks[ victim.userId ]) return
            free( victim )
            caller.message(V2( `You freed ${victim.username}.` ))
        })
    },
    [["broadcast","b"]]: (caller, args) => {
        Game.topPrintAll(`[#ff0000]${caller.username}: [#ffffff]${args}`, 5)
    },
    hat: (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match) return

        let user = match[0]
        let hatId = Number(match[1])

        if (!hatId) return

        getPlayersFromCommand(caller, user).forEach(victim => {
            new Outfit(victim)
            .hat1(hatId)
            .set()
        })
    },
    reset: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            reset(victim) 
        })
    },
    tool: (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match) return

        let user = match[0]
        let toolId = Number(match[1])

        if (!toolId) return

        getPlayersFromCommand(caller, user).forEach(victim => {
            let tool = new Tool("Tool")
            tool.model = toolId
            victim.equipTool(tool)
        })
    },
    wand: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            newWand(victim)
        })
    },
    [["greset","gr"]]: () => {
        Game.setEnvironment({
            ambient: "0",
            skyColor: "#71b1e6"
        })
    },
    team: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match) return

        let user = match[1] && match[1].trim()
        let name = match[2]
        let checkTeam = world.teams.find(n => n.name.toLowerCase() === name.toLowerCase())

        let team = (checkTeam) ? checkTeam : new Team(name) // random colors

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setTeam(team)
        })

    },
    [["av","avatar"]]: (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match) return

        let user = match[0]
        let target = match[1]

        getPlayersFromCommand(caller, user).forEach(async victim => {
            if (isNaN(Number( target ))) {
                let userTarget = getPlayersFromCommand(caller, target)[0]
                await victim.setAvatar( userTarget.userId )
            } else {
                await victim.setAvatar( Number( target ) )
            }
        })
    },
    score: (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match) return

        let user = match[0]
        let amount = match[1]

        if (isNaN( amount )) return

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setScore( amount )
        })

    },
    smite: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            smite( victim )
        })
    },
    eval: (caller,args) => {
        try {
            eval(args)
            caller.message(`[#00ff00][Success]: [#ffffff]Code was executed.`)
        } catch(err) {
            caller.message(`[#ff0000][Error]: [#ffffff]${err}.`)
        }
    },
    shutdown: () => {
        Game.shutdown()
    },
    heal: (caller, args) => {
        let match = parseCommand(caller,args)

        if (!match) return

        let user = match[0]
        let amount = match[1]

        if (isNaN(amount)) return

        getPlayersFromCommand(caller,user).forEach(victim => {
            heal(victim, amount)
        })
    },
    damage: (caller, args) => {
        let match = parseCommand(caller,args)

        if (!match) return

        let user = match[0]
        let amount = match[1]

        if (isNaN(amount)) return

        getPlayersFromCommand(caller,user).forEach(victim => {
            damage(victim, amount)
        })
    },
    loopkill: (caller,args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            loopkill(victim)
        })
    },
    btools: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            btools(victim)
        })
    },
    admins: (caller, _) => {
        let currentAdmins = []
        for (let ids of admins) {
            let admin = Game.players.find(v => v.userId === ids)
            if (!admin) continue
            currentAdmins.push(` ${admin.username}`)
        }
        caller.message(`[#ff0000][Admins]:[#ffffff]${String(currentAdmins)}`)
    },
    speech: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match) return

        let user = match[1] && match[1].trim()
        let reason = match[2]


        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.setSpeech(reason)
        })
    },
    respawn: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            victim.respawn()
        })
    }
}

Game.setMaxListeners(100)

for (let cmds of Object.keys(commands)) {
    loadCommands(cmds.split(","),commands[cmds])
}