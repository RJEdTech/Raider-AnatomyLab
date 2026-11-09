# Raider AnatomyLab

Interactive anatomy and physiology simulations, virtual labs and learning tools for Regis Jesuit Anatomy & Physiology.

**Live site:** https://rjedtech.github.io/Raider-AnatomyLab/

Part of the Raider Labs suite with BioLab, ChemLab, PhysLab, ForensicsLab, AnatomyLab and SportsMedLab.

## Course order
From the course's Canvas modules:

- **Unit 1:** Body terms, planes, cavities and organ systems
- **Unit 2:** Homeostasis
- **Unit 3:** Integumentary system
- **Unit 4:** Skeletal system
- **Unit 5:** Muscular system
- **Unit 6:** Cardiovascular system
- **Unit 7:** Respiratory system
- **Unit 8:** Nervous system

## How it is built
Static site with no build step: `index.html`, `engine.js` and `biolab.css` (shared with the other Raider Labs sites), one file per tool in `sims/`, and `courses.js` for the course order. Everything runs in the browser; no student data leaves the device. See `ENGINE.md` to author a tool.

## License

© 2026 Jason Beyer, RJ Ed Tech. Licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/): free to share and adapt for non-commercial use with credit. See [LICENSE](LICENSE).
