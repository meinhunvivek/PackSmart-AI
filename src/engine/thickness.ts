import { PackagingMaterial } from '../data/materials';
import { RequiredSpecs } from './types';

export const STANDARD_GAUGES = [20, 25, 30, 40, 50, 60, 75, 100, 120, 150];

export interface ThicknessResult {
  suggestedThicknessUm: number;
  effectiveOtr: number;
  effectiveWvtr: number;
  thicknessRatio: number;
}

/**
 * Calculates suggested commercial gauge based on inverse permeability scaling:
 * Permeability(t) = Permeability(t_ref) * (t_ref / t)
 * t_req = t_ref * (Perm_ref / Perm_target)
 */
export function calculateSuggestedThickness(
  material: PackagingMaterial,
  specs: RequiredSpecs
): ThicknessResult {
  // If it's a micro-perforated produce film, thickness is fixed to mechanical standard
  // and OTR is controlled by laser hole micro-perforations.
  if (material.id === 'micro-bopp') {
    return {
      suggestedThicknessUm: 25,
      effectiveOtr: material.otr,
      effectiveWvtr: material.wvtr,
      thicknessRatio: 1.0,
    };
  }

  // Determine thickness required for WVTR barrier
  let tWvtr = material.refThicknessUm;
  if (specs.wvtrMaxRef > 0 && material.wvtr > specs.wvtrMaxRef) {
    tWvtr = material.refThicknessUm * (material.wvtr / specs.wvtrMaxRef);
  }

  // Determine thickness required for OTR barrier
  let tOtr = material.refThicknessUm;
  if (specs.otrMax > 0 && specs.otrMax < 1000 && material.otr > specs.otrMax) {
    tOtr = material.refThicknessUm * (material.otr / specs.otrMax);
  }

  // Raw needed thickness
  const rawNeeded = Math.max(tWvtr, tOtr, 20);

  // Clamp to 20-150 µm range
  const clampedNeeded = Math.min(150, Math.max(20, rawNeeded));

  // Find standard gauge from available commercial standard gauges
  const standardOptions = material.standardThicknesses.length > 0
    ? material.standardThicknesses
    : STANDARD_GAUGES;

  // Find the smallest standard gauge >= clampedNeeded, or the largest available
  let suggested = standardOptions[standardOptions.length - 1];
  for (const gauge of standardOptions) {
    if (gauge >= clampedNeeded) {
      suggested = gauge;
      break;
    }
  }

  // Calculate effective barrier at this suggested thickness
  const thicknessRatio = material.refThicknessUm / suggested;
  
  // For laminates with non-scalable foil layer (Al foil), OTR and WVTR stay pinned to near-zero
  const effectiveOtr = material.id === 'pet-al-pe' 
    ? material.otr 
    : parseFloat((material.otr * thicknessRatio).toFixed(2));
    
  const effectiveWvtr = material.id === 'pet-al-pe'
    ? material.wvtr
    : parseFloat((material.wvtr * thicknessRatio).toFixed(2));

  return {
    suggestedThicknessUm: suggested,
    effectiveOtr,
    effectiveWvtr,
    thicknessRatio: suggested / material.refThicknessUm,
  };
}
