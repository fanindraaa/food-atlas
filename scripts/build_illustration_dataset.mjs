import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ingredients150 = JSON.parse(fs.readFileSync('src/data/india-food-journey-150.json', 'utf8'));
const ingredients35 = JSON.parse(fs.readFileSync('data/ingredients.json', 'utf8'));
const styleConfig = JSON.parse(fs.readFileSync('food_illustration_style.json', 'utf8'));

fs.mkdirSync('public/ingredients', { recursive: true });

// Botanical definitions for all 150 items
const BOTANICAL_DETAILS = {
  // Grains & Millets
  'rice': { visualForm: 'golden drooping ripening rice panicle with a small cluster of polished pearly grains', primaryColor: '#E8CA65', secondaryColor: '#BFA043', category: 'Grain' },
  'wheat': { visualForm: 'dense bearded ear of golden wheat with long awns and individual grains', primaryColor: '#E5BF62', secondaryColor: '#BA933E', category: 'Grain' },
  'barley': { visualForm: 'bearded barley spikelet with elongated parallel awns and husked grains', primaryColor: '#DFC278', secondaryColor: '#B0954F', category: 'Grain' },
  'sorghum-jowar': { visualForm: 'dense compact panicle head of cream and terracotta jowar grains', primaryColor: '#D89860', secondaryColor: '#96522E', category: 'Grain' },
  'pearl-millet-bajra': { visualForm: 'cylindrical brownish-grey spiked ear of bajra with dense exposed pearls', primaryColor: '#9E886B', secondaryColor: '#6B5840', category: 'Grain' },
  'finger-millet-ragi': { visualForm: 'digitate claw-like cluster of dense reddish-brown ragi grain spikes', primaryColor: '#8C382A', secondaryColor: '#5C1D13', category: 'Grain' },
  'little-millet-kutki': { visualForm: 'delicate open spreading panicle of tiny golden-buff kutki seeds', primaryColor: '#E2CA88', secondaryColor: '#B29752', category: 'Grain' },
  'kodo-millet': { visualForm: 'twin-rowed dark brown kodo seed spike with smooth rounded grains', primaryColor: '#784E33', secondaryColor: '#4A2C18', category: 'Grain' },
  'foxtail-millet': { visualForm: 'arching bristly golden-yellow foxtail panicle nodding gently', primaryColor: '#E6B83B', secondaryColor: '#B58716', category: 'Grain' },
  'barnyard-millet': { visualForm: 'erect branching purplish-green panicle of tiny sanwa grains', primaryColor: '#7D8856', secondaryColor: '#533844', category: 'Grain' },
  'proso-millet': { visualForm: 'drooping one-sided loose panicle of lustrous yellow-golden proso grains', primaryColor: '#EBC452', secondaryColor: '#BA9225', category: 'Grain' },
  'maize-corn': { visualForm: 'partially peeled ripe ear of golden yellow sweet corn with dry green husk and silk', primaryColor: '#F5BE27', secondaryColor: '#829C38', category: 'Grain' },
  'amaranth-grain-rajgira': { visualForm: 'plumed velvety magenta-gold rajgira floral tassel with ivory seeds', primaryColor: '#C4375A', secondaryColor: '#EDE4B8', category: 'Grain' },

  // Pulses
  'chickpea-chana': { visualForm: 'swollen glandular green pod with dried golden-brown wrinkled desi chana chickpeas beside it', primaryColor: '#C99351', secondaryColor: '#789445', category: 'Pulse' },
  'lentil-masoor': { visualForm: 'short flat papery pod opened to reveal bright split orange-red masoor lentils', primaryColor: '#E86538', secondaryColor: '#8CA352', category: 'Pulse' },
  'field-pea-matar': { visualForm: 'succulent green field pea pod split open to reveal a row of spherical green peas', primaryColor: '#6DA838', secondaryColor: '#43731E', category: 'Pulse' },
  'green-gram-moong': { visualForm: 'slender dark brown hairy pod with cylindrical olive-green moong beans', primaryColor: '#637A3B', secondaryColor: '#415222', category: 'Pulse' },
  'black-gram-urad': { visualForm: 'narrow dark hairy pod with matte black cylindrical urad beans with white hilum', primaryColor: '#363432', secondaryColor: '#EDEDED', category: 'Pulse' },
  'pigeon-pea-toor-arhar': { visualForm: 'mottled purple-green toor pod alongside golden split pigeon peas', primaryColor: '#E6A72C', secondaryColor: '#6E4256', category: 'Pulse' },
  'moth-bean-matki': { visualForm: 'small curved brown pod with tiny mottled terracotta matki seeds', primaryColor: '#96583A', secondaryColor: '#66361E', category: 'Pulse' },
  'horse-gram-kulthi': { visualForm: 'flattened curved pod with hard flattened reddish-brown kulthi seeds', primaryColor: '#804832', secondaryColor: '#4A2518', category: 'Pulse' },
  'cowpea-lobia': { visualForm: 'long slender pod with creamy white lobia beans bearing distinct dark eye markings', primaryColor: '#E6DCC8', secondaryColor: '#302622', category: 'Pulse' },
  'hyacinth-bean-avarekai-sem': { visualForm: 'broad flat curved purple-edged green pod with plump avarekai seeds', primaryColor: '#789C44', secondaryColor: '#843A6E', category: 'Pulse' },
  'rice-bean': { visualForm: 'slender cylindrical pod with small polished red-brown rice beans', primaryColor: '#8F3D2C', secondaryColor: '#5E2215', category: 'Pulse' },
  'cluster-bean-guar': { visualForm: 'cluster of straight narrow green guar pods with subtle seed bulges', primaryColor: '#729E42', secondaryColor: '#4F7327', category: 'Pulse' },
  'common-bean-french-bean': { visualForm: 'crisp bright green slender tender french bean pod with natural curvature', primaryColor: '#5E9E32', secondaryColor: '#3C6B1B', category: 'Pulse' },
  'kidney-bean-rajma': { visualForm: 'handful of plump glossy deep mahogany-red kidney beans with white hilum scar', primaryColor: '#821D1D', secondaryColor: '#4A0C0C', category: 'Pulse' },
  'soybean': { visualForm: 'short hairy clustered pod with oval cream-tan soybeans', primaryColor: '#D4B87D', secondaryColor: '#8A7144', category: 'Pulse' },

  // Vegetables & Roots
  'potato-aloo': { visualForm: 'earthy dusted russet potato alongside a cut halved section showing pale cream flesh', primaryColor: '#B08852', secondaryColor: '#EFE1BA', category: 'Vegetable' },
  'sweet-potato': { visualForm: 'tapered rosy copper-skinned sweet potato with sliced bright orange-fleshed round', primaryColor: '#C4573B', secondaryColor: '#E87D38', category: 'Vegetable' },
  'cassava-tapioca': { visualForm: 'woody brown-barked cassava root with one clean cut end showing chalky white starchy interior', primaryColor: '#5A3E28', secondaryColor: '#F7F7F2', category: 'Vegetable' },
  'tomato': { visualForm: 'glossy ripe crimson tomato with green star calyx and sliced juicy half showing seed gel', primaryColor: '#D92B1C', secondaryColor: '#5C8226', category: 'Vegetable' },
  'chilli-pepper': { visualForm: 'curved tapered vibrant scarlet chilli with natural green stem', primaryColor: '#D11D13', secondaryColor: '#4A6925', category: 'Spice' },
  'bell-pepper-capsicum': { visualForm: 'blocky glossy emerald-green capsicum pepper with four lobes and stout green stem', primaryColor: '#3B872A', secondaryColor: '#245917', category: 'Vegetable' },
  'pumpkin-american-squash': { visualForm: 'ribbed warm terracotta-orange pumpkin with curved stem and a carved thick crescent slice', primaryColor: '#D96E23', secondaryColor: '#F09C48', category: 'Vegetable' },
  'cucumber': { visualForm: 'crisp dark green cylindrical cucumber with subtle pale spines and sliced rounds showing watery seed core', primaryColor: '#4C7D33', secondaryColor: '#D0E3BA', category: 'Vegetable' },
  'brinjal-eggplant': { visualForm: 'deep glossy violet-purple teardrop eggplant with fleshy green spined calyx', primaryColor: '#4A1D4E', secondaryColor: '#587A31', category: 'Vegetable' },
  'okra-bhindi': { visualForm: 'slender ridged pentagonal green okra pod with delicate tapered tip and star-shaped cross section', primaryColor: '#6B9438', secondaryColor: '#E8E4D1', category: 'Vegetable' },
  'onion': { visualForm: 'round onion with papery copper-crimson outer skin and a cut half showing concentric purple rings', primaryColor: '#A83B5E', secondaryColor: '#EDE4DF', category: 'Vegetable' },
  'garlic': { visualForm: 'whole ivory and purple-streaked garlic bulb with delicate papery husk and an individual peeled clove', primaryColor: '#E8DFD3', secondaryColor: '#B896B2', category: 'Vegetable' },
  'ginger': { visualForm: 'knobby branched pale tan ginger rhizome with fibrous nodes and a cut yellow-gold fragrant slice', primaryColor: '#C49B5A', secondaryColor: '#E6CA65', category: 'Spice' },
  'turmeric': { visualForm: 'knobby segmented earthy brown turmeric rhizome sliced to reveal intensely brilliant deep orange flesh', primaryColor: '#966336', secondaryColor: '#F2790F', category: 'Spice' },
  'taro-arbi': { visualForm: 'barrel-shaped fibrous brown banded taro corm with hairy rings and cut pale purple-flecked flesh', primaryColor: '#6B503B', secondaryColor: '#E0D7D0', category: 'Vegetable' },
  'greater-yam-ratalu': { visualForm: 'large rough dark brown tuberous yam root with deep violet-tinged cut interior', primaryColor: '#4D3627', secondaryColor: '#784869', category: 'Vegetable' },
  'elephant-foot-yam-suran': { visualForm: 'massive depressed-globose rough warted suran corm with a chunky cut wedge showing yellowish-pink flesh', primaryColor: '#5E4939', secondaryColor: '#D6A580', category: 'Vegetable' },
  'green-peas': { visualForm: 'fresh garden pea pod split to display spherical tender green peas in their papery cradle', primaryColor: '#619E28', secondaryColor: '#8CC24D', category: 'Vegetable' },
  'radish': { visualForm: 'crisp tapered pure white mooli radish with fresh green leafy tops and a sliced crunchy round', primaryColor: '#F0EFEA', secondaryColor: '#5E872D', category: 'Vegetable' },
  'carrot': { visualForm: 'vibrant deep orange tapered carrot with natural root ridges and feathery green foliage at crown', primaryColor: '#E85B17', secondaryColor: '#4A7D23', category: 'Vegetable' },
  'turnip': { visualForm: 'flattened spherical white turnip with vivid royal purple shoulder wash and slender taproot', primaryColor: '#782662', secondaryColor: '#F2EFEB', category: 'Vegetable' },
  'cabbage': { visualForm: 'dense spherical head of pale celadon-green cabbage with tightly folded crinkled outer leaves', primaryColor: '#97BA77', secondaryColor: '#688F45', category: 'Vegetable' },
  'cauliflower': { visualForm: 'compact creamy-ivory curd florets nestled securely inside a collar of crisp ribbed green leaves', primaryColor: '#EBE6CD', secondaryColor: '#5E8532', category: 'Vegetable' },
  'broccoli': { visualForm: 'dense dome of granular forest-green florets on a thick succulent pale green stalk', primaryColor: '#30632B', secondaryColor: '#65914A', category: 'Vegetable' },
  'beetroot': { visualForm: 'bulbous ruby-purple beetroot with rough skin ring, slender taproot, and sliced crimson-ringed half', primaryColor: '#6E1428', secondaryColor: '#3B0914', category: 'Vegetable' },
  'spinach-palak': { visualForm: 'bundle of tender succulent dark emerald-green palak leaves with crisp pale midribs', primaryColor: '#306927', secondaryColor: '#568A36', category: 'Leafy green' },
  'amaranth-greens-chaulai': { visualForm: 'bunch of oval green chaulai leaves with dramatic splash of magenta-crimson at center', primaryColor: '#38732E', secondaryColor: '#B0254D', category: 'Leafy green' },
  'mustard-greens-sarson': { visualForm: 'broad crumpled dark green sarson leaves with wavy toothed margins and pale thick petioles', primaryColor: '#436B28', secondaryColor: '#284714', category: 'Leafy green' },
  'fenugreek-leaves-methi': { visualForm: 'cluster of trifoliate delicate oval green methi leaves on slender branched stalks', primaryColor: '#4B7A30', secondaryColor: '#2E521B', category: 'Leafy green' },
  'moringa-drumstick-pods': { visualForm: 'long ribbed triangular green drumstick pods with characteristic knobby seed swellings', primaryColor: '#5A8532', secondaryColor: '#37571B', category: 'Vegetable' },
  'bottle-gourd-lauki': { visualForm: 'smooth pale celadon-green bottle gourd with natural tapered neck and rounded base', primaryColor: '#93B879', secondaryColor: '#C4DEC2', category: 'Vegetable' },
  'bitter-gourd-karela': { visualForm: 'distinctively warty spiny dark jade-green karela gourd with tapered pointed tip', primaryColor: '#386624', secondaryColor: '#214212', category: 'Vegetable' },
  'ridge-gourd-turai': { visualForm: 'long slender dark green gourd with prominent raised longitudinal sharp ribs', primaryColor: '#3C6929', secondaryColor: '#1E3B10', category: 'Vegetable' },
  'snake-gourd-padwal': { visualForm: 'elongated undulating snake-like green gourd with distinctive longitudinal white stripes', primaryColor: '#668F4A', secondaryColor: '#E3EAD8', category: 'Vegetable' },
  'ash-gourd-winter-melon': { visualForm: 'large oval pale green melon dusted with natural chalky white powdery wax bloom', primaryColor: '#8FA87B', secondaryColor: '#D7DFCF', category: 'Vegetable' },

  // Fruits
  'mango': { visualForm: 'curved golden alphonso mango blushing with vermilion on the shoulder and attached deep green leaf', primaryColor: '#F7A71E', secondaryColor: '#D4371C', category: 'Fruit' },
  'banana': { visualForm: 'gracefully curved cluster of ripe golden yellow bananas with green tips and dark crown', primaryColor: '#F5CE38', secondaryColor: '#7A8C2B', category: 'Fruit' },
  'jackfruit': { visualForm: 'massive oblong green jackfruit covered in hexagonal pyramidal prickles with cut golden fleshy bulb', primaryColor: '#637A31', secondaryColor: '#F2B824', category: 'Fruit' },
  'jamun': { visualForm: 'cluster of glossy oblong deep midnight-purple jamun berries with a single berry split to show pink-purple flesh', primaryColor: '#2A1A3B', secondaryColor: '#733261', category: 'Fruit' },
  'amla-indian-gooseberry': { visualForm: 'translucent pale yellowish-green ribbed spherical amla fruit with faint vertical segments', primaryColor: '#9DBA5F', secondaryColor: '#CBDDA2', category: 'Fruit' },
  'bael': { visualForm: 'hard smooth woody spherical green-grey bael fruit cracked open to display aromatic orange fibrous pulp', primaryColor: '#7D8A52', secondaryColor: '#E87D25', category: 'Fruit' },
  'wood-apple-kaitha': { visualForm: 'rough grey-brown hard globose wood apple cracked open showing dark aromatic brown sticky pulp', primaryColor: '#6E6657', secondaryColor: '#3B2A1E', category: 'Fruit' },
  'ber-indian-jujube': { visualForm: 'cluster of small round polished ber fruits ranging from pale apple-green to warm reddish-brown', primaryColor: '#967838', secondaryColor: '#5C8A36', category: 'Fruit' },
  'karonda': { visualForm: 'pair of smooth shiny oval karonda berries with dramatic pink-red blush over creamy white base', primaryColor: '#DE456C', secondaryColor: '#F5EBE1', category: 'Fruit' },
  'kokum': { visualForm: 'sun-dried wrinkled deep blackish-purple kokum rind halves with rich tart anthocyanin hue', primaryColor: '#2C1B2E', secondaryColor: '#59294F', category: 'Fruit' },
  'tamarind': { visualForm: 'brittle curved cinnamon-brown tamarind pod cracked open to reveal sticky fibrous dark pulp and seeds', primaryColor: '#7D5735', secondaryColor: '#452A17', category: 'Fruit' },
  'pomegranate': { visualForm: 'crowned leathery crimson pomegranate with a cracked window revealing clusters of glistening jewel arils', primaryColor: '#A81E2E', secondaryColor: '#5C0F1A', category: 'Fruit' },
  'dates': { visualForm: 'wrinkled glistening translucent amber-brown medjool date with one cut half showing slender furrowed pit', primaryColor: '#633B1F', secondaryColor: '#381C09', category: 'Fruit' },
  'fig': { visualForm: 'teardrop-shaped dusty violet fig sliced open to display luscious strawberry-pink seedy center', primaryColor: '#54364D', secondaryColor: '#C4495C', category: 'Fruit' },
  'grapes': { visualForm: 'generous hanging cluster of dusty indigo-purple grapes with powdery bloom and tender vine tendril', primaryColor: '#342745', secondaryColor: '#594473', category: 'Fruit' },
  'apple': { visualForm: 'crisp rounded apple blushing with crimson over golden undertones with slender curved stem and leaf', primaryColor: '#C42B27', secondaryColor: '#F5CE4C', category: 'Fruit' },
  'pear': { visualForm: 'graceful bell-shaped celadon-green pear with soft russet speckling and slender brown stalk', primaryColor: '#A3B856', secondaryColor: '#785A34', category: 'Fruit' },
  'peach': { visualForm: 'velvety fuzzy peach blushing with warm rose-pink over sunset-gold with a deep longitudinal suture', primaryColor: '#DE5F47', secondaryColor: '#F0AA51', category: 'Fruit' },
  'apricot': { visualForm: 'plump golden-orange apricot with velvet skin, subtle crimson blush, and halved to show smooth pit', primaryColor: '#F08B32', secondaryColor: '#D64E24', category: 'Fruit' },
  'plum': { visualForm: 'plump rounded deep plum-purple stone fruit covered with a delicate cloudy powdery silver-blue bloom', primaryColor: '#4A2143', secondaryColor: '#6D3866', category: 'Fruit' },
  'watermelon': { visualForm: 'large dark and pale green striped watermelon with an inviting cut crescent slice of crisp red seed-dotted flesh', primaryColor: '#2F6627', secondaryColor: '#D63131', category: 'Fruit' },
  'muskmelon-kharbuja': { visualForm: 'round muskmelon with intricate raised greyish-corky netting over ribbed pale green skin and orange slice', primaryColor: '#A39974', secondaryColor: '#F08630', category: 'Fruit' },
  'sweet-orange': { visualForm: 'bright pebbled orange citrus sphere with cut cross-section showing radiating juicy juice sacs', primaryColor: '#EB711A', secondaryColor: '#F5A63B', category: 'Fruit' },
  'mandarin': { visualForm: 'slightly flattened loose-skinned golden-orange mandarin with an exposed naturally separated sweet segment', primaryColor: '#F07D1A', secondaryColor: '#FFA147', category: 'Fruit' },
  'lemon': { visualForm: 'bright sunshine-yellow oval lemon with distinct pointed mammilla and sliced wheel with translucent pulp', primaryColor: '#F0D424', secondaryColor: '#E6B812', category: 'Fruit' },
  'lime': { visualForm: 'compact round vibrant emerald-green lime with a cleanly sliced half showing glistening pale green vesicles', primaryColor: '#5FA326', secondaryColor: '#96C758', category: 'Fruit' },
  'pomelo': { visualForm: 'massive piriform pale greenish-yellow citrus fruit with thick spongy rind and peeled pink vesicles', primaryColor: '#BAC456', secondaryColor: '#DE687A', category: 'Fruit' },
  'coconut': { visualForm: 'fibrous brown coconut with characteristic three germination pores alongside a cracked white-fleshed half', primaryColor: '#573D26', secondaryColor: '#F7F4EB', category: 'Fruit' },
  'guava': { visualForm: 'round pebbled yellowish-green guava with persistent dry calyx crown and cut half displaying pink seedy pulp', primaryColor: '#8AA842', secondaryColor: '#DE5B6E', category: 'Fruit' },
  'papaya': { visualForm: 'large oblong golden-orange papaya with one halved section hollowed to show glistening round black seeds', primaryColor: '#E08524', secondaryColor: '#2B2824', category: 'Fruit' },
  'pineapple': { visualForm: 'pinecone-like cylinder of geometric diamond eyes crowned with a spiky rosette of stiff serrated leaves', primaryColor: '#C48A27', secondaryColor: '#486927', category: 'Fruit' },
  'custard-apple-sitaphal': { visualForm: 'knobby tuberculate green custard apple composed of loosely cohering carpels with creamy interior view', primaryColor: '#5E7D40', secondaryColor: '#F2EDE4', category: 'Fruit' },
  'sapodilla-chikoo': { visualForm: 'smooth sandy-brown oval chikoo fruit sliced lengthwise to show grainy sweet caramel-brown flesh and black seeds', primaryColor: '#8C6845', secondaryColor: '#BD8C5C', category: 'Fruit' },
  'avocado': { visualForm: 'pebbled dark purplish-black hass avocado halved cleanly to reveal smooth chartreuse flesh and spherical pit', primaryColor: '#242B1A', secondaryColor: '#94B84D', category: 'Fruit' },
  'strawberry': { visualForm: 'glossy conical scarlet strawberry studded with tiny golden achenes and crowned with frilled green leafy calyx', primaryColor: '#D11F2E', secondaryColor: '#497322', category: 'Fruit' },

  // Spices & Aromatics
  'black-pepper': { visualForm: 'fruiting spike with clustered berries alongside a small pile of dried wrinkled spherical black peppercorns', primaryColor: '#2B2625', secondaryColor: '#52433D', category: 'Spice' },
  'long-pepper-pippali': { visualForm: 'cylindrical rough catkin-like spikes of dark grey-black pippali pepper with fused tiny berries', primaryColor: '#36302B', secondaryColor: '#5C544E', category: 'Spice' },
  'green-cardamom': { visualForm: 'plump ribbed celadon-green cardamom pod with one opened pod revealing aromatic dark seeds', primaryColor: '#788F44', secondaryColor: '#2B211A', category: 'Spice' },
  'black-large-cardamom': { visualForm: 'large coarse wrinkled dark chocolate-brown ribbed pod with characteristic smoky appearance', primaryColor: '#402E24', secondaryColor: '#241913', category: 'Spice' },
  'cinnamon': { visualForm: 'tightly curled golden-tan thin quills of real ceylon cinnamon bark with fine layered rolls', primaryColor: '#94582E', secondaryColor: '#6B3C1B', category: 'Spice' },
  'cassia': { visualForm: 'thick rough dark reddish-grey rolled bark slabs of aromatic cassia with woody texture', primaryColor: '#633B26', secondaryColor: '#402315', category: 'Spice' },
  'clove': { visualForm: 'nail-shaped dark reddish-brown dried flower buds with four-pointed calyx and domed round bud head', primaryColor: '#4A2A20', secondaryColor: '#2D160F', category: 'Spice' },
  'nutmeg': { visualForm: 'hard oval brown nutmeg kernel with reticulate surface alongside its Lacy brilliant crimson aril', primaryColor: '#593D2A', secondaryColor: '#C42525', category: 'Spice' },
  'mace': { visualForm: 'intricate branching lacy dried golden-orange filigree aril of aromatic mace', primaryColor: '#DB6E23', secondaryColor: '#B04B10', category: 'Spice' },
  'cumin': { visualForm: 'small cluster of ribbed boat-shaped pale brown cumin seeds with delicate longitudinal bristled ridges', primaryColor: '#967848', secondaryColor: '#6E5530', category: 'Spice' },
  'coriander-seed': { visualForm: 'spherical ribbed hollow golden-tan dried coriander fruits with vertical ridges', primaryColor: '#BA9659', secondaryColor: '#8C6C38', category: 'Spice' },
  'fennel': { visualForm: 'curved pale greenish-tan ribbed fennel seeds with distinct sweet aniseed aromatic shape', primaryColor: '#9CA66D', secondaryColor: '#707A48', category: 'Spice' },
  'fenugreek-seed': { visualForm: 'angular rhombic hard golden-amber fenugreek seeds with a deep diagonal groove dividing each seed', primaryColor: '#C99138', secondaryColor: '#94651D', category: 'Spice' },
  'mustard-seed': { visualForm: 'cluster of tiny spherical round mustard seeds in natural contrast of yellow-gold and dark brown varieties', primaryColor: '#D6A531', secondaryColor: '#362B21', category: 'Spice' },
  'ajwain-carom': { visualForm: 'tiny oval ridged greyish-brown carom seeds with sharp aromatic thyme-like ridges', primaryColor: '#85765F', secondaryColor: '#574C3A', category: 'Spice' },
  'nigella-kalonji': { visualForm: 'triangular jet-black matte nigella seeds with faceted geometric angles', primaryColor: '#1F1E21', secondaryColor: '#38363B', category: 'Spice' },
  'asafoetida-hing': { visualForm: 'irregular dried resinous amber-brown tears and a block of compounded pale yellow hing gum', primaryColor: '#8C5627', secondaryColor: '#DEC57A', category: 'Spice' },
  'saffron': { visualForm: 'small graceful tangle of slender trumpet-tipped deep crimson-red saffron stigmas with golden bases', primaryColor: '#B81D1D', secondaryColor: '#E67B1E', category: 'Spice' },
  'star-anise': { visualForm: 'eight-pointed star-shaped rust-brown pericarp with boat-shaped carpels each opening to show a glossy seed', primaryColor: '#6E3C21', secondaryColor: '#9E5B33', category: 'Spice' },
  'caraway': { visualForm: 'curved tapered brown caraway seeds with five pale ridges along their length', primaryColor: '#735738', secondaryColor: '#4A341E', category: 'Spice' },
  'aniseed': { visualForm: 'small grey-green oval ridged aniseed seeds with short attached stem pedicels', primaryColor: '#858F67', secondaryColor: '#5C6643', category: 'Spice' },
  'poppy-seed': { visualForm: 'creamy-white tiny kidney-shaped khus-khus poppy seeds with delicate surface reticulations', primaryColor: '#EBE6DA', secondaryColor: '#BDB6A8', category: 'Seed' },
  'indian-bay-leaf-tejpat': { visualForm: 'three-veined lanceolate aromatic dried tejpat leaf with prominent parallel longitudinal veins', primaryColor: '#8A7A4E', secondaryColor: '#5C502E', category: 'Spice' },
  'vanilla': { visualForm: 'long dark wrinkled glossy blackish-brown cured vanilla bean pods with curved ends', primaryColor: '#261B14', secondaryColor: '#140E0A', category: 'Spice' },
  'sesame-til': { visualForm: 'small teardrop flat sesame seeds shown in a natural mixture of pearly ivory and glossy jet black', primaryColor: '#EDE5D1', secondaryColor: '#242220', category: 'Seed' },

  // Nuts
  'cashew': { visualForm: 'curved kidney-shaped ivory cashew nut nestled beneath a plump juicy red-and-yellow cashew apple', primaryColor: '#E8D5B5', secondaryColor: '#D9452E', category: 'Nut' },
  'peanut-groundnut': { visualForm: 'reticulated tan constricted peanut shell with a split pod revealing two pink-skinned kernels', primaryColor: '#BFA073', secondaryColor: '#C46462', category: 'Nut' },
  'almond': { visualForm: 'oval tear-shaped hard pitted almond shell with an extracted whole kernel with warm cinnamon-brown skin', primaryColor: '#8C5832', secondaryColor: '#C98F5D', category: 'Nut' },
  'walnut': { visualForm: 'deeply furrowed two-valved round walnut shell with an exposed brain-like golden-amber kernel half', primaryColor: '#785A3C', secondaryColor: '#BA8D59', category: 'Nut' },
  'pistachio': { visualForm: 'partially split hard ivory pistachio shell revealing vibrant emerald and purple-skinned kernel inside', primaryColor: '#E6DDC8', secondaryColor: '#6EA83D', category: 'Nut' },
  'areca-nut-supari': { visualForm: 'fibrous orange-brown areca palm fruit alongside a hard mottled cross-sectioned supari nut with marble veins', primaryColor: '#C46125', secondaryColor: '#7D4727', category: 'Nut' },
  'pine-nut-chilgoza': { visualForm: 'slender elongated dark brown chilgoza pine nut shells with extracted tender cream kernel', primaryColor: '#5E4431', secondaryColor: '#EDE3C7', category: 'Nut' },
  'sunflower-seed': { visualForm: 'teardrop-shaped sunflower seeds with characteristic black and white longitudinal stripes', primaryColor: '#2B2B2B', secondaryColor: '#EDEDED', category: 'Seed' },
  'flaxseed-linseed': { visualForm: 'flat glossy teardrop-shaped deep reddish-brown alsi flaxseeds with smooth polished coats', primaryColor: '#783E23', secondaryColor: '#4A2312', category: 'Seed' },
  'safflower-seed': { visualForm: 'angular obovoid ivory-white safflower seeds alongside dried orange-red floral florets', primaryColor: '#F5EFE6', secondaryColor: '#C74826', category: 'Seed' },

  // Herbs & Greens
  'mint': { visualForm: 'sprig of vibrant green spearmint with paired textured serrated leaves and delicate leaf venation', primaryColor: '#367A32', secondaryColor: '#1F521C', category: 'Herb' },
  'basil-tulsi': { visualForm: 'sacred tulsi branch with aromatic purple-tinged green leaves and a delicate terminal flower spike', primaryColor: '#38662F', secondaryColor: '#6B3157', category: 'Herb' },
  'lemongrass': { visualForm: 'stalk of layered pale green and ivory lemongrass with fibrous sheath and slender reed-like blades', primaryColor: '#8DA64B', secondaryColor: '#E2E8BE', category: 'Herb' },
  'dill': { visualForm: 'feathery thread-like blue-green dill leaves with an open delicate umbrella of tiny yellow flowers', primaryColor: '#447D4F', secondaryColor: '#C4BC37', category: 'Herb' },
  'curry-leaves': { visualForm: 'slender pinnate stem with shiny asymmetrical aromatic dark green curry leaves', primaryColor: '#2A5C28', secondaryColor: '#153D14', category: 'Herb' },
  'makhana-fox-nut': { visualForm: 'puffed spherical ivory fox-nuts with delicate crinkled texture and tiny brown husk speckles', primaryColor: '#F2EDE2', secondaryColor: '#664C34', category: 'Seed' },
  'lotus-seeds': { visualForm: 'spongy dried green lotus seed pod with embedded oval seeds and extracted peeled seeds', primaryColor: '#647D43', secondaryColor: '#D6CCA7', category: 'Seed' },
  'water-chestnut-singhara': { visualForm: 'distinctive two-horned triangular dark purplish-brown singhara with peeled white interior', primaryColor: '#362326', secondaryColor: '#FAF7ED', category: 'Aquatic' },
  'betel-leaf': { visualForm: 'glossy heart-shaped deep emerald betel vine leaf with delicate curved veins', primaryColor: '#255C24', secondaryColor: '#143813', category: 'Leaf' },
  'coriander-leaves-cilantro': { visualForm: 'tender sprig of bright green coriander with fan-shaped serrated leaflets and thin stems', primaryColor: '#3B8233', secondaryColor: '#24591E', category: 'Herb' },
  'oregano': { visualForm: 'woody sprig with small rounded spade-shaped aromatic olive-green oregano leaves', primaryColor: '#536E39', secondaryColor: '#364A23', category: 'Herb' },
  'parsley': { visualForm: 'crisp bright green flat-leaf parsley stem with tripartite triangular toothed leaflets', primaryColor: '#3B802E', secondaryColor: '#215219', category: 'Herb' },

  // Beverages & Sweeteners
  'coffee': { visualForm: 'woody sprig bearing glossy dark green leaves, bright scarlet coffee cherries, and roasted brown beans', primaryColor: '#C72828', secondaryColor: '#4A2C18', category: 'Beverage' },
  'tea': { visualForm: 'botanical tea shoot with the traditional two tender young green leaves and an unopened apical bud', primaryColor: '#4A7A30', secondaryColor: '#2C4F1A', category: 'Beverage' },
  'sugarcane': { visualForm: 'stout jointed purple-green sugarcane stem segment with distinct nodes and cut juicy fibrous core', primaryColor: '#5E2B4D', secondaryColor: '#C7C29F', category: 'Sweetener' },
  'jaggery': { visualForm: 'rustic block of golden-brown unrefined gur jaggery with crumbly artisanal texture', primaryColor: '#965D29', secondaryColor: '#613914', category: 'Sweetener' },
  'cocoa-cacao': { visualForm: 'large ribbed leathery orange-red cacao pod cut open lengthwise to reveal white mucilage-covered beans', primaryColor: '#C44E25', secondaryColor: '#EDE4D8', category: 'Beverage' },
};

// Generate full prompt dictionary
const promptCatalog = {};

for (const ing of ingredients150) {
  const detail = BOTANICAL_DETAILS[ing.id] || {
    visualForm: `characteristic culinary specimen with natural anatomical details`,
    primaryColor: '#8C6845',
    secondaryColor: '#5A3E28',
    category: ing.category
  };

  const prompt = styleConfig.promptTemplate.template
    .replace('{INGREDIENT}', `${ing.name} (${ing.category})`)
    .replace('{VISUAL_FORM}', detail.visualForm);

  promptCatalog[ing.id] = {
    id: ing.id,
    name: ing.name,
    category: ing.category,
    visualForm: detail.visualForm,
    primaryColor: detail.primaryColor,
    secondaryColor: detail.secondaryColor,
    fullPrompt: prompt,
    negativePrompt: styleConfig.negativePrompt.join(', ')
  };
}

fs.writeFileSync('data/ingredient-prompts.json', JSON.stringify(promptCatalog, null, 2), 'utf8');
console.log(`Generated prompts for ${Object.keys(promptCatalog).length} ingredients in data/ingredient-prompts.json`);
