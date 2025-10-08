let seed = 1337;

function random() {
  seed = (seed * 1103515245 + 12345) % 2 ** 31;
  return seed / 2 ** 31;
}

/**
 * Sets the RNG seed for deterministic sampling.
 * @param {number} value
 */
export function setSamplerSeed(value) {
  seed = Number.isFinite(value) ? value : 1337;
}

const SAMPLERS = {
  '5.G': () => {
    const side = 3 + Math.floor(random() * 5);
    const offset = Math.floor(random() * 4);
    return {
      prompt: `Plot the vertices of a quadrilateral starting at (0, ${offset}) with side length ${side}. Classify the figure.`,
      rubric: 'Correctly plots all vertices and classifies the polygon using side lengths or angles.'
    };
  },
  '8.G': () => {
    const a = 3 + Math.floor(random() * 3);
    const b = 4 + Math.floor(random() * 3);
    return {
      prompt: `Construct a right triangle with legs ${a} and ${b}. Compute the hypotenuse using the Pythagorean Theorem.`,
      rubric: 'Shows calculation of a^2 + b^2 and square root for c.'
    };
  },
  'G-CO.D.13': () => {
    const radius = (Math.floor(random() * 4) + 2) * 5;
    return {
      prompt: `Use classical tools to construct an equilateral triangle inscribed in a circle of radius ${radius}.`,
      rubric: 'Circle constructed, intersections marked, triangle vertices identified, reasoning given.'
    };
  },
  'G-GPE': () => {
    const slope = (Math.floor(random() * 4) + 1);
    const yIntercept = Math.floor(random() * 6) - 3;
    return {
      prompt: `Graph the line y = ${slope}x + ${yIntercept} and prove a segment is parallel using slope relationships.`,
      rubric: 'Correct graph and explanation of equal slopes for parallel lines.'
    };
  }
};

const DEFAULT_SAMPLER = code => ({
  prompt: `Describe a task that demonstrates understanding of ${code}.`,
  rubric: 'Response references the core idea of the listed standard.'
});

/**
 * Returns a deterministic task seed for the provided standard code.
 * @param {string} code
 * @returns {{prompt: string, rubric: string, code: string}}
 */
export function sampleForStandard(code) {
  const sampler = SAMPLERS[code] || DEFAULT_SAMPLER.bind(null, code);
  const payload = sampler();
  return { ...payload, code };
}

/**
 * Builds an exit ticket blueprint for the provided codes.
 * @param {string[]} codes
 * @param {{itemsPerCode?: number}} [options]
 * @returns {Array<{prompt: string, rubric: string, code: string}>}
 */
export function buildExitTicket(codes, options = {}) {
  const itemsPerCode = options.itemsPerCode ?? 2;
  const out = [];
  codes.forEach(code => {
    for (let i = 0; i < itemsPerCode; i += 1) {
      out.push(sampleForStandard(code));
    }
  });
  return out;
}
