'use client'
import { useState, useEffect } from 'react'

const GROUPS = [
  {
    id:'protein', label:'Proteins', emoji:'🥩',
    desc:'High-protein foods for muscle building, recovery, and satiety.',
    accent:'#d85a30', accentBg:'#faece7', accentText:'#993c1d',
    foods:[
      {e:'🍗',n:'Chicken Breast',srv:'3 oz (85g)',cal:140,fat:3,satFat:1,chol:70,sod:65,carb:0,fiber:0,sugar:0,prot:26,pos:['Complete protein — all 9 essential amino acids for muscle synthesis','Low in saturated fat, supporting heart health'],neg:['Conventionally raised may contain antibiotic residues — choose organic']},
      {e:'🥩',n:'Lean Ground Beef (93%)',srv:'3 oz (85g)',cal:170,fat:8,satFat:3,chol:80,sod:75,carb:0,fiber:0,sugar:0,prot:23,pos:['Rich in zinc and iron — critical for immune function and endurance','High leucine content triggers muscle protein synthesis'],neg:['Saturated fat can raise LDL when consumed in excess']},
      {e:'🐟',n:'Atlantic Salmon',srv:'3 oz (85g)',cal:175,fat:10,satFat:2,chol:60,sod:50,carb:0,fiber:0,sugar:0,prot:19,pos:['Omega-3 fatty acids (EPA/DHA) reduce inflammation and muscle soreness','Vitamin D supports bone density and immune function'],neg:['Higher mercury than smaller fish — limit to 2–3 servings/week']},
      {e:'🥚',n:'Whole Egg (large)',srv:'1 egg (50g)',cal:78,fat:5,satFat:2,chol:186,sod:62,carb:0,fiber:0,sugar:0,prot:6,pos:['Choline is critical for brain function and liver health','Leucine-rich — ideal post-workout muscle repair'],neg:['High dietary cholesterol — consult doctor if cardiovascular risk present']},
      {e:'🫙',n:'Greek Yogurt (plain)',srv:'¾ cup (170g)',cal:130,fat:0,satFat:0,chol:10,sod:65,carb:9,fiber:0,sugar:6,prot:22,pos:['Probiotics support gut health and immune system','High calcium strengthens bones during training'],neg:['Dairy — not suitable for lactose-intolerant individuals']},
      {e:'🦃',n:'Turkey Breast',srv:'3 oz (85g)',cal:120,fat:1,satFat:0,chol:75,sod:55,carb:0,fiber:0,sugar:0,prot:26,pos:['Very lean — one of the lowest-fat complete proteins available','Tryptophan supports serotonin production and sleep quality'],neg:['Deli versions often high in sodium — choose fresh when possible']},
      {e:'🐚',n:'Shrimp',srv:'3 oz (85g)',cal:84,fat:1,satFat:0,chol:166,sod:805,carb:0,fiber:0,sugar:0,prot:18,pos:['Exceptionally lean protein source for cutting phases','Iodine supports thyroid function and metabolism'],neg:['Very high sodium — rinse before cooking; avoid if on low-sodium diet']},
      {e:'🐄',n:'Cottage Cheese (low-fat)',srv:'½ cup (113g)',cal:80,fat:1,satFat:0,chol:10,sod:360,carb:6,fiber:0,sugar:5,prot:14,pos:['Slow-digesting casein protein — ideal before bed for overnight muscle repair','High in selenium, an antioxidant supporting thyroid health'],neg:['Higher sodium content — check labels if watching sodium intake']},
      {e:'🌱',n:'Tempeh',srv:'3 oz (85g)',cal:160,fat:6,satFat:1,chol:0,sod:10,carb:8,fiber:0,sugar:0,prot:17,pos:['Fermented — contains probiotics and is more digestible than tofu','Complete plant protein with all essential amino acids'],neg:['Made from soy — avoid if soy allergy present']},
      {e:'🟫',n:'Canned Tuna (water)',srv:'3 oz (85g)',cal:100,fat:1,satFat:0,chol:35,sod:320,carb:0,fiber:0,sugar:0,prot:22,pos:['Extremely affordable high-quality protein source','Selenium content provides antioxidant protection'],neg:['Higher mercury than salmon — limit to 2 cans/week for adults']},
      {e:'🫘',n:'Lentils (cooked)',srv:'½ cup (99g)',cal:115,fat:0,satFat:0,chol:0,sod:2,carb:20,fiber:8,sugar:2,prot:9,pos:['High fiber + protein combination supports satiety and gut health','Iron-rich — important for endurance athletes and women'],neg:['Incomplete protein — combine with grains for all amino acids']},
      {e:'🫛',n:'Edamame',srv:'½ cup (78g)',cal:94,fat:4,satFat:0,chol:0,sod:5,carb:7,fiber:4,sugar:2,prot:9,pos:['One of the few complete plant proteins','High in folate, vitamin K, and manganese for bone health'],neg:['Soy-based — avoid with soy allergies']},
      {e:'🦑',n:'Sardines (canned)',srv:'2 oz (56g)',cal:90,fat:5,satFat:1,chol:45,sod:310,carb:0,fiber:0,sugar:0,prot:11,pos:['One of the richest omega-3 sources available — great value','Eating the bones provides 27% daily calcium'],neg:['Strong flavor; canned versions high in sodium']},
      {e:'🐄',n:'Whey Protein Powder',srv:'1 scoop (30g)',cal:120,fat:2,satFat:1,chol:60,sod:130,carb:4,fiber:0,sugar:2,prot:24,pos:['Fastest-absorbing protein — ideal immediately post-workout','Rich in BCAAs, especially leucine, for muscle protein synthesis'],neg:['Dairy-derived — not suitable for vegans or lactose-intolerant']},
      {e:'🥜',n:'Peanut Butter (natural)',srv:'2 tbsp (32g)',cal:190,fat:16,satFat:3,chol:0,sod:140,carb:7,fiber:2,sugar:3,prot:8,pos:['Healthy monounsaturated fats support heart health','Magnesium supports over 300 enzymatic reactions in the body'],neg:['Calorie-dense — measure portions carefully when cutting']},
      {e:'🥣',n:'Tofu (firm)',srv:'3 oz (85g)',cal:70,fat:4,satFat:1,chol:0,sod:10,carb:2,fiber:0,sugar:0,prot:8,pos:['Isoflavones may reduce inflammation and support hormonal health','Excellent absorbs flavors — versatile cooking protein'],neg:['Lower protein density than animal sources — scale serving up']},
      {e:'🐑',n:'Lamb Chop (lean)',srv:'3 oz (85g)',cal:172,fat:9,satFat:3,chol:78,sod:65,carb:0,fiber:0,sugar:0,prot:22,pos:['High in conjugated linoleic acid (CLA) — may support fat loss','Excellent source of B12 for nerve function and energy'],neg:['Higher saturated fat than chicken — moderate consumption recommended']},
      {e:'🫐',n:'Black Beans (cooked)',srv:'½ cup (86g)',cal:114,fat:0,satFat:0,chol:0,sod:2,carb:20,fiber:8,sugar:0,prot:8,pos:['Extremely high fiber slows glucose absorption — great for weight management','Anthocyanins provide antioxidant and anti-inflammatory effects'],neg:['Incomplete protein — pair with rice for complete amino acid profile']},
      {e:'🐔',n:'Egg Whites',srv:'3 large (99g)',cal:51,fat:0,satFat:0,chol:0,sod:166,carb:1,fiber:0,sugar:0,prot:11,pos:['Pure protein with zero fat — ideal for cutting phases','Low calorie protein source to hit daily targets without excess calories'],neg:['Missing the fat-soluble vitamins and choline found in egg yolks']},
      {e:'🧀',n:'Parmesan Cheese',srv:'1 oz (28g)',cal:111,fat:7,satFat:5,chol:26,sod:449,carb:1,fiber:0,sugar:0,prot:10,pos:['Very high calcium — 34% daily value per ounce','Aged hard cheeses contain minimal lactose — tolerated by many'],neg:['High in saturated fat and sodium — use as a flavor accent, not main protein']},
    ]
  },
  {
    id:'carbs', label:'Carbs & Grains', emoji:'🌾',
    desc:'Complex carbohydrates for sustained energy, fiber, and workout fuel.',
    accent:'#ba7517', accentBg:'#faeeda', accentText:'#633806',
    foods:[
      {e:'🍚',n:'Brown Rice (cooked)',srv:'½ cup (98g)',cal:108,fat:1,satFat:0,chol:0,sod:5,carb:22,fiber:2,sugar:0,prot:2,pos:['Whole grain — keeps the bran layer for extra fiber and minerals','Low glycemic index provides steady sustained energy during workouts'],neg:['Arsenic levels can be higher than white rice — vary grain sources']},
      {e:'🌾',n:'Rolled Oats (dry)',srv:'½ cup (40g)',cal:150,fat:3,satFat:1,chol:0,sod:0,carb:27,fiber:4,sugar:1,prot:5,pos:['Beta-glucan fiber reduces LDL cholesterol and feeds beneficial gut bacteria','Avenanthramides provide anti-inflammatory effects post-exercise'],neg:['Can contain gluten cross-contamination — choose certified GF if celiac']},
      {e:'🍠',n:'Sweet Potato (baked)',srv:'1 medium (130g)',cal:112,fat:0,satFat:0,chol:0,sod:72,carb:26,fiber:4,sugar:5,prot:2,pos:['Beta-carotene converts to vitamin A — supports vision and immune function','High potassium supports muscle function and prevents cramping'],neg:['Naturally higher in sugar than regular potatoes — portion control for diabetics']},
      {e:'🍝',n:'Whole Wheat Pasta',srv:'2 oz dry (56g)',cal:180,fat:1,satFat:0,chol:0,sod:0,carb:38,fiber:6,sugar:2,prot:8,pos:['Higher fiber than regular pasta — improves satiety and gut health','Slower digestion provides more sustained energy for endurance training'],neg:['Gluten-containing — not suitable for celiac disease']},
      {e:'🫓',n:'Whole Grain Bread',srv:'1 slice (40g)',cal:100,fat:2,satFat:0,chol:0,sod:170,carb:19,fiber:3,sugar:3,prot:4,pos:['B vitamins support energy metabolism','Whole grain label means more nutrients than refined flour'],neg:['Many "wheat" breads are mostly refined flour — check for 100% whole grain']},
      {e:'🌽',n:'Corn (cooked)',srv:'½ cup (82g)',cal:66,fat:1,satFat:0,chol:0,sod:0,carb:15,fiber:2,sugar:2,prot:2,pos:['Lutein and zeaxanthin protect eye health','Affordable and versatile carb source for bulking phases'],neg:['Lower fiber density than most whole grains']},
      {e:'🫘',n:'Chickpeas (cooked)',srv:'½ cup (82g)',cal:135,fat:2,satFat:0,chol:0,sod:6,carb:22,fiber:6,sugar:4,prot:7,pos:['High resistant starch feeds gut microbiome and improves insulin sensitivity','Protein + carb combo makes it one of the most filling legumes'],neg:['Can cause gas/bloating when dramatically increased in diet']},
      {e:'🟡',n:'Quinoa (cooked)',srv:'½ cup (92g)',cal:111,fat:2,satFat:0,chol:0,sod:6,carb:20,fiber:3,sugar:1,prot:4,pos:['Complete plant protein — one of few grains with all 9 essential amino acids','Gluten-free whole grain alternative for those with wheat sensitivity'],neg:['More expensive than most grains — substitute brown rice for budget savings']},
      {e:'🍌',n:'Banana',srv:'1 medium (118g)',cal:105,fat:0,satFat:0,chol:0,sod:1,carb:27,fiber:3,sugar:14,prot:1,pos:['Fast-digesting carbs ideal for pre-workout energy and post-workout recovery','Potassium prevents muscle cramps during intense exercise'],neg:['Higher natural sugar content — limit intake if managing blood sugar']},
      {e:'🟤',n:'Barley (cooked)',srv:'½ cup (79g)',cal:97,fat:0,satFat:0,chol:0,sod:2,carb:22,fiber:3,sugar:0,prot:2,pos:['Highest beta-glucan content of any grain — powerful cholesterol reducer','Very low glycemic index — exceptional blood sugar management'],neg:['Contains gluten — not appropriate for celiac disease']},
      {e:'🫛',n:'Green Peas (cooked)',srv:'½ cup (80g)',cal:62,fat:0,satFat:0,chol:0,sod:3,carb:11,fiber:4,sugar:4,prot:4,pos:['High vitamin K content supports bone health and blood clotting','Impressive protein for a vegetable — supports muscle maintenance'],neg:['Low calorie density — difficult to use as primary carb source for bulking']},
      {e:'🍚',n:'White Rice (cooked)',srv:'½ cup (79g)',cal:103,fat:0,satFat:0,chol:0,sod:1,carb:22,fiber:0,sugar:0,prot:2,pos:['Fastest-digesting carb — ideal immediately post-workout for glycogen replenishment','Low in FODMAPs — very gentle on digestive system'],neg:['Refined grain — stripped of fiber, B vitamins, and minerals during processing']},
      {e:'🌰',n:'Buckwheat Groats',srv:'½ cup (85g)',cal:155,fat:1,satFat:0,chol:0,sod:4,carb:34,fiber:5,sugar:0,prot:6,pos:['Rutin, a potent antioxidant, supports cardiovascular health','Gluten-free despite the name — safe for celiac and wheat-sensitive'],neg:['Less widely available and more expensive than common grains']},
      {e:'🥣',n:'Granola (low sugar)',srv:'¼ cup (30g)',cal:130,fat:5,satFat:1,chol:0,sod:55,carb:20,fiber:2,sugar:6,prot:3,pos:['Convenient portable energy for on-the-go athletes','Can be fortified with nuts and seeds for extra nutrients'],neg:['Commercial granola often high in added sugar — read labels carefully']},
      {e:'🍠',n:'Cassava / Yuca',srv:'½ cup (103g)',cal:165,fat:0,satFat:0,chol:0,sod:14,carb:39,fiber:2,sugar:2,prot:1,pos:['One of the most calorie-dense root vegetables — great for hard gainers','Naturally gluten-free — excellent grain alternative for bulking'],neg:['Raw cassava contains cyanogenic compounds — must be fully cooked']},
      {e:'🌽',n:'Popcorn (air-popped)',srv:'3 cups (24g)',cal:93,fat:1,satFat:0,chol:0,sod:2,carb:19,fiber:4,sugar:0,prot:3,pos:['High volume, low calorie — great for satiety during cutting','Polyphenols in hull provide antioxidant benefits'],neg:['Commercial versions loaded with butter and salt — air-pop at home']},
      {e:'🫙',n:'Cream of Wheat',srv:'¼ cup dry (33g)',cal:120,fat:0,satFat:0,chol:0,sod:0,carb:25,fiber:1,sugar:0,prot:4,pos:['Iron-fortified — helps prevent anemia in active individuals','Very easy to digest — ideal pre-workout meal option'],neg:['Refined grain — low in fiber; add fruit to improve nutritional profile']},
      {e:'🌾',n:'Millet (cooked)',srv:'½ cup (87g)',cal:104,fat:1,satFat:0,chol:0,sod:1,carb:21,fiber:1,sugar:0,prot:3,pos:['Gluten-free alkaline grain — supports bone mineral density','Magnesium content supports over 300 metabolic reactions'],neg:['Contains goitrogens — may interfere with thyroid function in excess']},
      {e:'🟫',n:'Whole Wheat Tortilla',srv:'1 medium (45g)',cal:130,fat:3,satFat:1,chol:0,sod:200,carb:23,fiber:3,sugar:1,prot:4,pos:['Convenient portable carb source for meal prep and on-the-go eating','More fiber than white flour tortillas — better blood sugar response'],neg:['Many commercial brands use refined flour with added coloring — check labels']},
      {e:'🍠',n:'Plantain (cooked)',srv:'½ cup (77g)',cal:89,fat:0,satFat:0,chol:0,sod:4,carb:24,fiber:2,sugar:11,prot:1,pos:['High in vitamin B6 — supports mood, protein metabolism, and immune function','Resistant starch when green — acts as prebiotic fiber for gut health'],neg:['Ripe plantains have higher sugar content — use green for lower glycemic impact']},
    ]
  },
  {
    id:'produce', label:'Produce', emoji:'🥦',
    desc:'Fruits and vegetables packed with vitamins, minerals, and antioxidants.',
    accent:'#3b6d11', accentBg:'#eaf3de', accentText:'#27500a',
    foods:[
      {e:'🥦',n:'Broccoli (raw)',srv:'1 cup (91g)',cal:31,fat:0,satFat:0,chol:0,sod:30,carb:6,fiber:2,sugar:2,prot:3,pos:['Sulforaphane activates NRF2 — the most powerful antioxidant pathway in the body','Vitamin C content exceeds oranges by weight — critical for collagen synthesis'],neg:['Can cause bloating when suddenly increased — introduce gradually']},
      {e:'🍓',n:'Strawberries',srv:'1 cup (152g)',cal:49,fat:0,satFat:0,chol:0,sod:2,carb:12,fiber:3,sugar:7,prot:1,pos:['Anthocyanins reduce oxidative stress from intense exercise','Highest vitamin C of common berries — boosts iron absorption from plant foods'],neg:['On the "dirty dozen" pesticide list — buy organic when possible']},
      {e:'🫑',n:'Bell Pepper (red)',srv:'1 medium (149g)',cal:37,fat:0,satFat:0,chol:0,sod:6,carb:9,fiber:3,sugar:6,prot:1,pos:['Richest vitamin C source of any common vegetable — over 200% daily value','Capsanthin and quercetin provide strong anti-inflammatory effects'],neg:['Nightshade family — some with arthritis or autoimmune conditions may react']},
      {e:'🥬',n:'Kale (raw)',srv:'1 cup (67g)',cal:34,fat:0,satFat:0,chol:0,sod:29,carb:7,fiber:1,sugar:0,prot:2,pos:['Vitamin K1 at 684% daily value — essential for bone metabolism and blood clotting','Lutein and zeaxanthin protect against macular degeneration'],neg:['High oxalate content may contribute to kidney stones in susceptible individuals']},
      {e:'🥑',n:'Avocado',srv:'½ medium (75g)',cal:120,fat:11,satFat:2,chol:0,sod:5,carb:6,fiber:5,sugar:0,prot:1,pos:['Monounsaturated oleic acid supports heart health — Mediterranean diet cornerstone','Highest potassium food available — more than bananas, prevents muscle cramps'],neg:['Calorie-dense — track portions during fat loss phases']},
      {e:'🍅',n:'Tomato (raw)',srv:'1 medium (123g)',cal:22,fat:0,satFat:0,chol:0,sod:6,carb:5,fiber:2,sugar:3,prot:1,pos:['Lycopene is a powerful carotenoid antioxidant — concentration increases when cooked','Vitamin C and potassium support immune function and blood pressure'],neg:['Nightshade — may trigger symptoms in those with nightshade sensitivity']},
      {e:'🥕',n:'Carrot (raw)',srv:'1 medium (61g)',cal:25,fat:0,satFat:0,chol:0,sod:42,carb:6,fiber:2,sugar:3,prot:1,pos:['Beta-carotene is the richest plant source of pre-vitamin A — supports eye and skin health','Absorption increases significantly when cooked with fat'],neg:['Baby carrots often treated with chlorine wash — rinse well before eating']},
      {e:'🫙',n:'Spinach (raw)',srv:'2 cups (60g)',cal:14,fat:0,satFat:0,chol:0,sod:48,carb:2,fiber:1,sugar:0,prot:2,pos:['Nitrates improve athletic endurance by increasing oxygen efficiency in muscles','Lutein and beta-carotene support eye health and reduce age-related decline'],neg:['Very high oxalates — those with kidney stones should moderate intake']},
      {e:'🫐',n:'Blueberries',srv:'1 cup (148g)',cal:84,fat:0,satFat:0,chol:0,sod:1,carb:21,fiber:4,sugar:15,prot:1,pos:['Anthocyanins improve blood flow to the brain — shown to boost memory and cognition','May reduce post-exercise muscle damage and speed recovery'],neg:['High natural sugar — limit to 1 cup serving; choose frozen for better value']},
      {e:'🧅',n:'Garlic (raw)',srv:'3 cloves (9g)',cal:13,fat:0,satFat:0,chol:0,sod:2,carb:3,fiber:0,sugar:0,prot:1,pos:['Allicin — formed when garlic is crushed — has potent antimicrobial properties','Reduces LDL cholesterol and blood pressure through multiple mechanisms'],neg:['Can cause digestive discomfort in large quantities; breath odor is a side effect']},
      {e:'🍆',n:'Eggplant (cooked)',srv:'1 cup (99g)',cal:35,fat:0,satFat:0,chol:0,sod:1,carb:9,fiber:2,sugar:3,prot:1,pos:['Nasunin — a unique antioxidant in the purple skin — protects brain cell membranes','Low calorie with fiber — excellent volume food for calorie restriction'],neg:['Nightshade family; solanine may aggravate symptoms in some with arthritis']},
      {e:'🥒',n:'Cucumber',srv:'½ cup (52g)',cal:8,fat:0,satFat:0,chol:0,sod:1,carb:2,fiber:0,sugar:1,prot:0,pos:['Over 95% water — excellent for hydration during hot weather training','Cucurbitacins have anti-inflammatory and potential cancer-preventive properties'],neg:['Very low nutrient density — primarily a hydration and volume food']},
      {e:'🍋',n:'Lemon Juice',srv:'2 tbsp (30ml)',cal:7,fat:0,satFat:0,chol:0,sod:1,carb:2,fiber:0,sugar:1,prot:0,pos:['Vitamin C in lemon juice significantly enhances non-heme iron absorption from plant foods','Citric acid may reduce kidney stone formation and supports urinary health'],neg:['Highly acidic — can erode tooth enamel over time; rinse mouth after consumption']},
      {e:'🥝',n:'Kiwi',srv:'1 medium (69g)',cal:42,fat:0,satFat:0,chol:0,sod:2,carb:10,fiber:2,sugar:6,prot:1,pos:['Highest vitamin C density of any common fruit — 71mg per fruit','Actinidin enzyme improves protein digestion — eat after high-protein meals'],neg:['Common allergen in latex-fruit syndrome — avoid if latex allergy present']},
      {e:'🧄',n:'Onion (raw)',srv:'½ cup (80g)',cal:32,fat:0,satFat:0,chol:0,sod:3,carb:7,fiber:1,sugar:3,prot:1,pos:['Quercetin is one of the most studied antioxidants — anti-inflammatory and anti-viral','Prebiotic FOS fiber feeds beneficial Lactobacillus and Bifidobacterium in the gut'],neg:['High FODMAP — may cause bloating and digestive discomfort in IBS sufferers']},
      {e:'🥗',n:'Romaine Lettuce',srv:'2 cups (94g)',cal:16,fat:0,satFat:0,chol:0,sod:9,carb:3,fiber:2,sugar:1,prot:1,pos:['Vitamin A at 82% daily value — critical for immune function and skin integrity','High water content supports hydration; very low calorie for volume eating'],neg:['Prone to contamination in recalls — wash thoroughly; buy whole heads']},
      {e:'🫑',n:'Zucchini (raw)',srv:'1 cup (124g)',cal:21,fat:0,satFat:0,chol:0,sod:16,carb:4,fiber:1,sugar:3,prot:2,pos:['Very low calorie — excellent for adding volume to meals without extra calories','Vitamin B6 supports over 100 enzymatic reactions including protein metabolism'],neg:['Low calorie density means it cannot replace starchy carbs as primary fuel']},
      {e:'🍊',n:'Orange',srv:'1 medium (131g)',cal:62,fat:0,satFat:0,chol:0,sod:0,carb:15,fiber:3,sugar:12,prot:1,pos:['Hesperidin improves blood vessel function and reduces blood pressure over time','Whole fruit fiber slows sugar absorption compared to orange juice'],neg:['Juice form removes fiber entirely — stick to whole fruit for maximum benefit']},
      {e:'🥜',n:'Beets (cooked)',srv:'½ cup (85g)',cal:37,fat:0,satFat:0,chol:0,sod:65,carb:8,fiber:2,sugar:7,prot:1,pos:['Dietary nitrates significantly improve endurance performance and oxygen efficiency','Betaine supports liver detoxification and reduces homocysteine in the blood'],neg:['May cause red/pink urine (beeturia) — harmless but can be alarming']},
      {e:'🥬',n:'Brussels Sprouts',srv:'½ cup (78g)',cal:28,fat:0,satFat:0,chol:0,sod:16,carb:6,fiber:2,sugar:1,prot:2,pos:['Glucosinolates break down into sulforaphane and indoles — potent cancer-protective compounds','Highest folate of the brassica family — essential for DNA synthesis and cell division'],neg:['Causes significant bloating for many people — cook well and increase gradually']},
    ]
  },
  {
    id:'dairy', label:'Dairy & Fats', emoji:'🥛',
    desc:'Calcium-rich dairy and healthy fats for hormones, brain, and joint health.',
    accent:'#185fa5', accentBg:'#e6f1fb', accentText:'#0c447c',
    foods:[
      {e:'🥛',n:'Whole Milk',srv:'1 cup (244ml)',cal:149,fat:8,satFat:5,chol:24,sod:105,carb:12,fiber:0,sugar:12,prot:8,pos:['Complete nutrition matrix — fat enables absorption of fat-soluble vitamins A, D, E, K','CLA and butyrate in full-fat dairy have anti-inflammatory effects'],neg:['High saturated fat — those with cardiovascular disease should choose lower fat options']},
      {e:'🧀',n:'Cheddar Cheese',srv:'1 oz (28g)',cal:113,fat:9,satFat:6,chol:29,sod:183,carb:0,fiber:0,sugar:0,prot:7,pos:['Calcium and phosphorus directly support bone density and dental health','Aged cheeses naturally low in lactose — tolerated by many with lactose intolerance'],neg:['Calorie-dense with high saturated fat — limit to 1–2 oz servings']},
      {e:'🫙',n:'Kefir (plain)',srv:'1 cup (244ml)',cal:104,fat:2,satFat:2,chol:10,sod:125,carb:12,fiber:0,sugar:12,prot:9,pos:['Contains up to 61 strains of beneficial bacteria — most probiotic-dense food available','Kefiran may lower blood pressure and reduce inflammation'],neg:['Fermented dairy — those with severe lactose intolerance may still react']},
      {e:'🥚',n:'Butter (unsalted)',srv:'1 tbsp (14g)',cal:102,fat:12,satFat:7,chol:31,sod:2,carb:0,fiber:0,sugar:0,prot:0,pos:['Butyrate — a short-chain fatty acid — feeds colon cells and reduces gut inflammation','Fat-soluble vitamins A, D, E, K are concentrated in butter fat'],neg:['Very high in saturated fat — use sparingly and balance with unsaturated fats']},
      {e:'🫒',n:'Olive Oil (EVOO)',srv:'1 tbsp (14g)',cal:119,fat:14,satFat:2,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Oleocanthal has anti-inflammatory effects comparable to ibuprofen at therapeutic doses','Oleic acid is the most heart-healthy monounsaturated fat — Mediterranean diet cornerstone'],neg:['Low smoke point for EVOO — use for finishing or low-heat cooking only']},
      {e:'🥣',n:'Low-Fat Yogurt',srv:'¾ cup (170g)',cal:100,fat:2,satFat:1,chol:10,sod:120,carb:14,fiber:0,sugar:11,prot:8,pos:['Live and active cultures provide digestive and immune benefits','Convenient portable protein source for busy athletes and meal preppers'],neg:['Flavored versions can have as much added sugar as dessert — choose plain always']},
      {e:'🥥',n:'Coconut Oil',srv:'1 tbsp (13g)',cal:121,fat:14,satFat:11,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['MCTs convert to ketones — rapid brain energy source','Lauric acid has antimicrobial properties against harmful bacteria and viruses'],neg:['Extremely high saturated fat — may raise LDL cholesterol; use in strict moderation']},
      {e:'🧈',n:'Ricotta Cheese',srv:'½ cup (124g)',cal:171,fat:10,satFat:6,chol:38,sod:155,carb:6,fiber:0,sugar:0,prot:14,pos:['Higher protein than most fresh cheeses — excellent for post-workout meals','Calcium content rivals other dairy forms — supports bone health during training'],neg:['Fresh cheese with shorter shelf life — use within 5–7 days of opening']},
      {e:'🐟',n:'Fish Oil',srv:'1 tsp (4.5g)',cal:40,fat:5,satFat:1,chol:12,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['EPA and DHA reduce triglycerides by 15–30% at therapeutic doses','Shown in clinical trials to reduce exercise-induced muscle soreness and joint pain'],neg:['Can cause fishy burps — take with meals or choose enteric-coated capsules']},
      {e:'🌻',n:'Sunflower Seeds',srv:'1 oz (28g)',cal:165,fat:14,satFat:1,chol:0,sod:1,carb:7,fiber:2,sugar:1,prot:5,pos:['Richest food source of vitamin E — protects cell membranes from oxidative damage','Selenium content provides thyroid and immune system support'],neg:['High omega-6 content — balance with omega-3 sources to maintain proper ratio']},
      {e:'🥜',n:'Almonds (raw)',srv:'1 oz (28g)',cal:164,fat:14,satFat:1,chol:0,sod:0,carb:6,fiber:4,sugar:1,prot:6,pos:['Highest vitamin E content of any tree nut — powerful fat-soluble antioxidant','Magnesium at 19% daily value — supports muscle function, sleep, and 300+ enzymes'],neg:['Calorie-dense — measure by weight; 1 oz is only about 23 almonds']},
      {e:'🌰',n:'Walnuts',srv:'1 oz (28g)',cal:185,fat:18,satFat:2,chol:0,sod:1,carb:4,fiber:2,sugar:1,prot:4,pos:['Highest plant omega-3 (ALA) content of any nut — 2.5g per serving','Polyphenols and melatonin support sleep quality and cognitive function'],neg:['Very calorie-dense — pre-portion to avoid overconsuming']},
      {e:'🫘',n:'Flaxseeds (ground)',srv:'2 tbsp (14g)',cal:75,fat:6,satFat:1,chol:0,sod:4,carb:4,fiber:4,sugar:0,prot:3,pos:['Lignans in flaxseed are the richest plant source of phytoestrogens','Ground form dramatically increases nutrient bioavailability vs whole seeds'],neg:['Should be ground to access nutrients — whole seeds pass through undigested']},
      {e:'🧀',n:'Feta Cheese',srv:'1 oz (28g)',cal:75,fat:6,satFat:4,chol:25,sod:316,carb:1,fiber:0,sugar:0,prot:4,pos:['Lower calorie and fat than many hard cheeses — good flavor-to-calorie ratio','Traditional sheep milk feta contains beneficial fatty acid profile'],neg:['Very high sodium — 316mg per ounce; avoid if on a sodium-restricted diet']},
      {e:'🥛',n:'Skim Milk',srv:'1 cup (245ml)',cal:83,fat:0,satFat:0,chol:5,sod:103,carb:12,fiber:0,sugar:12,prot:8,pos:['All the calcium and protein of whole milk with virtually no fat or calories','Casein protein is slow-digesting — excellent bedtime protein source'],neg:['Removal of fat reduces absorption of fat-soluble vitamins A, D, E, K significantly']},
      {e:'🫙',n:'Cream Cheese',srv:'2 tbsp (28g)',cal:97,fat:10,satFat:6,chol:31,sod:89,carb:2,fiber:0,sugar:2,prot:2,pos:['Lower lactose than most dairy — tolerated by many lactose-sensitive individuals','Provides concentrated fat-soluble vitamins in small quantities'],neg:['Very low in protein relative to calories — not a useful protein source']},
      {e:'🌻',n:'Pumpkin Seeds',srv:'1 oz (28g)',cal:151,fat:13,satFat:2,chol:0,sod:5,carb:5,fiber:2,sugar:0,prot:7,pos:['Richest food source of zinc — critical for testosterone production and immune function','Magnesium content is among the highest of any seed — muscle relaxation and sleep'],neg:['High in phosphorus — those with kidney disease should consult a doctor']},
      {e:'🥜',n:'Cashews (raw)',srv:'1 oz (28g)',cal:157,fat:12,satFat:2,chol:0,sod:3,carb:9,fiber:1,sugar:2,prot:5,pos:['Highest copper content of any nut — supports iron metabolism and collagen formation','Oleic acid and palmitoleic acid have been shown to improve lipid profiles'],neg:['Technically a tree nut — common allergen for those with tree nut allergies']},
      {e:'🧈',n:'Ghee (clarified butter)',srv:'1 tbsp (13g)',cal:112,fat:13,satFat:8,chol:32,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Removal of milk solids makes it suitable for most with lactose intolerance','Higher smoke point than butter — safer for high-heat cooking'],neg:['Even higher in saturated fat than regular butter — use in very small amounts']},
      {e:'🥚',n:'Sour Cream (full fat)',srv:'2 tbsp (24g)',cal:51,fat:5,satFat:3,chol:15,sod:12,carb:1,fiber:0,sugar:1,prot:1,pos:['Contains live cultures in some varieties — provides minor probiotic benefit','Low lactose content makes it tolerated by many lactose-sensitive individuals'],neg:['Primarily fat with very little protein or micronutrients — minimal nutritional value']},
    ]
  },
  {
    id:'supplements', label:'Supplements', emoji:'💊',
    desc:'Common supplements for athletic performance, recovery, and micronutrient gaps.',
    accent:'#534ab7', accentBg:'#eeedfe', accentText:'#3c3489',
    foods:[
      {e:'💊',n:'Whey Isolate (scoop)',srv:'1 scoop (30g)',cal:110,fat:1,satFat:0,chol:30,sod:120,carb:2,fiber:0,sugar:1,prot:25,pos:['Fastest absorbed protein — peak amino acids in blood within 60 min of consumption','Highest leucine density of any protein source — maximizes muscle protein synthesis'],neg:['Dairy-derived — not suitable for vegans; some people experience digestive discomfort']},
      {e:'🌿',n:'Creatine Monohydrate',srv:'5g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Most researched supplement in sports science — improves high-intensity performance by 10–15%','Saturates phosphocreatine stores enabling faster ATP regeneration between sets'],neg:['Causes water retention intracellularly (muscle cells) — weight gain is normal and beneficial']},
      {e:'☕',n:'Caffeine (pre-workout)',srv:'200mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Blocks adenosine receptors — reduces perceived effort and fatigue during training','Improves endurance performance by 3–5% and strength by up to 7% in research trials'],neg:['Half-life of 5–6 hours — avoid within 6–8 hours of sleep; can worsen anxiety']},
      {e:'🧬',n:'Beta-Alanine',srv:'3.2g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Increases muscle carnosine — buffers lactic acid accumulation in muscles during high-rep sets','Clinical evidence shows 2–3% improvement in sustained high-intensity exercise capacity'],neg:['Causes harmless tingling (paresthesia) within 15–20 min — split into smaller doses to minimize']},
      {e:'🧡',n:'Fish Oil (1g capsule)',srv:'1g',cal:9,fat:1,satFat:0,chol:3,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['EPA and DHA reduce pro-inflammatory cytokines — speeds recovery between training sessions','Meta-analyses show reduced risk of cardiovascular events at 1–4g EPA+DHA per day'],neg:['Quality varies dramatically between brands — look for third-party tested products (NSF/USP)']},
      {e:'☀️',n:'Vitamin D3 (2000 IU)',srv:'2000 IU',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Over 1,000 genes have vitamin D response elements — regulates immune, muscle, and bone systems','Athletes with optimal D3 levels have significantly fewer stress fractures'],neg:['Fat-soluble — can accumulate to toxic levels; get 25(OH)D blood test before high-dose supplementation']},
      {e:'🧲',n:'Magnesium Glycinate',srv:'300mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Glycinate form has highest bioavailability and least laxative effect of all magnesium forms','Supports sleep quality, muscle relaxation, and over 300 enzymatic reactions in the body'],neg:['Excessive doses cause loose stools — start at 200mg and titrate up over 2 weeks']},
      {e:'🫐',n:'Collagen Peptides',srv:'10g',cal:35,fat:0,satFat:0,chol:0,sod:15,carb:0,fiber:0,sugar:0,prot:9,pos:['Type I and III collagen supports tendons, ligaments, and skin elasticity','Vitamin C co-administration required for optimal collagen synthesis — take with citrus'],neg:['Not a complete protein — lacks tryptophan; should not replace whey or whole food proteins']},
      {e:'🌿',n:'Ashwagandha (KSM-66)',srv:'600mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Clinical trials show significant reductions in cortisol — supports recovery and stress management','RCTs demonstrate 1–2% improvements in VO2max and 10–15% in strength after 8 weeks'],neg:['Nightshade family; may interact with thyroid medications; avoid in pregnancy']},
      {e:'🧊',n:'Electrolyte Mix',srv:'1 packet',cal:15,fat:0,satFat:0,chol:0,sod:500,carb:4,fiber:0,sugar:3,prot:0,pos:['Sodium, potassium, and magnesium replacement critical for sessions over 60 minutes','Prevents hyponatremia during ultra-endurance events'],neg:['Many commercial products contain artificial colors (Red 40, Yellow 5) — check labels carefully']},
      {e:'💊',n:'ZMA (Zinc+Magnesium)',srv:'3 capsules',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Zinc at 30mg supports testosterone production and immune function in athletes','Taking at bedtime supports sleep quality and overnight recovery through magnesium'],neg:['Zinc above 40mg/day long-term can deplete copper — monitor and add copper supplementation']},
      {e:'🌱',n:'Plant Protein Blend',srv:'1 scoop (35g)',cal:130,fat:2,satFat:0,chol:0,sod:200,carb:6,fiber:3,sugar:1,prot:22,pos:['Pea + rice combination creates complete amino acid profile matching whey','Hypoallergenic — suitable for dairy-free, soy-free, and most allergy profiles'],neg:['Slightly lower leucine content than whey — may need slightly higher dosing for equivalent MPS']},
      {e:'🫚',n:'MCT Oil',srv:'1 tbsp (15ml)',cal:130,fat:14,satFat:13,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['C8 caprylic acid converts to ketones within 2 hours — immediate brain and exercise fuel','Does not require bile or carnitine for absorption — bypasses normal fat digestion'],neg:['Can cause severe GI distress, nausea, and diarrhea — must start at 1 tsp and increase slowly']},
      {e:'🍋',n:'Vitamin C (500mg)',srv:'500mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Critical cofactor for collagen synthesis — take 30–60 min before training for tissue support','High-dose may reduce DOMS and exercise-induced oxidative stress'],neg:['Doses above 1g/day can cause kidney stones in predisposed individuals; GI intolerance common']},
      {e:'🌾',n:'Glutamine Powder',srv:'5g',cal:20,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:5,pos:['Most abundant amino acid in muscle tissue — decreases during intense training','Supports intestinal cell integrity — helps prevent leaky gut in high-volume athletes'],neg:['Evidence for benefits is weak in athletes with adequate protein intake — low priority supplement']},
      {e:'💙',n:'B12 (methylcobalamin)',srv:'1000mcg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Essential for vegans and vegetarians — only reliable vegan B12 source is supplementation','Methylcobalamin form is more bioavailable than cyanocobalamin found in cheaper supplements'],neg:['Very safe even at high doses — excess is excreted in urine; no upper tolerable limit established']},
      {e:'🌿',n:'Rhodiola Rosea',srv:'400mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Adaptogen shown to reduce mental fatigue and improve endurance performance by 1–3%','Salidroside and rosavin compounds protect mitochondria from stress-induced damage'],neg:['May cause insomnia if taken late in the day; some experience headaches initially']},
      {e:'🍃',n:'Green Tea Extract (EGCG)',srv:'400mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['EGCG at 400mg may increase fat oxidation during exercise by 10–16% in research trials','Powerful antioxidant — reduces biomarkers of oxidative stress and inflammation'],neg:['Contains caffeine — account for this in total daily caffeine; high doses may cause liver stress']},
      {e:'🍖',n:'HMB (Beta-hydroxy)',srv:'3g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Metabolite of leucine — shown to reduce muscle protein breakdown during caloric restriction','May preserve lean mass during cutting phases when protein intake is optimized'],neg:['Benefits most significant for untrained individuals — diminished returns for experienced athletes']},
      {e:'🧫',n:'Probiotics (multi-strain)',srv:'1 capsule (10B CFU)',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Lactobacillus + Bifidobacterium strains shown to reduce respiratory illness in athletes by 27%','Emerging research links gut microbiome diversity to athletic performance and body composition'],neg:['Benefits are strain-specific — generic products may not match studied formulations exactly']},
    ]
  },
]

type Food = typeof GROUPS[0]['foods'][0]
type Group = typeof GROUPS[0]

const dvPct = (v: number, daily: number) => v ? `${Math.round((v/daily)*100)}%` : '0%'

const NF_ROWS = (f: Food) => [
  { b:true,  label:`Total Fat ${f.fat}g`,              pct: dvPct(f.fat, 78) },
  { b:false, i:true, label:`Saturated Fat ${f.satFat}g`, pct: dvPct(f.satFat, 20) },
  { b:false, i:true, label:`Trans Fat 0g`,               pct: '' },
  { b:true,  label:`Cholesterol ${f.chol}mg`,          pct: dvPct(f.chol, 300) },
  { b:true,  label:`Sodium ${f.sod}mg`,                pct: dvPct(f.sod, 2300) },
  { b:true,  label:`Total Carbohydrate ${f.carb}g`,    pct: dvPct(f.carb, 275) },
  { b:false, i:true, label:`Dietary Fiber ${f.fiber}g`, pct: dvPct(f.fiber, 28) },
  { b:false, i:true, label:`Total Sugars ${f.sugar}g`,  pct: '' },
  { b:true,  label:`Protein ${f.prot}g`,               pct: '' },
]

const MACROS = (f: Food) => {
  const total = f.fat*9 + f.carb*4 + f.prot*4 || 1
  return [
    { label:'Protein', val:`${f.prot}g`, pct: Math.round((f.prot*4/total)*100), color:'#185fa5' },
    { label:'Carbs',   val:`${f.carb}g`, pct: Math.round((f.carb*4/total)*100), color:'#ba7517' },
    { label:'Fat',     val:`${f.fat}g`,  pct: Math.round((f.fat*9/total)*100),  color:'#d85a30' },
    { label:'Fiber',   val:`${f.fiber}g`,pct: Math.min(100, Math.round((f.fiber/28)*100)), color:'#3b6d11' },
  ]
}

const card: React.CSSProperties = { background:'var(--card)', border:'2px solid var(--border)', borderRadius:18, padding:16, marginBottom:14 }

export function NutritionTab() {
  const [group, setGroup]   = useState<Group>(GROUPS[0])
  const [food, setFood]     = useState<Food|null>(null)
  const [search, setSearch] = useState('')
  const [flash, setFlash]   = useState(false)

  const selectFood = (f: Food) => {
    setFlash(true)
    setTimeout(() => { setFood(f); setFlash(false) }, 220)
  }

  const filtered = group.foods.filter(f => f.n.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Group tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {GROUPS.map(g => (
          <button key={g.id} onClick={() => { setGroup(g); setFood(null); setSearch('') }}
            style={{
              padding:'8px 18px', borderRadius:20, fontSize:13, fontWeight:800,
              border:`2px solid ${g.id===group.id ? g.accent : 'var(--border)'}`,
              background: g.id===group.id ? g.accentBg : 'var(--bg)',
              color: g.id===group.id ? g.accentText : 'var(--muted)',
              cursor:'pointer', fontFamily:'Nunito,sans-serif', display:'flex', alignItems:'center', gap:7,
              transition:'all 0.15s',
            }}>
            <span style={{ fontSize:18 }}>{g.emoji}</span>{g.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)' }}>{group.desc}</div>

      {/* Main two-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:18, alignItems:'start' }}>

        {/* Food list */}
        <div style={{ background:'var(--card)', border:'2px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={`Search ${group.label.toLowerCase()}...`}
            style={{ width:'100%', padding:'10px 13px', border:'none', borderBottom:'2px solid var(--border)', fontSize:13, fontWeight:700, background:'var(--bg)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }} />
          <div style={{ maxHeight:460, overflowY:'auto' }}>
            {filtered.map(f => (
              <div key={f.n} onClick={() => selectFood(f)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 13px',
                  cursor:'pointer', borderBottom:'1.5px solid var(--border)',
                  background: food?.n===f.n ? group.accentBg : 'transparent',
                  transition:'background 0.1s',
                }}>
                <span style={{ fontSize:22, width:28, textAlign:'center', flexShrink:0 }}>{f.e}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color: food?.n===f.n ? group.accentText : 'var(--text)' }}>{f.n}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginTop:1 }}>{f.cal} cal · {f.prot}g protein</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Image flash area */}
          <div style={{
            height:160, borderRadius:18, overflow:'hidden', position:'relative',
            background:`linear-gradient(135deg, ${group.accentBg}, var(--bg))`,
            border:'2px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <span style={{ fontSize:90, transition:'opacity 0.22s', opacity: flash ? 0 : 1 }}>
              {food ? food.e : group.emoji}
            </span>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'8px 16px', background:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{food ? food.n : 'Select a food'}</span>
              {food && <span style={{ fontSize:11, fontWeight:800, padding:'2px 10px', borderRadius:20, background:group.accent, color:'#fff' }}>{group.label}</span>}
            </div>
          </div>

          {food ? (
            <>
              {/* Nutrition Facts Label */}
              <div style={card}>
                <div style={{ fontFamily:'Arial,sans-serif', border:'1.5px solid var(--text)', borderRadius:3, padding:'10px 14px', color:'var(--text)', maxWidth:320 }}>
                  <div style={{ fontSize:22, fontWeight:900, borderBottom:'7px solid var(--text)', paddingBottom:2, marginBottom:2 }}>Nutrition Facts</div>
                  <div style={{ fontSize:11, marginBottom:1 }}>Serving size: {food.srv}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:'3px solid var(--text)', paddingBottom:2, marginBottom:3 }}>
                    <div><div style={{ fontSize:12, fontWeight:900 }}>Amount per serving</div><div style={{ fontSize:13, fontWeight:900 }}>Calories</div></div>
                    <div style={{ fontSize:38, fontWeight:900, lineHeight:1 }}>{food.cal}</div>
                  </div>
                  <div style={{ textAlign:'right', fontSize:10, fontWeight:900, borderBottom:'2px solid var(--text)', paddingBottom:1, marginBottom:2 }}>% Daily Value*</div>
                  {NF_ROWS(food).map((r,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11, borderBottom:'0.5px solid #ccc', padding:`1.5px 0 1.5px ${r.i?14:0}px`, fontWeight: r.b?900:400 }}>
                      <span>{r.label}</span><span>{r.pct}</span>
                    </div>
                  ))}
                  <div style={{ fontSize:9, color:'var(--muted)', textAlign:'center', borderTop:'1px solid var(--text)', marginTop:4, paddingTop:3 }}>
                    *% Daily Value based on a 2,000 calorie diet.
                  </div>
                </div>
              </div>

              {/* Macro bars */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {MACROS(food).map(m => (
                  <div key={m.label} style={{ background:'var(--bg)', border:'2px solid var(--border)', borderRadius:12, padding:'11px 13px' }}>
                    <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginBottom:4 }}>{m.label}</div>
                    <div style={{ fontSize:17, fontWeight:900, color:'var(--text)', marginBottom:6 }}>{m.val}</div>
                    <div style={{ height:6, background:'var(--border)', borderRadius:20, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${m.pct}%`, background:m.color, borderRadius:20, transition:'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div style={card}>
                <div style={{ fontSize:14, fontWeight:900, color:'var(--text)', marginBottom:8 }}>🌿 Health & fitness benefits</div>
                {food.pos.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginTop:8, alignItems:'flex-start' }}>
                    <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, background:'var(--p-light)', color:'var(--p-dark)', whiteSpace:'nowrap', marginTop:1, flexShrink:0 }}>✓ Benefit</span>
                    <span style={{ fontSize:12, color:'var(--muted)', lineHeight:1.55, fontWeight:700 }}>{t}</span>
                  </div>
                ))}
                {food.neg.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, marginTop:8, alignItems:'flex-start' }}>
                    <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, background:'#FFE8E8', color:'#C62A2A', whiteSpace:'nowrap', marginTop:1, flexShrink:0 }}>⚠ Caution</span>
                    <span style={{ fontSize:12, color:'var(--muted)', lineHeight:1.55, fontWeight:700 }}>{t}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ ...card, padding:40, textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{group.emoji}</div>
              <div style={{ fontSize:16, fontWeight:900, color:'var(--text)', marginBottom:6 }}>
                {group.foods.length} {group.label}
              </div>
              <div style={{ fontSize:13, color:'var(--muted)', fontWeight:700 }}>
                Click any food on the left to see its full nutrition label, macro breakdown, and health benefits.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
