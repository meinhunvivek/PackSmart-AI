import { PackagingMaterial } from '../data/materials';
import { InputState, RequiredSpecs, ScoredMaterial, UserPreference } from './types';
import { calculateSuggestedThickness } from './thickness';
import { calculateSustainability } from './sustainability';
import { calculateCost } from './cost';
import { calculateShelfLife } from './shelfLife';

export interface ScoreWeights {
  wBarrier: number;
  wMech: number;
  wCost: number;
  wEco: number;
  wTransport: number;
}

export function getWeights(preference: UserPreference): ScoreWeights {
  switch (preference) {
    case 'lowest cost':
      return { wBarrier: 0.30, wMech: 0.10, wCost: 0.40, wEco: 0.10, wTransport: 0.10 };
    case 'best shelf life':
      return { wBarrier: 0.55, wMech: 0.15, wCost: 0.10, wEco: 0.10, wTransport: 0.10 };
    case 'eco':
      return { wBarrier: 0.25, wMech: 0.10, wCost: 0.15, wEco: 0.40, wTransport: 0.10 };
    case 'balanced':
    default:
      return { wBarrier: 0.35, wMech: 0.15, wCost: 0.20, wEco: 0.20, wTransport: 0.10 };
  }
}

/**
 * Computes Step 3 multi-criteria weighted score for a material.
 */
export function scoreMaterial(
  material: PackagingMaterial,
  inputs: InputState,
  specs: RequiredSpecs
): ScoredMaterial {
  const { suggestedThicknessUm, effectiveOtr, effectiveWvtr } =
    calculateSuggestedThickness(material, specs);

  // 1. Barrier Fit Calculation (0 - 100)
  let barrierFit = 75;

  if (specs.isFreshProduce) {
    // Fresh produce demands specific gas respiration and moisture retention
    if (material.id === 'micro-bopp') {
      barrierFit = 98; // Ideal engineered breathable film
    } else if (material.id === 'ldpe') {
      barrierFit = 85; // Good passive permeability
    } else if (material.id === 'pla' || material.id === 'compostable-cellulose') {
      barrierFit = 78; // Bio films with moderate permeability
    } else if (material.id === 'hdpe') {
      barrierFit = 70;
    } else {
      barrierFit = 60;
    }
  } else {
    // Non-produce: barrier fit against WVTR and OTR
    let wvtrFit = 100;
    if (specs.wvtrMaxRef > 0) {
      if (effectiveWvtr <= specs.wvtrMaxRef) {
        // Meets WVTR requirement: mild penalty if excessive over-specification (wasteful)
        const ratio = effectiveWvtr / specs.wvtrMaxRef;
        if (ratio < 0.05 && material.costPerM2 > 15) {
          wvtrFit = 90; // mild 10pt penalty for overkill
        } else {
          wvtrFit = 100;
        }
      } else {
        // Under-specification: heavy linear penalty
        const excess = (effectiveWvtr - specs.wvtrMaxRef) / specs.wvtrMaxRef;
        wvtrFit = Math.max(10, Math.round(100 - excess * 50));
      }
    }

    let otrFit = 100;
    const isO2Sensitive =
      inputs.oxygenSensitive ||
      inputs.category === 'fatty snack' ||
      inputs.category === 'dairy' ||
      inputs.category === 'meat' ||
      (inputs.category === 'dry' && inputs.fat >= 4);

    if (isO2Sensitive && specs.otrMax > 0 && specs.otrMax < 1000) {
      if (effectiveOtr <= specs.otrMax) {
        otrFit = 100;
      } else {
        const excess = (effectiveOtr - specs.otrMax) / specs.otrMax;
        otrFit = Math.max(10, Math.round(100 - excess * 60));
      }
    }

    barrierFit = Math.round(0.55 * wvtrFit + 0.45 * otrFit);
  }

  // 2. Mechanical Strength Fit (0 - 100)
  // Normalizing tensile strength (20 - 190 MPa) and puncture resistance
  let punctureScore = 60;
  if (material.punctureResistance === 'very high') punctureScore = 100;
  else if (material.punctureResistance === 'high') punctureScore = 85;
  else if (material.punctureResistance === 'moderate') punctureScore = 65;
  else punctureScore = 40;

  const tensileScore = Math.min(100, Math.round((material.tensileStrengthMpa / 160) * 100));
  const mechFit = Math.round(0.6 * tensileScore + 0.4 * punctureScore);

  // 3. Transport & Logistics Fit (0 - 100)
  let transportFit = 80;
  switch (inputs.transportCondition) {
    case 'export sea':
      // Demands high tensile, hermetic seal, puncture resistance
      transportFit = Math.round(0.4 * mechFit + (material.punctureResistance === 'very high' ? 55 : 35));
      break;
    case 'cold chain':
      // Demands cold crack resistance
      transportFit = material.coldCrackResistant ? 95 : 45;
      break;
    case 'long road':
      // Vibration and impact resistance
      transportFit = material.tensileStrengthMpa >= 50 ? 90 : 70;
      break;
    case 'short road':
    default:
      transportFit = 90;
      break;
  }

  // 4. Cost and Sustainability
  const costData = calculateCost(material, specs.packAreaM2, suggestedThicknessUm);
  const ecoData = calculateSustainability(material);

  // 5. Total Score calculation
  const weights = getWeights(inputs.preference);
  const totalScoreRaw =
    weights.wBarrier * barrierFit +
    weights.wMech * mechFit +
    weights.wCost * costData.costScore +
    weights.wEco * ecoData.ecoScore +
    weights.wTransport * transportFit;

  const matchScore = Math.min(99, Math.max(25, Math.round(totalScoreRaw)));

  // 6. Shelf-life prediction
  const shelfLifeData = calculateShelfLife(inputs, barrierFit);

  // 7. Explanatory reason generator
  let reasonEn = `Meets target WVTR (${effectiveWvtr} g/m²/day) & OTR specs; ${matchScore}% thermodynamic fit.`;
  let reasonHi = `लक्षित नमी (${effectiveWvtr} g/m²/day) और गैस अवरोधक को पूरा करता है; ${matchScore}% उपयुक्तता।`;

  if (specs.isFreshProduce) {
    if (material.id === 'micro-bopp') {
      reasonEn = 'Optimum gas equilibrium through laser micro-perforations prevents anaerobic fermentation.';
      reasonHi = 'लेज़र छिद्रों द्वारा संतुलित गैस विनिमय जो ताज़ा उपज को सड़ने से रोकता है।';
    } else if (material.id === 'ldpe') {
      reasonEn = 'Economical flexible pouch providing good moisture retention and natural gas exchange.';
      reasonHi = 'किफायती थैली जो पर्याप्त नमी बनाए रखते हुए प्राकृतिक गैस विनिमय करती है।';
    }
  } else if (inputs.category === 'fatty snack' || (inputs.category === 'dry' && inputs.lightSensitive)) {
    if (material.id === 'met-pet-ldpe') {
      reasonEn = `Superior light & O₂ barrier (OTR ${effectiveOtr} cc/m²); prevents crispness loss and lipid rancidity.`;
      reasonHi = `उत्कृष्ट प्रकाश व ऑक्सीजन अवरोधक; तेल के ऑक्सीकरण और सीलन को रोकता है।`;
    } else if (material.id === 'pet-al-pe') {
      reasonEn = `Ultra-high hermetic barrier with 0.1 OTR/WVTR for maximum shelf-life and export transit.`;
      reasonHi = `शून्य-पारगम्यता वाला एल्युमीनियम फॉयल जो अधिकतम शेल्फ-लाइफ व निर्यात सुरक्षा देता है।`;
    }
  } else if (inputs.storageType === 'frozen') {
    if (material.id === 'pa-pe') {
      reasonEn = `Exceptional puncture resistance and sub-zero flex endurance at ${inputs.storageTemp}°C prevents freezer burn.`;
      reasonHi = `फ्रोजन तापमान (${inputs.storageTemp}°C) में अटूट पंचर-प्रतिरोधक क्षमता जो फ्रीजर-बर्न रोकती है।`;
    }
  }

  return {
    material,
    matchScore,
    barrierFit,
    mechFit,
    costScore: costData.costScore,
    ecoScore: ecoData.ecoScore,
    transportFit,
    suggestedThicknessUm,
    effectiveOtr,
    effectiveWvtr,
    costPerPackInr: costData.costPerPackInr,
    costPer1000PacksInr: costData.costPer1000PacksInr,
    predictedShelfLifeDays: shelfLifeData.predictedDays,
    meetsShelfLifeTarget: shelfLifeData.meetsTarget,
    spoilageReductionPct: shelfLifeData.spoilageReductionPct,
    reasonEn,
    reasonHi,
    isBestValue: false, // will be evaluated across results
    sustainabilityBadge: {
      labelEn: ecoData.badgeLabelEn,
      labelHi: ecoData.badgeLabelHi,
      level: ecoData.badgeLevel,
      score: ecoData.ecoScore,
    },
  };
}
