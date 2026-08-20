/**
 * Written guides.
 *
 * Not part of AppData — these ship with the app and are never stored, so they
 * cost nothing to change and never need a migration. Body text is an array of
 * paragraphs rather than markdown, because a markdown parser is a dependency
 * and this is a list of <p> tags.
 */

export type LessonTopic = 'swim' | 'run' | 'sauna' | 'training' | 'nutrition'

export interface Lesson {
  id: string
  title: string
  /** One line, shown in the list before you open it. */
  summary: string
  topic: LessonTopic
  body: string[]
  /** Exercises this explains — lets a drill link to the guide behind it. */
  relatedExerciseIds?: string[]
  /** Where it came from, when it came from a reel rather than being written here. */
  sourceUrl?: string
  creator?: string
}

export const TOPIC_LABEL: Record<LessonTopic, string> = {
  swim: '🏊 Swimming',
  run: '🏃 Running',
  sauna: '🔥 Sauna',
  training: '🏋️ Training',
  nutrition: '🥗 Food',
}

export const LESSONS: Lesson[] = [
  // ============================ NUTRITION ============================
  //
  // Ground rules for anything added to this section, in keeping with the rest
  // of the app: give the range the evidence actually supports, say what it
  // rests on, and never turn a population number into a claim about this
  // person's body. Anything involving a health condition, a medication or a
  // diagnosed deficiency is a doctor's or dietitian's question, and these
  // guides say so rather than answering it.
  {
    id: 'ls-protein',
    title: 'Protein: how much, and why that number',
    summary: '1.6–2.2 g per kg. Where the range comes from and what happens above it.',
    topic: 'nutrition',
    body: [
      'If you lift and run, protein is the one macronutrient worth being deliberate about. The rest of your diet has more room for preference than the internet suggests; this bit does not.',
      'The range that repeated analyses keep landing on is 1.6 to 2.2 grams per kilogram of bodyweight per day for people training hard. Below roughly 1.6 you leave adaptation on the table. Above roughly 2.2 the extra has no measurable effect on muscle — it is not harmful for a healthy person, it is just breakfast you paid twice for.',
      'At 80kg that is about 130–175g a day. The app can do this arithmetic with your logged bodyweight: Progress → Body → add an entry, and the number appears instead of the formula.',
      'Spread it across three or four meals rather than stacking it into dinner. Each meal landing somewhere around 0.3 g/kg — 25 to 40g for most people — is the practical version of this.',
      'Timing matters far less than the daily total. The "anabolic window" turned out to be a barn door: if you have eaten protein in the last few hours and will again in the next few, you are fine. The exception is genuinely back-to-back sessions, where getting protein and carbohydrate in soon after the first one helps the second.',
      'Sources are unremarkable on purpose: dairy, eggs, meat, fish, soy, legumes, and a whey or plant powder when convenience is the obstacle. Powder is food, not a supplement, whatever the tub says.',
      'If you have kidney disease or any condition that affects how you handle protein, this guide is not for you — that is a question for your doctor, not an app.',
    ],
  },
  {
    id: 'ls-fuelling',
    title: 'Fuelling a long session',
    summary: 'Under an hour, nothing. Over two, it is part of the session — and the gut is trainable.',
    topic: 'nutrition',
    body: [
      'Short version: under an hour you need water. Between one and two hours, 30–60g of carbohydrate an hour helps. Past two and a half hours, 60–90 g/h, and at that point fuelling is not an accessory to the session, it is part of it.',
      'The reason the numbers climb is absorption, not appetite. Glucose transport across the gut wall saturates somewhere around 60g an hour. Adding fructose, which uses a different route, is what makes 90 possible — which is why sports products list two sugars rather than one.',
      'The number that matters most is the one nobody advertises: your gut is trainable, and untrained it will reject what your legs need. Taking 80 g/h for the first time on race day is a well-documented way to spend the last 10km in a portable toilet.',
      'So practise it. Every long run in this app that crosses the threshold shows you a fuelling line, and the point of it is rehearsal — same products, same timing, same amounts you intend to use on the day.',
      'Start before you feel you need it. By the time you feel empty you are twenty minutes behind, and no amount of gel fixes it quickly.',
      'Drink to thirst. Overdrinking is a real risk in long events and the consequences are worse than mild dehydration. If you sweat heavily or the race is hot, sodium matters — see the hydration guide.',
      'These are population ranges. Bodyweight, intensity, heat and the individual gut all move them, and the only reliable data is your own.',
    ],
  },
  {
    id: 'ls-eating-around-lifting',
    title: 'Eating around a lifting session',
    summary: 'Much less complicated than it is made to sound.',
    topic: 'nutrition',
    body: [
      'A gym session is 45 to 90 minutes of intermittent work. It does not need special fuelling, and most of what is sold for it exists because a supplement industry needs something to sell.',
      'Eat a normal meal one to three hours beforehand, with carbohydrate in it. If you train early and eating first makes you feel sick, train fasted — the difference in a session of this length is small, and feeling good is worth more than the margin.',
      'During the session: water. Anything else is optional at this duration.',
      'Afterwards, eat. Protein and carbohydrate, in whatever form your day normally takes. The urgency is overstated for one session a day; it becomes real only when the next session is a few hours away.',
      'The thing that actually limits most people is total daily food, not timing. Consistently under-eating while training hard shows up as stalled lifts, poor sleep and a mood the weekly review will notice before you do.',
    ],
  },
  {
    id: 'ls-supplements',
    title: 'Supplements: the short list',
    summary: 'Three that hold up, several that do not, and what "no evidence" actually means.',
    topic: 'nutrition',
    body: [
      'Almost nothing in a supplement shop does anything. A small number of things do, and they are cheap and boring.',
      'Creatine monohydrate is the most studied ergogenic aid there is. Roughly 3–5g a day, timing irrelevant, no loading phase required. It helps repeated high-effort work — sets in the gym, the stations in a Hyrox — more than it helps a marathon. The weight gain people worry about is water inside muscle, not fat. Buy the cheapest monohydrate you can find; the fancy forms exist for margin.',
      'Caffeine works, reliably, for endurance and for perceived effort. Roughly 3–6 mg per kg an hour before. It is also the one most likely to wreck your sleep, and sleep is worth more than the session it improved. If you train in the evening, be careful.',
      'Vitamin D is worth attention at northern latitudes in winter, when sun exposure genuinely cannot cover it. That is a blood-test question rather than a guess.',
      'Beta-alanine has real evidence for efforts in the one-to-several-minute range, with the harmless but startling side effect of skin tingling. Nitrate/beetroot has some evidence for endurance. Both are marginal next to sleeping properly.',
      'Everything else — BCAAs alongside adequate protein, testosterone boosters, most "recovery" blends, fat burners — is either redundant or unsupported. BCAAs in particular are protein you already ate, sold at a markup.',
      'Two cautions worth more than any of the above. Supplements are poorly regulated in most countries and contamination is a documented problem; if you are ever drug-tested, only use products batch-tested by a scheme like Informed Sport. And if you take medication or have a health condition, check interactions with a pharmacist or doctor rather than an app.',
    ],
  },
  {
    id: 'ls-hydration',
    title: 'Water, salt and the sauna',
    summary: 'Drink to thirst, take sodium seriously in heat, and stop weighing yourself wet.',
    topic: 'nutrition',
    body: [
      'Drinking to thirst is good enough for almost every session almost every time. The elaborate hydration protocols of the 2000s were built on the assumption that any dehydration hurts performance, which turned out to be roughly untrue at the levels most people experience.',
      'The genuine risk at the other end is hyponatremia — diluting your blood sodium by drinking large volumes of plain water during a long event. It is rarer than dehydration and considerably more dangerous. If you are out for hours, especially in heat, sodium belongs in what you drink.',
      'Sweat rates vary by a factor of three between people, which is why every general number here is soft. If you want your own: weigh yourself before and after a hard hour, and each kilogram lost is roughly a litre of sweat. That is the only personalised figure in this guide, and you have to generate it yourself.',
      'Sauna is a fluid loss with no training stimulus attached. Rehydrate afterwards, with something containing sodium if you were in long enough to be genuinely wrung out. Do not use the sauna to make weight and then race.',
      'Alcohol after a session interferes with the adaptation you just paid for and with the sleep that consolidates it. This is not a moral point; it is the reason a heavy Friday shows up in Saturday\'s session.',
    ],
  },
  {
    id: 'ls-race-day-food',
    title: 'Race morning',
    summary: 'The meal you have already practised, at the time you have already practised it.',
    topic: 'nutrition',
    body: [
      'Nothing new. Not the breakfast, not the gel brand, not the coffee, not the shoes. Race morning is the worst possible venue for an experiment.',
      'Eat a carbohydrate-based meal two to three hours before the start — familiar, low in fibre, low in fat, big enough to matter and small enough to sit still. Most people land somewhere between 1 and 4 g of carbohydrate per kg of bodyweight, and where you land inside that is a thing you learn in training.',
      'Top up with something small 30–60 minutes before if the gap has stretched.',
      'For a marathon, carbohydrate loading in the two or three days beforehand is one of the few things with a genuinely large effect. It means eating more carbohydrate while training less, which feels wrong and works. It also means a couple of kilograms of water weight — that is the stored fuel, not a problem.',
      'For a Hyrox, the event is about an hour: a normal pre-race meal is enough and there is no in-race fuelling to rehearse beyond a mouthful of water.',
      'Have a plan for what you do if something goes wrong — a dropped bottle, a station with a queue, a stomach that will not take a gel. Deciding in advance is worth more than any product.',
    ],
  },

  // ============================ SWIMMING ============================
  {
    id: 'ls-swim-session',
    title: 'How a swim session is built',
    summary: 'Warm-up, drills, main set, cool-down — and why the order is not negotiable.',
    topic: 'swim',
    body: [
      'Almost every structured swim session has the same four parts, and they go in this order for a reason.',
      'Warm-up (200–400m). Easy, continuous, mixed strokes. You are not warming up muscles so much as re-learning the water — the first hundred metres of any swim always feel worse than the second.',
      'Drills (2–4 × 50m). Technique work goes here, while you are warm but not tired. Doing drills at the end of a session teaches you what bad technique feels like, because that is all you are capable of by then.',
      'Main set. The actual work: distance, intervals, or speed depending on the day. This is the part that changes between the three session types in the Swim program.',
      'Cool-down (200m). Easy, no clock. It feels optional and it is the cheapest thing in the whole session.',
      'Sets are written as "8 × 50m on 20s" — eight repeats of fifty metres, with twenty seconds rest between each. Some clubs write "on 1:00" instead, meaning each repeat starts every sixty seconds, so swimming faster earns you more rest. This app uses the first form because it does not need a pace clock.',
    ],
  },
  {
    id: 'ls-swim-freestyle',
    title: 'Freestyle: the four things that matter',
    summary: 'Body position, rotation, the catch, breathing. In that order.',
    topic: 'swim',
    relatedExerciseIds: ['sw-free', 'sw-catch-up', 'sw-fist'],
    body: [
      'Fixing freestyle in the wrong order wastes years. These four are roughly in order of how much they cost you.',
      '1. Body position. If your hips sink, you are dragging a parachute and nothing else you do matters. The fix is almost never "kick harder" — it is pressing your chest down into the water. Your lungs are a float; lean on them and the hips come up on their own.',
      '2. Rotation. Freestyle is swum on your side, not flat on your stomach. Both shoulders should clear the water each stroke cycle. Rotation is what lets you reach further and use your back rather than just your arm.',
      '3. The catch. Most swimmers push water backwards with a straight arm dropping from the shoulder. What you want is a high elbow with the forearm facing back like a paddle. Fist drill teaches this faster than any explanation — swim with closed fists for 50m, then open them, and the sudden grip on the water is the feeling you are chasing.',
      '4. Breathing. Rotate to breathe, do not lift to breathe. One goggle stays in the water. If you are lifting your head, your hips drop, and you are back to problem one.',
      'Notice what is not on this list: kicking. In distance freestyle the kick contributes very little propulsion. It is mostly there to keep you balanced and streamlined.',
    ],
  },
  {
    id: 'ls-swim-breathing',
    title: 'Breathing without the panic',
    summary: 'The problem is almost never the inhale.',
    topic: 'swim',
    relatedExerciseIds: ['sw-free'],
    body: [
      'If you get out of breath after 50m, you are probably holding your breath.',
      'On land, you exhale passively. In water, people hold air in and then try to exhale and inhale in the fraction of a second their mouth is clear. It cannot be done, so they surface already full of stale air with nowhere to put a new breath. That is the panic.',
      'The fix: breathe out steadily through your nose and mouth the entire time your face is in the water. A slow continuous hum works. When you rotate to breathe, your lungs are already empty and all you have to do is inhale.',
      'Bilateral breathing — every three strokes, alternating sides — is worth learning because it keeps your stroke symmetrical and lets you sight both ways in open water. But if you are still building fitness, breathing every two strokes to your good side is completely fine. Symmetry is a refinement, not a prerequisite.',
    ],
  },
  {
    id: 'ls-swim-drills',
    title: 'What each drill is actually for',
    summary: 'A drill you do not understand is just slow swimming.',
    topic: 'swim',
    relatedExerciseIds: ['sw-catch-up', 'sw-fist', 'sw-single-arm', 'sw-6-kick', 'sw-sculling', 'sw-kick-board', 'sw-pull-buoy'],
    body: [
      'Catch-up — one hand waits at full extension until the other touches it. Fixes a rushed, windmilling stroke and forces you to hold a long body line.',
      'Fist — swim with closed fists. Teaches the high-elbow catch by taking your hand away, so you learn to feel water on the forearm.',
      'Single-arm — one arm works, the other rests at your side (not out front, which lets you cheat). Forces rotation and exposes which side is weaker.',
      '6-kick switch — six kicks on your side, then switch. The balance drill. If you cannot hold this position, your freestyle is being swum flat.',
      'Sculling — small figure-eight sweeps, elbows high. The purest "what does holding water feel like" drill. Boring and unusually valuable.',
      'Kick with a board — isolates the legs. Kick from the hip with loose ankles; a loud kick is a knee-bending kick, and it is slow.',
      'Pull with a buoy — isolates the arms. It is not a rest, it is an upper-body set.',
      'Do drills at 50m at a time, thinking about one thing. A 400m drill where your mind wandered after the first length is a 50m drill and 350m of practising your bad habit.',
    ],
  },
  {
    id: 'ls-swim-css',
    title: 'Finding your pace: the CSS test',
    summary: 'Two swims, a bit of arithmetic, and every future session has a number.',
    topic: 'swim',
    body: [
      'Critical Swim Speed is the pace you could theoretically hold for a very long time — roughly your threshold. It gives every other session a reference point.',
      'The test: fully warm up, then swim 400m as fast as you can sustain evenly. Rest properly, at least 10 minutes. Then swim 200m all out. Record both times in seconds.',
      'CSS pace per 100m = (400 − 200) ÷ (time400 − time200), then divide 100 by that number. In practice: subtract the 200m time from the 400m time, and that difference IS your CSS pace per 100m.',
      'Example: 400m in 6:40 (400s) and 200m in 3:05 (185s). 400 − 185 = 215 seconds per 200m, so 1:47 per 100m.',
      'How to use it: endurance sets go at CSS or a couple of seconds slower. Speed sets go 5+ seconds per 100m faster with long rest. Easy and cool-down swimming goes as slow as you like — genuinely slow, not "slightly less hard".',
      'Retest every couple of months. Watching that number fall is far more motivating than watching total metres go up.',
    ],
  },
  {
    id: 'ls-swim-openwater',
    title: 'Open water: what actually changes',
    summary: 'No walls, no line on the floor, and water that can hurt you.',
    topic: 'swim',
    relatedExerciseIds: ['sw-open-water'],
    body: [
      'Sighting. There is no black line to follow, so you lift your eyes just above the surface every six to eight strokes, then put your face straight back down. Crocodile eyes — the higher you lift, the more your hips sink. Practise it in the pool first.',
      'Cold. Cold water triggers a gasp reflex and rapid breathing that has nothing to do with fitness. Get in slowly, put your face in before you start swimming, and give it a couple of minutes to settle. It always settles.',
      'Navigation. You will swim crooked. Everyone does. Pick a large fixed landmark on the shore rather than a buoy you cannot see from water level.',
      'Safety, plainly: never swim alone, know where you are getting out before you get in, wear a bright cap and a tow float, and tell someone your plan. Cold water and open water are the two places where "I felt fine, then suddenly I did not" is a real thing.',
      'This is why open water is switched off in Settings by default. Tick it when you have somewhere sensible to swim and someone to swim with.',
    ],
  },

  // ============================ RUNNING ============================
  {
    id: 'ls-run-polarized',
    title: 'Easy days easy, hard days hard',
    summary: 'The middle is where running progress goes to die.',
    topic: 'run',
    relatedExerciseIds: ['rn-easy', 'rn-intervals', 'rn-tempo'],
    body: [
      'The most common mistake in running is that every run ends up at the same moderately uncomfortable pace. Too hard to build a base, too easy to drive adaptation, and tiring enough that the hard sessions are never actually hard.',
      'Easy runs should be conversational. If you cannot speak a full sentence, slow down — and yes, that will feel humiliatingly slow at first. This is the pace that builds the aerobic engine, and it is most of your weekly volume.',
      'Hard sessions — intervals and tempo — should be genuinely hard, which is only possible because the easy days were easy. Two per week is plenty alongside gym work.',
      'The Run program is built this way: two easy sessions (Easy, Long) and two hard ones (Tempo, Intervals). If you are also lifting three to four times a week, running three days is usually the sustainable number.',
    ],
  },
  {
    id: 'ls-run-volume',
    title: 'Adding mileage without collecting injuries',
    summary: 'Almost all running injuries are load applied faster than tissue adapts.',
    topic: 'run',
    body: [
      'Muscle adapts to new training loads within weeks. Tendon and bone take considerably longer. Nearly every running injury is that gap — you got fit faster than you got durable.',
      'Add roughly 10% per week to total volume, and take an easier week every fourth week rather than climbing forever.',
      'Cadence is the cheapest fix available. Most people over-stride, landing heel-first well in front of their hips, which brakes on every step and sends the shock up the shin. Taking slightly shorter, quicker steps usually solves it without any conscious change to your form.',
      'Strength work is not optional if you run. Single-leg work, calf raises, and hinges are what let tissue tolerate the load. The gym programs in this app already cover it.',
      'Sharp, localised, one-sided pain that gets worse as you run is different from general soreness. That one is worth stopping for and getting looked at.',
    ],
  },

  // ============================ SAUNA ============================
  {
    id: 'ls-sauna-how',
    title: 'How to use a sauna',
    summary: 'Rounds, rest, water — and the honest safety notes.',
    topic: 'sauna',
    relatedExerciseIds: ['sa-round', 'sa-plunge', 'sa-cold-shower', 'sa-rest'],
    body: [
      'A sauna session is rounds, not one long endurance test. Typically two to four rounds of 8–15 minutes, each followed by cooling and then real rest before the next.',
      'The rest between rounds is not padding. Sitting down, cooling off and drinking is where your heart rate and blood pressure come back to normal, and it is the part people skip when they are trying to be impressive.',
      'Cooling can be a cold shower, fresh air, or a plunge. A plunge is the most intense and the most overrated as a requirement — a cold shower gets you most of the way. Whatever you use, get your breathing under control before you go deeper; the involuntary gasp is the genuinely dangerous part of cold water.',
      'Drink water between every round. You are losing a meaningful amount of fluid and you will not notice.',
      'Leave a round early whenever you want to. Dizziness, nausea, a racing or fluttering heart, or a headache all mean get out now. The timer in this app is a suggestion — nothing about it knows how you feel today.',
      'Sensible caution, not medical advice: heat and cold are real cardiovascular stressors. If you are pregnant, have heart or blood-pressure conditions, or take medication that affects blood pressure or heat regulation, talk to a doctor before making this a habit. Never use a sauna after drinking alcohol, and never cold plunge alone.',
      'On timing: a sauna is a fine way to end a training day and a poor way to start one. If you lift after, expect to feel weaker.',
    ],
  },

  // ============================ TRAINING ============================
  {
    id: 'ls-double-progression',
    title: 'Double progression',
    summary: 'How the app decides when to add weight — and why it is not a percentage.',
    topic: 'training',
    body: [
      'Every slot prescribes a rep range, say 3 × 8–12. Double progression means: stay at the same weight until you hit the TOP of that range on every set, then add the smallest sensible increment and drop back to the bottom.',
      'So 3 × 8 at 60kg becomes 3 × 9, 3 × 10, eventually 3 × 12 at 60kg — and only then 3 × 8 at 62.5kg.',
      'Two reasons this beats percentage-based plans for anyone not competing. It needs no maximum test, and it survives real life: miss three weeks and it simply picks up from what you can currently do, rather than from a number that was true in March.',
      'If you miss the bottom of the range, the app backs the weight off. That is not a failure state, it is the scheme working.',
    ],
  },
  {
    id: 'ls-why-slots',
    title: 'Why the app picks your exercises',
    summary: 'A program here stores requirements, not a list of lifts.',
    topic: 'training',
    body: [
      'A normal training app stores "Monday: Back Squat 4 × 5". This one stores a slot: "a squat-pattern movement, 4 × 5–8, heavy, 180s rest".',
      'When you tap Generate, it finds every exercise in your library that could fill that slot — right movement pattern, equipment you actually have today, within your difficulty cap — scores them, and picks one.',
      'Scoring balances five things: how long since you did it, how much history you have with it (you cannot add 2.5kg to a lift you never repeat), how recovered those muscles are, whether you have been running it long enough to be due a change, and whether it can be loaded at all for a heavy slot.',
      'Consequences worth knowing. Change your available equipment and today’s session re-plans around it. Add an exercise from a reel and it immediately becomes eligible everywhere its pattern fits, with no program editing. And every choice carries a reason string in the UI — if it gives you something odd, it tells you what it was thinking.',
      'If you want a lift to stay put, set that slot to "fixed" and pin it. Primaries rotate slowly by design; accessories rotate freely because nothing is lost by swapping one curl variation for another.',
    ],
  },
  {
    id: 'ls-mobility-vs-flexibility',
    title: 'Mobility, flexibility, stability',
    summary: 'Three different things, and only one of them is stretching.',
    topic: 'training',
    body: [
      'Flexibility is how far a joint can be moved passively — someone else pushes your leg up and it goes that far.',
      'Mobility is how far you can move it yourself, under control. This is the one that transfers to lifting, running and getting off the floor at sixty.',
      'Stability is being able to hold a position once you are in it. Range without stability is where people get hurt.',
      'This is why the app splits active drills from passive holds. Morning routines use active mobility — moving through range warms tissue and wakes up the nervous system. Evening routines use passive stretching and breathing, which is calming and where genuine range change happens.',
      'One practical consequence: do not do long passive stretching immediately before lifting or sprinting. It measurably reduces force output for a while afterwards. Save it for the evening or a separate session — which is exactly how the routines here are laid out.',
    ],
  },

  // ================= FROM THE SAVED REELS =================
  {
    id: 'ls-run-hip-strength',
    title: 'Stretching will not fix running hip pain',
    summary: 'Tight is often the symptom. Unstable is usually the cause.',
    topic: 'run',
    creator: 'walk_among_giants',
    sourceUrl: 'https://www.instagram.com/reel/DcJdC2ru7XP/',
    relatedExerciseIds: ['ig-mo-lunge-twist', 'ig-hg-glute-bridge-rollout', 'wk-hip-airplane', 'ig-st-miniband-abduction'],
    body: [
      'The pattern is familiar: hip aches at mile six, you stretch, it feels looser for ten minutes, and by the next run it is back. So you stretch more, foam roll more, and nothing changes.',
      'The argument in this reel is that the hips are not merely tight, they are under-strong. They lack the capacity to hold the pelvis level through thousands of single-leg landings, and the ability to absorb force through full range under load. Stretching addresses a small slice of that and leaves the rest untouched.',
      'When hips cannot absorb force, the load goes somewhere else — commonly the IT band, the knee, or the lower back. Which is why the pain often shows up somewhere other than the problem, and why stretching the sore bit rarely stops it hurting.',
      'The evidence cited: Leppänen et al., British Journal of Sports Medicine, 2024 — a randomised controlled trial following recreational runners for 24 weeks, reporting that a hip and core strengthening programme significantly reduced running-related injuries compared with a stretching-only group. That is the creator\'s citation, quoted as they gave it; worth reading yourself before treating it as settled.',
      'What to actually do: mobility under load (lunge and twist), force absorption (plyometrics), posterior chain strength (glute bridge rollout), and hip control (hip airplanes). All four are in your library.',
    ],
  },
  {
    id: 'ls-mobility-earn-keep',
    title: 'Earning mobility, then keeping it',
    summary: 'Four weeks to gain range, two short sessions a week to keep it.',
    topic: 'training',
    creator: 'alexgloeckle',
    sourceUrl: 'https://www.instagram.com/reel/DcE2Nr8t7JX/',
    relatedExerciseIds: ['fx-hamstring-pails', 'wk-hip-car', 'wd-couch', 'ln-cossack'],
    body: [
      'Translated and condensed from a German reel, and the most complete mobility method in your saved posts.',
      'Pick one or two weak spots — hips, adductors, hamstrings or shoulders. Test them first with something repeatable (toe touch, cossack, deep lunge) and write down where you are. Without a baseline you cannot tell progress from a good day.',
      'Phase one, roughly four weeks, is earning the range: 10–15 minutes a day, four to five days a week. Each area gets three ingredients — a classic mobility drill, controlled joint circles (CARs), and a strength exercise or PAILs/RAILs contract-relax work.',
      'The worked example: for hip flexors, couch stretch 2 × 30–60s, hip CARs on all fours 3–5 very slow reps, and wide split squats 3 × 12.',
      'The principle underneath it: time under tension is what changes tissue. Do not touch the end range and retreat — live there, slowly, with tension. And progress by going deeper before adding reps, and adding reps before adding weight. Same drills, better executed.',
      'Phase two is keeping it: two or three short mobility snacks a week, plus movements that use the range inside your normal training — cossacks, B-stance RDLs, split squats. Range you do not use goes away.',
      'The three mistakes named: stretching without strengthening, dropping the slow tempo, and doing ten drills badly instead of one properly. As the creator puts it — stretch opens, strength secures.',
    ],
  },
  {
    id: 'ls-desk-counter',
    title: 'Undoing the desk',
    summary: 'Your body adapted perfectly. To sitting.',
    topic: 'training',
    creator: 'skylerfelt',
    sourceUrl: 'https://www.instagram.com/reel/DcKj-VcP8qe/',
    relatedExerciseIds: ['ig-mo-ql-stretch', 'wk-hip-car', 'ig-st-reverse-nordic', 'ig-mo-straight-arm-pullover'],
    body: [
      'The framing in this reel is worth keeping: the aches are not age, they are adaptation. Six hours a day folded into a chair produces exactly what you would expect — short hip flexors, stiff quads, a hunched thoracic spine, shallow breathing, forward head, rounded shoulders.',
      'The encouraging half of the same argument: the adaptability that shaped you into the chair will shape you back, given the opposite signal.',
      'Four drills as the counter-stimulus. QL stretch to unload a lower back that has been bracing all day. Hip CARs to reclaim the rotation hips lose when parked in flexion. Reverse Nordic to lengthen and strengthen quads and hip flexors under control. Straight-arm pullover to open the chest and restore thoracic extension.',
      'Note that only one of those four is a passive stretch. That is the point — the others load the new range, which is what makes it stick.',
    ],
  },
  {
    id: 'ls-dead-hang',
    title: 'What hanging actually does',
    summary: 'Grip, decompression, shoulders — and a caveat about the claims.',
    topic: 'training',
    creator: 'hybridhawker',
    sourceUrl: 'https://www.instagram.com/reel/DcIv9GRBXMg/',
    relatedExerciseIds: ['fx-bar-hang', 'pu-pullup'],
    body: [
      'A creator\'s account of hanging daily, worth separating into the parts that are mechanically obvious and the parts that are personal testimony.',
      'Mechanically sound: holding your bodyweight trains grip and forearms directly, and grip is very often the limiting factor in pull-up volume. Remove that ceiling and you can actually train the lats.',
      'Reasonable: a passive hang lets the shoulders travel up into full elevation, which most desk-bound people rarely visit. Overhead positions often feel smoother afterwards.',
      'Personal testimony rather than established fact: "my lower back pain completely disappeared" and claims about spinal decompression creating lasting space between vertebrae. Hanging does unload the spine while you are in it. Whether that produces durable change is a bigger claim than the reel supports.',
      'Practical: build toward 60 seconds. Grip usually fails long before the shoulders do, which is itself the useful signal.',
    ],
  },
  {
    id: 'ls-swim-fly-warning',
    title: 'Butterfly as an early warning system',
    summary: 'The first stroke pain takes away, and the last to come back.',
    topic: 'swim',
    creator: 'drjoshlo',
    sourceUrl: 'https://www.instagram.com/reel/DbWzbhhipA4/',
    relatedExerciseIds: ['sw-fly', 'wk-shoulder-car', 'wk-wall-slide'],
    body: [
      'Butterfly demands more shoulder elevation, more thoracic extension and more catch strength than any other stroke. That is why it hurts first when a shoulder is struggling.',
      'Which makes it diagnostically useful. Someone quietly avoiding fly sets usually has a shoulder that is already behind. And when fly feels strong again, the rebuild worked.',
      'The clinician posting this frames the question as: which link is weak — mobility, capacity, or mechanics? Those need different answers, and guessing between them is how people end up stretching a shoulder that actually needed strengthening.',
      'If your shoulder complains in the water, that is worth a professional opinion rather than a reel, this one included.',
    ],
  },
  {
    id: 'ls-hybrid-week',
    title: 'Lifting and running in the same week',
    summary: 'A worked four-lift, three-run split, and what makes it survivable.',
    topic: 'run',
    creator: 'chriss.han',
    sourceUrl: 'https://www.instagram.com/reel/DavIAhyhEPp/',
    body: [
      'One saved reel lays out a full hybrid week at about 30km of running alongside four lifting sessions. The structure is worth more than the specific exercises.',
      'Monday push, Tuesday easy run 6–7km, Wednesday pull, Thursday tempo (2km easy, 4km at tempo, 2km easy), Friday lower body, Saturday rest, Sunday long run in the morning with an upper session in the evening.',
      'What makes it work is the separation. The hard runs are on days without a leg session, the long run is followed by upper body only, and one day is genuinely rest.',
      'The line worth keeping from it: "The problem was never that you didn\'t know what to do. It\'s that you\'ve never done it for 12 straight weeks."',
      'At gym 3–4× a week plus daily routines, three runs is usually the ceiling before something starts giving. If you add running, take a lifting day out rather than stacking both.',
    ],
  },
]
