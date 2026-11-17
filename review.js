BioLab.addReview({});
/* Fall final review: homeostasis (Nov 2026) */
BioLab.addReview({
homeostasis:{questions:[
  {id:'negfb',kind:'test',lvl:'bio',q:'Most of the body’s control systems use negative feedback. What does that mean?',
    choices:['The body makes a change bigger and bigger','A change triggers a response that reverses it','The body ignores small changes until they grow','Hormones always shut off once they are released'],correct:1,
    steps:['A sensor detects a change, like rising blood sugar.','The control center triggers a response that reverses it.','The condition returns toward its set point, like a thermostat.'],lab:{set:{mode:'glucose',carbs:100},look:'Eat a meal and watch blood sugar come back down.'}},
  {id:'insulin',kind:'test',lvl:'bio',q:'After a big meal, blood sugar rises. Which hormone brings it back down?',
    choices:['Glucagon','Adrenaline','Insulin','Thyroxine'],correct:2,
    steps:['The pancreas senses high blood glucose.','It releases insulin.','Insulin helps cells take up glucose and the liver store it, so blood sugar falls.'],lab:{set:{mode:'glucose',carbs:120},look:'Watch insulin rise after the meal.'}},
  {id:'glucagon',kind:'test',lvl:'bio',q:'During a long run, blood sugar starts to drop. What does the body do?',
    choices:['The pancreas releases glucagon; the liver releases glucose','The pancreas releases more insulin to move sugar into cells','Breathing slows down to save the sugar','Nothing happens until the run is over'],correct:0,
    steps:['Muscles burn glucose during exercise.','Low blood sugar triggers glucagon from the pancreas.','Glucagon tells the liver to break down glycogen and release glucose.']},
  {id:'cold',kind:'test',lvl:'bio',q:'You step out into the snow. How does your body hold its temperature?',
    choices:['Sweating more to keep the skin dry','Widening the blood vessels in the skin to warm it','Breathing slower to hold in warm air','Shivering and narrowing skin blood vessels'],correct:3,
    steps:['Sensors in the skin and brain detect cooling.','Shivering muscles produce heat.','Narrowed skin blood vessels send less warm blood to the surface, so less heat is lost.'],lab:{set:{mode:'temp',ta:-10},look:'Lower the air temperature.'}},
  {id:'sweat',kind:'real',lvl:'bio',q:'Why is a hot, humid day more dangerous for overheating than a hot, dry one?',
    choices:['Humid air is hotter than dry air at the same reading','Sweat can’t evaporate well, so it cools you less','You sweat less on humid days, so you overheat','Humid air has less oxygen, so you work harder'],correct:1,
    steps:['Sweat cools you only when it evaporates.','Humid air already holds a lot of water vapor.','So sweat drips off instead of evaporating, and body temperature can climb.'],lab:{set:{mode:'temp',ta:38},look:'Raise the air temperature and watch the sweat response.'}}
]}
});
