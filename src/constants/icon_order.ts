import { IDataUnit, IDataUpgrade } from "./interfaces"

const unitPriority: { [name: string]: number } = {
    // Protoss
    Probe: 1,
    Zealot: 2,
    Adept: 3,
    Stalker: 4,
    Sentry: 5,
    HighTemplar: 6,
    DarkTemplar: 7,
    Observer: 8,
    Immortal: 10,
    WarpPrism: 9,
    Colossus: 11,
    Disruptor: 12,
    Phoenix: 13,
    Oracle: 14,
    VoidRay: 15,
    Carrier: 16,
    Tempest: 17,
    Mothership: 18,

    // Terran
    SCV: 1,
    Reaper: 2,
    Marine: 3,
    Marauder: 4,
    Ghost: 5,
    Hellion: 6,
    HellionTank: 7,
    WidowMine: 8,
    Cyclone: 9,
    SiegeTank: 10,
    Thor: 11,
    VikingFighter: 12,
    Medivac: 13,
    Liberator: 14,
    Banshee: 15,
    Raven: 16,
    Battlecruiser: 17,

    // Zerg
    Drone: 1,
    Overlord: 2,
    Queen: 3,
    Zergling: 4,
    Baneling: 5,
    Roach: 6,
    Ravager: 7,
    Overseer: 8,
    Hydralisk: 9,
    LurkerMP: 10,
    SwarmHostMP: 11,
    Infestor: 12,
    Ultralisk: 13,
    Mutalisk: 14,
    Corruptor: 15,
    BroodLord: 16,
    Viper: 17,
}

const structurePriority: { [name: string]: number } = {
    // Protoss
    Nexus: 1,
    Pylon: 2,
    Assimilator: 3,
    Gateway: 4,
    CyberneticsCore: 5,
    Forge: 6,
    ShieldBattery: 7,
    TwilightCouncil: 9,
    PhotonCannon: 8,
    TemplarArchive: 10,
    DarkShrine: 11,
    RoboticsFacility: 12,
    Stargate: 14,
    RoboticsBay: 13,
    FleetBeacon: 15,

    // Terran
    CommandCenter: 1,
    OrbitalCommand: 2,
    PlanetaryFortress: 3,
    SupplyDepot: 4,
    Refinery: 5,
    Barracks: 6,
    BarracksTechLab: 7,
    BarracksReactor: 8,
    Factory: 10,
    FactoryTechLab: 11,
    FactoryReactor: 12,
    Starport: 13,
    StarportTechLab: 14,
    StarportReactor: 15,
    EngineeringBay: 20,
    Armory: 22,
    Bunker: 25,
    GhostAcademy: 26,
    FusionCore: 28,
    SensorTower: 21,
    MissileTurret: 20,

    // Zerg
    Hatchery: 1,
    Lair: 2,
    Hive: 3,
    Extractor: 4,
    SpawningPool: 5,
    EvolutionChamber: 6,
    RoachWarren: 8,
    BanelingNest: 7,
    SpineCrawler: 9,
    SporeCrawler: 10,
    HydraliskDen: 11,
    LurkerDenMP: 12,
    NydusNetwork: 13,
    InfestationPit: 14,
    UltraliskCavern: 17,
    Spire: 19,
    GreaterSpire: 20,
}

const upgradePriority: { [name: string]: number } = {
    // Protoss
    ProtossGroundWeaponsLevel1: 2,
    ProtossGroundWeaponsLevel2: 3,
    ProtossGroundWeaponsLevel3: 4,
    ProtossGroundArmorsLevel1: 5,
    ProtossGroundArmorsLevel2: 6,
    ProtossGroundArmorsLevel3: 7,
    ProtossShieldsLevel1: 8,
    ProtossShieldsLevel2: 9,
    ProtossShieldsLevel3: 10,
    ObserverGraviticBooster: 20,
    GraviticDrive: 21,
    ExtendedThermalLance: 22,
    PsiStormTech: 23,
    ProtossAirWeaponsLevel1: 11,
    ProtossAirWeaponsLevel2: 12,
    ProtossAirWeaponsLevel3: 13,
    ProtossAirArmorsLevel1: 14,
    ProtossAirArmorsLevel2: 15,
    ProtossAirArmorsLevel3: 16,
    WarpGateResearch: 1,
    Charge: 17,
    BlinkTech: 18,
    PhoenixRangeUpgrade: 24,
    AdeptPiercingAttack: 19,
    DarkTemplarBlinkUpgrade: 27,
    VoidRaySpeedUpgrade: 25,
    TempestGroundAttackUpgrade: 26,

    // Terran
    HiSecAutoTracking: 60,
    TerranBuildingArmor: 61,
    TerranInfantryWeaponsLevel1: 4,
    TerranInfantryWeaponsLevel2: 5,
    TerranInfantryWeaponsLevel3: 6,
    TerranInfantryArmorsLevel1: 7,
    TerranInfantryArmorsLevel2: 8,
    TerranInfantryArmorsLevel3: 9,
    Stimpack: 20,
    ShieldWall: 21,
    PunisherGrenades: 22,
    HighCapacityBarrels: 30,
    BansheeCloak: 40,
    RavenCorvidReactor: 43,
    DurableMaterials: 45,
    PersonalCloaking: 35,
    TerranVehicleWeaponsLevel1: 10,
    TerranVehicleWeaponsLevel2: 11,
    TerranVehicleWeaponsLevel3: 12,
    TerranShipWeaponsLevel1: 13,
    TerranShipWeaponsLevel2: 14,
    TerranShipWeaponsLevel3: 15,
    BattlecruiserEnableSpecializations: 50,
    TerranVehicleAndShipArmorsLevel1: 16,
    TerranVehicleAndShipArmorsLevel2: 17,
    TerranVehicleAndShipArmorsLevel3: 18,
    DrillClaws: 31,
    BansheeSpeed: 53,
    MedivacIncreaseSpeedBoost: 54,
    LiberatorAGRangeUpgrade: 51,
    CycloneLockOnDamageUpgrade: 22,
    SmartServos: 23,
    EnhancedShockwaves: 36,

    // Zerg
    ZergMeleeWeaponsLevel1: 1,
    ZergMeleeWeaponsLevel2: 2,
    ZergMeleeWeaponsLevel3: 3,
    ZergGroundArmorsLevel1: 7,
    ZergGroundArmorsLevel2: 8,
    ZergGroundArmorsLevel3: 9,
    ZergMissileWeaponsLevel1: 4,
    ZergMissileWeaponsLevel2: 5,
    ZergMissileWeaponsLevel3: 6,
    ZergFlyerWeaponsLevel1: 10,
    ZergFlyerWeaponsLevel2: 11,
    ZergFlyerWeaponsLevel3: 12,
    ZergFlyerArmorsLevel1: 13,
    ZergFlyerArmorsLevel2: 14,
    ZergFlyerArmorsLevel3: 15,
    zerglingmovementspeed: 20,
    zerglingattackspeed: 21,
    overlordspeed: 25,
    Burrow: 26,
    CentrificalHooks: 30,
    GlialReconstitution: 31,
    TunnelingClaws: 32,
    InfestorEnergyUpgrade: 40,
    NeuralParasite: 41,
    MicrobialShroud: 42,
    EvolveGroovedSpines: 50,
    EvolveMuscularAugments: 51,
    DiggingClaws: 55,
    LurkerRange: 56,
    ChitinousPlating: 60,
    AnabolicSynthesis: 61,
}

const iconSortUnitFunction = (item1: IDataUnit, item2: IDataUnit): number => {
    const result = unitPriority[item1.name] - unitPriority[item2.name]
    if (result < 0) {
        return -1
    } else if (result > 0) {
        return 1
    }
    return 0
}

const iconSortStructureFunction = (item1: IDataUnit, item2: IDataUnit): number => {
    const result = structurePriority[item1.name] - structurePriority[item2.name]
    if (result < 0) {
        return -1
    } else if (result > 0) {
        return 1
    }
    return 0
}
const iconSortUpgradeFunction = (item1: IDataUpgrade, item2: IDataUpgrade): number => {
    const result = upgradePriority[item1.name] - upgradePriority[item2.name]
    if (result < 0) {
        return -1
    } else if (result > 0) {
        return 1
    }
    return 0
}

export { iconSortUnitFunction, iconSortStructureFunction, iconSortUpgradeFunction }
