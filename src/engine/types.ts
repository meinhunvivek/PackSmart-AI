import { PackagingMaterial } from '../data/materials';

export type CommodityCategory =
  | 'fresh'
  | 'dry'
  | 'dairy'
  | 'fatty snack'
  | 'meat'
  | 'bakery'
  | 'beverage'
  | 'frozen';

export type StorageType = 'ambient' | 'chilled' | 'frozen';

export type TransportCondition = 'short road' | 'long road' | 'export sea' | 'cold chain';

export type UserPreference = 'balanced' | 'lowest cost' | 'best shelf life' | 'eco';

export interface InputState {
  commodityId: string;
  commodityName: string;
  category: CommodityCategory;
  moisture: number; // %
  fat: number; // %
  pH: number;
  respirationRate: number; // mL CO2/kg/h at 10°C
  oxygenSensitive: boolean;
  lightSensitive: boolean;
  desiredShelfLifeDays: number;
  storageType: StorageType;
  storageTemp: number; // °C
  storageRH: number; // % RH
  transportCondition: TransportCondition;
  packWeightG: number; // grams
  preference: UserPreference;
}

export interface RequiredSpecs {
  packAreaM2: number;
  areaAssumptionText: string;
  wvtrMaxRef: number; // at 38°C, 90% RH
  wvtrMaxActual: number; // at storage temp & RH
  rhFactor: number;
  otrMax: number; // at 23°C, 0% RH
  requiresLightBarrier: boolean;
  requiresColdCrackResistance: boolean;
  requiresHermeticSeal: boolean;
  isFreshProduce: boolean;
  isFrozen: boolean;
  isChilled: boolean;
}

export interface ScoredMaterial {
  material: PackagingMaterial;
  matchScore: number; // 0 - 100
  barrierFit: number; // 0 - 100
  mechFit: number; // 0 - 100
  costScore: number; // 0 - 100
  ecoScore: number; // 0 - 100
  transportFit: number; // 0 - 100
  suggestedThicknessUm: number;
  effectiveOtr: number;
  effectiveWvtr: number;
  costPerPackInr: number;
  costPer1000PacksInr: number;
  predictedShelfLifeDays: number;
  meetsShelfLifeTarget: boolean;
  spoilageReductionPct: number;
  reasonEn: string;
  reasonHi: string;
  isBestValue: boolean;
  sustainabilityBadge: {
    labelEn: string;
    labelHi: string;
    level: 'green' | 'amber' | 'red';
    score: number;
  };
}

export interface MapRecommendation {
  suitable: 'Yes' | 'No' | 'Conditional';
  badgeColor: 'emerald' | 'amber' | 'slate';
  targetO2: string;
  targetCO2: string;
  targetN2: string;
  gasMixDescriptionEn: string;
  gasMixDescriptionHi: string;
  respirationAtTemp: number; // mL CO2/kg/h at storage temp
  otrRequired: number; // mL/m²/day/atm
  co2trRequired: number; // mL/m²/day/atm
  suggestedFilmType: string;
  perforationRecommendationEn: string;
  perforationRecommendationHi: string;
  estimatedHolesCount: number;
  anaerobicRiskWarning: boolean;
  nonProduceAdviceEn?: string;
  nonProduceAdviceHi?: string;
}

export interface ShelfLifeCurvePoint {
  temp: number;
  [key: string]: number;
}

export interface EvaluationResult {
  inputs: InputState;
  requiredSpecs: RequiredSpecs;
  allMaterials: ScoredMaterial[];
  topRecommendations: ScoredMaterial[];
  mapData: MapRecommendation;
  shelfLifeCurve: ShelfLifeCurvePoint[];
  ecoAlternativeMaterial?: ScoredMaterial;
  ecoAlternativeTradeoff?: {
    shelfLifeDiffDays: number;
    costDiffPct: number;
    ecoScoreGainPct: number;
  };
}
