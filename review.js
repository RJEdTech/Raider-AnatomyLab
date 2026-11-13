BioLab.addReview({});
/* Fall final review: homeostasis (Nov 2026) */
BioLab.addReview({
homeostasis:{questions:[
  {id:'negfb',kind:'test',lvl:'bio',q:'Most of the body’s control systems use negative feedback. What does that mean?',
    choices:['The body makes a change bigger and bigger','A change triggers a response that pushes the condition back toward normal','The body ignores small changes','Hormones always shut off'],correct:1,
    steps:['A sensor detects a change, like rising blood sugar.','The control center triggers a response that reverses it.','The condition returns toward its set point, like a thermostat.'],lab:{set:{mode:'glucose',carbs:100},look:'Eat a meal and watch blood sugar come back down.'}},
  {id:'insulin',kind:'test',lvl:'bio',q:'After a big meal, blood sugar rises. Which hormone brings it back down?',
    choices:['Glucagon','Adrenaline','Insulin, from the pancreas','Thyroxine'],correct:2,
    steps:['The pancreas senses high blood glucose.','It releases insulin.','Insulin helps cells take up glucose and the liver store it, so blood sugar falls.'],lab:{set:{mode:'glucose',carbs:120},look:'Watch insulin rise after the meal.'}},
  {id:'glucagon',kind:'test',lvl:'bio',q:'During a long run, blood sugar starts to drop. What does the body do?',
    choices:['The pancreas releases glucagon, and the liver releases stored glucose','It releases more insulin','It stops breathing faster','Nothing'],correct:0,
    steps:['Muscles burn glucose during exercise.','Low blood sugar triggers glucagon from the pancreas.','Glucagon tells the liver to break down glycogen and release glucose.']},
  {id:'cold',kind:'test',lvl:'bio',q:'You step out into the snow. How does your body hold its temperature?',
    choices:['Sweating more','Widening blood vessels in the skin','Breathing slower','Shivering and narrowing blood vessels in the skin to keep heat in the core'],correct:3,
    steps:['Sensors in the skin and brain detect cooling.','Shivering muscles produce heat.','Narrowed skin blood vessels send less warm blood to the surface, so less heat is lost.'],lab:{set:{mode:'temp',ta:-10},look:'Lower the air temperature.'}},
  {id:'sweat',kind:'real',lvl:'bio',q:'Why is a hot, humid day more dangerous for overheating than a hot, dry one?',
    choices:['Humid air is hotter','Sweat can’t evaporate as well in humid air, so it cools you less','You sweat less when it is humid','Humid air has less oxygen'],correct:1,
    steps:['Sweat cools you only when it evaporates.','Humid air already holds a lot of water vapor.','So sweat drips off instead of evaporating, and body temperature can climb.'],lab:{set:{mode:'temp',ta:38},look:'Raise the air temperature and watch the sweat response.'}}
]}
});
