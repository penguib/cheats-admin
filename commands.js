//--------------------------------------------Properties--------------------------------------------\\                           

const admins = [1,127118], // Your id here!
      banned = [], // Add your foes' ids here!
      allowEval = false, // Set to true if you want to use /eval *this is an unsafe command*
      maxScale = 10,
      minScale = 0.1,
      maxBrickSize = 5,
      minBrickSize = 1,
      audit = true,
      immunity = true, // immunes the owner/original admins from ban, kick, and admin
      safeCommands = true; // disables shutdown, ban, kick, loopkill, unless you are the owner

//--------------------------------------------------------------------------------------------------\\


const jailBricks = {},
      regexMatch = /([^"]+)(?:\"([^\"]+)\"+)?/,
      teamRegex = /t\:[^\:]+\:/,
      hexRegex = /^#[0-9A-F]{6}$/i,
      angle = -57.7,
      _admins = [...admins],
      phin = require("phin").defaults({parse: "json"}),
      itemAPI = "https://api.brick-hill.com/v1/shop/item?id=";

let auditTarget = null;

function _safeCommands(caller) {
    if (safeCommands) {
        if (!_admins.includes(caller.userId)) return false
        return true
    }
    return true
}

function checkOwner(player) {
    if (immunity) {
        if (_admins.includes(player.userId)) return true
        return false
    }
    return false
}

async function checkTool(caller, id) {

    let data

    try {
        data = await phin(itemAPI + id)
      } catch (err) {
        return caller.message(V2("Error fetching item."))
      }

    if (data.body.type_id !== 3)
        return caller.message(V2("Item must be a tool."))
    
    return {
        name: data.body.name,
        id: data.body.id
    }
}

function isAdmin(player, args, next) {
    if (!admins.includes(player.userId)) return
    next(player, args)
}

function levitate(player) {
    let brick = new Brick(new Vector3(), new Vector3(3, 3, 1))
    player.lev = false
    brick.setVisibility(0)
    player.newBrick(brick)

    player.setSpeed(0)
    player.setJumpPower(0)

    brick.setInterval(() => {
        if (player.lev) {
            player.setSpeed(0)
            player.setJumpPower(0)
            return brick.destroy()
        }
        rotx = Math.round(player.position.x + 1 * Math.sin(player.rotation.z / angle)),
        roty = Math.round(player.position.y - 1 * Math.cos(player.rotation.z / angle));
        brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5), roty -= Math.round(brick.scale.x /1.5), player.position.z))
    }, 10);
}

function carpet(p) {
    let carpet = new Tool("Magic carpet"),
        unequipped = false;

    p.setSpeed(10)

    carpet.equipped(player => {
        let brick = new Brick(new Vector3(), new Vector3(7, 5, 0.5), "#ff0000")
        unequipped = false
        Game.newBrick(brick)

        brick.setInterval(() => {
            if (unequipped) return brick.destroy()

            rotx = Math.round(player.position.x + 1 * Math.sin(player.rotation.z / angle))
            roty = Math.round(player.position.y - 1 * Math.cos(player.rotation.z / angle))
            
            brick.setPosition(new Vector3(rotx -= Math.round(brick.scale.x /1.5), (roty -= Math.round(brick.scale.x /1.5)) + 2.5, player.position.z - 0.5))
        }, 10)
            
          
    })

    carpet.unequipped(() => {
        unequipped = true
    })

    p.addTool(carpet)
}

function btools(player) {
    let brickSize = minBrickSize,
        unequipped = false,
        offset = Math.round(brickSize/1.5),
        offsetPlacement = 7,
        brickColor = "#ff0000";

    let create = new Tool("Create")
    create.model = 20681

    create.on("activated", async p => {
        let rotx = Math.round(p.position.x + offsetPlacement * Math.sin(p.rotation.z / angle)),
            roty = Math.round(p.position.y - offsetPlacement * Math.cos(p.rotation.z / angle));
        let brick = new Brick(new Vector3(
            rotx -= offset, 
            roty -= offset, 
            player.position.z),new Vector3(brickSize, brickSize, brickSize), brickColor)
        brick.name = "btools"
        await Game.newBrick(brick)
    })

    create.equipped(player => {
        let brick = new Brick(new Vector3(), new Vector3(1, 1, 1))
        unequipped = false
        brick.setVisibility(0.5)
        player.newBrick(brick)
        brick.setInterval(() => {
            if (unequipped) return brick.destroy()

            rotx = Math.round(player.position.x + offsetPlacement * Math.sin(player.rotation.z / angle)),
            roty = Math.round(player.position.y - offsetPlacement * Math.cos(player.rotation.z / angle));
            brick.setScale(new Vector3(brickSize, brickSize, brickSize))
            brick.setPosition(new Vector3(rotx -= offset, roty -= offset, player.position.z))
            brick.setColor(brickColor)          
        }, 10);
    })

    create.unequipped(() => {
        unequipped = true
    })
    
    let destroy = new Tool("Destroy")
    destroy.model = 6928

    destroy.on("activated", p => {
        for (let bricks of world.bricks) {
            if (Game.pointDistance3D(p.position, bricks.position) <= 10 && bricks.name === "btools") {
                return bricks.destroy()
            }
        }
    })

    let sizeInc = new Tool("Size+")
    sizeInc.model = 25568

    sizeInc.on("activated", p => {
        if (brickSize >= maxBrickSize) {
            brickSize = maxBrickSize
            return p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${brickSize}.`)
        }
        brickSize++
        p.message(`[#00ff00][Size]: [#ffffff]You increased the brick size to ${brickSize}.`)
    })

    let sizeDec = new Tool("Size-")
    sizeDec.model = 25568

    sizeDec.on("activated", p => {
        if (brickSize <= minBrickSize) {
            brickSize = minBrickSize
            return p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${brickSize}.`)
        }
            brickSize--
            p.message(`[#ff0000][Size]: [#ffffff]You decreased the brick size to ${brickSize}.`)
    })

    let color = new Tool("Color")

    color.on("activated", p => {
        brickColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        p.message(`[#ff0000][V2]: [${brickColor}]Your brick color now looks like this.`)
    })
    
    player.addTool(create)
    player.addTool(destroy)
    player.addTool(sizeInc)
    player.addTool(sizeDec)
    player.addTool(color)
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
            auditTarget = ":me"
            return [ caller ]
        }
        case ":all": {
            auditTarget = ":all"
            return Game.players
        }
        case ":others": {
            let others = []
            for (let player of Game.players) {
                if (player !== caller)
                    others.push(player)
            }

            auditTarget = ":others"
            return others
        }
        case ":random": {
            let randomIndex = Math.floor( Math.random() * Game.players.length )
            let victim = Game.players[ randomIndex ]

            auditTarget = victim.username
            return [ victim ]
        }
        case ":admins": {
            let _admins = []
            for (let ids of admins) {
                let user = Game.players.find(v => v.userId === ids)
                if (!user) continue
                _admins.push(user)
            }
            auditTarget = ":admins"
            return _admins
        }
        case ":nonadmins": {
            let nonAdmins = []
            for (let players of Game.players) {
                if (admins.includes(players.userId)) continue
                nonAdmins.push(players)
            }

            auditTarget = ":nonadmins"
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

            auditTarget = "Team: " + teamName
            return members
        }
        default: {
            args = args.toLowerCase()
            for (let player of Game.players) {
                if (player.username.toLowerCase().indexOf(args) === 0) {
                    const victim = Game.players.find(v => v.username === player.username)
                    auditTarget = victim.username
                    return [ victim ]
                }
            }
        }
        caller.message(V2("User or value is not valid."))
        return []
    }
}

function V2(message) {
    return `[#ff0000][V2]: [#ffffff]${message}`
}

function cmdAudit(caller, cmd) {
    if (!audit) return

    let revisedStr = String(cmd).replace(",","/")
    let data = [{ Username: caller.username, UserId: caller.userId, Command: revisedStr, Target: auditTarget }]

    console.table(data)

    auditTarget = null
}

function loadCommands(cmd,cb) {
    return Game.commands(cmd, isAdmin, (caller, args) => {
        cb(caller, args)
        cmdAudit(caller, cmd)
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
        if (jailBricks[p.userId] || p.frozen) return
        p.setJumpPower(12)
    })
    balloon.unequipped(p => {
        if (jailBricks[p.userId] || p.frozen) return
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
        lightning.name = "lightning"

    await player.setSpeed(0)
    player.setHealth(player.health - 50)

    Game.newBrick(lightning)

    await sleep(300)
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

        player.message(V2("This server uses Cheats' V2 Commands."))

        player.on("died", () => {
            if (jailBricks[player.userId]) free(player)
        })

        player.frozen = false
        player.loopKill = false
        player.hex = null
        player.lev = false

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

Game.on("chat", (player, message) => {
    if (!player.hex && !player.admin)
        return Game.messageAll(`[#ffde0a]${player.username}\\c1:\\c0 ` + message)
    if (!player.hex && player.admin)
        return Game.messageAll(`[#ffde0a]${player.username}\\c1:\\c0 [#ffde0a]` + message)
    
    Game.messageAll(`[#ffde0a]${player.username}\\c1:[${player.hex}] ` + message)
})

const commands = {
    kill: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach((victim) => {
            victim.kill()
        })
    },
    kick: (caller, args) => {
        if (!_safeCommands(caller)) return

        let match = args.match(regexMatch)

        if (!match || !match[1]) return

        let user = match[1] && match[1].trim()
        let reason = match[2]

        getPlayersFromCommand(caller, user).forEach((victim) => {
            if (checkOwner(victim)) return
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
        if (!_safeCommands(caller)) return

        let match = args.match(regexMatch)

        if (!match || !match[1]) return

        let user = match[1] && match[1].trim()
        let reason = (match[2]) ? match[2] : "You are banned from this server."

        getPlayersFromCommand(caller, user).forEach(victim => {
            if (checkOwner(victim)) return
            banned.push(victim.userId)
            caller.message( V2( `You banned [#ff0000]${victim.username}[#ffffff].` ) )
            victim.kick(reason)
        })
    },
    unban: (_, args) => {
        let id = Number(args)

        if (isNaN(id)) return
        if (!banned.includes(id)) return V2("This player is not banned.")

        let index = banned.indexOf(id)

        if (index > -1) 
            index.splice(index, 1) 

    },
    admin: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            if (checkOwner(victim)) return
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
        let match = parseCommand(caller, args)

        if (!match || !match[1]) return

        let user = match[0] && match[0].trim()
        let coords = match[1].split(",")

        getPlayersFromCommand(caller, user).forEach(victim => {
            let target = (coords.length === 3 && coords[2]) ? coords : getPlayersFromCommand(caller, String(coords))[0]
            if (Array.isArray(target)) {
                if (target.length < 3) return

                victim.setPosition(new Vector3(
                    Number(coords[0]),
                    Number(coords[1]),
                    Number(coords[2])
                ))
            } else {
                if (!target) return
                victim.setPosition( target.position )
            }
        })
    },
    speed: (caller, args) => {
        let match = parseCommand(caller, args)
        
        if (!match || !match[1]) return

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

        if (!match || !match[1]) return

        let user = match[0]
        let scale = match[1].split(",")

        if (scale.length === 2 || scale.length > 3) return

        for (let num in scale) {
            if (isNaN( scale[num] )) return
            if (scale[num] >= maxScale)
                scale[num] = maxScale
            if (scale[num] <= minScale)
                scale[num] = minScale
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
    [["thaw","unfreeze"]]: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(async victim => { // thaw as function?
            if (!victim.frozen) return
            await victim.setAvatar(victim.userId)
            victim.setSpeed(4)
            victim.setJumpPower(5)
            victim.frozen = false
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
    [["free","unjail"]]: (caller, args) => {
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

        if (!match || !match[1]) return

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
    tool: async (caller, args) => {
        let match = parseCommand(caller, args)

        if (!match || !match[1]) return

        let user = match[0]
        let toolId = Number(match[1])

        if (!toolId) return

        let data;

        try {
            data = await checkTool(caller, toolId)
        } catch {}



        getPlayersFromCommand(caller, user).forEach(victim => {
            let tool = new Tool("Tool")
            tool.model = data.id
            tool.name = data.name
            victim.equipTool(tool)
        })
    },
    wand: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            newWand(victim)
        })
    },
    [["greset","gr"]]: async (caller) => {

        let bricksMatched = []
        for (let bricks of world.bricks) {
            if (bricks.name === "btools") 
                bricksMatched.push(bricks)
        }

        caller.message(V2(`Cleared ${bricksMatched.length} bricks.`))

        for (let bricks of bricksMatched) {
            bricks.destroy()
        }

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

        if (!match || !match[1]) return

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

        if (!match || !match[1]) return

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
            victim.message(V2(`You were smited by the gods above.`))
        })
    },
    eval: (caller,args) => {
        if (!allowEval) return

        try {
            eval(args)
            caller.message(`[#00ff00][Success]: [#ffffff]Code was executed.`)
        } catch(err) {
            caller.message(`[#ff0000][Error]: [#ffffff]${err}.`)
        }
    },
    shutdown: (caller) => {
        if (!_safeCommands(caller)) return

        Game.shutdown()
    },
    heal: (caller, args) => {
        let match = parseCommand(caller,args)

        if (!match || !match[1]) return

        let user = match[0]
        let amount = match[1]

        if (isNaN(amount)) return

        getPlayersFromCommand(caller,user).forEach(victim => {
            heal(victim, amount)
        })
    },
    damage: (caller, args) => {
        let match = parseCommand(caller,args)

        if (!match || !match[1]) return

        let user = match[0]
        let amount = match[1]

        if (isNaN(amount)) return

        getPlayersFromCommand(caller,user).forEach(victim => {
            damage(victim, amount)
        })
    },
    loopkill: (caller,args) => {
        if (!_safeCommands(caller)) return

        getPlayersFromCommand(caller, args).forEach(victim => {
            loopkill(victim)
        })
    },
    btools: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            btools(victim)
        })
    },
    admins: (caller) => {
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

        if (!match || !match[1]) return

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
    },
    color: (caller, args) => {
        let match = args.match(regexMatch)

        if (!match || !match[1]) return

        let user = match[1] && match[1].trim()
        let hex = match[2]

        if (!hex) return

        let check = (hex.split("")[0] === "#") ? hex : "#" + hex

        if (!hexRegex.test(check)) return caller.message(V2("Not a valid hex color (aabbcc)."))

        getPlayersFromCommand(caller, user).forEach(victim => {
            victim.hex = check
            victim.message(`[#ff0000][V2]: [${check}]Your text color now looks like this.`)
        })
    },
    god: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            victim.setHealth(Number.MAX_SAFE_INTEGER)
            victim.message(V2("You now have the health of the gods."))
        })
    },
    carpet: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            carpet(victim)
        })
    },
    [["levitate","lev"]]: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            levitate(victim)
        })
    },
    [["descend", "dec"]]: (caller, args) => {
        getPlayersFromCommand(caller, args).forEach(victim => {
            victim.lev = true
        })
    }
}


Game.setMaxListeners(100)

for (let cmds of Object.keys(commands)) {
    loadCommands(cmds.split(","),commands[cmds])
}