import { PackagingMaterial } from '../data/materials';

export interface SustainabilityMetric {
  ecoScore: number; // 0 - 100
  recScore: number;
  bioScore: number;
  co2Score: number;
  badgeLevel: 'green' | 'amber' | 'red';
  badgeLabelEn: string;
  badgeLabelHi: string;
}

/**
 * Computes Sustainability score 0-100:
 * Recyclability (40%), Biodegradability (30%), CO2e footprint (30%)
 */
export function calculateSustainability(material: PackagingMaterial): SustainabilityMetric {
  // 1. Recyclability score (40%)
  let recScore = 15;
  if (material.recyclable === 'yes') {
    recScore = 100;
  } else if (material.recyclable === 'compostable') {
    recScore = 95;
  } else if (material.recyclable === 'industrial compost') {
    recScore = 80;
  } else if (material.recyclable === 'partial') {
    recScore = 45;
  } else {
    recScore = 10;
  }

  // 2. Biodegradability score (30%)
  const bioScore = material.biodegradable ? 100 : 0;

  // 3. Carbon intensity CO2e score (30%)
  // Range: 1.2 kg/kg (cellulose) to 5.5 kg/kg (foil laminate)
  const co2Min = 1.2;
  const co2Max = 5.5;
  const co2Score = Math.max(
    0,
    Math.min(100, 100 - ((material.co2eKgPerKg - co2Min) / (co2Max - co2Min)) * 100)
  );

  const ecoScore = Math.round(0.4 * recScore + 0.3 * bioScore + 0.3 * co2Score);

  let badgeLevel: 'green' | 'amber' | 'red' = 'red';
  let badgeLabelEn = 'High Carbon Barrier';
  let badgeLabelHi = 'उच्च कार्बन बैरियर';

  if (ecoScore >= 70) {
    badgeLevel = 'green';
    badgeLabelEn = 'Eco-Champion';
    badgeLabelHi = 'पर्यावरण अनुकूल';
  } else if (ecoScore >= 45) {
    badgeLevel = 'amber';
    badgeLabelEn = 'Recyclable Polyolefin';
    badgeLabelHi = 'पुनर्चक्रण योग्य';
  }

  return {
    ecoScore,
    recScore,
    bioScore,
    co2Score: Math.round(co2Score),
    badgeLevel,
    badgeLabelEn,
    badgeLabelHi,
  };
}
