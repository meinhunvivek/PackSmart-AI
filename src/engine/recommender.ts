import { MATERIALS, PackagingMaterial } from '../data/materials';
import { EvaluationResult, InputState, ScoredMaterial } from './types';
import { computeRequirements } from './requirements';
import { applyHardFilters } from './filters';
import { scoreMaterial } from './scoring';
import { computeMapAdvisory } from './map';
import { generateShelfLifeCurve } from './shelfLife';

/**
 * Main Pure Recommendation Engine orchestrator for PackSmart.
 */
export function evaluatePackaging(inputs: InputState): EvaluationResult {
  // Step 1: Compute barrier & physical requirements
  const requiredSpecs = computeRequirements(inputs);

  // Step 2: Apply hard constraint filters
  const passedMaterials: PackagingMaterial[] = [];
  const rejectedMaterials: Array<{ material: PackagingMaterial; reasonEn?: string }> = [];

  for (const mat of MATERIALS) {
    const filterRes = applyHardFilters(mat, inputs, requiredSpecs);
    if (filterRes.passed) {
      passedMaterials.push(mat);
    } else {
      rejectedMaterials.push({ material: mat, reasonEn: filterRes.rejectReasonEn });
    }
  }

  // Fallback safeguard: if filters were overly aggressive, ensure at least 2 materials pass
  let activeMaterials = [...passedMaterials];
  if (activeMaterials.length < 2) {
    for (const rej of rejectedMaterials) {
      if (!rej.material.lightBarrier && !inputs.lightSensitive) {
        activeMaterials.push(rej.material);
        if (activeMaterials.length >= 3) break;
      }
    }
    if (activeMaterials.length === 0) {
      activeMaterials = MATERIALS.slice(0, 3);
    }
  }

  // Step 3: Score all active materials
  const scoredMaterials: ScoredMaterial[] = activeMaterials.map((mat) =>
    scoreMaterial(mat, inputs, requiredSpecs)
  );

  // Sort by match score descending
  scoredMaterials.sort((a, b) => b.matchScore - a.matchScore);

  // Step 4: Identify "Best Value"
  // Cheapest option among those meeting shelf life target
  const meetingTarget = scoredMaterials.filter((m) => m.meetsShelfLifeTarget);
  let bestValueMaterial: ScoredMaterial | null = null;
  if (meetingTarget.length > 0) {
    bestValueMaterial = [...meetingTarget].sort(
      (a, b) => a.costPerPackInr - b.costPerPackInr
    )[0];
  } else if (scoredMaterials.length > 0) {
    bestValueMaterial = [...scoredMaterials].sort(
      (a, b) => a.costPerPackInr - b.costPerPackInr
    )[0];
  }

  if (bestValueMaterial) {
    const found = scoredMaterials.find((m) => m.material.id === bestValueMaterial!.material.id);
    if (found) {
      found.isBestValue = true;
    }
  }

  // Pick top 3
  const topRecommendations = scoredMaterials.slice(0, 3);

  // Step 5: Compute MAP advisory
  const mapData = computeMapAdvisory(inputs, requiredSpecs.packAreaM2);

  // Step 6: Generate temperature shelf-life curve for top recommendations
  const shelfLifeCurve = generateShelfLifeCurve(
    inputs,
    topRecommendations.map((r) => ({
      material: r.material,
      barrierFit: r.barrierFit,
    }))
  );

  // Step 7: Eco Alternative discovery
  let ecoAlternativeMaterial: ScoredMaterial | undefined;
  let ecoAlternativeTradeoff: EvaluationResult['ecoAlternativeTradeoff'] | undefined;

  // Find material with highest ecoScore that is not top #1
  const sortedByEco = [...scoredMaterials].sort(
    (a, b) => b.sustainabilityBadge.score - a.sustainabilityBadge.score
  );

  const top1 = topRecommendations[0];
  const candidateEco = sortedByEco.find(
    (m) =>
      m.material.id !== top1?.material.id &&
      m.sustainabilityBadge.score > (top1?.sustainabilityBadge.score ?? 50)
  );

  if (candidateEco && top1) {
    ecoAlternativeMaterial = candidateEco;
    const shelfLifeDiff = candidateEco.predictedShelfLifeDays - top1.predictedShelfLifeDays;
    const costDiffPct = top1.costPerPackInr > 0
      ? Math.round(((candidateEco.costPerPackInr - top1.costPerPackInr) / top1.costPerPackInr) * 100)
      : 0;
    const ecoScoreGainPct = Math.round(
      candidateEco.sustainabilityBadge.score - top1.sustainabilityBadge.score
    );

    ecoAlternativeTradeoff = {
      shelfLifeDiffDays: shelfLifeDiff,
      costDiffPct,
      ecoScoreGainPct,
    };
  }

  return {
    inputs,
    requiredSpecs,
    allMaterials: scoredMaterials,
    topRecommendations,
    mapData,
    shelfLifeCurve,
    ecoAlternativeMaterial,
    ecoAlternativeTradeoff,
  };
}
