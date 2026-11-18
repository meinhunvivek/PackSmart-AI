import { PackagingMaterial } from '../data/materials';
import { InputState, RequiredSpecs } from './types';
import { calculateSuggestedThickness } from './thickness';

export interface FilterResult {
  passed: boolean;
  rejectReasonEn?: string;
  rejectReasonHi?: string;
}

/**
 * Executes Step 2 hard constraint filtering.
 */
export function applyHardFilters(
  material: PackagingMaterial,
  inputs: InputState,
  specs: RequiredSpecs
): FilterResult {
  const { category, lightSensitive, storageType, storageTemp } = inputs;
  const isFrozen = storageType === 'frozen' || category === 'frozen' || storageTemp <= -5;
  const isFreshProduce = category === 'fresh';

  // 1. Light sensitivity rule:
  // Requires opaque / metallized / aluminum barrier; clear films (PET, PLA, etc.) fail.
  if (lightSensitive && !material.lightBarrier) {
    return {
      passed: false,
      rejectReasonEn: `Rejected: Product is light-sensitive; ${material.shortName} lacks UV/light opaque barrier layer.`,
      rejectReasonHi: `अस्वीकृत: उत्पाद प्रकाश-संवेदनशील है; ${material.shortName} में प्रकाश/यूवी अवरोधक नहीं है।`,
    };
  }

  // 2. Frozen storage rule:
  // Requires sub-zero flexibility & cold crack resistance (PE-based, PA/PE). Exclude PLA, paper, cellulose.
  if (isFrozen) {
    if (material.id === 'pla' || material.id === 'kraft-pe' || material.id === 'compostable-cellulose') {
      return {
        passed: false,
        rejectReasonEn: `Rejected: Brittle at frozen sub-zero temperatures (-18°C); fails flex-crack and puncture standards.`,
        rejectReasonHi: `अस्वीकृत: शून्य से नीचे (-18°C) तापमान में टूटने का जोखिम; फ्रोजन मानकों में अनुपयुक्त।`,
      };
    }
    if (!material.coldCrackResistant) {
      return {
        passed: false,
        rejectReasonEn: `Rejected: Not certified for sub-zero deep-freeze environments.`,
        rejectReasonHi: `अस्वीकृत: गहरे फ्रीजर तापमान के लिए उपयुक्त नहीं है।`,
      };
    }
  }

  // 3. Heat-sealability rule:
  // If the film cannot be heat-sealed (e.g. plain unlaminated PET without sealant)
  if (!material.heatSealable) {
    return {
      passed: false,
      rejectReasonEn: `Rejected: Non-heat-sealable standalone substrate; requires secondary extrusion coating.`,
      rejectReasonHi: `अस्वीकृत: अकेले सील करने योग्य नहीं है; आंतरिक सीलेंट परत आवश्यक है।`,
    };
  }

  // 4. Fresh produce respiration check:
  // Living vegetables/fruits must not be hermetically sealed in zero-permeability foil or heavy barrier
  // that causes rapid anoxia (<1% O2) and anaerobic rotting.
  if (isFreshProduce) {
    if (material.id === 'pet-al-pe' || material.id === 'evoh') {
      return {
        passed: false,
        rejectReasonEn: `Rejected: Hermetic gas barrier induces severe anaerobic fermentation (spoilage) in respiring produce.`,
        rejectReasonHi: `अस्वीकृत: अत्यंत अभेद्य अवरोधक ताज़ा उपज में ऑक्सीजन समाप्त कर सड़न पैदा करता है।`,
      };
    }
  }

  // 5. Barrier severe under-specification rule:
  // If the product is moisture-sensitive, film transmission > 5x allowable causes rapid spoilage.
  const thicknessData = calculateSuggestedThickness(material, specs);
  const effectiveWvtr = thicknessData.effectiveWvtr;

  const isMoistureSensitive =
    category === 'dry' ||
    category === 'fatty snack' ||
    (category === 'bakery' && inputs.moisture < 15);

  if (isMoistureSensitive && specs.wvtrMaxRef > 0) {
    if (effectiveWvtr > 5.0 * specs.wvtrMaxRef) {
      return {
        passed: false,
        rejectReasonEn: `Rejected: Moisture transmission (${effectiveWvtr} g/m²/day) exceeds 5× the permissible threshold (${specs.wvtrMaxRef.toFixed(1)} g/m²/day).`,
        rejectReasonHi: `अस्वीकृत: नमी पारगम्यता दर (${effectiveWvtr}) अनुमत सीमा (${specs.wvtrMaxRef.toFixed(1)}) के 5 गुना से अधिक है।`,
      };
    }
  }

  // If oxygen-sensitive and effective OTR exceeds 5x permissible limit
  if (inputs.oxygenSensitive && specs.otrMax > 0 && specs.otrMax < 100) {
    if (thicknessData.effectiveOtr > 10.0 * specs.otrMax) {
      return {
        passed: false,
        rejectReasonEn: `Rejected: Oxygen transmission (${thicknessData.effectiveOtr} cc/m²/day) too high for oxidation-prone goods.`,
        rejectReasonHi: `अस्वीकृत: ऑक्सीजन पारगम्यता अत्यधिक होने से तेल व स्वाद शीघ्र खराब होगा।`,
      };
    }
  }

  return { passed: true };
}
