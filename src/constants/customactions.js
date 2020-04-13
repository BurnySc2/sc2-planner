const CUSTOMACTIONS = {
    all: [
        {   
            internal_name: "worker_to_mins",
            name: "Stop gas",
            path: "icon-mineral-nobg.png",
            duration: 5,
        },
        {   
            internal_name: "worker_to_gas",
            name: "Mine gas",
            path: "icon-gas-terran-nobg.png",
            duration: 5,
        },
        {   
            internal_name: "3worker_to_gas",
            name: "3x Mine gas",
            path: "icon-gas-protoss-nobg.png",
            duration: 5,
        },
        {   
            internal_name: "worker_to_scout",
            name: "Worker scout",
            path: "ui-editoricon-data_types_movers.png",
            duration: 3,
        },
        {   
            internal_name: "worker_from_scout",
            name: "Return scout",
            path: "ui-editoricon-previewer_rotateleft.png",
            duration: 3,
        },
        {   
            internal_name: "do_nothing_1_sec",
            name: "Wait",
            path: "icon-time-terran.png",
            duration: 1,
        },
        {   
            internal_name: "do_nothing_5_sec",
            name: "Wait 5secs",
            path: "icon-time-zerg.png",
            duration: 5,
        },
    ],
    terran: [
        {   
            internal_name: "call_down_mule",
            name: "Call down MULE",
            path: "btn-unit-terran-mule.png",
            duration: 71,
        },
        {   
            internal_name: "call_down_supply",
            name: "Call down supply",
            path: "btn-ability-terran-calldownextrasupplies-color.png",
            duration: 10,
        },
        {   
            internal_name: "attach_barracks_to_free_techlab",
            name: "Barracks to free Techlab",
            path: "btn-building-terran-barracks.png",
            duration: 3,
        },
        {   
            internal_name: "attach_barracks_to_free_reactor",
            name: "Barracks to free Reactor",
            path: "btn-building-terran-barracksmengsk.png",
            duration: 3,
        },
        {   
            internal_name: "attach_factory_to_free_techlab",
            name: "Factory to free Techlab",
            path: "btn-building-terran-factory.png",
            duration: 3,
        },
        {   
            internal_name: "attach_factory_to_free_reactor",
            name: "Factory to free Reactor",
            path: "btn-building-terran-factorymengsk.png",
            duration: 3,
        },
        {   
            internal_name: "attach_starport_to_free_techlab",
            name: "Starport to free Techlab",
            path: "btn-building-terran-starport.png",
            duration: 3,
        },
        {   
            internal_name: "attach_starport_to_free_reactor",
            name: "Starport to free Reactor",
            path: "btn-building-terran-starportmengsk.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_barracks_from_techlab",
            name: "Lift Barracks from Techlab",
            path: "btn-building-nova-barracks.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_barracks_from_reactor",
            name: "Lift Barracks from Reactor",
            path: "btn-building-stukov-infestedbarracks.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_factory_from_techlab",
            name: "Lift Factory from Techlab",
            path: "btn-building-terran-factory-covertops.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_factory_from_reactor",
            name: "Lift Factory from Reactor",
            path: "btn-building-terran-factorymengsk.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_starport_from_techlab",
            name: "Lift Starport from Techlab",
            path: "btn-building-nova-starport.png",
            duration: 3,
        },
        {   
            internal_name: "dettach_starport_from_reactor",
            name: "Lift Starport from Reactor",
            path: "btn-building-stukov-infestedstarport.png",
            duration: 3,
        },
        // {   
        //     internal_name: "salvage_bunker",
        //     name: "Salvage Bunker",
        //     path: "btn-building-stukov-infestedstarport.png",
        //     duration: 3,
        // },

    ],
    protoss: [
        {   
            // TODO chrono other buildings: gate, warpgate, forge, cybercore, twilight, stargate, fleet beacon, robo, robo bay
            // Perhaps use drag and drop to select which to target? select event which is connected to task start and unit id which executes that task, then from game logic try to chrono that unit 
            internal_name: "chrono_nexus",
            name: "Chrono Nexus",
            path: "btn-ability-spearofadun-chronosurge.png",
            duration: 20,
        },
        {   
            internal_name: "convert_gateway_to_warpgate",
            name: "Gate to Warpgate",
            path: "btn-building-protoss-warpgate.png",
            duration: 7,
        },
        {   
            internal_name: "convert_warpgate_to_gateway",
            name: "Warpgate to Gate",
            path: "btn-building-protoss-gateway.png",
            duration: 7,
        },
        {   
            internal_name: "morph_archon_from_dt_dt",
            name: "Morph Archon HT+HT",
            path: "btn-unit-protoss-archon.png",
            duration: 9,
        },
        {   
            internal_name: "morph_archon_from_dt_dt",
            name: "Morph Archon DT+DT",
            path: "btn-unit-protoss-archon.png",
            duration: 9,
        },
        {   
            internal_name: "morph_archon_from_ht_dt",
            name: "Morph Archon HT+DT",
            path: "btn-unit-protoss-archon.png",
            duration: 9,
        },
    ],
    zerg: [
        {   
            internal_name: "inject",
            name: "Inject",
            path: "btn-unit-zerg-larva.png",
            duration: 29,
        },
        {   
            internal_name: "creep_tumor",
            name: "Creep Tumor",
            path: "btn-building-zerg-creeptumor.png",
            duration: 11,
        },
    ],
}

// Create an object with customaction.name as key and the action as value for quick lookup
const CUSTOMACTIONS_BY_NAME = {}
Object.keys(CUSTOMACTIONS).forEach((race) => {
    CUSTOMACTIONS[race].forEach((customAction) => {
        CUSTOMACTIONS_BY_NAME[customAction.name] = customAction
        // Load image from path
        customAction["image"] = require(`../icons/png/${customAction.path}`)
    })
})

export {CUSTOMACTIONS, CUSTOMACTIONS_BY_NAME}