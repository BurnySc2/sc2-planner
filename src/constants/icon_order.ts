// import { IBuildOrderElement } from "./interfaces"

// const unitPriority = {
//     // Protoss
//     Colossus:
//     Mothership:
//     Zealot:
//     Stalker:
//     HighTemplar:
//     DarkTemplar:
//     Sentry:
//     Phoenix:
//     Carrier:
//     VoidRay:
//     WarpPrism:
//     Observer:
//     Immortal:
//     Probe:
//     Adept:
//     Oracle:
//     Tempest:
//     Disruptor:

//     // Terran
//     SiegeTank:
//     VikingFighter:
//     SCV: 1,
//     Marine: 3, 
//     Reaper: 2,
//     Ghost: 5,
//     Marauder: 4,
//     Thor:
//     Hellion: 6,
//     Medivac:
//     Banshee:
//     Raven:
//     Battlecruiser:
//     HellionTank:
//     WidowMine:
//     Liberator:
//     Cyclone:

//     // Zerg
//     Baneling:
//     Drone:
//     Zergling:
//     Overlord:
//     Hydralisk:
//     Mutalisk:
//     Ultralisk:
//     Roach:
//     Infestor:
//     Corruptor:
//     BroodLord:
//     Queen:
//     Overseer:
//     SwarmHostMP:
//     Viper:
//     LurkerMP:
//     Ravager:
// }

// const structurePriority = {
//     // Protoss
//     Nexus:
//     Pylon:
//     Assimilator:
//     Gateway:
//     Forge:
//     FleetBeacon:
//     TwilightCouncil:
//     PhotonCannon:
//     Stargate:
//     TemplarArchive:
//     DarkShrine:
//     RoboticsBay:
//     RoboticsFacility:
//     CyberneticsCore:
//     ShieldBattery:

//     // Terran
//     CommandCenter:
//     SupplyDepot:
//     Refinery:
//     Barracks:
//     EngineeringBay:
//     Bunker:
//     SensorTower:
//     GhostAcademy:
//     Factory:
//     Starport:
//     Armory:
//     FusionCore:
//     BarracksTechLab:
//     BarracksReactor:
//     FactoryTechLab:
//     FactoryReactor:
//     StarportTechLab:
//     StarportReactor:
//     PlanetaryFortress:
//     OrbitalCommand:

//     // Zerg
//     Hatchery:
//     Extractor:
//     SpawningPool:
//     EvolutionChamber:
//     HydraliskDen:
//     Spire:
//     UltraliskCavern:
//     InfestationPit:
//     NydusNetwork:
//     BanelingNest:
//     RoachWarren:
//     SpineCrawler:
//     SporeCrawler:
//     Lair:
//     Hive:
//     GreaterSpire:
//     LurkerDenMP:
// }

// const upgradePriority = {
//     // Protoss 
//     ProtossGroundWeaponsLevel1:
//     ProtossGroundWeaponsLevel2:
//     ProtossGroundWeaponsLevel3:
//     ProtossGroundArmorsLevel1:
//     ProtossGroundArmorsLevel2:
//     ProtossGroundArmorsLevel3:
//     ProtossShieldsLevel1:
//     ProtossShieldsLevel2:
//     ProtossShieldsLevel3:
//     ObserverGraviticBooster:
//     GraviticDrive:
//     ExtendedThermalLance:
//     PsiStormTech:
//     ProtossAirWeaponsLevel1:
//     ProtossAirWeaponsLevel2:
//     ProtossAirWeaponsLevel3:
//     ProtossAirArmorsLevel1:
//     ProtossAirArmorsLevel2:
//     ProtossAirArmorsLevel3:
//     WarpGateResearch:
//     Charge:
//     BlinkTech:
//     PhoenixRangeUpgrade:
//     AdeptPiercingAttack:
//     DarkTemplarBlinkUpgrade:
//     VoidRaySpeedUpgrade:

//     // Terran 
//     HiSecAutoTracking:
//     TerranBuildingArmor:
//     TerranInfantryWeaponsLevel1:
//     TerranInfantryWeaponsLevel2:
//     TerranInfantryWeaponsLevel3:
//     TerranInfantryArmorsLevel1:
//     TerranInfantryArmorsLevel2:
//     TerranInfantryArmorsLevel3:
//     Stimpack:
//     ShieldWall:
//     PunisherGrenades:
//     HighCapacityBarrels:
//     BansheeCloak:
//     RavenCorvidReactor:
//     DurableMaterials:
//     PersonalCloaking:
//     TerranVehicleWeaponsLevel1:
//     TerranVehicleWeaponsLevel2:
//     TerranVehicleWeaponsLevel3:
//     TerranShipWeaponsLevel1:
//     TerranShipWeaponsLevel2:
//     TerranShipWeaponsLevel3:
//     BattlecruiserEnableSpecializations:
//     TerranVehicleAndShipArmorsLevel1:
//     TerranVehicleAndShipArmorsLevel2:
//     TerranVehicleAndShipArmorsLevel3:
//     DrillClaws:
//     BansheeSpeed:
//     MedivacIncreaseSpeedBoost:
//     LiberatorAGRangeUpgrade:
//     CycloneLockOnDamageUpgrade:
//     SmartServos:
//     EnhancedShockwaves:
//     HiSecAutoTracking:
//     TerranBuildingArmor:
//     TerranInfantryWeaponsLevel1:
//     TerranInfantryWeaponsLevel2:
//     TerranInfantryWeaponsLevel3:
//     TerranInfantryArmorsLevel1:
//     TerranInfantryArmorsLevel2:
//     TerranInfantryArmorsLevel3:
//     Stimpack:
//     ShieldWall:
//     PunisherGrenades:
//     HighCapacityBarrels:
//     BansheeCloak:
//     RavenCorvidReactor:
//     DurableMaterials:
//     PersonalCloaking:
//     TerranVehicleWeaponsLevel1:
//     TerranVehicleWeaponsLevel2:
//     TerranVehicleWeaponsLevel3:
//     TerranShipWeaponsLevel1:
//     TerranShipWeaponsLevel2:
//     TerranShipWeaponsLevel3:
//     BattlecruiserEnableSpecializations:
//     TerranVehicleAndShipArmorsLevel1:
//     TerranVehicleAndShipArmorsLevel2:
//     TerranVehicleAndShipArmorsLevel3:
//     DrillClaws:
//     BansheeSpeed:
//     MedivacIncreaseSpeedBoost:
//     LiberatorAGRangeUpgrade:
//     CycloneLockOnDamageUpgrade:
//     SmartServos:
//     EnhancedShockwaves:

//     // Zerg
//     GlialReconstitution:
//     TunnelingClaws:
//     ChitinousPlating:
//     ZergMeleeWeaponsLevel1:
//     ZergMeleeWeaponsLevel2:
//     ZergMeleeWeaponsLevel3:
//     ZergGroundArmorsLevel1:
//     ZergGroundArmorsLevel2:
//     ZergGroundArmorsLevel3:
//     ZergMissileWeaponsLevel1:
//     ZergMissileWeaponsLevel2:
//     ZergMissileWeaponsLevel3:
//     overlordspeed:
//     Burrow:
//     zerglingattackspeed:
//     zerglingmovementspeed:
//     ZergFlyerWeaponsLevel1:
//     ZergFlyerWeaponsLevel2:
//     ZergFlyerWeaponsLevel3:
//     ZergFlyerArmorsLevel1:
//     ZergFlyerArmorsLevel2:
//     ZergFlyerArmorsLevel3:
//     InfestorEnergyUpgrade:
//     CentrificalHooks:
//     AnabolicSynthesis:
//     NeuralParasite:
//     LurkerRange:
//     EvolveGroovedSpines:
//     EvolveMuscularAugments:
//     DiggingClaws:
//     MicrobialShroud:
// }

// const iconSortFunction = (
//     item1: IBuildOrderElement,
//     item2: IBuildOrderElement
// ) => {
//     if (item1.type === "upgrade" && item2.type === "upgrade") {
//         const result = upgradePriority[item1.name] - upgradePriority[item2.name]
//         if (result < 0){
//             return -1
//         } else if (result > 0) {
//             return 1
//         }
//         return 0
//     }
//     if (item1.type === "unit" && item2.type === "unit") {
//         const result = unitPriority[item1.name] - unitPriority[item2.name]
//         if (result < 0){
//             return -1
//         } else if (result > 0) {
//             return 1
//         }
//         return 0
//     }
//     if (item1.type === "structure" && item2.type === "structure") {
//         const result = structurePriority[item1.name] - structurePriority[item2.name]
//         if (result < 0){
//             return -1
//         } else if (result > 0) {
//             return 1
//         }
//         return 0
//     }
//     return 0
// }
const iconSortFunction = {}

export default iconSortFunction
