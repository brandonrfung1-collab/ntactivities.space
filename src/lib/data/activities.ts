import type { Activity, PriceType } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { VILLAGE_BY_SLUG } from '@/lib/data/villages';

/**
 * Sample dataset: 64 activities across all eight categories (Auburndale has 4
 * rather than 5 — a fifth row, "Norumbega Tower", was removed because that
 * landmark is actually in Weston, MA, not Newton). Places and landmarks are
 * real Newton fixtures; hours, prices and event times are illustrative sample
 * data meant to be replaced by real submissions. See CLAUDE.md → "Seed data"
 * before editing.
 *
 * Event timestamps are the *next real occurrence* of each event's schedule
 * (weekday, season, nth-weekday or fixed date), so the demo never shows a
 * calendar full of past events or a Tuesday market dated on a Sunday.
 */

/**
 * Real, verified Wikimedia Commons photos of specific Newton landmarks that
 * multiple rows below reference (e.g. Echo Bridge appears in three separate
 * activities). Rows without a `imageKey` fall back to their village's own
 * verified photo in the `ACTIVITIES` mapper below — never a generic stock
 * image unrelated to the actual place.
 */
export const LANDMARK_IMAGES: Record<string, { url: string; credit: string; creditUrl: string }> = {
  'auburndale-library': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Auburndale_Library%2C_Auburndale_MA.jpg/1920px-Auburndale_Library%2C_Auburndale_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Auburndale_Library,_Auburndale_MA.jpg',
  },
  'chestnut-hill-street': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/The_Street%2C_Chestnut_Hill_MA.jpg/1920px-The_Street%2C_Chestnut_Hill_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:The_Street,_Chestnut_Hill_MA.jpg',
  },
  'bc-gasson-hall': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Boston_College_Adlersaeule_Gasson_Hall_NW_9355_20190426.jpg/1920px-Boston_College_Adlersaeule_Gasson_Hall_NW_9355_20190426.jpg',
    credit: 'Karlunun / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:Boston_College_Adlersaeule_Gasson_Hall_NW_9355_20190426.jpg',
  },
  'crystal-lake': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Crystal_Lake%2C_Newton_Centre_MA.jpg/1920px-Crystal_Lake%2C_Newton_Centre_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY 3.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Crystal_Lake,_Newton_Centre_MA.jpg',
  },
  'newton-free-library': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Newton_Free_Library_May_2026.jpg/1920px-Newton_Free_Library_May_2026.jpg',
    credit: '4300streetcar / Wikimedia Commons, CC BY 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Newton_Free_Library_May_2026.jpg',
  },
  'farlow-park': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/NewtonMA_FarlowPark.jpg',
    credit: 'Magicpiano / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:NewtonMA_FarlowPark.jpg',
  },
  'echo-bridge': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/A_closer_view_of_the_Echo_Bridge%2C_Sudbury_Aqueduct.jpg/1920px-A_closer_view_of_the_Echo_Bridge%2C_Sudbury_Aqueduct.jpg',
    credit: 'Bestbudbrian / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:A_closer_view_of_the_Echo_Bridge,_Sudbury_Aqueduct.jpg',
  },
  'lower-falls-mill': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Lower_Falls_Wine_Company%2C_Newton_Lower_Falls_MA.jpg/1920px-Lower_Falls_Wine_Company%2C_Newton_Lower_Falls_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY-SA 3.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:Lower_Falls_Wine_Company,_Newton_Lower_Falls_MA.jpg',
  },
  'upper-falls-greenway': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Upper_Falls_Greenway%2C_Newton_Upper_Falls_MA.jpg/1920px-Upper_Falls_Greenway%2C_Newton_Upper_Falls_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl:
      'https://commons.wikimedia.org/wiki/File:Upper_Falls_Greenway,_Newton_Upper_Falls_MA.jpg',
  },
  'upper-falls-mill': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Prospect_Block%2C_Newton_Upper_Falls_MA.jpg/1920px-Prospect_Block%2C_Newton_Upper_Falls_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:Prospect_Block,_Newton_Upper_Falls_MA.jpg',
  },
  'cochituate-aqueduct': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/CochituateAqueduct_WabanAvenueNewton.jpg',
    credit: 'Magicpiano / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:CochituateAqueduct_WabanAvenueNewton.jpg',
  },
  'west-newton-cinema': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/West_Newton_Cinema%2C_West_Newton_MA.jpg/1920px-West_Newton_Cinema%2C_West_Newton_MA.jpg',
    credit: 'John Phelan / Wikimedia Commons, CC BY 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:West_Newton_Cinema,_West_Newton_MA.jpg',
  },
  'west-newton-hill': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/NewtonMA_WestNewtonHillHD.jpg',
    credit: 'Magicpiano / Wikimedia Commons, CC BY-SA 4.0',
    creditUrl: 'https://commons.wikimedia.org/wiki/File:NewtonMA_WestNewtonHillHD.jpg',
  },
};

/**
 * When a recurring event happens. Resolved by `nextOccurrence` to the next real
 * date that fits, so a "Tuesday market" always lands on a Tuesday and a July
 * festival never shows up in October.
 */
interface EventRule {
  /** Days of the week it can fall on (0 = Sunday). Omit for any day. */
  days?: number[];
  /** Months it runs in (1 = January). Omit for year-round. */
  months?: number[];
  /** Only the nth matching weekday of the month, e.g. 2 = "second Saturday". */
  nth?: number;
  /** A fixed day of the month, e.g. 4 for the Fourth of July. */
  date?: number;
}

/** Inclusive month range, e.g. months(6, 10) → June through October. */
function months(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

const EASTERN = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Eastern-time wall clock of an instant, as a fake-UTC millisecond value. */
function easternWallClock(ms: number): number {
  const p = Object.fromEntries(EASTERN.formatToParts(ms).map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
}

/** The instant at which Eastern-time clocks read the given date and time (DST-aware). */
function easternToUtc(y: number, m: number, d: number, h: number, min: number): number {
  const wall = Date.UTC(y, m - 1, d, h, min);
  let guess = wall;
  for (let i = 0; i < 2; i++) guess = wall - (easternWallClock(guess) - guess);
  return guess;
}

/** ISO start of the next occurrence of `rule` at `time` (Eastern) that has not started yet. */
function nextOccurrence(rule: EventRule, time: string): string {
  const [h, min] = time.split(':').map(Number);
  const now = Date.now();
  const today = new Date(easternWallClock(now));
  for (let offset = 0; offset < 800; offset++) {
    const day = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offset),
    );
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    if (rule.months && !rule.months.includes(m)) continue;
    if (rule.days && !rule.days.includes(day.getUTCDay())) continue;
    if (rule.nth && Math.ceil(d / 7) !== rule.nth) continue;
    if (rule.date && d !== rule.date) continue;
    const start = easternToUtc(y, m, d, h, min);
    if (start >= now) return new Date(start).toISOString();
  }
  throw new Error(`No upcoming date matches event rule ${JSON.stringify(rule)}`);
}

/** Shorthand row so 65 entries stay readable. */
interface Row {
  title: string;
  village: string;
  category: string;
  summary: string;
  description: string;
  address: string;
  /** Offset from the village center, in degrees, so pins are not stacked. */
  offset?: [number, number];
  /** Key into LANDMARK_IMAGES for a specific verified real-place photo. Falls back to the village's own verified photo when absent. */
  imageKey?: string;
  price?: PriceType;
  priceMin?: number;
  priceMax?: number;
  /** [when it recurs, start time (Eastern), duration in hours] — presence marks it an event. */
  event?: [EventRule, string, number];
  recurrence?: string;
  website?: string;
  phone?: string;
  tags?: string[];
  featured?: boolean;
  rating?: [number, number];
}

const ROWS: Row[] = [
  // ─── Auburndale ────────────────────────────────────────────────────────────
  {
    title: 'Auburndale Cove & Riverside Playground',
    village: 'auburndale',
    category: 'outdoors-parks',
    summary:
      'A gentle Charles River cove with a sandy edge, big shade trees and one of Newton’s best-loved playgrounds.',
    description:
      'Auburndale Cove is the friendliest stretch of the Charles in Newton: a wide, slow bend of river with a small sandy beach area, picnic lawn and a shaded playground just up the bank. Parking is free and rarely full outside July weekends.\n\nBring a blanket for the lawn, walk the paved path along the water toward the Recreation Road boardwalk, or launch a paddleboard from the cove. Restrooms are seasonal, so plan accordingly with small kids.',
    address: '1 Riverside Road, Auburndale, MA 02466',
    offset: [-0.002, 0.004],
    tags: ['playground', 'river', 'picnic', 'stroller-friendly'],
    featured: true,
    rating: [4.7, 96],
  },
  {
    title: 'Charles River Canoe & Kayak — Newton Launch',
    village: 'auburndale',
    category: 'fitness',
    summary:
      'Rent a kayak, canoe or paddleboard and put in on the flattest, prettiest water in the metro area.',
    description:
      'The Newton launch sits on Commonwealth Avenue right where the Charles widens out. Hourly rentals cover kayaks, canoes, and stand-up paddleboards, with staff on the dock to get first-timers moving in the right direction.\n\nPaddle upstream toward Wellesley for near-total quiet, or downstream past Norumbega for the classic postcard view. Lessons and guided sunset paddles run midweek in summer.',
    address: '2401 Commonwealth Avenue, Auburndale, MA 02466',
    offset: [0.001, 0.006],
    price: 'paid',
    priceMin: 22,
    priceMax: 45,
    recurrence: 'Daily, April–October',
    website: 'https://paddleboston.com',
    tags: ['kayak', 'paddleboard', 'rental', 'summer'],
    rating: [4.8, 214],
  },
  {
    title: 'Auburndale Library Story Hour',
    village: 'auburndale',
    category: 'family-kids',
    summary:
      'Songs, rhymes and picture books for toddlers and preschoolers at the Auburndale branch.',
    description:
      'The Auburndale branch of the Newton Free Library runs a warm, unfussy story hour aimed at ages 1–4. Expect twenty minutes of books and songs, then free play and a chance for caregivers to compare notes.\n\nNo registration needed, but the room fills up — arrive five minutes early in winter. Free, like everything at the library.',
    address: '375 Auburn Street, Auburndale, MA 02466',
    offset: [-0.001, -0.003],
    imageKey: 'auburndale-library',
    event: [{ days: [3] }, '10:30', 1],
    recurrence: 'Every Wednesday, year-round',
    tags: ['toddlers', 'library', 'indoor', 'free'],
    rating: [4.9, 58],
  },
  {
    title: 'Auburndale Park Pickleball Courts',
    village: 'auburndale',
    category: 'fitness',
    summary: 'Four striped courts, open play mornings, and a very welcoming regular crowd.',
    description:
      'Newton’s pickleball boom found a home here. Four dedicated courts see steady open play from early morning through dusk, and the regulars are notably good about folding newcomers into rotations.\n\nBring your own paddle and a ball. Courts are first-come, first-served; weekday mornings are the sweet spot if you want a game without waiting.',
    address: 'Auburn Street at Melrose Avenue, Auburndale, MA 02466',
    offset: [-0.003, -0.001],
    recurrence: 'Daily, dawn to dusk',
    tags: ['pickleball', 'open play', 'outdoor', 'free'],
    rating: [4.5, 73],
  },

  // ─── Chestnut Hill ─────────────────────────────────────────────────────────
  {
    title: 'Chestnut Hill Reservoir Loop',
    village: 'chestnut-hill',
    category: 'outdoors-parks',
    summary:
      'A flat 1.5-mile gravel loop around open water, with the Boston skyline on the far side.',
    description:
      'The Reservoir loop is the definitive Chestnut Hill activity: a mile and a half of level crushed stone with water on one side and mature trees on the other. It draws runners at dawn, strollers midday, and a golden-hour crowd that is worth planning around.\n\nThe path connects to the Green Line B branch at Cleveland Circle, so you can arrive without a car. Dogs on leash are welcome; swimming is not.',
    address: 'Beacon Street at Chestnut Hill Driveway, Chestnut Hill, MA 02467',
    offset: [0.002, 0.003],
    recurrence: 'Daily, dawn to dusk',
    tags: ['running', 'walking', 'sunset', 'dog-friendly', 'free'],
    featured: true,
    rating: [4.8, 412],
  },
  {
    title: 'The Street Chestnut Hill',
    village: 'chestnut-hill',
    category: 'shopping',
    summary:
      'An open-air shopping block with big-name retail, a cinema, and better-than-average patio dining.',
    description:
      'The Street is where Chestnut Hill does an afternoon: a walkable outdoor block of clothing shops, home goods, a Showcase cinema, and a dozen restaurants with real outdoor seating.\n\nIt is unapologetically upscale, but the plaza is free to wander, there is a splash-and-play area for kids in summer, and parking is plentiful — a rarity in Newton.',
    address: '33 Boylston Street, Chestnut Hill, MA 02467',
    offset: [-0.003, -0.004],
    imageKey: 'chestnut-hill-street',
    price: 'varies',
    recurrence: 'Daily, 10am–8pm (restaurants later)',
    tags: ['shopping', 'cinema', 'patio', 'rainy day'],
    rating: [4.4, 287],
  },
  {
    title: 'Boston College Campus Walk & Bapst Library',
    village: 'chestnut-hill',
    category: 'arts-culture',
    summary:
      'Collegiate Gothic towers, a hilltop reservoir view, and a reading room that looks like a cathedral.',
    description:
      'You do not need to be a student to walk the BC campus. Start at the Linden Lane gates, take in Gasson Hall’s tower, and if the doors are open, step into Bapst Library’s Ford Tower reading room — stained glass, vaulted ceilings, absolute silence.\n\nCampus is prettiest in mid-October when the quad turns. Football Saturdays are electric but crowded; go on a weekday morning for the quiet version.',
    address: '140 Commonwealth Avenue, Chestnut Hill, MA 02467',
    offset: [0.001, -0.002],
    imageKey: 'bc-gasson-hall',
    tags: ['architecture', 'walking', 'fall foliage', 'free'],
    rating: [4.7, 168],
  },
  {
    title: 'Reservoir Sunset Run Club',
    village: 'chestnut-hill',
    category: 'fitness',
    summary: 'A no-drop group run around the Reservoir every Thursday evening, all paces welcome.',
    description:
      'A neighborhood-organized group run that meets at the Beacon Street gate and does two loops of the Reservoir — roughly three miles — with a pace group for everyone from 8-minute miles to a brisk walk.\n\nNo sign-up, no fee, no one gets left behind. Many people stay for a drink in Cleveland Circle afterward.',
    address: 'Beacon Street Gate, Chestnut Hill Reservoir, Chestnut Hill, MA 02467',
    offset: [0.003, 0.002],
    event: [{ days: [4], months: months(3, 11) }, '18:30', 1.5],
    recurrence: 'Every Thursday, March–November',
    tags: ['running', 'social', 'beginner friendly', 'free'],
    rating: [4.6, 64],
  },
  {
    title: 'Chestnut Hill Farmers Market',
    village: 'chestnut-hill',
    category: 'food-drink',
    summary:
      'Massachusetts growers, prepared food, and live music in the plaza on Saturday mornings.',
    description:
      'A compact but well-curated market: five or six farms, a bread baker, a cheesemonger, and rotating prepared-food vendors. Live acoustic music from around ten.\n\nCome early for produce and late for the discounted end-of-day bread. SNAP/HIP accepted at the market tent.',
    address: 'Boylston Street Plaza, Chestnut Hill, MA 02467',
    offset: [-0.002, 0.001],
    imageKey: 'chestnut-hill-street',
    event: [{ days: [6], months: months(6, 10) }, '09:00', 4],
    recurrence: 'Saturdays, June–October',
    price: 'varies',
    tags: ['farmers market', 'local', 'live music', 'family'],
    rating: [4.5, 132],
  },

  // ─── Newton Centre ─────────────────────────────────────────────────────────
  {
    title: 'Crystal Lake Beach',
    village: 'newton-centre',
    category: 'outdoors-parks',
    summary:
      'Newton’s only public swimming beach — spring-fed, lifeguarded, and a ten-minute walk from Newton Centre.',
    description:
      'Crystal Lake is the city’s summer center of gravity. The bathhouse beach on Rogers Street has lifeguards, a roped swim area, a dock, and a grassy slope that fills with towels by noon on hot days.\n\nResident passes cover the season; day passes are available at the gate. Outside beach hours the perimeter path is open year-round and is a lovely twenty-minute loop, with ice-skating some winters when the ice is certified.',
    address: '10 Rogers Street, Newton Centre, MA 02459',
    offset: [-0.004, 0.001],
    imageKey: 'crystal-lake',
    price: 'paid',
    priceMin: 10,
    priceMax: 10,
    recurrence: 'Daily, mid-June through Labor Day, 10am–7pm',
    tags: ['swimming', 'beach', 'summer', 'lifeguard', 'family'],
    featured: true,
    rating: [4.6, 341],
  },
  {
    title: 'Newton Centre Green Summer Concert',
    village: 'newton-centre',
    category: 'seasonal-events',
    summary:
      'Free Thursday-evening concerts on the triangle green — bring a blanket and dinner from the square.',
    description:
      'The city puts a stage on the Newton Centre Green and programs eight weeks of free evening concerts: brass bands, blues, a swing night, and one reliably chaotic kids’ music show.\n\nThe smart move is to pick up dinner from one of the two dozen restaurants ringing the square and eat on the grass. Bring a low chair; the green fills in fast after 6:30.',
    address: 'Centre Street at Beacon Street, Newton Centre, MA 02459',
    offset: [0.001, 0.001],
    event: [{ days: [4], months: [7, 8] }, '19:00', 2],
    recurrence: 'Thursdays, July–August',
    tags: ['live music', 'free', 'family', 'outdoor', 'summer'],
    featured: true,
    rating: [4.7, 189],
  },
  {
    title: 'Dessert Crawl: Newton Centre Square',
    village: 'newton-centre',
    category: 'food-drink',
    summary:
      'Four dessert stops within three blocks — ice cream, gelato, French pastry and a late-night cookie.',
    description:
      'Newton Centre has an improbable density of dessert. A workable route: gelato on Union Street, then a pastry counter on Langley, then ice cream on Beacon, and finish with something warm from the bakery near the T stop.\n\nBudget about $8 per stop. Most places stay open until at least nine, later on weekends — this is Newton’s best answer to "what do we do after dinner."',
    address: 'Union Street & Langley Road, Newton Centre, MA 02459',
    offset: [0.0005, -0.001],
    price: 'paid',
    priceMin: 8,
    priceMax: 32,
    recurrence: 'Daily, most shops until 9pm',
    tags: ['dessert', 'ice cream', 'walkable', 'date night'],
    rating: [4.8, 226],
  },
  {
    title: 'Newton Free Library',
    village: 'newton-centre',
    category: 'family-kids',
    summary:
      'One of the busiest public libraries in Massachusetts: huge children’s wing, museum passes, quiet study floors.',
    description:
      'The main library on Homer Street is a genuine civic anchor — a soaring atrium, an enormous children’s room with a dedicated program space, a teen room, and an upper floor of near-silent study carrels.\n\nDo not miss the museum pass program: free or steeply discounted admission to the MFA, the Museum of Science, the Aquarium and more, reservable online with a Newton card. There is also a small café and a gallery that rotates local artists monthly.',
    address: '330 Homer Street, Newton Centre, MA 02459',
    offset: [0.003, -0.002],
    imageKey: 'newton-free-library',
    recurrence: 'Mon–Thu 9am–9pm, Fri–Sat 9am–5pm, Sun 1pm–5pm',
    tags: ['library', 'indoor', 'rainy day', 'museum passes', 'free'],
    rating: [4.9, 508],
  },
  {
    title: 'Trivia Night in the Square',
    village: 'newton-centre',
    category: 'nightlife',
    summary: 'Tuesday-night pub trivia in Newton Centre — teams of up to six, no cover.',
    description:
      'A long-running trivia night that draws a mix of grad students, teachers, and neighbors who have been playing on the same team for a decade. Six rounds, a music round, and a genuinely competitive final wager.\n\nArrive by 7:15 to get a table. No cover; a house tab prize for the winners. Kitchen runs late, which in Newton is worth noting.',
    address: 'Union Street, Newton Centre, MA 02459',
    offset: [-0.001, 0.002],
    event: [{ days: [2] }, '19:30', 2.5],
    recurrence: 'Every Tuesday, year-round',
    price: 'varies',
    tags: ['trivia', 'bar', 'social', '21+'],
    rating: [4.4, 91],
  },

  // ─── Newton Corner ─────────────────────────────────────────────────────────
  {
    title: 'Farlow Park',
    village: 'newton-corner',
    category: 'outdoors-parks',
    summary:
      'A Victorian-era pocket park with a pond, weeping willows and Newton’s oldest planted landscape.',
    description:
      'Farlow Park is a small 19th-century park with a duck pond, mature willows, and curving paths that were laid out when Newton Corner was the city’s fashionable address. It is an unexpectedly peaceful spot given how close the Mass Pike is.\n\nGood for a twenty-minute walk, a bench lunch, or letting small kids run. The surrounding streets have some of the best-preserved Victorian houses in the city.',
    address: 'Church Street at Park Street, Newton Corner, MA 02458',
    offset: [-0.001, 0.002],
    imageKey: 'farlow-park',
    tags: ['pond', 'historic', 'quiet', 'stroller-friendly', 'free'],
    rating: [4.4, 67],
  },
  {
    title: 'Charles River Greenway — Newton Corner Access',
    village: 'newton-corner',
    category: 'fitness',
    summary:
      'Hop onto the paved riverside path here and ride all the way into Boston without a traffic light.',
    description:
      'The access point near Nonantum Road puts you on the Charles River paths with a clean shot east toward Watertown Square, Cambridge and the Esplanade — roughly nine miles to the Museum of Science.\n\nMostly flat and fully paved, so it works for road bikes, joggers and rollerbladers alike. Heading west from here gets scrappier; go east.',
    address: 'Nonantum Road at Charles Street, Newton Corner, MA 02458',
    offset: [0.003, 0.001],
    tags: ['cycling', 'running', 'river', 'commute', 'free'],
    rating: [4.6, 143],
  },
  {
    title: 'Newton Corner Sunday Brunch Row',
    village: 'newton-corner',
    category: 'food-drink',
    summary:
      'Three brunch spots within a block of the Washington Street rotary, none of them requiring a reservation.',
    description:
      'Newton Corner’s brunch scene is unglamorous and reliable: a diner-style counter, a bakery-café with excellent laminated pastry, and a full-service restaurant that does a proper eggs benedict.\n\nWaits peak between 10:30 and noon on Sundays. Street parking is free but tight — the municipal lot behind Washington Street is the local secret.',
    address: 'Washington Street, Newton Corner, MA 02458',
    offset: [0.0005, -0.001],
    price: 'paid',
    priceMin: 14,
    priceMax: 28,
    recurrence: 'Saturdays & Sundays, 8am–2pm',
    tags: ['brunch', 'coffee', 'no reservation', 'family'],
    rating: [4.3, 118],
  },
  {
    title: 'Newton History Walking Tour',
    village: 'newton-corner',
    category: 'arts-culture',
    summary:
      'A 90-minute docent-led walk through the city’s first settled village and its Victorian streetscape.',
    description:
      'Starting at Farlow Park, this volunteer-led walk covers Newton Corner’s arc from 1630s settlement to railroad suburb to highway casualty — including the blocks lost to the Mass Pike in the 1960s.\n\nAbout a mile and a half at a conversational pace, with plenty of stops. Suggested donation supports the Newton History Museum at the Jackson Homestead.',
    address: 'Farlow Park, Church Street, Newton Corner, MA 02458',
    offset: [-0.0015, 0.0025],
    imageKey: 'farlow-park',
    event: [{ days: [6], nth: 2, months: months(5, 10) }, '14:00', 1.5],
    recurrence: 'Second Saturday of the month, May–October',
    price: 'paid',
    priceMin: 10,
    priceMax: 10,
    tags: ['history', 'walking tour', 'architecture', 'adults'],
    rating: [4.7, 52],
  },
  {
    title: 'Newton Corner Playground at Cabot',
    village: 'newton-corner',
    category: 'family-kids',
    summary: 'Shaded modern play structures, a toddler section, and a splash pad in summer.',
    description:
      'A well-maintained neighborhood playground with genuinely good shade — rare and valuable in August. Separate structures for under-5s and older kids, plus swings with two bucket seats and a summer splash pad.\n\nFenced on three sides, which parents of runners will appreciate. Adjacent ball fields and a basketball court for older siblings.',
    address: '229 Cabot Street, Newton Corner, MA 02458',
    offset: [-0.003, -0.002],
    recurrence: 'Daily, dawn to dusk; splash pad late June–August',
    tags: ['playground', 'splash pad', 'shade', 'fenced', 'free'],
    rating: [4.5, 88],
  },

  // ─── Newton Highlands ──────────────────────────────────────────────────────
  {
    title: 'Newton Highlands Village Square Stroll',
    village: 'newton-highlands',
    category: 'shopping',
    summary:
      'Two blocks of independent shops — bookseller, bakery, hardware store, florist — around the Green Line stop.',
    description:
      'The Highlands square is what people mean when they say Newton has real village centers. Within two blocks: an independent bookshop, a bakery with a line on Saturday, an old-school hardware store, a florist, and a couple of good restaurants.\n\nPark once and walk the whole thing in an hour. The D-branch stop puts you here from Downtown Crossing in about twenty-five minutes.',
    address: 'Lincoln Street at Walnut Street, Newton Highlands, MA 02461',
    offset: [0.0005, 0.001],
    price: 'varies',
    recurrence: 'Most shops Mon–Sat 10am–6pm',
    tags: ['independent shops', 'bookstore', 'walkable', 'T-accessible'],
    featured: true,
    rating: [4.6, 154],
  },
  {
    title: 'Hemlock Gorge Reservation & Echo Bridge',
    village: 'newton-highlands',
    category: 'outdoors-parks',
    summary:
      'Hemlock-shaded trails above a rocky river gorge, with a stone aqueduct arch that echoes fifteen times.',
    description:
      'Hemlock Gorge is Newton’s most dramatic landscape — the Charles narrows and drops through a rock cut, with old-growth hemlocks on the slopes above. Echo Bridge, an 1877 aqueduct arch, crosses the gorge, and a stairway leads down to a platform beneath it.\n\nStand on the platform and shout. The echo is genuinely startling and delights kids every time. Trails are short but rooty and steep in places; wear real shoes.',
    address: 'Ellis Street, Newton Highlands, MA 02461',
    offset: [-0.004, -0.003],
    imageKey: 'echo-bridge',
    tags: ['hiking', 'echo bridge', 'gorge', 'hidden gem', 'free'],
    featured: true,
    rating: [4.8, 276],
  },
  {
    title: 'Cold Spring Park Trails',
    village: 'newton-highlands',
    category: 'outdoors-parks',
    summary:
      '67 acres of woodland loop trails, a cross-country course, and a Tuesday farmers market in season.',
    description:
      'Cold Spring Park is Newton’s workhorse open space: a flat two-mile network of wood-chip and gravel loops through mixed forest and wetland, popular with dog walkers, cross-country teams and stroller pushers.\n\nThe Beacon Street lot hosts the Newton Farmers Market on Tuesday afternoons in summer and fall. Boardwalks cross the wettest sections, but spring mud is real.',
    address: '1200 Beacon Street, Newton Highlands, MA 02461',
    offset: [0.004, 0.003],
    recurrence: 'Daily, dawn to dusk',
    tags: ['trails', 'dog-friendly', 'cross country', 'farmers market', 'free'],
    rating: [4.7, 231],
  },
  {
    title: 'Community Theatre Night in the Highlands',
    village: 'newton-highlands',
    category: 'arts-culture',
    summary:
      'Local companies stage plays and musicals in a small Highlands house — tickets under $30.',
    description:
      'Newton’s community theatre scene is more ambitious than you would expect: full musicals, Sondheim revivals, and new work by local playwrights, staged in an intimate house where no seat is far from the stage.\n\nRuns are short — usually two weekends — so check dates and buy early. Street parking is free after 6pm.',
    address: 'Lincoln Street, Newton Highlands, MA 02461',
    offset: [0.001, -0.002],
    event: [{ days: [5] }, '19:30', 2.5],
    recurrence: 'Select Fri–Sun through the season',
    price: 'paid',
    priceMin: 18,
    priceMax: 30,
    tags: ['theatre', 'live performance', 'date night'],
    rating: [4.5, 79],
  },
  {
    title: 'Highlands Yoga in the Park',
    village: 'newton-highlands',
    category: 'fitness',
    summary: 'Donation-based outdoor vinyasa on the Cold Spring Park lawn, Saturday mornings.',
    description:
      'A local studio brings mats and a portable speaker to the Cold Spring Park lawn for an all-levels vinyasa class in the open air. Sixty minutes, gentle enough for beginners, with modifications called throughout.\n\nSuggested $10 donation, nobody turned away. Cancelled for rain — check the studio’s socials by 7am.',
    address: 'Cold Spring Park lawn, 1200 Beacon Street, Newton Highlands, MA 02461',
    offset: [0.0045, 0.0025],
    event: [{ days: [6], months: months(6, 9) }, '08:30', 1],
    recurrence: 'Saturdays, June–September',
    price: 'varies',
    tags: ['yoga', 'outdoor', 'all levels', 'donation'],
    rating: [4.7, 68],
  },

  // ─── Newton Lower Falls ────────────────────────────────────────────────────
  {
    title: 'Charles River Path — Lower Falls Riverbank',
    village: 'newton-lower-falls',
    category: 'outdoors-parks',
    summary:
      'A short, pretty riverside walk past old mill dams where the Charles drops toward Wellesley.',
    description:
      'Lower Falls earned its name from the drop in the river that once powered paper mills. The path along the bank gives you the dam, the old mill foundations, and a surprisingly loud stretch of moving water for suburban Boston.\n\nIt is a half-mile out and back rather than a hike. Combine it with the Blue Heron Bridge to cross into Wellesley for a longer loop.',
    address: 'Concord Street at Washington Street, Newton Lower Falls, MA 02462',
    offset: [0.001, 0.002],
    tags: ['river', 'walking', 'history', 'quick stop', 'free'],
    rating: [4.4, 62],
  },
  {
    title: 'Blue Heron Bridge Crossing',
    village: 'newton-lower-falls',
    category: 'outdoors-parks',
    summary:
      'A pedestrian bridge over the Charles connecting Newton to Wellesley — great heron spotting at dusk.',
    description:
      'This footbridge links the Lower Falls riverbank to the Wellesley side, opening up a two-mile loop that most Newton residents do not know exists. It is named for the great blue herons that stalk the shallows.\n\nBest at dusk in late summer, when the herons are active and the light on the water is worth the trip on its own. Bring binoculars if you have them.',
    address: 'Off Concord Street, Newton Lower Falls, MA 02462',
    offset: [-0.001, 0.003],
    tags: ['birding', 'bridge', 'hidden gem', 'sunset', 'free'],
    rating: [4.6, 47],
  },
  {
    title: 'Lower Falls Coffee & Pastry Stop',
    village: 'newton-lower-falls',
    category: 'food-drink',
    summary: 'A small café on the Route 16 corner — good espresso, better scones, six seats.',
    description:
      'Tiny, competent, and exactly what the village needed: a proper espresso machine, house-baked scones and morning buns, and a couple of tables that turn over fast.\n\nMostly a takeaway stop for people heading to the river path or over to Wellesley. Sold out of pastry by eleven on weekends.',
    address: 'Washington Street, Newton Lower Falls, MA 02462',
    offset: [0.002, -0.001],
    price: 'paid',
    priceMin: 4,
    priceMax: 14,
    recurrence: 'Mon–Fri 7am–3pm, Sat–Sun 8am–2pm',
    tags: ['coffee', 'bakery', 'takeaway', 'quick stop'],
    rating: [4.6, 104],
  },
  {
    title: 'Mill Village Architecture Walk',
    village: 'newton-lower-falls',
    category: 'arts-culture',
    summary:
      'A self-guided loop past 19th-century mill housing, a 1811 church, and the old paper works.',
    description:
      'Lower Falls is unusually intact for a New England mill village: worker housing, the mill owner’s house, and St. Mary’s church all still stand within a few blocks of the dam that started it all.\n\nDownload the self-guided map from the Newton History Museum site, or just wander — the interpretive signs along Concord Street cover the essentials. About forty-five minutes.',
    address: 'Concord Street, Newton Lower Falls, MA 02462',
    offset: [0.0015, -0.0025],
    imageKey: 'lower-falls-mill',
    tags: ['self-guided', 'history', 'architecture', 'free'],
    rating: [4.2, 33],
  },
  {
    title: 'Lower Falls Playground & Ball Field',
    village: 'newton-lower-falls',
    category: 'family-kids',
    summary:
      'A quiet neighborhood playground that never feels crowded, with a full ball field beside it.',
    description:
      'Because Lower Falls is Newton’s smallest-feeling village, its playground is the one you go to when everywhere else is packed. Standard modern equipment, good swings, and a bench line with actual shade.\n\nThe adjacent field hosts little-league practices on weekday evenings. Parking is easy, which cannot be said of most Newton playgrounds.',
    address: 'Hagar Street, Newton Lower Falls, MA 02462',
    offset: [-0.002, -0.002],
    recurrence: 'Daily, dawn to dusk',
    tags: ['playground', 'uncrowded', 'ball field', 'free'],
    rating: [4.4, 39],
  },

  // ─── Newton Upper Falls ────────────────────────────────────────────────────
  {
    title: 'Echo Bridge Photo Walk',
    village: 'newton-upper-falls',
    category: 'arts-culture',
    summary:
      'The classic Newton shot: a stone arch over a gorge, best in the last hour of light in October.',
    description:
      'From the Upper Falls side, a short trail brings you to the viewpoint that puts Echo Bridge’s full 130-foot arch in frame with the river below. In mid-October the hemlocks and maples turn the whole gorge gold.\n\nGo an hour before sunset. The descent to the under-bridge platform is steep and slick when wet — worth it, but take care with kids.',
    address: 'Chestnut Street at Ellis Street, Newton Upper Falls, MA 02464',
    offset: [0.002, 0.003],
    imageKey: 'echo-bridge',
    tags: ['photography', 'fall foliage', 'echo bridge', 'free'],
    featured: true,
    rating: [4.8, 197],
  },
  {
    title: 'Upper Falls Greenway',
    village: 'newton-upper-falls',
    category: 'fitness',
    summary:
      'A flat, paved rail-trail through the old mill district, with public art and a mile of easy walking.',
    description:
      'Built on an abandoned rail bed, the Greenway runs about a mile from Needham Street through the heart of the old industrial village, with murals, benches and interpretive signs along the way.\n\nFully paved and level, so it works for wheelchairs, strollers and scooters. Connects toward Hemlock Gorge at the north end for a longer outing.',
    address: 'Needham Street at Oak Street, Newton Upper Falls, MA 02464',
    offset: [-0.002, -0.001],
    imageKey: 'upper-falls-greenway',
    recurrence: 'Daily, dawn to dusk',
    tags: ['rail trail', 'accessible', 'public art', 'walking', 'free'],
    rating: [4.6, 158],
  },
  {
    title: 'Mill District Studio Open House',
    village: 'newton-upper-falls',
    category: 'arts-culture',
    summary:
      'Working artists open their mill-building studios one weekend each season — painting, ceramics, glass.',
    description:
      'The old mill buildings along the river now house painters, potters, printmakers and a glassblower. Twice a year they open the doors, put out cider, and let you watch them work.\n\nFree to browse, and most artists sell directly. The buildings themselves — timber beams, huge industrial windows — are half the appeal.',
    address: 'Oak Street mill buildings, Newton Upper Falls, MA 02464',
    offset: [-0.0025, -0.0015],
    imageKey: 'upper-falls-mill',
    event: [{ days: [6], nth: 1, months: [5, 11] }, '11:00', 6],
    recurrence: 'First Saturday of May and November',
    tags: ['open studios', 'local art', 'shopping', 'free'],
    rating: [4.7, 71],
  },
  {
    title: 'Upper Falls Dinner on the River',
    village: 'newton-upper-falls',
    category: 'food-drink',
    summary:
      'Converted-mill dining rooms with exposed brick and a patio over the water — Newton’s best dinner setting.',
    description:
      'The mill conversions along the river gave Upper Falls a restaurant row with genuine atmosphere: brick and beam interiors, big windows, and at least one patio that hangs out over the water.\n\nReservations strongly advised on weekends. Expect $30–$45 entrées; the bar menus are a good cheaper entry point.',
    address: 'Needham Street, Newton Upper Falls, MA 02464',
    offset: [-0.001, 0.001],
    price: 'paid',
    priceMin: 30,
    priceMax: 60,
    recurrence: 'Tue–Sun dinner, from 5pm',
    tags: ['dinner', 'patio', 'date night', 'reservations'],
    rating: [4.5, 213],
  },
  {
    title: 'Hemlock Gorge Family Nature Hunt',
    village: 'newton-upper-falls',
    category: 'family-kids',
    summary:
      'A ranger-guided scavenger hunt through the gorge for ages 5–10, ending under Echo Bridge.',
    description:
      'A Friends-of-the-reservation volunteer leads kids through the gorge looking for hemlock cones, river-carved rock, heron tracks and the best echo spot. Ninety minutes, mostly downhill, ends with the shouting.\n\nRegistration is free but capped at twenty kids. Long pants recommended — there is poison ivy off-trail.',
    address: 'Hemlock Gorge Reservation, Ellis Street, Newton Upper Falls, MA 02464',
    offset: [0.0025, 0.0025],
    imageKey: 'echo-bridge',
    event: [{ days: [6], nth: 3, months: months(5, 10) }, '10:00', 1.5],
    recurrence: 'Third Saturday of the month, May–October',
    tags: ['nature program', 'ages 5-10', 'guided', 'free'],
    rating: [4.8, 44],
  },

  // ─── Newtonville ───────────────────────────────────────────────────────────
  {
    title: 'Newtonville Farmers Market',
    village: 'newtonville',
    category: 'food-drink',
    summary:
      'A long-running Tuesday market on Walnut Street — produce, bread, flowers and prepared food.',
    description:
      'The Newtonville market is a genuine neighborhood institution. A dozen vendors set up along Walnut Street with Massachusetts produce, sourdough, cut flowers, honey, and a couple of hot-food trucks.\n\nGoes on rain or shine. SNAP and HIP are accepted, and the market matches HIP dollars for fruit and vegetables.',
    address: 'Walnut Street at Austin Street, Newtonville, MA 02460',
    offset: [0.0005, 0.001],
    event: [{ days: [2], months: months(6, 10) }, '13:30', 5],
    recurrence: 'Tuesdays, mid-June through October',
    price: 'varies',
    tags: ['farmers market', 'local', 'produce', 'SNAP/HIP'],
    featured: true,
    rating: [4.7, 203],
  },
  {
    title: 'Albemarle Field & Gath Pool',
    village: 'newtonville',
    category: 'fitness',
    summary:
      'Newton’s big public pool complex plus turf fields, a track and a summer-long swim program.',
    description:
      'The Albemarle complex is the city’s athletic hub: an outdoor pool with a shallow end for small kids, turf fields, a running track, and tennis courts, all in one place off Crafts Street.\n\nPool passes are per-season or per-visit; residents get priority for swim lessons, which fill in April. The track is open to the public whenever teams are not using it.',
    address: '750 Watertown Street, Newtonville, MA 02460',
    offset: [0.002, 0.003],
    price: 'paid',
    priceMin: 8,
    priceMax: 12,
    recurrence: 'Pool late June–Labor Day; fields year-round',
    tags: ['swimming', 'pool', 'track', 'tennis', 'family'],
    rating: [4.4, 167],
  },
  {
    title: 'Newtonville Restaurant Row',
    village: 'newtonville',
    category: 'nightlife',
    summary:
      'The village’s rebuilt Washington Street strip now holds Newton’s densest cluster of good bars.',
    description:
      'Redevelopment around the commuter-rail stop brought Newtonville a real evening scene: a taproom, a cocktail bar, a wine shop that pours, and restaurants that keep their kitchens open past ten.\n\nWalkable from the Newtonville station, which makes it the easiest Newton night out without a car. Weekends get busy after eight.',
    address: 'Washington Street, Newtonville, MA 02460',
    offset: [-0.001, -0.002],
    price: 'paid',
    priceMin: 12,
    priceMax: 45,
    recurrence: 'Nightly, most kitchens until 10pm',
    tags: ['bars', 'cocktails', 'T-accessible', '21+'],
    rating: [4.5, 176],
  },
  {
    title: 'Newtonville Books',
    village: 'newtonville',
    category: 'shopping',
    summary:
      'A beloved independent bookstore with a serious author-event calendar and excellent staff picks.',
    description:
      'Newtonville Books is the kind of independent shop that anchors a neighborhood: tightly curated fiction, a strong kids’ section, and staff recommendation cards that are actually worth reading.\n\nThe author-event series punches well above the store’s size — nationally touring novelists read here regularly. Events are usually free with a book purchase; check the calendar and RSVP.',
    address: '10 Langley Road, Newtonville, MA 02460',
    offset: [-0.0015, 0.0015],
    price: 'varies',
    recurrence: 'Daily, 10am–7pm',
    tags: ['bookstore', 'author events', 'independent', 'rainy day'],
    featured: true,
    rating: [4.9, 288],
  },
  {
    title: 'Newton Farmers Market Kids’ Craft Table',
    village: 'newtonville',
    category: 'family-kids',
    summary: 'A free craft and seed-planting table for kids alongside the Tuesday market.',
    description:
      'While parents shop, volunteers run a craft table beside the market: seed planting in paper pots, vegetable stamp printing, and a weekly produce-tasting dare that gets more kids eating kohlrabi than you would believe.\n\nDrop in any time during market hours. Free, no registration, aimed at ages 3–9.',
    address: 'Walnut Street at Austin Street, Newtonville, MA 02460',
    offset: [0.001, 0.0015],
    event: [{ days: [2], months: months(6, 10) }, '14:00', 3],
    recurrence: 'Tuesdays with the market, June–October',
    tags: ['crafts', 'ages 3-9', 'drop-in', 'free'],
    rating: [4.6, 51],
  },

  // ─── Nonantum ──────────────────────────────────────────────────────────────
  {
    title: 'St. Mary of Carmen Festival',
    village: 'nonantum',
    category: 'seasonal-events',
    summary:
      'Nonantum’s four-day Italian street feast — processions, a midway, sausage carts and fireworks.',
    description:
      'The Festa is the biggest thing that happens in Newton all year. Adams Street closes down for four days of food stalls, carnival rides, brass bands, and a Sunday procession that carries the statue of Our Lady of Mount Carmel through the village.\n\nGo hungry: sausage and peppers, arancini, zeppole, and Italian ice. Free to attend; bring cash for food and rides. Parking is impossible — walk in from Watertown Street.',
    address: 'Adams Street, Nonantum, MA 02458',
    offset: [0.0005, 0.001],
    event: [{ days: [4], nth: 3, months: [7] }, '17:00', 78],
    recurrence: 'Thursday–Sunday, mid-July',
    price: 'varies',
    tags: ['festival', 'italian', 'food', 'fireworks', 'family'],
    featured: true,
    rating: [4.9, 421],
  },
  {
    title: 'Nonantum Bakery Crawl',
    village: 'nonantum',
    category: 'food-drink',
    summary:
      'Generational Italian bakeries within a few blocks — cannoli, ricotta pie, and bread by noon.',
    description:
      'The Lake takes baking seriously. Within a short walk you can get cannoli filled to order, a proper ricotta pie, seeded semolina loaves, and pizzelle stacked by the register.\n\nGo Saturday morning and expect a numbered-ticket line. Cash is still king at a couple of counters. Bread sells out well before noon.',
    address: 'Watertown Street, Nonantum, MA 02458',
    offset: [-0.001, -0.001],
    price: 'paid',
    priceMin: 5,
    priceMax: 30,
    recurrence: 'Tue–Sun mornings',
    tags: ['bakery', 'italian', 'cannoli', 'cash preferred'],
    featured: true,
    rating: [4.8, 312],
  },
  {
    title: 'Pellegrini Park Bocce Courts',
    village: 'nonantum',
    category: 'outdoors-parks',
    summary: 'Real bocce courts with real regulars — show up, watch a while, and you will get invited in.',
    description:
      'The bocce courts at Pellegrini Park are one of Newton’s best pieces of living culture: an ongoing, decades-long game among Nonantum regulars, played most fair afternoons and evenings in season.\n\nBalls are usually on site. Standing at the fence for ten minutes is the accepted way to get asked to play. The park also has a playground and a small lawn.',
    address: 'Pellegrini Park, Adams Street, Nonantum, MA 02458',
    offset: [0.001, -0.0015],
    recurrence: 'Afternoons and evenings, April–October',
    tags: ['bocce', 'local culture', 'social', 'hidden gem', 'free'],
    rating: [4.7, 86],
  },
  {
    title: 'Red Sauce Sunday Dinner',
    village: 'nonantum',
    category: 'food-drink',
    summary:
      'Old-school Italian-American dining rooms — chicken parm the size of a hubcap, at family prices.',
    description:
      'Nonantum’s restaurants are not chasing trends. Expect vinyl booths, bread and butter on arrival, chicken and veal parm, baked ziti, and portions built for leftovers.\n\nSunday afternoon is the right time to go — multigenerational tables, everyone in a good mood. Most places take walk-ins; a few are cash-friendly and reservation-averse.',
    address: 'Watertown Street, Nonantum, MA 02458',
    offset: [-0.0015, 0.0005],
    price: 'paid',
    priceMin: 18,
    priceMax: 34,
    recurrence: 'Wed–Sun, dinner from 4pm',
    tags: ['italian', 'family style', 'comfort food', 'groups'],
    rating: [4.6, 244],
  },
  {
    title: 'Nonantum Village Day',
    village: 'nonantum',
    category: 'seasonal-events',
    summary:
      'A one-day neighborhood block party with a road race, a parade, and the fire department’s hose spray.',
    description:
      'Smaller and homier than the Festa: a morning 5K, a short parade of scout troops and antique cars, a stage of local bands, and a fire truck that hoses down the kids at the end of the afternoon.\n\nFree, and about as purely local as Newton gets. Food is by neighborhood organizations, so bring cash and small bills.',
    address: 'Watertown Street at Adams Street, Nonantum, MA 02458',
    offset: [0.0015, 0.0005],
    event: [{ days: [6], nth: 2, months: [9] }, '10:00', 6],
    recurrence: 'Second Saturday of September',
    tags: ['block party', 'parade', '5K', 'family', 'free'],
    rating: [4.7, 118],
  },

  // ─── Oak Hill ──────────────────────────────────────────────────────────────
  {
    title: 'Nahanton Park',
    village: 'oak-hill',
    category: 'outdoors-parks',
    summary:
      'Meadows, woods and a canoe launch on the Charles — Newton’s premier birding spot at 180+ species.',
    description:
      'Nahanton Park’s mix of meadow, wetland and riverbank makes it the most biologically interesting open space in Newton. Birders have logged well over 180 species; spring migration in the meadow edges is genuinely excellent.\n\nA canoe and kayak launch sits at the river end, and the community gardens occupy the upper field. Trails are easy but unpaved. Winter Street lot is the closest parking.',
    address: '455 Nahanton Street, Oak Hill, MA 02459',
    offset: [0.002, 0.002],
    recurrence: 'Daily, dawn to dusk',
    tags: ['birding', 'canoe launch', 'meadow', 'trails', 'free'],
    featured: true,
    rating: [4.8, 164],
  },
  {
    title: 'Oak Hill Conservation Trails',
    village: 'oak-hill',
    category: 'outdoors-parks',
    summary:
      'Quiet, rooty single-track through Newton’s biggest stretch of unbroken woodland.',
    description:
      'A network of narrow footpaths threads the conservation land in Newton’s southern corner. It is the closest thing the city has to a real forest walk — hemlock, oak, glacial boulders, and almost no one else.\n\nSignage is sparse; download a map or drop a pin at your car. Ticks are a genuine consideration from May through September.',
    address: 'Saw Mill Brook Parkway, Oak Hill, MA 02459',
    offset: [-0.003, -0.002],
    tags: ['hiking', 'woods', 'solitude', 'hidden gem', 'free'],
    rating: [4.5, 72],
  },
  {
    title: 'Nahanton Park Community Gardens',
    village: 'oak-hill',
    category: 'family-kids',
    summary:
      'Over a hundred garden plots on a sunny hillside — open to walk through, with a waitlist to grow.',
    description:
      'The community gardens are a lovely thing to walk through in August, when the plots are at full tilt: tomato jungles, sunflower walls, and gardeners happy to talk about what is working.\n\nPlots are city-managed with an annual fee and a real waitlist, but the paths are public. Great low-key outing with kids who like seeing where food comes from.',
    address: 'Nahanton Street, Oak Hill, MA 02459',
    offset: [0.0025, 0.0015],
    price: 'varies',
    recurrence: 'Daylight hours, April–November',
    tags: ['gardens', 'kids', 'walkthrough', 'free'],
    rating: [4.6, 55],
  },
  {
    title: 'Charles River Canoe Launch at Nahanton',
    village: 'oak-hill',
    category: 'fitness',
    summary:
      'Put in on the Charles’s quiet southern bend — no motorboats, no crowds, herons everywhere.',
    description:
      'This launch gives you the slowest, quietest water on the Newton stretch of the Charles. Paddle upstream toward Needham through marsh and overhanging trees and you will see more wildlife than people.\n\nBring your own boat — this is a launch, not a rental. Small gravel lot; get there before nine on summer weekends.',
    address: 'Nahanton Street launch, Oak Hill, MA 02459',
    offset: [0.0015, 0.0025],
    tags: ['kayak', 'canoe', 'wildlife', 'quiet water', 'free'],
    rating: [4.7, 61],
  },
  {
    title: 'Oak Hill Winter Sledding Hill',
    village: 'oak-hill',
    category: 'seasonal-events',
    summary: 'A long, open slope that becomes the neighborhood sledding destination after every storm.',
    description:
      'When Newton gets six inches, this is where Oak Hill goes. A long, wide, obstacle-free slope with a gentle side for little kids and a steeper line for the committed.\n\nNo lights, so daylight only. Street parking fills fast the morning after a storm — walk in if you can.',
    address: 'Brookline Street at Saw Mill Brook Parkway, Oak Hill, MA 02459',
    offset: [-0.0025, -0.0015],
    recurrence: 'After snowfall, December–March',
    tags: ['sledding', 'winter', 'family', 'free'],
    rating: [4.6, 94],
  },

  // ─── Thompsonville ─────────────────────────────────────────────────────────
  {
    title: 'Newton Community Farm',
    village: 'thompsonville',
    category: 'family-kids',
    summary:
      'The city’s last working farm — a farmstand, kids’ programs, and 300 years of continuous cultivation.',
    description:
      'Newton Community Farm sits on the last piece of continuously farmed land in the city, now run as a nonprofit teaching farm. There are laying hens, raised beds, a greenhouse, and a farmstand that opens in the afternoon with what was picked that morning.\n\nThe education programs — summer camp, preschool farm mornings, adult workshops on seed starting and beekeeping — are the real draw and do sell out. Walking the grounds is free.',
    address: '303 Nahanton Street, Thompsonville, MA 02459',
    offset: [0.001, 0.001],
    price: 'varies',
    recurrence: 'Farmstand Tue–Sat afternoons, June–October',
    website: 'https://newtoncommunityfarm.org',
    tags: ['farm', 'kids', 'CSA', 'workshops', 'hidden gem'],
    featured: true,
    rating: [4.9, 187],
  },
  {
    title: 'Farm Stand Afternoon Pickup',
    village: 'thompsonville',
    category: 'food-drink',
    summary:
      'Same-day-picked vegetables, eggs and flowers from a farmstand you can walk to from Newton Centre.',
    description:
      'The farmstand is small and the inventory is whatever came out of the ground that morning: greens, tomatoes, garlic scapes in June, squash in September, plus eggs and cut-flower bunches.\n\nCards accepted. Best selection right at opening; by the last hour the tomatoes are usually gone. CSA shares are available for the season.',
    address: '303 Nahanton Street, Thompsonville, MA 02459',
    offset: [0.0012, 0.0008],
    event: [{ days: [2, 3, 4, 5, 6], months: months(6, 10) }, '14:00', 4],
    recurrence: 'Tue–Sat afternoons, June–October',
    price: 'paid',
    priceMin: 3,
    priceMax: 25,
    tags: ['farmstand', 'local produce', 'eggs', 'flowers'],
    rating: [4.8, 96],
  },
  {
    title: 'Seed-to-Table Kids Workshop',
    village: 'thompsonville',
    category: 'family-kids',
    summary:
      'A ninety-minute farm session for ages 4–8: plant something, harvest something, eat something.',
    description:
      'Farm educators walk small groups through a full cycle in one session — sowing a tray, harvesting a bed, then washing and tasting whatever came up. Hands genuinely get dirty.\n\nRegistration required and caps at twelve kids; a caregiver stays. Runs most Saturdays in the growing season.',
    address: '303 Nahanton Street, Thompsonville, MA 02459',
    offset: [0.0008, 0.0012],
    event: [{ days: [6], months: months(5, 9) }, '09:30', 1.5],
    recurrence: 'Most Saturdays, May–September',
    price: 'paid',
    priceMin: 15,
    priceMax: 15,
    tags: ['workshop', 'ages 4-8', 'registration', 'farm'],
    rating: [4.9, 63],
  },
  {
    title: 'Fall Harvest Festival at the Farm',
    village: 'thompsonville',
    category: 'seasonal-events',
    summary:
      'Cider pressing, hayrides, a pie contest and live bluegrass on the farm’s one big public day.',
    description:
      'The harvest festival is the farm’s annual open house: hand-cranked cider pressing, wagon rides around the field, a fiercely contested pie competition, face painting, and a bluegrass trio on the barn side.\n\nSmall admission supports the farm’s education programs; kids under three are free. It sells out some years, so buy ahead.',
    address: '303 Nahanton Street, Thompsonville, MA 02459',
    offset: [0.0015, 0.0005],
    event: [{ days: [0], nth: 2, months: [10] }, '11:00', 5],
    recurrence: 'Second Sunday of October',
    price: 'paid',
    priceMin: 10,
    priceMax: 15,
    tags: ['harvest festival', 'cider', 'hayride', 'family', 'fall'],
    featured: true,
    rating: [4.8, 142],
  },
  {
    title: 'Thompsonville Neighborhood Loop Walk',
    village: 'thompsonville',
    category: 'fitness',
    summary:
      'A flat two-mile residential loop linking the farm, Nahanton Park and Winchester Street.',
    description:
      'Nothing dramatic — just a genuinely pleasant two-mile sidewalk loop through Newton’s smallest village, passing the farm, skirting Nahanton Park, and coming back along Winchester Street.\n\nFully paved and mostly shaded, which makes it a reliable stroller or dog walk. Add the Nahanton meadow trails for a third mile.',
    address: 'Winchester Street at Nahanton Street, Thompsonville, MA 02459',
    offset: [-0.0015, -0.001],
    tags: ['walking', 'dog-friendly', 'stroller-friendly', 'flat', 'free'],
    rating: [4.3, 37],
  },

  // ─── Waban ─────────────────────────────────────────────────────────────────
  {
    title: 'Cochituate Aqueduct Trail',
    village: 'waban',
    category: 'outdoors-parks',
    summary:
      'A dead-flat grassy path along a buried 19th-century aqueduct, running for miles through backyards and woods.',
    description:
      'The aqueduct trail is Newton’s best-kept walking secret: a level, grassy corridor built over the buried brick aqueduct that once carried Lake Cochituate water to Boston. It runs for miles, crossing streets at grade and slipping behind neighborhoods.\n\nFrom Waban you can walk toward Wellesley or east toward Newton Highlands. No hills, no traffic, very few people. Some sections are mown, some are rougher.',
    address: 'Beacon Street near Waban Square, Waban, MA 02468',
    offset: [0.001, 0.002],
    imageKey: 'cochituate-aqueduct',
    tags: ['walking', 'flat', 'hidden gem', 'dog-friendly', 'free'],
    featured: true,
    rating: [4.7, 121],
  },
  {
    title: 'Waban Square Coffee & Village Errands',
    village: 'waban',
    category: 'food-drink',
    summary:
      'One block, one coffee shop, one market, one pharmacy — the platonic ideal of a small village square.',
    description:
      'Waban Square is about as compact as a village center gets: a coffee shop with a bench out front, a small market, a pharmacy, and the D-branch station. That is nearly all of it, and it works.\n\nGrab a coffee, sit on the bench, and watch the Green Line come and go. Then walk five minutes to the aqueduct trailhead.',
    address: 'Beacon Street at Wyman Street, Waban, MA 02468',
    offset: [0.0005, 0.0005],
    price: 'paid',
    priceMin: 4,
    priceMax: 16,
    recurrence: 'Mon–Sat 7am–5pm, Sun 8am–3pm',
    tags: ['coffee', 'village square', 'T-accessible', 'quick stop'],
    rating: [4.5, 108],
  },
  {
    title: 'Angier Woods Short Loop',
    village: 'waban',
    category: 'family-kids',
    summary:
      'A twenty-minute wooded loop that feels like a real hike to a five-year-old.',
    description:
      'A small patch of woods behind the school with a genuine dirt trail, a couple of log crossings, and enough turns that kids lose track of where the car is. Perfect first-hike territory.\n\nTwenty to thirty minutes at a kid pace. Muddy in spring. Bring a bug net in June if your children are the kind who collect things.',
    address: 'Beethoven Avenue, Waban, MA 02468',
    offset: [-0.002, -0.001],
    tags: ['first hike', 'woods', 'ages 3-8', 'short', 'free'],
    rating: [4.4, 48],
  },
  {
    title: 'Waban Hill Tennis Courts',
    village: 'waban',
    category: 'fitness',
    summary: 'Public hard courts with a backboard, rarely a wait outside weekend mornings.',
    description:
      'Four public hard courts in good repair, with a practice backboard at one end — useful for solo sessions and for kids learning to rally.\n\nFirst-come, first-served with the usual local etiquette of one set when others are waiting. Weekday evenings are quiet; Saturday morning has a line.',
    address: 'Waban Avenue, Waban, MA 02468',
    offset: [0.002, -0.0015],
    recurrence: 'Daily, dawn to dusk',
    tags: ['tennis', 'public courts', 'backboard', 'free'],
    rating: [4.3, 57],
  },
  {
    title: 'Waban Village Winter Tree Lighting',
    village: 'waban',
    category: 'seasonal-events',
    summary:
      'A small, genuinely charming tree lighting in the square with carols, cocoa and a fire truck Santa.',
    description:
      'The Waban tree lighting is deliberately modest: the merchants association puts up a tree, a school chorus sings, someone hands out cocoa, and Santa arrives on a fire engine to the delight of every child present.\n\nStarts right after dusk in early December and lasts under an hour. Free, and one of the nicest small-town moments in the city.',
    address: 'Waban Square, Beacon Street, Waban, MA 02468',
    offset: [0.0008, 0.0008],
    event: [{ days: [6], nth: 1, months: [12] }, '16:30', 1],
    recurrence: 'First Saturday of December',
    tags: ['holiday', 'tree lighting', 'family', 'winter', 'free'],
    rating: [4.8, 87],
  },

  // ─── West Newton ───────────────────────────────────────────────────────────
  {
    title: 'West Newton Cinema',
    village: 'west-newton',
    category: 'arts-culture',
    summary:
      'A community-owned 1937 movie house showing indies, foreign film and matinee classics on six screens.',
    description:
      'The West Newton Cinema is the kind of theatre that communities fight to keep — and Newton did, buying it collectively when it was at risk. Six screens, real butter on the popcorn, and a program that mixes new independent releases with foreign film and weekend classics.\n\nMatinees are cheap, the seats are comfortable, and the lobby still looks like 1937 in the best way. Cash-and-card both fine; weekend evening shows sell out.',
    address: '1296 Washington Street, West Newton, MA 02465',
    offset: [0.0005, 0.001],
    imageKey: 'west-newton-cinema',
    price: 'paid',
    priceMin: 9,
    priceMax: 16,
    recurrence: 'Daily, first show around noon',
    website: 'https://westnewtoncinema.com',
    tags: ['cinema', 'indie film', 'rainy day', 'date night', 'historic'],
    featured: true,
    rating: [4.8, 356],
  },
  {
    title: 'West Newton Hill Architecture Walk',
    village: 'west-newton',
    category: 'arts-culture',
    summary:
      'Grand Victorians, Shingle Style porches and Colonial Revivals on Newton’s most photogenic hill.',
    description:
      'West Newton Hill has one of the densest concentrations of great 19th-century domestic architecture in Greater Boston — Queen Anne turrets, Shingle Style sweeps, and a few genuinely important Colonial Revival houses.\n\nA loop up Highland Street and back down Otis takes about an hour. It is entirely a public-sidewalk activity; please admire from the street. Best in late October.',
    address: 'Highland Street, West Newton, MA 02465',
    offset: [-0.002, 0.002],
    imageKey: 'west-newton-hill',
    tags: ['architecture', 'walking', 'self-guided', 'fall foliage', 'free'],
    rating: [4.6, 94],
  },
  {
    title: 'West Newton Main Street Dinner & a Movie',
    village: 'west-newton',
    category: 'food-drink',
    summary:
      'Eat on Washington Street, walk fifty feet to the cinema — Newton’s easiest night out.',
    description:
      'West Newton’s block of Washington Street has a pizza place, a sushi counter, a taqueria and a couple of full-service restaurants, all within a minute of the cinema door. Tell them you have a 7:15 show and they will pace it.\n\nBudget $20–$35 a head for dinner plus $14 for the film. Street parking is metered until 8pm; the lot behind the block is free evenings.',
    address: 'Washington Street, West Newton, MA 02465',
    offset: [0.001, -0.0005],
    price: 'paid',
    priceMin: 20,
    priceMax: 45,
    recurrence: 'Nightly, from 5pm',
    tags: ['dinner', 'walkable', 'date night', 'before the movie'],
    rating: [4.5, 172],
  },
  {
    title: 'Lower Falls Aqueduct to West Newton Ride',
    village: 'west-newton',
    category: 'fitness',
    summary:
      'A flat six-mile out-and-back on quiet streets and aqueduct paths, ending at coffee.',
    description:
      'A loop that stitches together low-traffic residential streets, a stretch of the Cochituate Aqueduct path, and the Charles River bank — about six miles of nearly flat riding with only a couple of real intersections.\n\nA hybrid or gravel bike is ideal; the aqueduct section is grass and dirt. Ends back on Washington Street where the coffee is.',
    address: 'Washington Street at Elm Street, West Newton, MA 02465',
    offset: [-0.001, -0.002],
    imageKey: 'cochituate-aqueduct',
    tags: ['cycling', 'flat', 'gravel', 'loop', 'free'],
    rating: [4.5, 66],
  },
  {
    title: 'West Newton Fourth of July Parade',
    village: 'west-newton',
    category: 'seasonal-events',
    summary:
      'Newton’s hometown Independence Day parade — decorated bikes, fire trucks, and a whole lot of candy.',
    description:
      'Newton’s Fourth of July celebration brings a genuinely old-fashioned parade down Washington Street: scout troops, the high school band, antique fire apparatus, and a long tail of kids on decorated bicycles anyone can join.\n\nStake out curb space by 9:30. Free. The city usually pairs it with a field day and evening fireworks elsewhere in the city — check the schedule.',
    address: 'Washington Street, West Newton, MA 02465',
    offset: [0.0015, 0.0005],
    event: [{ months: [7], date: 4 }, '10:00', 2],
    recurrence: 'Every July 4th',
    tags: ['parade', 'fourth of july', 'family', 'free', 'summer'],
    rating: [4.7, 198],
  },
];

/** Expand the compact rows into full Activity records. */
export const ACTIVITIES: Activity[] = ROWS.map((row, i) => {
  const village = VILLAGE_BY_SLUG.get(row.village);
  if (!village) throw new Error(`Unknown village slug in seed data: ${row.village}`);

  const [dLat, dLng] = row.offset ?? [0, 0];
  const priceType: PriceType = row.price ?? 'free';
  const [rule, time, hours] = row.event ?? [];
  const startAt = row.event ? nextOccurrence(rule!, time!) : null;
  const endAt =
    startAt && hours
      ? new Date(new Date(startAt).getTime() + hours * 3600_000).toISOString()
      : null;
  const [ratingAvg, ratingCount] = row.rating ?? [0, 0];

  /**
   * Real-photo resolution: a row naming a specific landmark (Echo Bridge,
   * Crystal Lake, ...) gets that landmark's verified photo; every other row
   * falls back to its own village's verified photo — always a real photo of
   * the correct place, never an unrelated stock image.
   */
  const landmark = row.imageKey ? LANDMARK_IMAGES[row.imageKey] : undefined;
  const imageUrl = landmark?.url ?? village.imageUrl;
  const imageCredit = landmark?.credit ?? village.imageCredit;
  const imageCreditUrl = landmark?.creditUrl ?? village.imageCreditUrl;

  return {
    id: `act_${String(i + 1).padStart(3, '0')}`,
    slug: slugify(row.title),
    title: row.title,
    summary: row.summary,
    description: row.description,
    villageSlug: row.village,
    categorySlug: row.category,
    address: row.address,
    lat: Number((village.lat + dLat).toFixed(6)),
    lng: Number((village.lng + dLng).toFixed(6)),
    imageUrl,
    imageCredit,
    imageCreditUrl,
    priceType,
    priceMin: row.priceMin ?? (priceType === 'free' ? 0 : null),
    priceMax: row.priceMax ?? null,
    isEvent: Boolean(row.event),
    startAt,
    endAt,
    recurrence: row.recurrence ?? null,
    website: row.website ?? null,
    phone: row.phone ?? null,
    tags: row.tags ?? [],
    featured: row.featured ?? false,
    ratingAvg,
    ratingCount,
    // Deterministic pseudo-analytics so the admin dashboard has something to show.
    viewCount: 120 + ((i * 137) % 2400),
    saveCount: 4 + ((i * 29) % 180),
  } satisfies Activity;
});

export const ACTIVITY_BY_SLUG = new Map(ACTIVITIES.map((a) => [a.slug, a]));
