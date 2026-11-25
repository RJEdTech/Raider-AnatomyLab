/* Raider Labs: In the News (data for news.html).
   Newest week first. To add a week: put its stories at the TOP of the array.
   Each story: id, week (YYYY-MM-DD, the Sunday it was added), date (event date),
   title, summary, numbers[] (each with its source link and date), concept{title,html},
   hook{prompt, parts[{label, answer, tol, unit, signHint?}], worked}, hides, evidence,
   investigate, related[{href, label}].
   Rules: every number has a source and date; label company-reported figures;
   name agencies and programs, never parties; no em dashes. */
window.RAIDER_NEWS = [
 {
  "id": "fda-gazyva-membranous-nephropathy-2026",
  "week": "2026-11-22",
  "date": "2026-11-13",
  "title": "FDA approves the first drug for primary membranous nephropathy, a kidney disease where the body attacks its own filters",
  "summary": "The FDA approved obinutuzumab (Gazyva, from Genentech, part of Roche) to bring protein in the urine back toward normal in adults with primary membranous nephropathy who are at risk of getting worse. Until now, doctors had to use drugs approved for other diseases.",
  "numbers": [
   "Approved by the FDA on November 13, 2026; it is the first drug approved specifically for this disease (<a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>; <a href=\"https://www.drugtopics.com/view/gazyva-approved-as-first-drug-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Drug Topics, Nov 16, 2026</a>).",
   "MAJESTY, a phase 3 randomized trial, compared obinutuzumab with tacrolimus in 142 adults (<a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>).",
   "Complete remission at week 104: 26 of 71 patients on obinutuzumab versus 4 of 70 on tacrolimus, reported as 37% vs 6%; the FDA figure is 36% vs 6% (<a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>; <a href=\"https://www.healio.com/news/nephrology/20261117/fda-approves-gazyva-for-proteinuria-remission-in-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Healio, Nov 17, 2026</a>).",
   "Complete or partial remission at week 104: 50% vs 12.9% (Genentech, company-reported, via <a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>).",
   "Complete remission means a urine protein-to-creatinine ratio of 0.3 g/g or less with stable kidney function (NEJM paper, via <a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>).",
   "About 1.2 new cases per 100,000 people a year in the US; up to 30% of untreated patients reach kidney failure within 10 years (Genentech, company-reported, via <a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>).",
   "Serious side effects: 17% vs 14%; the label has boxed warnings for hepatitis B reactivation and a rare brain infection (PML) (<a href=\"https://www.pharmacytimes.com/view/fda-approves-obinutuzumab-for-primary-membranous-nephropathy\" target=\"_blank\" rel=\"noopener\">Pharmacy Times, Nov 16, 2026</a>)."
  ],
  "concept": {
   "title": "The kidney's filter, and why protein in urine is a warning sign",
   "html": "Each kidney has about a million <b>glomeruli</b>, tiny tangles of capillaries that filter blood. The filter has three layers: the capillary wall, the <b>glomerular basement membrane</b>, and cells called <b>podocytes</b> whose foot processes leave narrow slits. Water and small molecules pass through; large proteins like albumin should not. In membranous nephropathy, the immune system makes antibodies against a podocyte protein (usually PLA2R, in 70% to 80% of cases). The antibodies pile up in the basement membrane, damage the filter, and protein leaks into urine. Obinutuzumab binds CD20 on B cells, the white blood cells that make antibodies, and removes them. Fewer antibodies, less damage, less protein in the urine. Doctors track this with the urine protein-to-creatinine ratio (UPCR), which corrects for how dilute the urine is."
  },
  "hook": {
   "prompt": "Parts (a) to (c) use the trial counts. Part (d) uses a made-up patient.",
   "parts": [
    {
     "label": "(a) What percent of the 71 obinutuzumab patients reached complete remission?",
     "answer": 36.6,
     "tol": 0.3,
     "unit": "%"
    },
    {
     "label": "(b) How many percentage points higher is that than the tacrolimus group (4 of 70)?",
     "answer": 30.9,
     "tol": 0.4,
     "unit": "points"
    },
    {
     "label": "(c) About how many patients must be treated with obinutuzumab instead of tacrolimus for one extra complete remission?",
     "answer": 3.2,
     "tol": 0.1,
     "unit": "patients"
    },
    {
     "label": "(d) A patient's urine has 450 mg/dL protein and 75 mg/dL creatinine. By what percent must the UPCR fall to reach 0.3 g/g?",
     "answer": 95,
     "tol": 0.3,
     "unit": "%"
    }
   ],
   "worked": "(a) 26 &divide; 71 = 0.366, about <b>36.6%</b>. (b) 4 &divide; 70 = 5.7%, and 36.6 &minus; 5.7 = <b>30.9 points</b>. (c) 1 &divide; 0.309 = <b>about 3.2 patients</b> (the number needed to treat). (d) UPCR = 450 &divide; 75 = 6.0 g/g (the units cancel, mg/dL over mg/dL). (6.0 &minus; 0.3) &divide; 6.0 = 0.95, a <b>95%</b> drop."
  },
  "hides": "The trial was open-label: patients and doctors knew which drug was given. It compared obinutuzumab with tacrolimus, not with rituximab or cyclophosphamide, which many doctors also use. There was no significant difference in loss of kidney function over the trial, which is what patients care about most; remission of proteinuria is a sign of healing, not proof of avoiding kidney failure. The 37% figure uses a statistical method for missing data, so it differs slightly from 26 of 71.",
  "evidence": "Strong: FDA approval based on a phase 3 randomized trial published in the <i>New England Journal of Medicine</i>, read through trade-press coverage of the FDA and company releases, not the FDA page or the paper itself. Incidence and progression figures are company-reported.",
  "investigate": "Look up the trial on <a href=\"https://clinicaltrials.gov/study/NCT04629248\" target=\"_blank\" rel=\"noopener\">ClinicalTrials.gov (NCT04629248)</a>. How long did patients take each drug, and what were the secondary outcomes? Why might a trial measure protein in urine instead of waiting years for kidney failure?",
  "related": [
   {
    "href": "index.html#egfr",
    "label": "Kidney math: eGFR"
   },
   {
    "href": "index.html#homeostasis",
    "label": "Homeostasis"
   }
  ]
 }
];
