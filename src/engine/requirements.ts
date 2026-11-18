import { InputState, RequiredSpecs } from './types';

/**
 * Computes fundamental barrier and physical packaging requirements from food inputs.
 */
export function computeRequirements(inputs: InputState): RequiredSpecs {
  const {
    category,
    moisture,
    fat,
    oxygenSensitive,
    lightSensitive,
    desiredShelfLifeDays,
    storageType,
    storageTemp,
    storageRH,
    packWeightG,
  } = inputs;

  // 1. Pack Area Estimation: A = 0.0004 * (W^0.7)
  // Assumption: Standard 3-side seal or pillow pouch geometry with 1.15x aspect ratio
  const packAreaM2 = Math.max(0.005, 0.0004 * Math.pow(Math.max(5, packWeightG), 0.7));
  const areaAssumptionText = `Estimated surface area: ${(packAreaM2 * 10000).toFixed(1)} cm² (${packAreaM2.toFixed(4)} m²), computed using MoFPI empirical pouch model A = 0.0004 × W^0.7`;

  // 2. Relative Humidity and Temperature Factor for WVTR
  // RHfactor = (storageRH / 90) * 1.1^((T - 38)/10)
  const clampedRH = Math.max(10, Math.min(100, storageRH));
  const rhFactor = Math.max(0.05, (clampedRH / 90) * Math.pow(1.1, (storageTemp - 38) / 10));

  let wvtrMaxActual = 20.0;
  let wvtrMaxRef = 20.0;

  const isMoistureSensitiveDryOrFatty =
    category === 'dry' ||
    category === 'fatty snack' ||
    (category === 'bakery' && moisture < 15);

  if (isMoistureSensitiveDryOrFatty) {
    // Critical moisture determination
    let criticalMoisture = 8.0;
    if (category === 'fatty snack' || (category === 'bakery' && moisture < 10)) {
      criticalMoisture = 5.0; // Crispy snacks & biscuits lose crispness above 5%
    } else if (category === 'dry' && moisture < 10) {
      criticalMoisture = 8.0; // Dry spices & powders
    } else {
      criticalMoisture = 14.0; // Grains & flours
    }

    const initialMoisture = Math.min(criticalMoisture - 0.5, moisture);
    const allowedGainG = (packWeightG * Math.max(0.5, criticalMoisture - initialMoisture)) / 100;
    const shelfLifeDays = Math.max(1, desiredShelfLifeDays);

    // WVTR required at actual storage conditions
    wvtrMaxActual = allowedGainG / (packAreaM2 * shelfLifeDays);
    // Convert back to 38°C / 90% RH basis for standard testing table comparison
    wvtrMaxRef = Math.max(0.05, wvtrMaxActual / rhFactor);
  } else if (storageType === 'frozen' || category === 'frozen') {
    // Sub-zero storage: requires barrier against moisture sublimation (freezer burn)
    wvtrMaxActual = Math.max(1.5, 4.0 / Math.max(1, desiredShelfLifeDays / 90));
    wvtrMaxRef = Math.max(1.0, wvtrMaxActual / rhFactor);
  } else if (category === 'fresh') {
    // Fresh produce: needs controlled moisture retention to prevent weight loss (>5% causes shriveling)
    // while not creating excessive condensation
    wvtrMaxActual = 12.0;
    wvtrMaxRef = Math.max(5.0, wvtrMaxActual / rhFactor);
  } else if (category === 'dairy' || category === 'meat') {
    // High moisture proteinaceous goods: low WVTR needed to prevent dehydration skin
    wvtrMaxActual = Math.max(2.0, 5.0 / Math.max(1, desiredShelfLifeDays / 15));
    wvtrMaxRef = Math.max(1.0, wvtrMaxActual / rhFactor);
  } else {
    // Standard bakery or beverage
    wvtrMaxActual = 25.0;
    wvtrMaxRef = Math.max(5.0, wvtrMaxActual / rhFactor);
  }

  // 3. Oxygen Barrier (OTR) Requirements
  // OTR_max = 100 / (shelfLife_days / 30) cc/m²/day, capped between 1 and 500
  let otrMax = 1500; // default for non-sensitive
  const isO2SensitiveFood =
    oxygenSensitive ||
    category === 'fatty snack' ||
    category === 'dairy' ||
    category === 'meat' ||
    (category === 'dry' && fat >= 4);

  if (isO2SensitiveFood) {
    const shelfLifeMonths = Math.max(0.1, desiredShelfLifeDays / 30);
    let calculatedOtr = 100 / shelfLifeMonths;

    // Tighter cap if O2 sensitive and fat > 20%
    if (fat > 20) {
      calculatedOtr /= 3;
    }

    // Clamp between 1.0 and 500.0 cc/m²/day
    otrMax = Math.max(0.1, Math.min(500, calculatedOtr));
  } else if (category === 'fresh') {
    // Produce requires breathable OTR (addressed in MAP module)
    otrMax = 15000;
  }

  const requiresLightBarrier = lightSensitive;
  const requiresColdCrackResistance = storageType === 'frozen' || storageTemp <= -5;
  const requiresHermeticSeal =
    isO2SensitiveFood || storageType === 'frozen' || desiredShelfLifeDays > 30;

  return {
    packAreaM2,
    areaAssumptionText,
    wvtrMaxRef: parseFloat(wvtrMaxRef.toFixed(2)),
    wvtrMaxActual: parseFloat(wvtrMaxActual.toFixed(2)),
    rhFactor: parseFloat(rhFactor.toFixed(3)),
    otrMax: parseFloat(otrMax.toFixed(2)),
    requiresLightBarrier,
    requiresColdCrackResistance,
    requiresHermeticSeal,
    isFreshProduce: category === 'fresh',
    isFrozen: storageType === 'frozen' || category === 'frozen',
    isChilled: storageType === 'chilled',
  };
}
