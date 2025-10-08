# Interactive Geometry

An interactive Euclidean geometry playground with scaffolded activities, teacher tools, and a geometry dictionary. The live site is hosted at [https://maxaeon.github.io/geometry/](https://maxaeon.github.io/geometry/).

## Current Status

* Standards-aligned activities for grades K–12 are being seeded across the activity runner. Each activity now surfaces its California and Michigan Common Core alignment through an on-canvas standards chip and a teacher-facing overlay.
* The geometry engine is being hardened with reusable validators and measurement helpers to support robust automatic checks.
* Accessibility, teacher evidence capture, and mathematical practice prompts are actively expanding.

## Standards Alignment (CA & MI)

California and Michigan both adopt the Common Core State Standards for Mathematics (CCSSM). The project maintains state-specific provenance in `data/standards/ca_ccssm_geometry.json` (California Department of Education, 2013) and `data/standards/mi_ccssm_geometry.json` (Michigan Department of Education, 2010). Core geometry identifiers (K.G–8.G, G-CO, G-SRT, G-C, G-GPE, G-GMD, G-MG) are shared across states, so a single crosswalk powers the multi-state alignment.

* CA CCSSM reference PDF: <https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf>
* Michigan K-12 Mathematics Standards: <https://www.michigan.gov/-/media/Project/Websites/mde/Academic-Standards/Mathematics/Michigan_K-12_Mathematics_Standards.pdf>

Every activity exposes its content and practice codes in the standards chip located next to the toolbar. Teachers can toggle between CA and MI through the settings selector without reloading the activity. Detailed mappings live in [`docs/standards-alignment.md`](docs/standards-alignment.md).

## Mathematical Practices

The Standards for Mathematical Practice (SMP 1–8) are embedded in the activity metadata. UI hooks encourage each practice—for example, SMP 3 prompts students to justify their reasoning, while SMP 5 nudges learners to try alternative tools. A concise reference to the practices is available from the Geometry Dictionary and the teacher overlay. Additional context: <https://www.cde.ca.gov/ci/ma/cf/documents/mathfwchapter2.pdf>

## Directory Highlights

```
/data/standards           # CA & MI CCSSM geometry metadata
/data/activities          # Grade-banded activity specifications
/data/vocabulary.json     # Geometry dictionary entries
/src/engine               # Geometry primitives, transforms, validators
/src/standards            # Registry loader, crosswalk, assessment samplers
/src/ui                   # Activity runner, dictionary, accessibility, teacher tools
/tests                    # Jest unit tests & Cypress end-to-end specs
```

## Tooling

`package.json` defines scripts for local development:

* `npm run dev` – start Vite for rapid prototyping
* `npm run build` – produce a production bundle
* `npm run test` – run Jest unit tests
* `npm run cy:open` – launch the Cypress runner
* `npm run lint` – execute ESLint with jsdoc rules

## Contributing

1. Clone the repository and install dependencies with `npm install`.
2. Run `npm run dev` to iterate locally; the site will hot-reload changes.
3. Add unit tests in `tests/unit` or E2E flows in `tests/e2e` for new functionality.
4. Verify accessibility and keyboard navigation before submitting a pull request.

Feedback and pull requests are welcome to expand the activity library, strengthen the geometry engine, and extend standards coverage.
