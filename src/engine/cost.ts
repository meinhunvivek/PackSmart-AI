import { PackagingMaterial } from '../data/materials';

export interface CostMetric {
  costPerPackInr: number;
  costPer1000PacksInr: number;
  costScore: number; // 0-100 normalized score where lower cost gets higher score
}

/**
 * Computes packaging pouch unit cost:
 * cost per pack = cost_per_m2 * area_m2 * (thickness / ref_thickness)
 */
export function calculateCost(
  material: PackagingMaterial,
  packAreaM2: number,
  suggestedThicknessUm: number
): CostMetric {
  const thicknessRatio = suggestedThicknessUm / material.refThicknessUm;
  const rawCost = material.costPerM2 * packAreaM2 * thicknessRatio;
  
  // Keep clean precision
  const costPerPackInr = parseFloat(rawCost.toFixed(3));
  const costPer1000PacksInr = parseFloat((costPerPackInr * 1000).toFixed(1));

  // Normalized cost score (0-100):
  // Baseline cost benchmark: ₹0.05 to ₹3.00 per pack
  // Cheaper packaging gets a higher costScore
  const costScore = Math.max(
    5,
    Math.min(100, Math.round(100 - (costPerPackInr / 2.5) * 80))
  );

  return {
    costPerPackInr,
    costPer1000PacksInr,
    costScore,
  };
}
