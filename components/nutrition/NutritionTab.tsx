'use client'
import { useState } from 'react'

const GROUPS = [
  { id:'protein', label:'Proteins', emoji:'🥩', desc:'High-protein foods for muscle building, recovery, and satiety.', accent:'#d85a30', accentBg:'#faece7', accentText:'#993c1d',
    foods:[
      {e:'🍗',n:'Chicken Breast',srv:'3 oz (85g)',cal:140,fat:3,satFat:1,chol:70,sod:65,carb:0,fiber:0,sugar:0,prot:26,pos:['Complete protein with all 9 essential amino acids','Low in saturated fat supporting heart health'],neg:['Conventionally raised may contain antibiotic residues']},
      {e:'🥩',n:'Lean Ground Beef',srv:'3 oz (85g)',cal:170,fat:8,satFat:3,chol:80,sod:75,carb:0,fiber:0,sugar:0,prot:23,pos:['Rich in zinc and iron for immune function','High leucine triggers muscle protein synthesis'],neg:['Saturated fat can raise LDL when consumed in excess']},
      {e:'🐟',n:'Atlantic Salmon',srv:'3 oz (85g)',cal:175,fat:10,satFat:2,chol:60,sod:50,carb:0,fiber:0,sugar:0,prot:19,pos:['Omega-3 fatty acids reduce inflammation and muscle soreness','Vitamin D supports bone density and immune function'],neg:['Higher mercury than smaller fish — limit to 2-3 servings/week']},
      {e:'🥚',n:'Whole Egg',srv:'1 egg (50g)',cal:78,fat:5,satFat:2,chol:186,sod:62,carb:0,fiber:0,sugar:0,prot:6,pos:['Choline critical for brain function and liver health','Leucine-rich — ideal post-workout muscle repair'],neg:['High dietary cholesterol — consult doctor if cardiovascular risk present']},
      {e:'🫙',n:'Greek Yogurt',srv:'3/4 cup (170g)',cal:130,fat:0,satFat:0,chol:10,sod:65,carb:9,fiber:0,sugar:6,prot:22,pos:['Probiotics support gut health and immune system','High calcium strengthens bones during training'],neg:['Dairy — not suitable for lactose-intolerant individuals']},
      {e:'🦃',n:'Turkey Breast',srv:'3 oz (85g)',cal:120,fat:1,satFat:0,chol:75,sod:55,carb:0,fiber:0,sugar:0,prot:26,pos:['Very lean — lowest-fat complete protein available','Tryptophan supports serotonin and sleep quality'],neg:['Deli versions often high in sodium — choose fresh']},
      {e:'🐚',n:'Shrimp',srv:'3 oz (85g)',cal:84,fat:1,satFat:0,chol:166,sod:805,carb:0,fiber:0,sugar:0,prot:18,pos:['Exceptionally lean protein source for cutting phases','Iodine supports thyroid function and metabolism'],neg:['Very high sodium — rinse before cooking']},
      {e:'🐄',n:'Cottage Cheese',srv:'1/2 cup (113g)',cal:80,fat:1,satFat:0,chol:10,sod:360,carb:6,fiber:0,sugar:5,prot:14,pos:['Slow-digesting casein — ideal before bed for overnight repair','High in selenium supporting thyroid health'],neg:['Higher sodium — check labels if watching sodium intake']},
      {e:'🌱',n:'Tempeh',srv:'3 oz (85g)',cal:160,fat:6,satFat:1,chol:0,sod:10,carb:8,fiber:0,sugar:0,prot:17,pos:['Fermented — contains probiotics, more digestible than tofu','Complete plant protein with all essential amino acids'],neg:['Made from soy — avoid if soy allergy present']},
      {e:'🟫',n:'Canned Tuna',srv:'3 oz (85g)',cal:100,fat:1,satFat:0,chol:35,sod:320,carb:0,fiber:0,sugar:0,prot:22,pos:['Extremely affordable high-quality protein','Selenium content provides antioxidant protection'],neg:['Higher mercury — limit to 2 cans/week for adults']},
      {e:'🫘',n:'Lentils',srv:'1/2 cup (99g)',cal:115,fat:0,satFat:0,chol:0,sod:2,carb:20,fiber:8,sugar:2,prot:9,pos:['High fiber and protein supports satiety and gut health','Iron-rich — important for endurance athletes'],neg:['Incomplete protein — combine with grains for all amino acids']},
      {e:'🫛',n:'Edamame',srv:'1/2 cup (78g)',cal:94,fat:4,satFat:0,chol:0,sod:5,carb:7,fiber:4,sugar:2,prot:9,pos:['One of the few complete plant proteins','High in folate, vitamin K, and manganese'],neg:['Soy-based — avoid with soy allergies']},
      {e:'🦑',n:'Sardines',srv:'2 oz (56g)',cal:90,fat:5,satFat:1,chol:45,sod:310,carb:0,fiber:0,sugar:0,prot:11,pos:['One of the richest omega-3 sources — great value','Eating the bones provides 27% daily calcium'],neg:['Strong flavor; canned versions high in sodium']},
      {e:'🐄',n:'Whey Protein',srv:'1 scoop (30g)',cal:120,fat:2,satFat:1,chol:60,sod:130,carb:4,fiber:0,sugar:2,prot:24,pos:['Fastest-absorbing protein — ideal immediately post-workout','Rich in BCAAs especially leucine for muscle synthesis'],neg:['Dairy-derived — not suitable for vegans']},
      {e:'🥜',n:'Peanut Butter',srv:'2 tbsp (32g)',cal:190,fat:16,satFat:3,chol:0,sod:140,carb:7,fiber:2,sugar:3,prot:8,pos:['Healthy monounsaturated fats support heart health','Magnesium supports over 300 enzymatic reactions'],neg:['Calorie-dense — measure portions carefully when cutting']},
      {e:'🥣',n:'Tofu (firm)',srv:'3 oz (85g)',cal:70,fat:4,satFat:1,chol:0,sod:10,carb:2,fiber:0,sugar:0,prot:8,pos:['Isoflavones may reduce inflammation','Excellent absorbs flavors — versatile cooking protein'],neg:['Lower protein density than animal sources']},
      {e:'🫘',n:'Black Beans',srv:'1/2 cup (86g)',cal:114,fat:0,satFat:0,chol:0,sod:2,carb:20,fiber:8,sugar:0,prot:8,pos:['High fiber slows glucose absorption for weight management','Anthocyanins provide anti-inflammatory effects'],neg:['Incomplete protein — pair with rice for complete amino acids']},
      {e:'🐔',n:'Egg Whites',srv:'3 large (99g)',cal:51,fat:0,satFat:0,chol:0,sod:166,carb:1,fiber:0,sugar:0,prot:11,pos:['Pure protein with zero fat — ideal for cutting phases','Low calorie to hit daily protein targets'],neg:['Missing fat-soluble vitamins and choline found in yolks']},
      {e:'🧀',n:'Parmesan Cheese',srv:'1 oz (28g)',cal:111,fat:7,satFat:5,chol:26,sod:449,carb:1,fiber:0,sugar:0,prot:10,pos:['Very high calcium — 34% daily value per ounce','Aged cheeses contain minimal lactose'],neg:['High in saturated fat and sodium — use as flavor accent']},
      {e:'🐑',n:'Lamb Chop',srv:'3 oz (85g)',cal:172,fat:9,satFat:3,chol:78,sod:65,carb:0,fiber:0,sugar:0,prot:22,pos:['High in CLA which may support fat loss','Excellent source of B12 for nerve function and energy'],neg:['Higher saturated fat than chicken — moderate consumption']},
    ]
  },
  { id:'carbs', label:'Carbs & Grains', emoji:'🌾', desc:'Complex carbohydrates for sustained energy, fiber, and workout fuel.', accent:'#ba7517', accentBg:'#faeeda', accentText:'#633806',
    foods:[
      {e:'🍚',n:'Brown Rice',srv:'1/2 cup (98g)',cal:108,fat:1,satFat:0,chol:0,sod:5,carb:22,fiber:2,sugar:0,prot:2,pos:['Whole grain with extra fiber and minerals','Low glycemic index provides steady energy'],neg:['Arsenic levels can be higher — vary grain sources']},
      {e:'🌾',n:'Rolled Oats',srv:'1/2 cup (40g)',cal:150,fat:3,satFat:1,chol:0,sod:0,carb:27,fiber:4,sugar:1,prot:5,pos:['Beta-glucan fiber reduces LDL cholesterol','Avenanthramides provide anti-inflammatory effects'],neg:['Can contain gluten cross-contamination']},
      {e:'🍠',n:'Sweet Potato',srv:'1 medium (130g)',cal:112,fat:0,satFat:0,chol:0,sod:72,carb:26,fiber:4,sugar:5,prot:2,pos:['Beta-carotene converts to vitamin A for vision','High potassium prevents muscle cramping'],neg:['Naturally higher sugar — portion control for diabetics']},
      {e:'🍝',n:'Whole Wheat Pasta',srv:'2 oz dry (56g)',cal:180,fat:1,satFat:0,chol:0,sod:0,carb:38,fiber:6,sugar:2,prot:8,pos:['Higher fiber than regular pasta — improves satiety','Slower digestion for sustained endurance energy'],neg:['Gluten-containing — not for celiac disease']},
      {e:'🫓',n:'Whole Grain Bread',srv:'1 slice (40g)',cal:100,fat:2,satFat:0,chol:0,sod:170,carb:19,fiber:3,sugar:3,prot:4,pos:['B vitamins support energy metabolism','More nutrients than refined flour'],neg:['Many wheat breads are mostly refined — check labels']},
      {e:'🟡',n:'Quinoa',srv:'1/2 cup (92g)',cal:111,fat:2,satFat:0,chol:0,sod:6,carb:20,fiber:3,sugar:1,prot:4,pos:['Complete plant protein — all 9 essential amino acids','Gluten-free whole grain alternative'],neg:['More expensive than most grains']},
      {e:'🍌',n:'Banana',srv:'1 medium (118g)',cal:105,fat:0,satFat:0,chol:0,sod:1,carb:27,fiber:3,sugar:14,prot:1,pos:['Fast-digesting carbs ideal for pre-workout energy','Potassium prevents muscle cramps during exercise'],neg:['Higher natural sugar — limit if managing blood sugar']},
      {e:'🫘',n:'Chickpeas',srv:'1/2 cup (82g)',cal:135,fat:2,satFat:0,chol:0,sod:6,carb:22,fiber:6,sugar:4,prot:7,pos:['Resistant starch improves insulin sensitivity','Protein and carb combo — very filling legume'],neg:['Can cause gas when dramatically increased in diet']},
      {e:'🌽',n:'Corn (cooked)',srv:'1/2 cup (82g)',cal:66,fat:1,satFat:0,chol:0,sod:0,carb:15,fiber:2,sugar:2,prot:2,pos:['Lutein and zeaxanthin protect eye health','Affordable and versatile carb source'],neg:['Lower fiber density than most whole grains']},
      {e:'🟤',n:'Barley',srv:'1/2 cup (79g)',cal:97,fat:0,satFat:0,chol:0,sod:2,carb:22,fiber:3,sugar:0,prot:2,pos:['Highest beta-glucan content of any grain','Very low glycemic index — exceptional blood sugar management'],neg:['Contains gluten — not for celiac disease']},
      {e:'🍚',n:'White Rice',srv:'1/2 cup (79g)',cal:103,fat:0,satFat:0,chol:0,sod:1,carb:22,fiber:0,sugar:0,prot:2,pos:['Fastest-digesting carb — ideal post-workout','Low in FODMAPs — very gentle on digestive system'],neg:['Refined grain — stripped of fiber and B vitamins']},
      {e:'🌰',n:'Buckwheat',srv:'1/2 cup (85g)',cal:155,fat:1,satFat:0,chol:0,sod:4,carb:34,fiber:5,sugar:0,prot:6,pos:['Rutin antioxidant supports cardiovascular health','Gluten-free despite the name'],neg:['Less widely available and more expensive']},
      {e:'🥣',n:'Granola (low sugar)',srv:'1/4 cup (30g)',cal:130,fat:5,satFat:1,chol:0,sod:55,carb:20,fiber:2,sugar:6,prot:3,pos:['Convenient portable energy for athletes','Can be fortified with nuts and seeds'],neg:['Commercial granola often high in added sugar']},
      {e:'🌽',n:'Popcorn (air-popped)',srv:'3 cups (24g)',cal:93,fat:1,satFat:0,chol:0,sod:2,carb:19,fiber:4,sugar:0,prot:3,pos:['High volume low calorie — great for cutting satiety','Polyphenols in hull provide antioxidant benefits'],neg:['Commercial versions loaded with butter and salt']},
      {e:'🫛',n:'Green Peas',srv:'1/2 cup (80g)',cal:62,fat:0,satFat:0,chol:0,sod:3,carb:11,fiber:4,sugar:4,prot:4,pos:['Vitamin K supports bone health and blood clotting','Impressive protein for a vegetable'],neg:['Low calorie density for primary carb source']},
      {e:'🫙',n:'Cream of Wheat',srv:'1/4 cup dry (33g)',cal:120,fat:0,satFat:0,chol:0,sod:0,carb:25,fiber:1,sugar:0,prot:4,pos:['Iron-fortified — helps prevent anemia','Very easy to digest — ideal pre-workout'],neg:['Refined grain — low in fiber']},
      {e:'🌾',n:'Millet',srv:'1/2 cup (87g)',cal:104,fat:1,satFat:0,chol:0,sod:1,carb:21,fiber:1,sugar:0,prot:3,pos:['Gluten-free alkaline grain supports bone density','Magnesium supports over 300 metabolic reactions'],neg:['Contains goitrogens in excess']},
      {e:'🟫',n:'Whole Wheat Tortilla',srv:'1 medium (45g)',cal:130,fat:3,satFat:1,chol:0,sod:200,carb:23,fiber:3,sugar:1,prot:4,pos:['Convenient portable carb for meal prep','More fiber than white flour tortillas'],neg:['Many commercial brands use refined flour']},
      {e:'🍠',n:'Plantain (cooked)',srv:'1/2 cup (77g)',cal:89,fat:0,satFat:0,chol:0,sod:4,carb:24,fiber:2,sugar:11,prot:1,pos:['High vitamin B6 supports mood and protein metabolism','Resistant starch when green acts as prebiotic fiber'],neg:['Ripe plantains have higher sugar content']},
      {e:'🍠',n:'Cassava / Yuca',srv:'1/2 cup (103g)',cal:165,fat:0,satFat:0,chol:0,sod:14,carb:39,fiber:2,sugar:2,prot:1,pos:['Calorie-dense root — great for hard gainers','Naturally gluten-free grain alternative'],neg:['Raw cassava contains cyanogenic compounds — must fully cook']},
    ]
  },
  { id:'produce', label:'Produce', emoji:'🥦', desc:'Fruits and vegetables packed with vitamins, minerals, and antioxidants.', accent:'#3b6d11', accentBg:'#eaf3de', accentText:'#27500a',
    foods:[
      {e:'🥦',n:'Broccoli',srv:'1 cup (91g)',cal:31,fat:0,satFat:0,chol:0,sod:30,carb:6,fiber:2,sugar:2,prot:3,pos:['Sulforaphane activates the most powerful antioxidant pathway in the body','Vitamin C exceeds oranges by weight — critical for collagen synthesis'],neg:['Can cause bloating when suddenly increased']},
      {e:'🍓',n:'Strawberries',srv:'1 cup (152g)',cal:49,fat:0,satFat:0,chol:0,sod:2,carb:12,fiber:3,sugar:7,prot:1,pos:['Anthocyanins reduce oxidative stress from intense exercise','Highest vitamin C of common berries'],neg:['On the dirty dozen pesticide list — buy organic']},
      {e:'🫑',n:'Bell Pepper (red)',srv:'1 medium (149g)',cal:37,fat:0,satFat:0,chol:0,sod:6,carb:9,fiber:3,sugar:6,prot:1,pos:['Richest vitamin C source of any common vegetable','Capsanthin and quercetin provide anti-inflammatory effects'],neg:['Nightshade family — some with arthritis may react']},
      {e:'🥬',n:'Kale',srv:'1 cup (67g)',cal:34,fat:0,satFat:0,chol:0,sod:29,carb:7,fiber:1,sugar:0,prot:2,pos:['Vitamin K1 at 684% daily value — essential for bone metabolism','Lutein and zeaxanthin protect against macular degeneration'],neg:['High oxalates may contribute to kidney stones']},
      {e:'🥑',n:'Avocado',srv:'1/2 medium (75g)',cal:120,fat:11,satFat:2,chol:0,sod:5,carb:6,fiber:5,sugar:0,prot:1,pos:['Monounsaturated oleic acid supports heart health','Highest potassium food — more than bananas, prevents muscle cramps'],neg:['Calorie-dense — track portions during fat loss']},
      {e:'🍅',n:'Tomato',srv:'1 medium (123g)',cal:22,fat:0,satFat:0,chol:0,sod:6,carb:5,fiber:2,sugar:3,prot:1,pos:['Lycopene concentration increases when cooked','Vitamin C and potassium support immune function'],neg:['Nightshade — may trigger symptoms in sensitive individuals']},
      {e:'🥕',n:'Carrot',srv:'1 medium (61g)',cal:25,fat:0,satFat:0,chol:0,sod:42,carb:6,fiber:2,sugar:3,prot:1,pos:['Richest plant source of pre-vitamin A for eye health','Absorption increases significantly when cooked with fat'],neg:['Baby carrots treated with chlorine wash — rinse well']},
      {e:'🫙',n:'Spinach',srv:'2 cups (60g)',cal:14,fat:0,satFat:0,chol:0,sod:48,carb:2,fiber:1,sugar:0,prot:2,pos:['Nitrates improve athletic endurance and oxygen efficiency','Lutein and beta-carotene support eye health'],neg:['Very high oxalates — moderate if prone to kidney stones']},
      {e:'🫐',n:'Blueberries',srv:'1 cup (148g)',cal:84,fat:0,satFat:0,chol:0,sod:1,carb:21,fiber:4,sugar:15,prot:1,pos:['Anthocyanins improve blood flow to the brain','May reduce post-exercise muscle damage and speed recovery'],neg:['High natural sugar — limit to 1 cup; choose frozen for value']},
      {e:'🧅',n:'Garlic',srv:'3 cloves (9g)',cal:13,fat:0,satFat:0,chol:0,sod:2,carb:3,fiber:0,sugar:0,prot:1,pos:['Allicin has potent antimicrobial properties','Reduces LDL cholesterol and blood pressure'],neg:['Can cause digestive discomfort in large quantities']},
      {e:'🍆',n:'Eggplant',srv:'1 cup (99g)',cal:35,fat:0,satFat:0,chol:0,sod:1,carb:9,fiber:2,sugar:3,prot:1,pos:['Nasunin in purple skin protects brain cell membranes','Low calorie with fiber — excellent for volume eating'],neg:['Nightshade family may aggravate arthritis symptoms']},
      {e:'🥒',n:'Cucumber',srv:'1/2 cup (52g)',cal:8,fat:0,satFat:0,chol:0,sod:1,carb:2,fiber:0,sugar:1,prot:0,pos:['Over 95% water — excellent for hydration during training','Cucurbitacins have anti-inflammatory properties'],neg:['Very low nutrient density — primarily a hydration food']},
      {e:'🍋',n:'Lemon Juice',srv:'2 tbsp (30ml)',cal:7,fat:0,satFat:0,chol:0,sod:1,carb:2,fiber:0,sugar:1,prot:0,pos:['Vitamin C significantly enhances iron absorption from plant foods','Citric acid may reduce kidney stone formation'],neg:['Highly acidic — can erode tooth enamel over time']},
      {e:'🥝',n:'Kiwi',srv:'1 medium (69g)',cal:42,fat:0,satFat:0,chol:0,sod:2,carb:10,fiber:2,sugar:6,prot:1,pos:['Highest vitamin C density of any common fruit','Actinidin enzyme improves protein digestion'],neg:['Common allergen in latex-fruit syndrome']},
      {e:'🧄',n:'Onion',srv:'1/2 cup (80g)',cal:32,fat:0,satFat:0,chol:0,sod:3,carb:7,fiber:1,sugar:3,prot:1,pos:['Quercetin is one of the most studied anti-inflammatory antioxidants','Prebiotic fiber feeds beneficial gut bacteria'],neg:['High FODMAP — may cause bloating in IBS sufferers']},
      {e:'🥗',n:'Romaine Lettuce',srv:'2 cups (94g)',cal:16,fat:0,satFat:0,chol:0,sod:9,carb:3,fiber:2,sugar:1,prot:1,pos:['Vitamin A at 82% daily value for immune function','High water content supports hydration'],neg:['Prone to contamination — wash thoroughly']},
      {e:'🫑',n:'Zucchini',srv:'1 cup (124g)',cal:21,fat:0,satFat:0,chol:0,sod:16,carb:4,fiber:1,sugar:3,prot:2,pos:['Very low calorie — excellent for adding volume to meals','Vitamin B6 supports protein metabolism'],neg:['Cannot replace starchy carbs as primary fuel']},
      {e:'🍊',n:'Orange',srv:'1 medium (131g)',cal:62,fat:0,satFat:0,chol:0,sod:0,carb:15,fiber:3,sugar:12,prot:1,pos:['Hesperidin improves blood vessel function','Whole fruit fiber slows sugar absorption'],neg:['Juice form removes fiber entirely — choose whole fruit']},
      {e:'🥜',n:'Beets',srv:'1/2 cup (85g)',cal:37,fat:0,satFat:0,chol:0,sod:65,carb:8,fiber:2,sugar:7,prot:1,pos:['Dietary nitrates significantly improve endurance performance','Betaine supports liver detoxification'],neg:['May cause red urine (beeturia) — harmless but alarming']},
      {e:'🥬',n:'Brussels Sprouts',srv:'1/2 cup (78g)',cal:28,fat:0,satFat:0,chol:0,sod:16,carb:6,fiber:2,sugar:1,prot:2,pos:['Glucosinolates break down into powerful cancer-protective compounds','Highest folate of the brassica family'],neg:['Causes significant bloating for many people — cook well']},
    ]
  },
  { id:'dairy', label:'Dairy & Fats', emoji:'🥛', desc:'Calcium-rich dairy and healthy fats for hormones, brain, and joint health.', accent:'#185fa5', accentBg:'#e6f1fb', accentText:'#0c447c',
    foods:[
      {e:'🥛',n:'Whole Milk',srv:'1 cup (244ml)',cal:149,fat:8,satFat:5,chol:24,sod:105,carb:12,fiber:0,sugar:12,prot:8,pos:['Fat enables absorption of fat-soluble vitamins A D E K','CLA and butyrate have anti-inflammatory effects'],neg:['High saturated fat — choose lower fat if cardiovascular risk']},
      {e:'🧀',n:'Cheddar Cheese',srv:'1 oz (28g)',cal:113,fat:9,satFat:6,chol:29,sod:183,carb:0,fiber:0,sugar:0,prot:7,pos:['Calcium and phosphorus support bone and dental health','Aged cheeses naturally low in lactose'],neg:['Calorie-dense with high saturated fat — limit to 1-2 oz']},
      {e:'🫙',n:'Kefir',srv:'1 cup (244ml)',cal:104,fat:2,satFat:2,chol:10,sod:125,carb:12,fiber:0,sugar:12,prot:9,pos:['Up to 61 strains of beneficial bacteria — most probiotic-dense food','Kefiran may lower blood pressure and reduce inflammation'],neg:['Fermented dairy — those with severe lactose intolerance may still react']},
      {e:'🫒',n:'Olive Oil (EVOO)',srv:'1 tbsp (14g)',cal:119,fat:14,satFat:2,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Oleocanthal has anti-inflammatory effects comparable to ibuprofen','Oleic acid is the most heart-healthy monounsaturated fat'],neg:['Low smoke point for EVOO — use for finishing or low-heat cooking']},
      {e:'🥜',n:'Almonds',srv:'1 oz (28g)',cal:164,fat:14,satFat:1,chol:0,sod:0,carb:6,fiber:4,sugar:1,prot:6,pos:['Highest vitamin E content of any tree nut','Magnesium at 19% daily value supports muscle function and sleep'],neg:['Calorie-dense — measure by weight; 1 oz is only 23 almonds']},
      {e:'🌰',n:'Walnuts',srv:'1 oz (28g)',cal:185,fat:18,satFat:2,chol:0,sod:1,carb:4,fiber:2,sugar:1,prot:4,pos:['Highest plant omega-3 content of any nut — 2.5g per serving','Polyphenols and melatonin support sleep quality'],neg:['Very calorie-dense — pre-portion to avoid overconsuming']},
      {e:'🌻',n:'Sunflower Seeds',srv:'1 oz (28g)',cal:165,fat:14,satFat:1,chol:0,sod:1,carb:7,fiber:2,sugar:1,prot:5,pos:['Richest food source of vitamin E — protects cell membranes','Selenium provides thyroid and immune system support'],neg:['High omega-6 — balance with omega-3 sources']},
      {e:'🌻',n:'Pumpkin Seeds',srv:'1 oz (28g)',cal:151,fat:13,satFat:2,chol:0,sod:5,carb:5,fiber:2,sugar:0,prot:7,pos:['Richest food source of zinc for testosterone and immune function','Magnesium among the highest of any seed'],neg:['High in phosphorus — kidney disease patients should consult doctor']},
      {e:'🥜',n:'Cashews',srv:'1 oz (28g)',cal:157,fat:12,satFat:2,chol:0,sod:3,carb:9,fiber:1,sugar:2,prot:5,pos:['Highest copper of any nut — supports iron metabolism','Oleic acid improves lipid profiles'],neg:['Tree nut allergen — common allergy']},
      {e:'🫘',n:'Flaxseeds (ground)',srv:'2 tbsp (14g)',cal:75,fat:6,satFat:1,chol:0,sod:4,carb:4,fiber:4,sugar:0,prot:3,pos:['Richest plant source of lignans and phytoestrogens','Ground form dramatically increases nutrient bioavailability'],neg:['Must be ground to access nutrients — whole seeds pass through undigested']},
      {e:'🧀',n:'Feta Cheese',srv:'1 oz (28g)',cal:75,fat:6,satFat:4,chol:25,sod:316,carb:1,fiber:0,sugar:0,prot:4,pos:['Lower calorie than many hard cheeses','Traditional sheep milk feta has beneficial fatty acids'],neg:['Very high sodium — 316mg per ounce']},
      {e:'🥛',n:'Skim Milk',srv:'1 cup (245ml)',cal:83,fat:0,satFat:0,chol:5,sod:103,carb:12,fiber:0,sugar:12,prot:8,pos:['All the calcium and protein of whole milk with no fat','Casein protein is slow-digesting — great bedtime protein'],neg:['Removal of fat reduces absorption of fat-soluble vitamins']},
      {e:'🥚',n:'Butter (unsalted)',srv:'1 tbsp (14g)',cal:102,fat:12,satFat:7,chol:31,sod:2,carb:0,fiber:0,sugar:0,prot:0,pos:['Butyrate feeds colon cells and reduces gut inflammation','Fat-soluble vitamins A D E K concentrated in butter fat'],neg:['Very high in saturated fat — use sparingly']},
      {e:'🥥',n:'Coconut Oil',srv:'1 tbsp (13g)',cal:121,fat:14,satFat:11,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['MCTs convert to ketones — rapid brain energy source','Lauric acid has antimicrobial properties'],neg:['Extremely high saturated fat — use in strict moderation']},
      {e:'🧈',n:'Ricotta Cheese',srv:'1/2 cup (124g)',cal:171,fat:10,satFat:6,chol:38,sod:155,carb:6,fiber:0,sugar:0,prot:14,pos:['Higher protein than most fresh cheeses','Calcium supports bone health during training'],neg:['Fresh cheese — use within 5-7 days of opening']},
      {e:'🧈',n:'Ghee',srv:'1 tbsp (13g)',cal:112,fat:13,satFat:8,chol:32,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Suitable for most with lactose intolerance','Higher smoke point than butter — safer for high-heat cooking'],neg:['Even higher in saturated fat than regular butter']},
      {e:'🐟',n:'Fish Oil',srv:'1 tsp (4.5g)',cal:40,fat:5,satFat:1,chol:12,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['EPA and DHA reduce triglycerides by 15-30%','Shown to reduce exercise-induced muscle soreness and joint pain'],neg:['Can cause fishy burps — take with meals or choose enteric-coated']},
      {e:'🥣',n:'Low-Fat Yogurt',srv:'3/4 cup (170g)',cal:100,fat:2,satFat:1,chol:10,sod:120,carb:14,fiber:0,sugar:11,prot:8,pos:['Live cultures provide digestive and immune benefits','Convenient portable protein source for athletes'],neg:['Flavored versions can have as much sugar as dessert — choose plain']},
      {e:'🫙',n:'Cream Cheese',srv:'2 tbsp (28g)',cal:97,fat:10,satFat:6,chol:31,sod:89,carb:2,fiber:0,sugar:2,prot:2,pos:['Lower lactose — tolerated by many lactose-sensitive individuals','Provides concentrated fat-soluble vitamins'],neg:['Very low in protein relative to calories']},
      {e:'🥚',n:'Sour Cream',srv:'2 tbsp (24g)',cal:51,fat:5,satFat:3,chol:15,sod:12,carb:1,fiber:0,sugar:1,prot:1,pos:['Contains live cultures in some varieties','Low lactose — tolerated by many lactose-sensitive individuals'],neg:['Primarily fat with very little protein or micronutrients']},
    ]
  },
  { id:'supplements', label:'Supplements', emoji:'💊', desc:'Common supplements for athletic performance, recovery, and micronutrient gaps.', accent:'#534ab7', accentBg:'#eeedfe', accentText:'#3c3489',
    foods:[
      {e:'💊',n:'Whey Isolate',srv:'1 scoop (30g)',cal:110,fat:1,satFat:0,chol:30,sod:120,carb:2,fiber:0,sugar:1,prot:25,pos:['Fastest absorbed protein — peak amino acids within 60 min','Highest leucine density maximizes muscle protein synthesis'],neg:['Dairy-derived — not suitable for vegans']},
      {e:'🌿',n:'Creatine Monohydrate',srv:'5g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Most researched supplement — improves high-intensity performance 10-15%','Faster ATP regeneration between sets'],neg:['Causes intracellular water retention — weight gain is normal and beneficial']},
      {e:'☕',n:'Caffeine',srv:'200mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Reduces perceived effort and fatigue during training','Improves endurance 3-5% and strength up to 7%'],neg:['Half-life 5-6 hours — avoid within 6-8 hours of sleep']},
      {e:'🧬',n:'Beta-Alanine',srv:'3.2g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Increases muscle carnosine — buffers lactic acid in muscles','2-3% improvement in sustained high-intensity exercise'],neg:['Causes harmless tingling — split into smaller doses to minimize']},
      {e:'☀️',n:'Vitamin D3 (2000 IU)',srv:'2000 IU',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Over 1000 genes have vitamin D response elements','Athletes with optimal D3 levels have fewer stress fractures'],neg:['Fat-soluble — can accumulate to toxic levels; get blood test first']},
      {e:'🧲',n:'Magnesium Glycinate',srv:'300mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Highest bioavailability and least laxative effect of all magnesium forms','Supports sleep quality muscle relaxation and 300+ enzymatic reactions'],neg:['Excessive doses cause loose stools — start at 200mg and titrate up']},
      {e:'🫐',n:'Collagen Peptides',srv:'10g',cal:35,fat:0,satFat:0,chol:0,sod:15,carb:0,fiber:0,sugar:0,prot:9,pos:['Supports tendons ligaments and skin elasticity','Vitamin C co-administration required for optimal synthesis'],neg:['Not a complete protein — lacks tryptophan']},
      {e:'🌿',n:'Ashwagandha (KSM-66)',srv:'600mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Clinical trials show significant cortisol reduction','10-15% strength improvements after 8 weeks in RCTs'],neg:['May interact with thyroid medications — avoid in pregnancy']},
      {e:'🧊',n:'Electrolyte Mix',srv:'1 packet',cal:15,fat:0,satFat:0,chol:0,sod:500,carb:4,fiber:0,sugar:3,prot:0,pos:['Sodium potassium and magnesium replacement for sessions over 60 min','Prevents hyponatremia during ultra-endurance events'],neg:['Many commercial products contain Red 40 and Yellow 5 — check labels']},
      {e:'🌱',n:'Plant Protein Blend',srv:'1 scoop (35g)',cal:130,fat:2,satFat:0,chol:0,sod:200,carb:6,fiber:3,sugar:1,prot:22,pos:['Pea and rice combination creates complete amino acid profile','Hypoallergenic — suitable for dairy-free and soy-free diets'],neg:['Slightly lower leucine than whey — may need higher dosing']},
      {e:'🫚',n:'MCT Oil',srv:'1 tbsp (15ml)',cal:130,fat:14,satFat:13,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['C8 converts to ketones within 2 hours — immediate brain fuel','Bypasses normal fat digestion — no bile required'],neg:['Can cause severe GI distress — must start at 1 tsp and increase slowly']},
      {e:'🍋',n:'Vitamin C (500mg)',srv:'500mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Critical cofactor for collagen synthesis — take before training','May reduce DOMS and exercise-induced oxidative stress'],neg:['Doses above 1g/day can cause kidney stones in predisposed individuals']},
      {e:'💙',n:'B12 (methylcobalamin)',srv:'1000mcg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Essential for vegans — only reliable vegan B12 source is supplementation','Methylcobalamin more bioavailable than cyanocobalamin'],neg:['Very safe even at high doses — excess excreted in urine']},
      {e:'🌿',n:'Rhodiola Rosea',srv:'400mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Reduces mental fatigue and improves endurance by 1-3%','Salidroside and rosavin protect mitochondria from stress damage'],neg:['May cause insomnia if taken late in the day']},
      {e:'🍃',n:'Green Tea Extract (EGCG)',srv:'400mg',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['May increase fat oxidation during exercise by 10-16%','Powerful antioxidant reduces inflammatory biomarkers'],neg:['Contains caffeine — account in total daily intake; high doses may stress liver']},
      {e:'🧡',n:'Fish Oil Capsule',srv:'1g',cal:9,fat:1,satFat:0,chol:3,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['EPA and DHA reduce pro-inflammatory cytokines','Reduced cardiovascular event risk at 1-4g EPA+DHA per day'],neg:['Quality varies dramatically — look for third-party tested products']},
      {e:'💊',n:'ZMA (Zinc+Magnesium)',srv:'3 capsules',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Zinc at 30mg supports testosterone production and immune function','Taking at bedtime supports sleep quality and overnight recovery'],neg:['Zinc above 40mg/day long-term can deplete copper']},
      {e:'🌾',n:'Glutamine Powder',srv:'5g',cal:20,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:5,pos:['Most abundant amino acid in muscle — decreases during intense training','Supports intestinal cell integrity in high-volume athletes'],neg:['Weak evidence in athletes with adequate protein intake']},
      {e:'🍖',n:'HMB (Beta-hydroxy)',srv:'3g',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Reduces muscle protein breakdown during caloric restriction','May preserve lean mass during cutting phases'],neg:['Benefits most significant for untrained individuals']},
      {e:'🧫',n:'Probiotics (multi-strain)',srv:'1 capsule (10B CFU)',cal:0,fat:0,satFat:0,chol:0,sod:0,carb:0,fiber:0,sugar:0,prot:0,pos:['Lactobacillus and Bifidobacterium shown to reduce respiratory illness in athletes 27%','Gut microbiome diversity linked to athletic performance'],neg:['Benefits are strain-specific — generic products may not match studied formulations']},
    ]
  },
] as const

type Food = { e:string; n:string; srv:string; cal:number; fat:number; satFat:number; chol:number; sod:number; carb:number; fiber:number; sugar:number; prot:number; pos:string[]; neg:string[] }
type Group = typeof GROUPS[number]

const dvPct = (v:number, d:number) => v ? `${Math.round((v/d)*100)}%` : '0%'

export function NutritionTab() {
  const [group, setGroup] = useState<Group>(GROUPS[0] as unknown as Group)
  const [food, setFood]   = useState<Food|null>(null)
  const [search, setSearch] = useState('')
  const [flash, setFlash] = useState(false)

  const selectFood = (f:Food) => { setFlash(true); setTimeout(()=>{ setFood(f); setFlash(false) }, 220) }
  const filtered = (group as any).foods.filter((f:Food) => f.n.toLowerCase().includes(search.toLowerCase()))
  const g = group as any

  const nfRows = food ? [
    {b:true, label:`Total Fat ${food.fat}g`, pct:dvPct(food.fat,78)},
    {b:false,i:true,label:`Saturated Fat ${food.satFat}g`,pct:dvPct(food.satFat,20)},
    {b:false,i:true,label:`Trans Fat 0g`,pct:''},
    {b:true, label:`Cholesterol ${food.chol}mg`,pct:dvPct(food.chol,300)},
    {b:true, label:`Sodium ${food.sod}mg`,pct:dvPct(food.sod,2300)},
    {b:true, label:`Total Carbohydrate ${food.carb}g`,pct:dvPct(food.carb,275)},
    {b:false,i:true,label:`Dietary Fiber ${food.fiber}g`,pct:dvPct(food.fiber,28)},
    {b:false,i:true,label:`Total Sugars ${food.sugar}g`,pct:''},
    {b:true, label:`Protein ${food.prot}g`,pct:''},
  ] : []

  const total = food ? (food.fat*9 + food.carb*4 + food.prot*4 || 1) : 1
  const macros = food ? [
    {label:'Protein',val:`${food.prot}g`,pct:Math.round((food.prot*4/total)*100),color:'#185fa5'},
    {label:'Carbs',val:`${food.carb}g`,pct:Math.round((food.carb*4/total)*100),color:'#ba7517'},
    {label:'Fat',val:`${food.fat}g`,pct:Math.round((food.fat*9/total)*100),color:'#d85a30'},
    {label:'Fiber',val:`${food.fiber}g`,pct:Math.min(100,Math.round((food.fiber/28)*100)),color:'#3b6d11'},
  ] : []

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {GROUPS.map((gr:any) => (
          <button key={gr.id} onClick={()=>{setGroup(gr as unknown as Group);setFood(null);setSearch('')}}
            style={{padding:'8px 18px',borderRadius:20,fontSize:13,fontWeight:800,
              border:`2px solid ${gr.id===g.id?gr.accent:'var(--border)'}`,
              background:gr.id===g.id?gr.accentBg:'var(--bg)',
              color:gr.id===g.id?gr.accentText:'var(--muted)',
              cursor:'pointer',fontFamily:'Nunito,sans-serif',display:'flex',alignItems:'center',gap:7,transition:'all 0.15s'}}>
            <span style={{fontSize:18}}>{gr.emoji}</span>{gr.label}
          </button>
        ))}
      </div>
      <div style={{fontSize:12,fontWeight:700,color:'var(--muted)'}}>{g.desc}</div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:18,alignItems:'start'}}>
        <div style={{background:'var(--card)',border:'2px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={`Search ${g.label.toLowerCase()}...`}
            style={{width:'100%',padding:'10px 13px',border:'none',borderBottom:'2px solid var(--border)',fontSize:13,fontWeight:700,background:'var(--bg)',color:'var(--text)',outline:'none',fontFamily:'Nunito,sans-serif'}}/>
          <div style={{maxHeight:460,overflowY:'auto'}}>
            {filtered.map((f:Food) => (
              <div key={f.n} onClick={()=>selectFood(f)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 13px',cursor:'pointer',
                  borderBottom:'1.5px solid var(--border)',
                  background:food?.n===f.n?g.accentBg:'transparent',transition:'background 0.1s'}}>
                <span style={{fontSize:22,width:28,textAlign:'center',flexShrink:0}}>{f.e}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:food?.n===f.n?g.accentText:'var(--text)'}}>{f.n}</div>
                  <div style={{fontSize:11,color:'var(--muted)',fontWeight:700,marginTop:1}}>{f.cal} cal · {f.prot}g protein</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{height:160,borderRadius:18,overflow:'hidden',position:'relative',
            background:`linear-gradient(135deg, ${g.accentBg}, var(--bg))`,
            border:'2px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{fontSize:90,transition:'opacity 0.22s',opacity:flash?0:1}}>{food?food.e:g.emoji}</span>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'8px 16px',background:'rgba(0,0,0,0.4)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:800,color:'#fff'}}>{food?food.n:'Select a food'}</span>
              {food&&<span style={{fontSize:11,fontWeight:800,padding:'2px 10px',borderRadius:20,background:g.accent,color:'#fff'}}>{g.label}</span>}
            </div>
          </div>
          {food ? (
            <>
              <div style={{background:'var(--card)',border:'2px solid var(--border)',borderRadius:18,padding:16}}>
                <div style={{fontFamily:'Arial,sans-serif',border:'1.5px solid var(--text)',borderRadius:3,padding:'10px 14px',color:'var(--text)',maxWidth:320}}>
                  <div style={{fontSize:22,fontWeight:900,borderBottom:'7px solid var(--text)',paddingBottom:2,marginBottom:2}}>Nutrition Facts</div>
                  <div style={{fontSize:11,marginBottom:1}}>Serving size: {food.srv}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',borderBottom:'3px solid var(--text)',paddingBottom:2,marginBottom:3}}>
                    <div><div style={{fontSize:12,fontWeight:900}}>Amount per serving</div><div style={{fontSize:13,fontWeight:900}}>Calories</div></div>
                    <div style={{fontSize:38,fontWeight:900,lineHeight:1}}>{food.cal}</div>
                  </div>
                  <div style={{textAlign:'right',fontSize:10,fontWeight:900,borderBottom:'2px solid var(--text)',paddingBottom:1,marginBottom:2}}>% Daily Value*</div>
                  {nfRows.map((r,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:11,borderBottom:'0.5px solid #ccc',padding:`1.5px 0 1.5px ${r.i?14:0}px`,fontWeight:r.b?900:400}}>
                      <span>{r.label}</span><span>{r.pct}</span>
                    </div>
                  ))}
                  <div style={{fontSize:9,color:'var(--muted)',textAlign:'center',borderTop:'1px solid var(--text)',marginTop:4,paddingTop:3}}>*% Daily Value based on a 2,000 calorie diet.</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {macros.map(m=>(
                  <div key={m.label} style={{background:'var(--bg)',border:'2px solid var(--border)',borderRadius:12,padding:'11px 13px'}}>
                    <div style={{fontSize:11,color:'var(--muted)',fontWeight:700,marginBottom:4}}>{m.label}</div>
                    <div style={{fontSize:17,fontWeight:900,color:'var(--text)',marginBottom:6}}>{m.val}</div>
                    <div style={{height:6,background:'var(--border)',borderRadius:20,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m.pct}%`,background:m.color,borderRadius:20,transition:'width 0.5s ease'}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--card)',border:'2px solid var(--border)',borderRadius:18,padding:16}}>
                <div style={{fontSize:14,fontWeight:900,color:'var(--text)',marginBottom:8}}>🌿 Health & fitness benefits</div>
                {food.pos.map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginTop:8,alignItems:'flex-start'}}>
                    <span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:20,background:'var(--p-light)',color:'var(--p-dark)',whiteSpace:'nowrap',flexShrink:0}}>✓ Benefit</span>
                    <span style={{fontSize:12,color:'var(--muted)',lineHeight:1.55,fontWeight:700}}>{t}</span>
                  </div>
                ))}
                {food.neg.map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginTop:8,alignItems:'flex-start'}}>
                    <span style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:20,background:'#FFE8E8',color:'#C62A2A',whiteSpace:'nowrap',flexShrink:0}}>⚠ Caution</span>
                    <span style={{fontSize:12,color:'var(--muted)',lineHeight:1.55,fontWeight:700}}>{t}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{background:'var(--card)',border:'2px solid var(--border)',borderRadius:18,padding:40,textAlign:'center'}}>
              <div style={{fontSize:52,marginBottom:12}}>{g.emoji}</div>
              <div style={{fontSize:16,fontWeight:900,color:'var(--text)',marginBottom:6}}>{(g as any).foods.length} {g.label}</div>
              <div style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Click any food on the left to see its full nutrition label, macro breakdown, and health benefits.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
