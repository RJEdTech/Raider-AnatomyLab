/* Where science meets philosophy + How exact does it need to be? (Nov 19, 2026; follows the BioLab/PhysLab pilot of Nov 17)
   One entry per tool. Rendered by the engine below the stage in Full lab and at the end of Learn it.
   Standard: teach, don't preach. Name each thinker's view fairly, state definitive Church teaching as the Church's teaching,
   and leave open questions open (no answer key). Every number has a source and a year. */
BioLab.addBorder({
neuron: {
  q: 'Is a thought just neurons firing?',
  saw: 'Past threshold, Na⁺ rushed in, K⁺ rushed out, and an all-or-none spike raced down the axon. Every signal in your nervous system is built from spikes like this one.',
  assumes: [
    'The voltages we record match what the neuron is really doing.',
    'Other people have inner experiences like yours. No meter shows this directly; we trust it from what people say and do.',
    'What a person reports (“I felt that”) counts as evidence alongside the readings.'
  ],
  stops: 'Neuroscience can map which neurons fire when you see red, feel pain or decide to move. Why those spikes come with an inner experience (what it is like to be you) is not answered by the voltage trace. Philosophers call this “the hard problem.”',
  church: 'The Church teaches that a human person is one being, body and soul together. The soul is the “form” of the body, so we are not a ghost living in a machine, and the body shares in the dignity of being made in God’s image (Catechism nos. 362–365). So the Church welcomes brain science: studying neurons is studying a living person. It also holds that understanding and free choice are more than chemistry.',
  views: [
    { who: 'René Descartes', when: '1641', says: 'Mind and body are two different kinds of thing. The body is a machine; the thinking self is not made of matter at all.' },
    { who: 'Aristotle and Thomas Aquinas', when: '4th century BC; 13th century', says: 'The soul is not a separate thing inside the body; it is what makes the body a living human. Body and soul make one person.' },
    { who: 'Francis Crick', when: '<i>The Astonishing Hypothesis</i>, 1994', says: 'Everything you are, your joys, memories and choices, comes down to what billions of nerve cells and their molecules do.' },
    { who: 'David Chalmers', when: '1995', says: 'Even a complete map of the brain would leave a question: why is there something it feels like to be you? He named this the “hard problem” of consciousness.' },
    { who: 'Edith Stein (St. Teresa Benedicta of the Cross)', when: '1917', says: 'We know other people’s inner lives through empathy, a real way of knowing that is different from measuring.' }
  ],
  margin: {
    lead: 'Even basic numbers about the nervous system come as ranges.',
    rows: [
      { what: 'Neurons in the human brain', value: 'About 86 billion', range: '± 8 billion across the four brains studied', how: 'Dissolving brain tissue and counting cell nuclei (Azevedo et al., 2009)', enough: 'Grasping the scale. The old “100 billion” was a rough guess.' },
      { what: 'Resting potential', value: 'About −70 mV', range: 'Roughly −60 to −80 mV, depending on the cell', how: 'Microelectrodes inside single cells', enough: 'Predicting threshold in this model.' },
      { what: 'Conduction speed', value: '0.5 to 120 m/s', range: 'More than 200 times faster in thick, myelinated fibers than in thin, bare ones', how: 'Timing a signal between two electrodes', enough: 'Explaining why a sharp pain arrives before the slow ache.' }
    ]
  }
}
});
