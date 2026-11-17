/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
heart:[
 {k:'blue',s:'Blood in your veins is blue.',fact:false,why:'Blood is always red. Oxygen-poor blood is a darker red. Veins look blue because of how light passes through skin.'},
 {k:'left',s:'The left ventricle has the thickest wall of the heart’s four chambers.',fact:true,why:'It pumps blood out to the whole body, which takes much more pressure than pumping to the lungs.'},
 {k:'arteries',s:'All arteries carry oxygen-rich blood.',fact:false,why:'Arteries carry blood away from the heart. The pulmonary arteries carry oxygen-poor blood to the lungs.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of AnatomyLab. */
BioLab.addMyths({
bodymap:[
 {k:'anat',s:'Anatomical position means standing, facing forward, palms facing forward.',fact:true,why:'Every direction term (left, right, anterior, proximal) is described from this position.'},
 {k:'left',s:'On a diagram of a person facing you, the patient’s left is on your left.',fact:false,why:'Their left is on your right. Left and right are always the patient’s.'},
 {k:'sag',s:'A sagittal plane divides the body into left and right parts.',fact:true,why:'A frontal (coronal) plane divides front from back; a transverse plane divides top from bottom.'}
],
skeleton:[
 {k:'206',s:'Adults have about 206 bones.',fact:true,why:'Babies are born with closer to 300; many fuse as they grow.'},
 {k:'dead',s:'Bones are dead, dry structures.',fact:false,why:'Bones are living tissue with blood vessels and cells that constantly rebuild them.'},
 {k:'femur',s:'The femur is the longest bone in the body.',fact:true,why:'It is about a quarter of a person’s height.'}
],
movements:[
 {k:'flex',s:'Bending your elbow is flexion.',fact:true,why:'Flexion decreases the angle at a joint; extension increases it.'},
 {k:'abd',s:'Abduction moves a limb toward the midline of the body.',fact:false,why:'Abduction moves it away (“abduct” = take away). Adduction moves it toward the midline.'},
 {k:'ball',s:'The shoulder is a ball-and-socket joint.',fact:true,why:'That is why it moves in more directions than any other joint, and dislocates more often.'}
],
muscles:[
 {k:'push',s:'Muscles can push as well as pull.',fact:false,why:'Muscles only pull. That is why they work in opposing pairs, like the biceps and triceps.'},
 {k:'heart',s:'The heart is made of a special kind of muscle.',fact:true,why:'Cardiac muscle contracts on its own rhythm and doesn’t tire like skeletal muscle.'},
 {k:'quad',s:'The quadriceps straighten the knee.',fact:true,why:'The hamstrings, on the back of the thigh, bend it.'}
],
contraction:[
 {k:'atp',s:'Muscles need ATP both to contract and to relax.',fact:true,why:'ATP lets myosin let go of actin. Without it, muscles lock, as in rigor mortis.'},
 {k:'lactic',s:'Lactic acid is the cause of next-day muscle soreness.',fact:false,why:'Lactate clears within about an hour. Next-day soreness comes from small muscle fiber damage.'},
 {k:'slide',s:'A muscle shortens when thin filaments slide past thick ones.',fact:true,why:'That is the sliding filament model. The filaments don’t get shorter themselves.'}
],
neuron:[
 {k:'all',s:'A neuron fires fully or not at all.',fact:true,why:'A stronger stimulus makes neurons fire more often, not make bigger signals.'},
 {k:'10',s:'You only use 10 percent of your brain.',fact:false,why:'Brain scans show activity throughout, and damage to almost any area causes problems.'},
 {k:'myelin',s:'Myelin makes nerve signals travel faster.',fact:true,why:'Signals jump between gaps in the myelin sheath.'}
],
nsmap:[
 {k:'cns',s:'The central nervous system is the brain and spinal cord.',fact:true,why:'Everything else, the nerves that reach the body, is the peripheral nervous system.'},
 {k:'reflex',s:'Every reflex has to go through the brain.',fact:false,why:'Many reflexes, like the knee jerk, loop through the spinal cord, which makes them faster.'},
 {k:'symp',s:'The sympathetic nervous system drives the “fight or flight” response.',fact:true,why:'It speeds the heart and opens the airways; the parasympathetic system calms things down.'}
],
reaction:[
 {k:'instant',s:'Reaction time is instant if you are paying attention.',fact:false,why:'Signals take time to travel and be processed. A typical simple reaction time is about 0.2 to 0.25 seconds.'},
 {k:'practice',s:'Practice can make reaction times faster.',fact:true,why:'Familiar patterns are recognized sooner, which is why athletes drill.'},
 {k:'phone',s:'Using a phone while driving slows reaction time.',fact:true,why:'Divided attention delays noticing and responding to hazards.'}
],
skin:[
 {k:'organ',s:'Skin is the body’s largest organ.',fact:true,why:'It covers about 1.5 to 2 square meters in an adult.'},
 {k:'tongue',s:'Each part of the tongue tastes only one flavor.',fact:false,why:'The “tongue map” is a myth. Taste buds all over the tongue detect all basic tastes.'},
 {k:'fingers',s:'Fingertips can tell two close points apart better than your back can.',fact:true,why:'They have many more touch receptors packed close together.'}
],
breathing:[
 {k:'push',s:'Your lungs pull air in by themselves.',fact:false,why:'The diaphragm contracts and moves down, which lowers the pressure in the chest so air flows in.'},
 {k:'co2',s:'The urge to breathe comes mostly from rising carbon dioxide, not falling oxygen.',fact:true,why:'Sensors detect CO₂ (and the acid it makes) in the blood.'},
 {k:'alveoli',s:'Gas exchange happens in tiny air sacs called alveoli.',fact:true,why:'Their thin walls and huge total area let oxygen and CO₂ move quickly.'}
],
spirometry:[
 {k:'race',s:'Spirometers have long used separate “normal” values by race.',fact:true,why:'Race-based equations were standard for decades. In 2023 the American Thoracic Society recommended a race-neutral equation.'},
 {k:'size',s:'Lung capacity depends only on fitness.',fact:false,why:'Height, age and sex matter a lot. Training improves how well you use your lungs more than their size.'},
 {k:'fev1',s:'FEV₁ is how much air you can blow out in the first second.',fact:true,why:'A low FEV₁ compared with total capacity points to narrowed airways, as in asthma.'}
],
egfr:[
 {k:'race',s:'Kidney function equations used to include a race factor.',fact:true,why:'In 2021, U.S. kidney groups recommended a new equation without race, and transplant waitlists were adjusted.'},
 {k:'water',s:'Drinking more water always improves kidney function numbers.',fact:false,why:'Staying hydrated helps, but eGFR mostly reflects how well the kidneys filter, which water doesn’t fix.'},
 {k:'cut',s:'Where a cutoff is set decides who gets labeled sick.',fact:true,why:'A small change in the formula can move people across a treatment line.'}
],
homeostasis:[
 {k:'neg',s:'Negative feedback brings a change back toward normal.',fact:true,why:'When blood sugar rises, insulin brings it back down.'},
 {k:'sweat',s:'Sweat cools you because the sweat itself is cold.',fact:false,why:'It cools you as it evaporates, taking heat from your skin.'},
 {k:'insulin',s:'Insulin lowers blood sugar.',fact:true,why:'It signals cells to take up glucose.'}
],
transport:[
 {k:'osm',s:'Water moves by osmosis toward the side with more dissolved solutes.',fact:true,why:'That side has a lower water concentration.'},
 {k:'energy',s:'Diffusion needs energy from ATP.',fact:false,why:'Diffusion is passive. Moving against the gradient (active transport) needs ATP.'},
 {k:'iv',s:'IV fluids are made to match the salt level of blood.',fact:true,why:'An isotonic solution keeps blood cells from shrinking or bursting.'}
],
dissection:[
 {k:'pig',s:'A fetal pig has organ systems very similar to a human’s.',fact:true,why:'Both are mammals.'},
 {k:'heart',s:'Insects have no heart.',fact:false,why:'A grasshopper has a tube-shaped heart along its back.'},
 {k:'cord',s:'The umbilical cord carries nutrients and oxygen to the fetus.',fact:true,why:'It connects the fetus to the placenta.'}
]
});
