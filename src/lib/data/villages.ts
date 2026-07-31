import type { Village } from '@/lib/types';

/**
 * Newton's 13 villages. Newton has no village-level government — these are
 * historic neighborhoods — so slugs are the canonical identifier throughout.
 * Coordinates are approximate village centers, used for the proximity filter.
 *
 * Photos are real, verified Wikimedia Commons photographs of each village
 * (not stock imagery) — see `imageCredit`/`imageCreditUrl` for attribution.
 * Thompsonville has no verifiable photo on Commons, so it intentionally has
 * no `imageUrl`; the UI falls back to a tinted panel rather than showing an
 * unrelated or inaccurate photo.
 */
export const VILLAGES: Village[] = [
  {
    slug: 'auburndale',
    name: 'Auburndale',
    tagline: 'Riverside walks and a quiet commuter-rail village green',
    description:
      'Tucked along the Charles River in Newton’s west end, Auburndale pairs canoe-launch riverbank with a compact Lexington Street business strip. It is the jumping-off point for the Charles River Reservation paths and the Auburndale Cove beach area.',
    zip: '02466',
    lat: 42.3459,
    lng: -71.249,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Pony_Truss_Trail_and_the_Charles_River%2C_December_2025.jpg/1920px-Pony_Truss_Trail_and_the_Charles_River%2C_December_2025.jpg',
    imageCredit: 'Pi.1415926535 / Wikimedia Commons, CC BY-SA 4.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Pony_Truss_Trail_and_the_Charles_River,_December_2025.jpg',
    funFact:
      'Just across the Charles in neighboring Weston stands the 1889 Norumbega Tower, built to mark a since-debunked theory that Vikings settled the riverbank — it’s visible from the Auburndale side of the water.',
  },
  {
    slug: 'chestnut-hill',
    name: 'Chestnut Hill',
    tagline: 'Reservoir loops, Boston College, and upscale shopping',
    description:
      'Chestnut Hill straddles the Newton–Brookline–Boston line, anchored by the Chestnut Hill Reservoir loop, Boston College’s Gothic campus, and The Street shopping district.',
    zip: '02467',
    lat: 42.3268,
    lng: -71.1668,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chestnut_Hill_Reservoir.jpg/1920px-Chestnut_Hill_Reservoir.jpg',
    imageCredit: 'Apextrancelike / Wikimedia Commons, CC0',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Chestnut_Hill_Reservoir.jpg',
    funFact:
      'The 1.5-mile Reservoir path is one of Greater Boston’s most-run loops — and the water is still an emergency backup supply.',
  },
  {
    slug: 'newton-centre',
    name: 'Newton Centre',
    tagline: 'The dining-and-dessert heart of Newton',
    description:
      'Newton Centre is the city’s busiest village center: two dozen restaurants and cafés within a few blocks, the Green Line D branch, Crystal Lake a short walk south, and the Newton Centre Green for summer concerts.',
    zip: '02459',
    lat: 42.3298,
    lng: -71.1926,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Beacon_and_Centre_St_intersection_Newton_Center_March_2025_1.jpg/1920px-Beacon_and_Centre_St_intersection_Newton_Center_March_2025_1.jpg',
    imageCredit: '4300streetcar / Wikimedia Commons, CC BY 4.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Beacon_and_Centre_St_intersection_Newton_Center_March_2025_1.jpg',
    funFact:
      'Crystal Lake was once called Baptist Pond and supplied commercial ice to Boston before refrigeration.',
  },
  {
    slug: 'newton-corner',
    name: 'Newton Corner',
    tagline: 'Newton’s oldest settlement, right at the Watertown line',
    description:
      'The city’s first settled village, Newton Corner sits where the Mass Pike meets Watertown. Expect historic Farlow Park, a busy Washington Street corridor, and quick access to the Charles River paths.',
    zip: '02458',
    lat: 42.3556,
    lng: -71.1875,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Washington_Street%2C_Newton_Corner_2006.jpg',
    imageCredit: 'Seasider53 / Wikimedia Commons, CC BY-SA 4.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Washington_Street,_Newton_Corner_2006.jpg',
    funFact:
      'Newton Corner was simply called "Newton" until the railroad arrived and every other village needed a name too.',
  },
  {
    slug: 'newton-highlands',
    name: 'Newton Highlands',
    tagline: 'Walkable village square with a theatre and a hidden gorge',
    description:
      'Newton Highlands has a genuinely charming square — bakery, bookshop, theatre — plus trailheads into Hemlock Gorge and the Upper Falls greenway just south.',
    zip: '02461',
    lat: 42.3218,
    lng: -71.2062,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Lincoln_St%2C_Newton_Highlands_MA.jpg/1920px-Lincoln_St%2C_Newton_Highlands_MA.jpg',
    imageCredit: 'John Phelan / Wikimedia Commons, CC BY 3.0',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Lincoln_St,_Newton_Highlands_MA.jpg',
    funFact:
      'The Highlands square is a designated National Register historic district, largely built out between 1880 and 1920.',
  },
  {
    slug: 'newton-lower-falls',
    name: 'Newton Lower Falls',
    tagline: 'Mill-era riverbank on the Wellesley border',
    description:
      'A small, leafy village on the Charles at the Wellesley line, Lower Falls kept its 19th-century paper-mill bones and now offers riverside trails and easy Route 16 access.',
    zip: '02462',
    lat: 42.3312,
    lng: -71.2549,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Charles_River%2C_Newton_Lower_Falls_MA.jpg/1920px-Charles_River%2C_Newton_Lower_Falls_MA.jpg',
    imageCredit: 'John Phelan / Wikimedia Commons, CC BY 3.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Charles_River,_Newton_Lower_Falls_MA.jpg',
    funFact:
      'Paper mills here supplied newsprint to Boston papers for more than a century.',
  },
  {
    slug: 'newton-upper-falls',
    name: 'Newton Upper Falls',
    tagline: 'Echo Bridge, Hemlock Gorge, and industrial-chic charm',
    description:
      'Upper Falls wraps around the Charles River gorge. Echo Bridge and Hemlock Gorge Reservation make it Newton’s most dramatic bit of landscape, and the old mill buildings now hold studios and restaurants.',
    zip: '02464',
    lat: 42.3143,
    lng: -71.2196,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/NewtonMA_NewtonUpperFalls.jpg',
    imageCredit: 'Magicpiano / Wikimedia Commons, CC BY-SA 4.0',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:NewtonMA_NewtonUpperFalls.jpg',
    funFact:
      'Stand under Echo Bridge’s stone arch and a shout comes back to you as many as fifteen times.',
  },
  {
    slug: 'newtonville',
    name: 'Newtonville',
    tagline: 'Everyday Newton: markets, farmstands, and neighborhood dining',
    description:
      'Newtonville’s Walnut Street strip is where locals actually shop — grocers, bakeries, a farmers market, and a growing restaurant row, all beside the commuter rail stop.',
    zip: '02460',
    lat: 42.3512,
    lng: -71.2078,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Newtonville_station_from_Walnut_Street%2C_March_2013.JPG/1920px-Newtonville_station_from_Walnut_Street%2C_March_2013.JPG',
    imageCredit: 'Pi.1415926535 / Wikimedia Commons, CC BY-SA 3.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Newtonville_station_from_Walnut_Street,_March_2013.JPG',
    funFact:
      'The Newtonville farmers market has run on Walnut Street for decades and is a Tuesday institution.',
  },
  {
    slug: 'nonantum',
    name: 'Nonantum',
    tagline: 'Italian-American "the Lake" — bakeries, feasts, and bocce',
    description:
      'Known locally as "the Lake," Nonantum is Newton’s tight-knit Italian-American village: red-sauce restaurants, generational bakeries, and the July St. Mary of Carmen Festival.',
    zip: '02458',
    lat: 42.3603,
    lng: -71.2013,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Coletti-Magni_Park%2C_Nonantum_MA.jpg/1920px-Coletti-Magni_Park%2C_Nonantum_MA.jpg',
    imageCredit: 'John Phelan / Wikimedia Commons, CC BY 3.0',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Coletti-Magni_Park,_Nonantum_MA.jpg',
    funFact:
      'Nonantum has its own local slang, "Lake Talk," with words traced to Italian and Romani roots.',
  },
  {
    slug: 'oak-hill',
    name: 'Oak Hill',
    tagline: 'Wooded conservation land in Newton’s southern corner',
    description:
      'Oak Hill is Newton’s greenest, quietest quarter — mid-century streets threaded with conservation land, the Nahanton Park canoe launch, and the Charles River’s southern bend.',
    zip: '02459',
    lat: 42.3018,
    lng: -71.1898,
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Oak_Hill_Park_Newton_MA_July_2025_1.jpg/1920px-Oak_Hill_Park_Newton_MA_July_2025_1.jpg',
    imageCredit: '4300streetcar / Wikimedia Commons, CC BY 4.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:Oak_Hill_Park_Newton_MA_July_2025_1.jpg',
    funFact:
      'Nahanton Park’s meadows are a birding hotspot — over 180 species have been logged there.',
  },
  {
    slug: 'thompsonville',
    name: 'Thompsonville',
    tagline: 'Newton’s smallest village, hiding a working farm',
    description:
      'Thompsonville is a pocket neighborhood between Newton Centre and Oak Hill, best known as the home of Newton Community Farm — the city’s last working farm.',
    zip: '02459',
    lat: 42.3126,
    lng: -71.1972,
    // No verifiable real photo of Thompsonville exists on Wikimedia Commons.
    // Left blank so the UI shows its tinted-panel fallback rather than a
    // photo of somewhere else. Replace once a real submission comes in.
    imageUrl: '',
    funFact:
      'Newton Community Farm has been continuously farmed since the 1700s and is now a nonprofit teaching farm.',
  },
  {
    slug: 'waban',
    name: 'Waban',
    tagline: 'Village-square calm with trailheads to the Aqueduct',
    description:
      'Waban is a small, residential village with a one-block square, a Green Line stop, and direct access to the Cochituate Aqueduct trail and Angier’s woods.',
    zip: '02468',
    lat: 42.3268,
    lng: -71.2306,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Beacon_St%2C_Waban_MA.jpg/1920px-Beacon_St%2C_Waban_MA.jpg',
    imageCredit: 'John Phelan / Wikimedia Commons, CC BY 3.0',
    imageCreditUrl: 'https://commons.wikimedia.org/wiki/File:Beacon_St,_Waban_MA.jpg',
    funFact:
      'Waban is named for Waban, a Nipmuc leader who was among the first to hear John Eliot preach at Nonantum in 1646.',
  },
  {
    slug: 'west-newton',
    name: 'West Newton',
    tagline: 'Cinema, Hill architecture, and a real village main street',
    description:
      'West Newton pairs a genuine main street — including the beloved West Newton Cinema — with the grand Victorians of West Newton Hill and easy Charles River access.',
    zip: '02465',
    lat: 42.3487,
    lng: -71.2258,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/NewtonMA_WestNewtonVillageCenter.jpg',
    imageCredit: 'Magicpiano / Wikimedia Commons, CC BY-SA 4.0',
    imageCreditUrl:
      'https://commons.wikimedia.org/wiki/File:NewtonMA_WestNewtonVillageCenter.jpg',
    funFact:
      'The West Newton Cinema opened in 1937 and was rescued by a community campaign — it is now community-owned.',
  },
];

export const VILLAGE_BY_SLUG = new Map(VILLAGES.map((v) => [v.slug, v]));

export function getVillage(slug: string): Village | undefined {
  return VILLAGE_BY_SLUG.get(slug);
}

/** Geographic center of Newton — the default origin for "near me" fallbacks. */
export const NEWTON_CENTER = { lat: 42.337, lng: -71.2092 };
