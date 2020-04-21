import { ICustomAction } from "./interfaces"

const CUSTOMACTIONS: Array<ICustomAction> = [
    {
        internal_name: "worker_to_mins",
        name: "Stop mine gas",
        imageSource: "icon-mineral-nobg.png",
        duration: 21,
    },
    {
        internal_name: "worker_to_gas",
        name: "Mine gas",
        imageSource: "icon-gas-terran-nobg.png",
        duration: 21,
    },
    {
        internal_name: "3worker_to_gas",
        name: "3x Mine gas",
        imageSource: "icon-gas-protoss-nobg.png",
        duration: 21,
    },
    {
        internal_name: "worker_to_scout",
        name: "Worker scout",
        imageSource: "ui-editoricon-data_types_movers.png",
        duration: 10,
    },
    {
        internal_name: "worker_from_scout",
        name: "Return scout",
        imageSource: "ui-editoricon-previewer_rotateleft.png",
        duration: 10,
    },
    {
        internal_name: "do_nothing_1_sec",
        name: "Wait 1sec",
        imageSource: "icon-time-terran.png",
        duration: 16,
    },
    {
        internal_name: "do_nothing_5_sec",
        name: "Wait 5secs",
        imageSource: "icon-time-zerg.png",
        duration: 17,
    },
    // Terran
    {
        internal_name: "call_down_mule",
        name: "Call down MULE",
        imageSource: "btn-unit-terran-mule.png",
        duration: 71,
        race: "terran",
    },
    {
        internal_name: "call_down_supply",
        name: "Call down supply",
        imageSource: "btn-ability-terran-calldownextrasupplies-color.png",
        duration: 25,
        race: "terran",
    },
    {
        internal_name: "attach_barracks_to_free_techlab",
        name: "Barracks to free Techlab",
        imageSource: "btn-building-terran-barracks.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "attach_barracks_to_free_reactor",
        name: "Barracks to free Reactor",
        imageSource: "btn-building-terran-barracksmengsk.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "attach_factory_to_free_techlab",
        name: "Factory to free Techlab",
        imageSource: "btn-building-terran-factory.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "attach_factory_to_free_reactor",
        name: "Factory to free Reactor",
        imageSource: "btn-building-terran-factorymengsk.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "attach_starport_to_free_techlab",
        name: "Starport to free Techlab",
        imageSource: "btn-building-terran-starport.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "attach_starport_to_free_reactor",
        name: "Starport to free Reactor",
        imageSource: "btn-building-terran-starportmengsk.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_barracks_from_techlab",
        name: "Lift Barracks from Techlab",
        imageSource: "btn-building-nova-barracks.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_barracks_from_reactor",
        name: "Lift Barracks from Reactor",
        imageSource: "btn-building-stukov-infestedbarracks.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_factory_from_techlab",
        name: "Lift Factory from Techlab",
        imageSource: "btn-building-terran-factory-covertops.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_factory_from_reactor",
        name: "Lift Factory from Reactor",
        imageSource: "btn-building-terran-factorymengsk.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_starport_from_techlab",
        name: "Lift Starport from Techlab",
        imageSource: "btn-building-nova-starport.png",
        duration: 40,
        race: "terran",
    },
    {
        internal_name: "dettach_starport_from_reactor",
        name: "Lift Starport from Reactor",
        imageSource: "btn-building-stukov-infestedstarport.png",
        duration: 40,
        race: "terran",
    },
    // {
    //     internal_name: "salvage_bunker",
    //     name: "Salvage Bunker",
    //     imageSource: "btn-building-stukov-infestedstarport.png",
    //     duration: 3,
    // },

    // Protoss
    {
        // TODO chrono other buildings: gate, warpgate, forge, cybercore, twilight, stargate, fleet beacon, robo, robo bay
        internal_name: "chronoboost_busy_nexus",
        name: "Chrono Nexus",
        imageSource: "btn-ability-spearofadun-chronosurge.png",
        duration: 20,
        race: "protoss",
    },
    {
        internal_name: "chronoboost_busy_gateway",
        name: "Chrono Gateway",
        imageSource: "btn-ability-spearofadun-chronosurge.png",
        duration: 20,
        race: "protoss",
    },
    {
        internal_name: "chronoboost_busy_warpgate",
        name: "Chrono Warpgate",
        imageSource: "btn-ability-spearofadun-chronosurge.png",
        duration: 20,
        race: "protoss",
    },
    {
        internal_name: "chronoboost_busy_cybercore",
        name: "Chrono Cybernetics Core",
        imageSource: "btn-ability-spearofadun-chronosurge.png",
        duration: 20,
        race: "protoss",
    },
    {
        internal_name: "chronoboost_busy_forge",
        name: "Chrono Forge",
        imageSource: "btn-ability-spearofadun-chronosurge.png",
        duration: 20,
        race: "protoss",
    },
    {
        internal_name: "convert_gateway_to_warpgate",
        name: "Gate to Warpgate",
        imageSource: "btn-building-protoss-warpgate.png",
        duration: 30,
        race: "protoss",
    },
    {
        internal_name: "convert_warpgate_to_gateway",
        name: "Warpgate to Gate",
        imageSource: "btn-building-protoss-gateway.png",
        duration: 30,
        race: "protoss",
    },
    {
        internal_name: "morph_archon_from_ht_ht",
        name: "Morph Archon HT+HT",
        imageSource: "btn-unit-protoss-archon.png",
        duration: 9,
        race: "protoss",
    },
    {
        internal_name: "morph_archon_from_dt_dt",
        name: "Morph Archon DT+DT",
        imageSource: "btn-unit-protoss-archon.png",
        duration: 9,
        race: "protoss",
    },
    {
        internal_name: "morph_archon_from_ht_dt",
        name: "Morph Archon HT+DT",
        imageSource: "btn-unit-protoss-archon.png",
        duration: 9,
        race: "protoss",
    },
    // Zerg
    {
        internal_name: "inject",
        name: "Inject",
        imageSource: "btn-unit-zerg-larva.png",
        duration: 29,
        race: "zerg",
    },
    {
        internal_name: "creep_tumor",
        name: "Creep Tumor",
        imageSource: "btn-building-zerg-creeptumor.png",
        duration: 11,
        race: "zerg",
    },
]

// Create an object with customaction.name as key and the action as value for quick lookup
const CUSTOMACTIONS_BY_NAME: { [name: string]: ICustomAction } = {}
CUSTOMACTIONS.forEach((customAction) => {
    // console.log(customAction);
    CUSTOMACTIONS_BY_NAME[customAction.name] = customAction
    // Load image from path
    // customAction["image"] = require(`../icons/png/${customAction.path}`)
})

// console.log(CUSTOMACTIONS);

export { CUSTOMACTIONS, CUSTOMACTIONS_BY_NAME }
