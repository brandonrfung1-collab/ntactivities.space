import type { Village } from '@/lib/types';

/**
 * Newton's 13 villages. Newton has no village-level government — these are
 * historic neighborhoods — so slugs are the canonical identifier throughout.
 * Coordinates are approximate village centers, used for the proximity filter.
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
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=70',
    funFact:
      'Auburndale’s Norumbega Tower was built in 1889 to mark a since-debunked theory that Vikings settled on the Charles.',
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
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70',
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
    imageUrl:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=70',
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
    imageUrl:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70',
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
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=70',
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
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=70',
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
    imageUrl:
      'https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=1200&q=70',
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
    imageUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=70',
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
