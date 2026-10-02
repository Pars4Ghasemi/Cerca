/* Cerca AI demo knowledge base — small, curated, hand-written pet care documents.
   Retrieval is deliberately simple keyword scoring (no embeddings needed for the demo). */

export const KNOWLEDGE = [
  {
    id: 'kb-leash',
    title: 'Loose Leash Walking Basics',
    category: 'Dog training',
    tags: ['leash', 'pulling', 'walk', 'walking', 'harness', 'dog', 'training', 'lead'],
    text: 'Dogs pull because moving forward is rewarding. Stop the moment the leash tightens, wait for slack, then continue - the walk only happens on a loose leash. Reward generously whenever your dog chooses to walk beside your leg without being asked. A well fitted front-clip or Y-front harness reduces strain while you train. Keep sessions short and expect two to four weeks of consistency in busy streets.',
  },
  {
    id: 'kb-recall',
    title: 'Building a Reliable Recall',
    category: 'Dog training',
    tags: ['recall', 'come', 'off leash', 'dog', 'training', 'park'],
    text: 'Choose one recall word and use it only for coming back. Start at three metres indoors, pay with something genuinely valuable, and slowly increase distance and distraction. Never call your dog to end something fun or to be told off, or the word becomes a warning. If your dog ignores you, move closer and make it easier rather than repeating the word.',
  },
  {
    id: 'kb-stay',
    title: 'Teaching Sit and Stay',
    category: 'Dog training',
    tags: ['stay', 'sit', 'impulse control', 'dog', 'training', 'wait'],
    text: 'Ask for a sit, show an open palm, say the cue once, then step back a single step and reward after two to three seconds. Build duration before distance, and distance before distraction. Always release with a clear word so your dog knows the stay has ended. Short daily repetitions beat long weekend sessions.',
  },
  {
    id: 'kb-barking',
    title: 'Barking at the Door and at Visitors',
    category: 'Dog training',
    tags: ['barking', 'bark', 'door', 'doorbell', 'visitors', 'courier', 'dog', 'noise'],
    text: 'Door barking is usually alarm plus excitement. Practise the doorbell sound at low intensity while feeding treats away from the door so the sound predicts something calm. Teach a station: a mat two metres from the door where your dog is paid for lying down. Never shout over the barking; it adds to the arousal.',
  },
  {
    id: 'kb-separation',
    title: 'Being Alone Without Stress',
    category: 'Dog training',
    tags: ['alone', 'separation', 'anxiety', 'crying', 'destructive', 'dog'],
    text: 'Alone time is a skill, not something a dog grows out of. Start with seconds behind a closed door and return before your dog gets worried. Give a familiar chew and keep departures and returns boring. If your dog panics, drools, destroys exits or never settles, work with a qualified behaviourist rather than extending the time.',
  },
  {
    id: 'kb-cat-intro',
    title: 'Introducing a Cat and a Dog',
    category: 'Cat behaviour',
    tags: ['introduce', 'introducing', 'new cat', 'cat', 'dog', 'multi pet', 'kitten'],
    text: 'Keep the animals fully separated at first and swap bedding so they learn each other by scent. Feed on both sides of a closed door so the other animal predicts good things. Only then allow short, supervised visual contact with the dog on a lead and an easy escape route plus high perches for the cat. Progress in days or weeks, never in one afternoon.',
  },
  {
    id: 'kb-cat-hiding',
    title: 'Cats That Hide or Change Behaviour',
    category: 'Cat behaviour',
    tags: ['hiding', 'hide', 'stress', 'cat', 'behaviour', 'scared', 'change'],
    text: 'Cats cope badly with several changes at once. Furniture moves, new litter, building noise and visitors stack up. Change one thing at a time, keep litter type and location stable, and provide high, quiet resting places. Sudden hiding combined with not eating, not using the litter tray or straining to urinate needs a veterinary check rather than patience.',
  },
  {
    id: 'kb-litter',
    title: 'Litter Tray Rules',
    category: 'Cat behaviour',
    tags: ['litter', 'tray', 'toilet', 'peeing', 'cat', 'accidents', 'box'],
    text: 'Offer one tray per cat plus one spare, in quiet places away from food and busy doorways. Most cats prefer large uncovered trays with fine unscented litter, scooped daily. Sudden accidents outside the tray are usually medical, stress or cleanliness related - clean with an enzymatic cleaner and never punish the cat.',
  },
  {
    id: 'kb-scratching',
    title: 'Scratching Furniture',
    category: 'Cat behaviour',
    tags: ['scratching', 'scratch', 'furniture', 'sofa', 'claws', 'cat'],
    text: 'Scratching maintains claws and marks territory, so the goal is redirection rather than stopping it. Place a tall, very stable sisal post right next to the furniture being used, plus a horizontal cardboard scratcher. Reward use, make the sofa temporarily less attractive, and trim claws every few weeks.',
  },
  {
    id: 'kb-enrichment-dog',
    title: 'Mental Enrichment for Dogs',
    category: 'Pet enrichment',
    tags: ['enrichment', 'bored', 'boredom', 'stimulation', 'mental', 'sniffing', 'games', 'dog', 'exercise', 'tired'],
    text: 'Sniffing and problem solving tire a dog far more than distance walking. Aim for one or two short scent games a day: scatter ten treats in grass, hide food in a towel roll, or use a snuffle mat. Ten to fifteen minutes of nose work often settles an evening better than an extra hour of walking. Rotate toys so they stay interesting.',
  },
  {
    id: 'kb-enrichment-cat',
    title: 'Enrichment for Indoor Cats',
    category: 'Pet enrichment',
    tags: ['enrichment', 'indoor', 'cat', 'play', 'toys', 'bored', 'climbing'],
    text: 'Indoor cats need height, hiding places and hunting. Two short wand-toy sessions a day that end with a catch and a small meal follow the natural hunt-eat-groom-sleep cycle. Add shelves or a tall cat tree, cardboard boxes, and food puzzles. Put teaser toys away between sessions so they keep their value.',
  },
  {
    id: 'kb-feeding',
    title: 'Feeding Fundamentals and Portions',
    category: 'Feeding fundamentals',
    tags: ['feeding', 'food', 'portion', 'portions', 'diet', 'weight', 'overweight', 'treats', 'nutrition', 'how much'],
    text: 'Use the feeding guide on the food as a starting point, then adjust to body condition: you should feel ribs easily without pressing. Weigh one daily portion instead of guessing, and subtract treats from the daily total - treats should stay under about ten percent of daily calories. Two measured meals a day suit most adult dogs and cats. Change foods gradually over a week.',
  },
  {
    id: 'kb-wet-dry',
    title: 'Wet Food, Dry Food and Water',
    category: 'Feeding fundamentals',
    tags: ['wet food', 'dry food', 'water', 'hydration', 'cat', 'senior', 'kibble'],
    text: 'Cats evolved to get most of their water from prey and often drink too little, so wet food helps hydration, especially in older cats or those with urinary history. A mix of mostly wet with some dry is a practical compromise. Provide fresh water in wide bowls away from food, and consider a fountain for cats that prefer moving water.',
  },
  {
    id: 'kb-toxic',
    title: 'Foods and Plants to Keep Away',
    category: 'General safety',
    tags: ['toxic', 'chocolate', 'grapes', 'onion', 'xylitol', 'lily', 'poison', 'safety', 'plants', 'ate'],
    text: 'Keep chocolate, grapes and raisins, onion and garlic, xylitol sweetener, macadamia nuts, alcohol and raw dough away from pets. Lilies are extremely dangerous for cats, as are antifreeze and many human painkillers such as ibuprofen and paracetamol. If a pet has eaten something on this list, that is an emergency: contact a vet immediately and do not wait for symptoms.',
  },
  {
    id: 'kb-emergency',
    title: 'When to Go to the Vet Immediately',
    category: 'General safety',
    tags: ['emergency', 'urgent', 'vet', 'bleeding', 'breathing', 'seizure', 'collapse', 'poison', 'trauma', 'shaking', 'vomiting'],
    text: 'Treat these as emergencies and go to a vet or emergency clinic now: difficulty breathing, choking, collapse or unconsciousness, seizures, heavy bleeding, suspected poisoning, being hit by a car, a hard swollen abdomen or unproductive retching, inability to urinate, heatstroke, or repeated vomiting with lethargy. Call ahead so the clinic can prepare, keep the animal warm and quiet, and never give human medication.',
  },
  {
    id: 'kb-heat',
    title: 'Hot Weather and Heatstroke Prevention',
    category: 'General safety',
    tags: ['heat', 'hot', 'summer', 'heatstroke', 'walk', 'pavement', 'water', 'safety'],
    text: 'Walk early morning and late evening in summer and test the pavement with your hand - if it is too hot for five seconds it is too hot for paws. Never leave a pet in a parked car. Offer shade and water, and keep exercise short for flat-faced breeds and seniors. Heavy panting, bright red gums, wobbliness or vomiting after heat is heatstroke and needs immediate veterinary care.',
  },
  {
    id: 'kb-paws-winter',
    title: 'Winter Paw and Coat Care',
    category: 'Grooming',
    tags: ['winter', 'paws', 'salt', 'cold', 'grooming', 'dog', 'coat'],
    text: 'Road salt and grit irritate paws. Rinse paws with lukewarm water after city walks, dry between the toes, and check weekly for cracks or redness. Trim the hair between the pads so ice balls do not form. Short-coated and small dogs benefit from a coat below freezing; keep walks shorter and more frequent instead of one long outing.',
  },
  {
    id: 'kb-grooming',
    title: 'Brushing, Shedding and Nail Care',
    category: 'Grooming',
    tags: ['brushing', 'brush', 'shedding', 'coat', 'nails', 'claws', 'grooming', 'matting', 'bath'],
    text: 'Brush double-coated dogs such as retrievers two to four times a week, and daily during seasonal shedding, using an undercoat rake plus a finishing brush. Long-haired cats need daily combing to prevent mats. Bath only when genuinely dirty with a pet shampoo. Trim nails every three to four weeks; if you can hear clicking on the floor they are too long.',
  },
  {
    id: 'kb-teeth',
    title: 'Dental Care at Home',
    category: 'Grooming',
    tags: ['teeth', 'dental', 'breath', 'brushing teeth', 'tartar', 'gums'],
    text: 'Daily brushing with a pet toothpaste is the only method that reliably slows tartar. Start by letting your pet lick the paste, then touch the outer teeth for a few seconds and build up. Dental chews help a little; they do not replace brushing. Persistent bad breath, bleeding gums or difficulty eating deserve a veterinary dental check.',
  },
  {
    id: 'kb-puppy',
    title: 'Puppy Basics: First Weeks at Home',
    category: 'Puppy basics',
    tags: ['puppy', 'toilet training', 'house training', 'crate', 'socialisation', 'biting', 'new dog'],
    text: 'Take a puppy outside after every sleep, meal and play session and reward outdoors immediately - accidents indoors mean more frequent trips, never punishment. Puppies need eighteen to twenty hours of sleep a day, so protect naps. Socialisation means calm, positive exposure to surfaces, sounds and people, not meeting every dog. Redirect play biting onto a toy and end the game when teeth touch skin.',
  },
  {
    id: 'kb-kitten',
    title: 'Kitten Basics: What to Prepare',
    category: 'Kitten basics',
    tags: ['kitten', 'new cat', 'prepare', 'adopting', 'adopt', 'shopping list', 'first days'],
    text: 'Prepare two litter trays, food and water bowls kept apart, a carrier left open at home so it never means only vet visits, a scratching post, and a quiet room with hiding places for the first days. Keep the kitten on its existing food at first and change gradually. Book a vet check for vaccinations, worming and microchipping, and plan neutering timing with your vet.',
  },
  {
    id: 'kb-vaccination',
    title: 'Vaccinations, Worming and Microchipping',
    category: 'Responsible pet ownership',
    tags: ['vaccination', 'vaccine', 'worming', 'microchip', 'chip', 'vet', 'health check', 'neutering'],
    text: 'Puppies and kittens need a vaccination course followed by regular boosters agreed with your vet, plus a worming schedule based on lifestyle. Microchipping is the single most useful thing for a lost pet: register the chip and keep your phone number up to date, since an unregistered chip cannot help anyone. Annual health checks catch problems early, twice yearly for seniors.',
  },
  {
    id: 'kb-lost',
    title: 'What to Do When a Pet Goes Missing',
    category: 'Responsible pet ownership',
    tags: ['lost', 'missing', 'escaped', 'search', 'found', 'runaway', 'lost pet'],
    text: 'Search the immediate area first: cats usually hide within a few houses, often in cellars, sheds or under cars, and come out at quiet times. Leave familiar bedding and food near the exit point. Post a clear photo with location, time and your contact details, alert neighbours, local vets and shelters, and check chip registration details. For dogs, stay near the escape point and avoid chasing - crouch, turn sideways and use a calm voice.',
  },
  {
    id: 'kb-senior',
    title: 'Caring for a Senior Pet',
    category: 'Responsible pet ownership',
    tags: ['senior', 'old', 'ageing', 'arthritis', 'joints', 'stiff', 'elderly'],
    text: 'From around seven years, watch for stiffness after rest, reluctance on stairs, weight change, drinking more, or sleeping in new places. Keep walks shorter and more frequent, add non-slip rugs and a supportive bed, and keep nails short. Twice yearly vet checks with blood and urine screening catch kidney, thyroid and joint problems while they are still easy to manage.',
  },
  {
    id: 'kb-travel',
    title: 'Car Travel and Carriers',
    category: 'General safety',
    tags: ['travel', 'car', 'carrier', 'crate', 'sick', 'journey', 'holiday'],
    text: 'Secure pets in a crate, carrier or crash-tested harness rather than loose on a seat. Build positive associations first: feed in the stationary carrier, then take very short drives that end somewhere pleasant. Avoid a large meal right before travelling, plan breaks every two to three hours for dogs, and never leave a pet in a parked car.',
  },
]

const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'have', 'has', 'how', 'what', 'why', 'can', 'should', 'does', 'his', 'her', 'their', 'about', 'not', 'you', 'your', 'from', 'when', 'where', 'was', 'are', 'but', 'get', 'got', 'any', 'all', 'too', 'much', 'many', 'very', 'just', 'like', 'want', 'need', 'know', 'help', 'please', 'him', 'she', 'they', 'them', 'our', 'out', 'off', 'own'])

const GENERIC = new Set(['dog', 'cat', 'pet', 'anima', 'milo', 'mine'])

function tokenize(text) {
  return (String(text).toLowerCase().match(/[a-z]{3,}/g) || []).filter((w) => !STOP.has(w))
}

/** crude singularise + stem so "pulling"/"pulls" and "poisonous"/"poison" match */
function norm(word) {
  let w = word
  if (w.endsWith('ies') && w.length > 4) w = w.slice(0, -3) + 'y'
  else if (w.endsWith('es') && w.length > 4) w = w.slice(0, -2)
  else if (w.endsWith('s') && w.length > 3) w = w.slice(0, -1)
  return w.length > 5 ? w.slice(0, 5) : w
}

function normSet(text) {
  return new Set(tokenize(text).map(norm))
}

/** Lightweight keyword retrieval over the knowledge base. */
export function retrieve(question, docs = KNOWLEDGE, limit = 3, emergency = false) {
  const words = [...new Set(tokenize(question).map(norm))]
  if (!words.length) return []

  const scored = docs.map((doc) => {
    const tagTokens = normSet((doc.tags || []).join(' '))
    const titleTokens = normSet(doc.title)
    const bodyTokens = normSet(doc.text)
    let score = 0
    for (const w of words) {
      const generic = GENERIC.has(w)
      if (tagTokens.has(w)) score += generic ? 0.5 : 3
      else if (titleTokens.has(w)) score += generic ? 0.5 : 2
      else if (bodyTokens.has(w)) score += generic ? 0 : 1
    }
    return { doc, score }
  })

  let picked = scored
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.doc)

  if (emergency) {
    const must = docs.filter((d) => d.id === 'kb-emergency' || d.id === 'kb-toxic')
    picked = [...must, ...picked.filter((d) => !must.some((m) => m.id === d.id))].slice(0, limit)
  }

  return picked
}

const EMERGENCY_PATTERNS = [
  /poison|toxic|ate (chocolate|grapes|raisins|onion|xylitol|rat poison|antifreeze)|swallowed/,
  /bleed|blood loss|haemorrhage|hemorrhage/,
  /(can'?t|cannot|difficulty|trouble|struggling to) breath|choking|gasping|blue (gums|tongue)/,
  /seizure|convulsion|fitting|shaking uncontrollably|tremor/,
  /unconscious|collapsed|collapse|unresponsive|passed out|not waking/,
  /hit by (a )?(car|bike|bus)|run over|fell from|major trauma|broken (leg|bone)/,
  /can'?t (pee|urinate)|unable to urinate|straining to (pee|urinate)|blocked bladder/,
  /heatstroke|heat stroke|overheated/,
  /bloated|swollen (belly|abdomen|stomach)|retching/,
  /vomiting blood|blood in (stool|vomit|urine)/,
]

export function isEmergency(question) {
  const q = String(question).toLowerCase()
  return EMERGENCY_PATTERNS.some((re) => re.test(q))
}

export default KNOWLEDGE
