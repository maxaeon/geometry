const CROSSWALK = {
  // K–2
  k_shape_hunt: ['K.G', 'SMP6'],
  g1_compose_shapes: ['1.G', 'SMP7'],
  g2_partition: ['2.G', 'SMP4'],

  // 3–5
  g3_fraction_tiles: ['3.G', 'SMP4'],
  g4_lines_angles: ['4.G', 'SMP5'],
  g5_coordinate_graphing: ['5.G', 'SMP4', 'SMP6'],

  // 6–8
  g6_area_surface_area: ['6.G', 'SMP1'],
  g7_circles_formulas: ['7.G', 'SMP5'],
  g8_rigid_motions: ['8.G', 'SMP2', 'SMP5'],
  g8_pythagorean_lab: ['8.G', 'SMP8'],

  // HS Geometry
  hs_parallel_theorems: ['G-CO.C.9', 'SMP3'],
  hs_congruence_criteria: ['G-CO.B.7', 'G-CO.B.8', 'SMP2'],
  hs_circles_theorems: ['G-C.A', 'SMP3'],
  hs_coordinate_proofs: ['G-GPE', 'SMP7'],
  hs_volume_wedges: ['G-GMD', 'SMP4'],
  hs_modeling_design: ['G-MG', 'SMP4'],
  hs_equilateral_triangle_in_circle: ['G-CO.D.13', 'G-CO.D.12', 'SMP3', 'SMP5']
};

const PRACTICE_CODES = new Set(['SMP1','SMP2','SMP3','SMP4','SMP5','SMP6','SMP7','SMP8']);

/**
 * @typedef {{code: string, weight: number, evidence: 'content' | 'practice'}} StandardLink
 */

/**
 * Returns the standards metadata for an activity and state.
 * @param {string} activityId
 * @param {'CA'|'MI'} [state]
 * @returns {StandardLink[]}
 */
export function mapActivityToStandards(activityId, state = 'CA') {
  void state; // placeholder for future state-specific logic
  const codes = CROSSWALK[activityId] || [];
  return codes.map(code => ({
    code,
    weight: PRACTICE_CODES.has(code) ? 0.5 : 1,
    evidence: PRACTICE_CODES.has(code) ? 'practice' : 'content'
  }));
}

export function listSupportedActivities() {
  return Object.keys(CROSSWALK);
}
