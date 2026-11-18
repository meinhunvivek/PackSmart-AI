import { InputState, MapRecommendation } from './types';
import { COMMODITIES } from '../data/commodities';

/**
 * Computes Modified Atmosphere Packaging (MAP) physics for produce and non-produce food items.
 */
export function computeMapAdvisory(
  inputs: InputState,
  packAreaM2: number
): MapRecommendation {
  const { category, commodityId, storageTemp, packWeightG } = inputs;
  const commodity = COMMODITIES.find((c) => c.id === commodityId);
  const weightKg = packWeightG / 1000;

  // Case A: Fresh produce respiration and steady-state gas balance
  if (category === 'fresh') {
    const rrRef = inputs.respirationRate > 0 ? inputs.respirationRate : (commodity?.respirationRate ?? 20);
    const tRef = 10; // Reference temperature in °C
    const q10 = 2.5; // Respiration temperature coefficient

    // 1. Respiration adjusted for temperature: RR_T = RR_ref * Q10^((T - T_ref)/10)
    const respirationAtTemp = rrRef * Math.pow(q10, (storageTemp - tRef) / 10);

    // 2. Target gas mix fractions
    let o2Fraction = 0.04; // default 4%
    let targetO2Str = '3 - 5% O₂';
    let targetCO2Str = '3 - 5% CO₂';
    let targetN2Str = 'Balance N₂ (90 - 94%)';
    let gasDescEn = 'O₂ 3-5%, CO₂ 3-5%, Balance N₂. Delays climacteric peak and ripening.';
    let gasDescHi = 'O₂ 3-5%, CO₂ 3-5%, शेष N₂। फल पकने की गति नियंत्रित करता है।';

    if (commodityId === 'spinach' || commodity?.name.toLowerCase().includes('leafy')) {
      o2Fraction = 0.03;
      targetO2Str = '2 - 5% O₂';
      targetCO2Str = '5 - 10% CO₂';
      gasDescEn = 'O₂ 2-5%, CO₂ 5-10%, Balance N₂. Preserves chlorophyll, delays yellowing and reduces high metabolic respiration.';
      gasDescHi = 'O₂ 2-5%, CO₂ 5-10%, शेष N₂। पत्तों का हरापन और ताजगी बनाए रखता है।';
    } else if (commodityId === 'strawberry' || commodity?.name.toLowerCase().includes('berr')) {
      o2Fraction = 0.07;
      targetO2Str = '5 - 10% O₂';
      targetCO2Str = '15 - 20% CO₂';
      gasDescEn = 'O₂ 5-10%, CO₂ 15-20%, Balance N₂. High CO₂ fungistatic atmosphere arrests grey mold (Botrytis cinerea).';
      gasDescHi = 'O₂ 5-10%, CO₂ 15-20%, शेष N₂। उच्च CO₂ फफूंद संक्रमण को रोकता है।';
    } else if (commodityId === 'apple') {
      o2Fraction = 0.025;
      targetO2Str = '2 - 3% O₂';
      targetCO2Str = '1 - 3% CO₂';
      gasDescEn = 'O₂ 2-3%, CO₂ 1-3%, Balance N₂. Low O₂ suppresses superficial scald and ethylene synthesis in cold storage.';
      gasDescHi = 'O₂ 2-3%, CO₂ 1-3%, शेष N₂। एथिलीन गैस संश्लेषण को रोकता है।';
    } else if (commodityId === 'potato') {
      o2Fraction = 0.20;
      targetO2Str = '18 - 21% O₂ (Ambient Air)';
      targetCO2Str = '< 1% CO₂';
      targetN2Str = '78% N₂ (Natural Air)';
      gasDescEn = 'Normal ventilated air with 100% light-blocking opaque film to prevent toxic solanine greening.';
      gasDescHi = 'हवादार सामान्य वायु + 100% प्रकाश अवरोधक थैली (सोलेनाइन हरापन रोकथाम)।';
    }

    // 3. Required film O2 transmission rate (OTR):
    // OTR_required (mL/m²/day/atm) = (RR_T * W * 24) / (A * (0.21 - targetO2_fraction))
    const drivingDeltaO2 = Math.max(0.01, 0.21 - o2Fraction);
    const otrRequired = (respirationAtTemp * weightKg * 24) / (packAreaM2 * drivingDeltaO2);
    // CO2 transmission required ≈ 3 to 5x OTR for polymeric films; 1x for micro-holes
    const co2trRequired = otrRequired * 4.0;

    // 4. Perforation calculation
    // Assume each 70 µm laser micro-hole provides approx 1,500 cc/day/atm O2 flux
    const otrPerHole = 1500;
    const totalGasFluxNeeded = otrRequired * packAreaM2;
    const estimatedHolesCount = Math.max(1, Math.round(totalGasFluxNeeded / otrPerHole));

    // Anaerobic warning: if temperature is elevated (>15°C) and film is non-perforated
    const anaerobicRiskWarning = storageTemp > 14 && otrRequired > 8000;

    let suggestedFilmType = 'Micro-perforated BOPP or Anti-fog Breathable LDPE';
    let perfEn = `Suggested: ${estimatedHolesCount} laser micro-holes (dia ~70µm) across ${packAreaM2.toFixed(4)} m² pouch surface to sustain steady-state ${targetO2Str}.`;
    let perfHi = `सुझाव: स्थिर गैस संतुलन के लिए लगभग ${estimatedHolesCount} लेज़र सूक्ष्म-छिद्र (70µm व्यास) आवश्यक हैं।`;

    if (commodityId === 'potato') {
      suggestedFilmType = 'Ventilated / Macro-perforated Opaque Kraft or Black PE Bag';
      perfEn = 'Macro-perforations / mesh netting for air exchange without gas accumulation.';
      perfHi = 'हवा के आवागमन हेतु छिद्रित या जालीदार प्रकाशरोधी थैली का उपयोग करें।';
    }

    return {
      suitable: 'Yes',
      badgeColor: 'emerald',
      targetO2: targetO2Str,
      targetCO2: targetCO2Str,
      targetN2: targetN2Str,
      gasMixDescriptionEn: gasDescEn,
      gasMixDescriptionHi: gasDescHi,
      respirationAtTemp: parseFloat(respirationAtTemp.toFixed(1)),
      otrRequired: Math.round(otrRequired),
      co2trRequired: Math.round(co2trRequired),
      suggestedFilmType,
      perforationRecommendationEn: perfEn,
      perforationRecommendationHi: perfHi,
      estimatedHolesCount,
      anaerobicRiskWarning,
    };
  }

  // Case B: Non-produce commodities (N2 flushing, bread, meat, dairy)
  if (category === 'fatty snack' || (category === 'dry' && inputs.lightSensitive)) {
    return {
      suitable: 'Yes',
      badgeColor: 'emerald',
      targetO2: '< 1.0% O₂ (Target < 0.5%)',
      targetCO2: '0% CO₂',
      targetN2: '99%+ N₂ Inert Gas Flush',
      gasMixDescriptionEn:
        'Active 99%+ N₂ gas flushing. Displaces atmospheric O₂ to permanently prevent oxidative rancidity, off-flavors, and crispness degradation.',
      gasMixDescriptionHi:
        '99%+ नाइट्रोजन गैस फ्लशिंग। ऑक्सीजन को बाहर निकालकर तेल के ऑक्सीकरण व सीलन को पूरी तरह रोकता है।',
      respirationAtTemp: 0,
      otrRequired: 2,
      co2trRequired: 10,
      suggestedFilmType: 'Metallized PET / LDPE or PET / Foil / PE pouch',
      perforationRecommendationEn: 'Hermetically heat-sealed barrier pouch with positive internal N₂ gas cushion (no pinholes).',
      perforationRecommendationHi: 'हवा-अभेद्य मजबूत सील पाउच, कुशन सुरक्षा के साथ (कोई छिद्र नहीं)।',
      estimatedHolesCount: 0,
      anaerobicRiskWarning: false,
      nonProduceAdviceEn: 'N₂ gas flushing creates protective pillow pouch cushioning against transit breakage while keeping residual O₂ below 1%.',
      nonProduceAdviceHi: 'नाइट्रोजन गैस फ्लश परिवहन में चिप्स/स्नैक्स को टूटने से बचाता है और ताजगी सुरक्षित रखता है।',
    };
  }

  if (category === 'bakery') {
    return {
      suitable: 'Yes',
      badgeColor: 'emerald',
      targetO2: '< 1.0% O₂',
      targetCO2: '20 - 50% CO₂',
      targetN2: 'Balance N₂ (50 - 80%)',
      gasMixDescriptionEn:
        'CO₂ 20-50% with N₂ balance. High CO₂ inhibits mold sporulation and fungal growth on bakery crusts without package collapse.',
      gasMixDescriptionHi:
        'CO₂ 20-50% शेष N₂। उच्च CO₂ ब्रेड व बेकरी उत्पादों में फफूंद (Mold) लगने से रोकता है।',
      respirationAtTemp: 0,
      otrRequired: 40,
      co2trRequired: 150,
      suggestedFilmType: 'BOPP / EVOH or Coextruded Barrier Film',
      perforationRecommendationEn: 'Continuous airtight flow-wrap seal without perforations.',
      perforationRecommendationHi: 'बिना छिद्र की एयर-टाइट फ्लो-रैप सील।',
      estimatedHolesCount: 0,
      anaerobicRiskWarning: false,
      nonProduceAdviceEn: 'Avoid 100% CO₂ as gas dissolves into crumb moisture causing pouch collapse; use N₂ as filler.',
      nonProduceAdviceHi: '100% CO₂ से बचें क्योंकि यह नमी में घुलकर पैकेट सिकोड़ देती है; N₂ का मिश्रण आवश्यक है।',
    };
  }

  if (category === 'meat') {
    return {
      suitable: 'Conditional',
      badgeColor: 'amber',
      targetO2: '70 - 80% O₂ (High-O₂ MAP) OR 0% (Vacuum Skin Pack)',
      targetCO2: '20 - 30% CO₂',
      targetN2: 'Balance N₂ (0 - 10%)',
      gasMixDescriptionEn:
        'High-O₂ MAP (70% O₂ + 30% CO₂) maintains bright red oxymyoglobin cherry color, while CO₂ inhibits Pseudomonas bacteria. Alternatively, Vacuum Skin Packaging (VSP) gives longer life with dark purple myoglobin.',
      gasMixDescriptionHi:
        '70% O₂ + 30% CO₂ ताज़ा लाल रंग बनाए रखता है और बैक्टीरिया रोकता है। अथवा वैक्यूम स्किन पैक (VSP) अधिक शेल्फ-लाइफ देता है।',
      respirationAtTemp: 0,
      otrRequired: 10,
      co2trRequired: 40,
      suggestedFilmType: 'PA / PE Coextruded High-Barrier Thermoforming Film',
      perforationRecommendationEn: 'Rigid barrier tray + peelable anti-fog hermetic lidding film.',
      perforationRecommendationHi: 'सख्त बैरियर ट्रे + एंटी-फॉग सील फिल्म।',
      estimatedHolesCount: 0,
      anaerobicRiskWarning: false,
      nonProduceAdviceEn: 'Conditional recommendation: Strict 0°C to 2°C cold chain is mandatory to prevent anaerobic pathogen outgrowth (Clostridium botulinum).',
      nonProduceAdviceHi: 'सख्त 0°C से 2°C तापमान आवश्यक है ताकि रोगजनक बैक्टीरिया न पनपें।',
    };
  }

  if (category === 'dairy') {
    return {
      suitable: 'Yes',
      badgeColor: 'emerald',
      targetO2: '< 0.5% O₂',
      targetCO2: '30 - 50% CO₂',
      targetN2: 'Balance N₂ (50 - 70%)',
      gasMixDescriptionEn:
        'CO₂ 30-50% with balance N₂ or deep vacuum. Displaces oxygen to prevent surface mold, yeast, and rancid lipase formation on paneer / cheese.',
      gasMixDescriptionHi:
        'CO₂ 30-50% शेष N₂ या गहरा वैक्यूम। पनीर पर खमीर व फफूंद लगने से रोकता है।',
      respirationAtTemp: 0,
      otrRequired: 20,
      co2trRequired: 80,
      suggestedFilmType: 'PA / PE Vacuum Pouch or EVOH barrier lidding',
      perforationRecommendationEn: 'Hermetic vacuum pouch or flush seal.',
      perforationRecommendationHi: 'वायुरोधी वैक्यूम पाउच सीलिंग।',
      estimatedHolesCount: 0,
      anaerobicRiskWarning: false,
      nonProduceAdviceEn: 'Maintain below 4°C chilled chain at all distribution checkpoints.',
      nonProduceAdviceHi: 'वितरण के दौरान लगातार 4°C से नीचे तापमान बनाए रखें।',
    };
  }

  // Frozen / Dry generic
  return {
    suitable: 'No',
    badgeColor: 'slate',
    targetO2: 'Atmospheric Air / Passive Gas',
    targetCO2: 'Ambient (< 0.04%)',
    targetN2: '78% N₂',
    gasMixDescriptionEn: 'Standard protective barrier packaging without active MAP flush is sufficient.',
    gasMixDescriptionHi: 'सक्रिय गैस फ्लश की आवश्यकता नहीं है; मानक बैरियर पैकेजिंग पर्याप्त है।',
    respirationAtTemp: 0,
    otrRequired: 1000,
    co2trRequired: 4000,
    suggestedFilmType: 'Standard flexible barrier pouch (LDPE / HDPE / Laminate)',
    perforationRecommendationEn: 'Continuous heat seal without perforations.',
    perforationRecommendationHi: 'बिना छिद्र की मजबूत हीट सील।',
    estimatedHolesCount: 0,
    anaerobicRiskWarning: false,
  };
}
