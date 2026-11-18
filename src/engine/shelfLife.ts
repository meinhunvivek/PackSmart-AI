import { InputState, ShelfLifeCurvePoint } from './types';
import { COMMODITIES } from '../data/commodities';
import { PackagingMaterial } from '../data/materials';

export interface ShelfLifePrediction {
  predictedDays: number;
  meetsTarget: boolean;
  baselineDays: number;
  spoilageReductionPct: number;
  packagingFactor: number;
}

/**
 * Computes shelf life prediction based on Arrhenius/Q10 kinetics and barrier fit factor:
 * SL(T) = SL_ref * Q10^((T_ref - T)/10) * pf
 * pf = clamp(barrierFit / 70, 0.7, 1.8)
 */
export function calculateShelfLife(
  inputs: InputState,
  barrierFit: number
): ShelfLifePrediction {
  const commodity = COMMODITIES.find((c) => c.id === inputs.commodityId);
  const baseRefDays = commodity?.baseShelfLifeDays ?? 30;
  const tRef = commodity?.refTemp ?? 20;
  const q10 = commodity?.q10 ?? 2.2;
  const actualTemp = inputs.storageTemp;

  // Temperature adjustment SL(T) = SL_ref * Q10^((T_ref - T) / 10)
  const tempAdjustedBase = baseRefDays * Math.pow(q10, (tRef - actualTemp) / 10);

  // Packaging factor: clamp(barrierFit / 70, 0.7, 1.8)
  const packagingFactor = Math.min(1.8, Math.max(0.7, barrierFit / 70.0));

  const predictedDays = Math.max(1, Math.round(tempAdjustedBase * packagingFactor));
  const meetsTarget = predictedDays >= inputs.desiredShelfLifeDays;

  // Baseline unpackaged / standard low-barrier LDPE baseline
  const baselineDays = Math.max(1, Math.round(tempAdjustedBase * 0.75));

  // Spoilage reduction percentage
  const spoilageReductionPct = Math.min(
    88,
    Math.max(12, Math.round(((predictedDays - baselineDays) / predictedDays) * 100))
  );

  return {
    predictedDays,
    meetsTarget,
    baselineDays,
    spoilageReductionPct,
    packagingFactor: parseFloat(packagingFactor.toFixed(2)),
  };
}

/**
 * Generates the temperature vs shelf life curve (0°C to 40°C, or -20°C to 5°C for frozen)
 */
export function generateShelfLifeCurve(
  inputs: InputState,
  topMaterials: Array<{ material: PackagingMaterial; barrierFit: number }>
): ShelfLifeCurvePoint[] {
  const commodity = COMMODITIES.find((c) => c.id === inputs.commodityId);
  const baseRefDays = commodity?.baseShelfLifeDays ?? 30;
  const tRef = commodity?.refTemp ?? 20;
  const q10 = commodity?.q10 ?? 2.2;

  const isFrozen = inputs.storageType === 'frozen' || inputs.category === 'frozen';
  const temps = isFrozen
    ? [-25, -20, -18, -15, -10, -5, 0, 5]
    : [0, 5, 10, 15, 20, 25, 30, 35, 40];

  return temps.map((t) => {
    const point: ShelfLifeCurvePoint = { temp: t };
    const tempAdjustedBase = baseRefDays * Math.pow(q10, (tRef - t) / 10);

    topMaterials.forEach(({ material, barrierFit }) => {
      const pf = Math.min(1.8, Math.max(0.7, barrierFit / 70.0));
      point[material.shortName] = Math.max(1, Math.round(tempAdjustedBase * pf));
    });

    return point;
  });
}
