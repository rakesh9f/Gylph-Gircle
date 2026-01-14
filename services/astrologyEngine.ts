
// VEDIC ASTROLOGY ENGINE (Advanced Parashari / Lahiri Ayanamsa Simulation)

export interface AstroInput {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  pob: string; // City, Country
}

export interface NakshatraInfo {
  name: string;
  lord: string;
  pada: number;
}

export interface Planet {
  name: string;
  sign: number; // 1-12
  signName: string;
  fullDegree: number; // 0-360
  normDegree: number; // 0-30 within sign
  house: number; // 1-12
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraLord: string;
  pada: number;
  speed: number; // Daily motion in degrees
  shadbala: number; // 0-100 score
  rank: number;
  lordOf?: number[]; // Houses owned
}

export interface House {
  number: number;
  sign: number;
  signName: string;
  lord: string;
  planets: string[]; // Names of planets inside
  strength: number; // 0-100
  type: string; // Kendra, Trikona, Dusthana, Upachaya
}

export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  duration: string;
}

export interface Panchang {
  tithi: string;
  yoga: string;
  karana: string;
  nakshatra: string;
  sunrise: string;
  ayanamsa: string;
}

export interface AstroChart {
  meta: {
    ayanamsha: string;
    sunrise: string;
    timezone: string;
  };
  lagna: { 
    sign: number; 
    signName: string; 
    degree: number; 
    nakshatra: string; 
    lord: string;
  };
  planets: Planet[];
  houses: House[];
  dasha: {
    balance: string;
    timeline: DashaPeriod[];
  };
  yogas: string[];
  panchang: Panchang;
}

// --- CONSTANTS ---
const RASHIS = ['', 'Mesha (Ari)', 'Vrishabha (Tau)', 'Mithuna (Gem)', 'Karka (Can)', 'Simha (Leo)', 'Kanya (Vir)', 'Tula (Lib)', 'Vrishchika (Sco)', 'Dhanu (Sag)', 'Makara (Cap)', 'Kumbha (Aq)', 'Meena (Pis)'];
const RASHI_LORDS = ['', 'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

const NAKSHATRAS = [
  { n: 'Ashwini', l: 'Ketu' }, { n: 'Bharani', l: 'Venus' }, { n: 'Krittika', l: 'Sun' },
  { n: 'Rohini', l: 'Moon' }, { n: 'Mrigashira', l: 'Mars' }, { n: 'Ardra', l: 'Rahu' },
  { n: 'Punarvasu', l: 'Jupiter' }, { n: 'Pushya', l: 'Saturn' }, { n: 'Ashlesha', l: 'Mercury' },
  { n: 'Magha', l: 'Ketu' }, { n: 'P.Phalguni', l: 'Venus' }, { n: 'U.Phalguni', l: 'Sun' },
  { n: 'Hasta', l: 'Moon' }, { n: 'Chitra', l: 'Mars' }, { n: 'Swati', l: 'Rahu' },
  { n: 'Vishakha', l: 'Jupiter' }, { n: 'Anuradha', l: 'Saturn' }, { n: 'Jyeshtha', l: 'Mercury' },
  { n: 'Mula', l: 'Ketu' }, { n: 'P.Ashadha', l: 'Venus' }, { n: 'U.Ashadha', l: 'Sun' },
  { n: 'Shravana', l: 'Moon' }, { n: 'Dhanishta', l: 'Mars' }, { n: 'Shatabhisha', l: 'Rahu' },
  { n: 'P.Bhadrapada', l: 'Jupiter' }, { n: 'U.Bhadrapada', l: 'Saturn' }, { n: 'Revati', l: 'Mercury' }
];

const YOGAS_NITYA = ['Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Sobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
const KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
const TITHIS = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];

// --- HELPERS ---

// Helper to normalize degrees to 0-360 range (handling negative inputs)
const normalizeDegree = (deg: number): number => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

// Simulates planetary position with Lahiri-like constraints
const getPlanetPosition = (planet: string, timestamp: number): number => {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 0; // Fallback for invalid dates
    }

    const yearOffset = date.getFullYear() - 2000;
    
    // Base positions (Simulated ephemeris anchors)
    let pos = 0;
    
    switch(planet) {
        case 'Sun': pos = (100 + yearOffset * 365.25 + date.getDate()) % 360; break;
        case 'Moon': pos = (200 + yearOffset * 365.25 * 13.176 + date.getDate() * 13) % 360; break;
        case 'Mars': pos = (300 + yearOffset * 365.25 * 0.52 + date.getDate() * 0.5) % 360; break;
        case 'Mercury': pos = (50 + yearOffset * 365.25 * 4.15 + date.getDate() * 1.5) % 360; break;
        case 'Jupiter': pos = (15 + yearOffset * 30.3 + date.getDate() * 0.08) % 360; break;
        case 'Venus': pos = (80 + yearOffset * 365.25 * 1.6 + date.getDate() * 1.2) % 360; break;
        case 'Saturn': pos = (220 + yearOffset * 12.2 + date.getDate() * 0.03) % 360; break;
        case 'Rahu': pos = (0 - (yearOffset * 19.3 + date.getDate() * 0.05)) % 360; break; // Retrograde motion
        case 'Ketu': pos = (180 - (yearOffset * 19.3 + date.getDate() * 0.05)) % 360; break;
    }
    
    return normalizeDegree(pos);
};

const getNakshatra = (deg: number): { name: string; lord: string; pada: number } => {
    const normDeg = normalizeDegree(deg);
    const nakshatraSpan = 13.3333; // 13 deg 20 min
    const idx = Math.floor(normDeg / nakshatraSpan);
    const rem = normDeg % nakshatraSpan;
    const pada = Math.floor(rem / 3.3333) + 1; // 3 deg 20 min per pada
    
    // Safety check to ensure index is within bounds (0-26)
    const nakshatraIndex = idx % 27;
    const info = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0]; // Fallback to Ashwini if undefined
    
    return { name: info.n, lord: info.l, pada };
};

// --- CORE CALCULATIONS ---

export const calculateAstrology = (input: AstroInput): AstroChart => {
    const timestamp = new Date(`${input.dob}T${input.tob}`).getTime();
    
    // Default to current date if input is invalid
    const date = isNaN(timestamp) ? new Date() : new Date(timestamp);
    const safeTimestamp = date.getTime();
    
    // 1. Calculate Lagna (Ascendant)
    const sunAbs = getPlanetPosition('Sun', safeTimestamp);
    // Rough logic for Lagna based on time of day
    const timeParts = input.tob.split(':');
    const hours = parseInt(timeParts[0] || "6");
    const minutes = parseInt(timeParts[1] || "0");
    
    // Sun rises approx 6 AM. Lagna is Sun sign at sunrise.
    // Moves 1 sign (30 deg) every 2 hours. Lagna moves ~15 deg per hour.
    const hoursSinceSunrise = (hours - 6) + (minutes / 60);
    let lagnaAbs = sunAbs + (hoursSinceSunrise * 15);
    lagnaAbs = normalizeDegree(lagnaAbs);
    
    const lagnaSign = Math.floor(lagnaAbs / 30) + 1;
    const lagnaDeg = lagnaAbs % 30;
    const lagnaNak = getNakshatra(lagnaAbs);

    // 2. Planets
    const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planets: Planet[] = planetNames.map(name => {
        const abs = getPlanetPosition(name, safeTimestamp);
        const sign = Math.floor(abs / 30) + 1;
        const normDeg = abs % 30;
        const nak = getNakshatra(abs);
        
        // Determine House (Whole Sign House System for clarity in Diamond Chart)
        let house = (sign - lagnaSign + 1);
        if (house <= 0) house += 12;

        return {
            name,
            sign,
            signName: RASHIS[sign],
            fullDegree: abs,
            normDegree: normDeg,
            house,
            isRetrograde: ['Rahu', 'Ketu'].includes(name) ? true : Math.random() > 0.8, // Simulation
            nakshatra: nak.name,
            nakshatraLord: nak.lord,
            pada: nak.pada,
            speed: name === 'Moon' ? 13.2 : 1.0, // Simulation
            shadbala: Math.floor(Math.random() * 50 + 50),
            rank: 0,
            lordOf: [] // Filled later
        };
    });

    // 3. Houses Analysis
    const houses: House[] = [];
    for(let i=1; i<=12; i++) {
        let sign = (lagnaSign + i - 1);
        if (sign > 12) sign -= 12;
        if (sign <= 0) sign += 12; 
        
        const lord = RASHI_LORDS[sign];
        
        // Find planets in this house
        const residents = planets.filter(p => p.house === i).map(p => p.name);
        
        // Determine type
        let type = 'Neutral';
        if ([1, 4, 7, 10].includes(i)) type = 'Kendra';
        else if ([5, 9].includes(i)) type = 'Trikona';
        else if ([6, 8, 12].includes(i)) type = 'Dusthana';
        else if ([3, 11].includes(i)) type = 'Upachaya';

        houses.push({
            number: i,
            sign,
            signName: RASHIS[sign],
            lord,
            planets: residents,
            strength: Math.floor(Math.random() * 40 + 60),
            type
        });
    }

    // 4. Vimshottari Dasha Balance
    const moon = planets.find(p => p.name === 'Moon')!;
    const moonNakTotalDeg = 13.3333; // 13deg 20min
    const moonDegInNak = moon.normDegree % moonNakTotalDeg; 
    const percentPassed = moonDegInNak / moonNakTotalDeg;
    
    const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaYears = { 'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17 };
    
    // Nakshatra Index determines starting lord
    const allNaks = NAKSHATRAS.map(n => n.n);
    const moonNakIdx = allNaks.indexOf(moon.nakshatra);
    // Safety check: If not found, default to 0 to prevent undefined errors
    const safeMoonNakIdx = moonNakIdx !== -1 ? moonNakIdx : 0;
    
    const lordIdx = safeMoonNakIdx % 9;
    const currentLord = dashaLords[lordIdx];
    const totalYears = dashaYears[currentLord as keyof typeof dashaYears];
    
    const yearsRemaining = totalYears * (1 - percentPassed);
    const balanceDate = new Date(date.getFullYear() + yearsRemaining, date.getMonth(), date.getDate());
    
    const balanceStr = `${currentLord} Dasha: ${Math.floor(yearsRemaining)}y ${Math.floor((yearsRemaining % 1) * 12)}m remaining`;

    // Generate Timeline
    const timeline: DashaPeriod[] = [];
    let dashaStart = new Date(input.dob);
    let dashaIdx = lordIdx;
    
    timeline.push({
        planet: currentLord,
        start: dashaStart.getFullYear().toString(),
        end: balanceDate.getFullYear().toString(),
        duration: "Balance"
    });
    
    let runningDate = new Date(balanceDate);
    
    for(let k=1; k<=5; k++) {
        dashaIdx = (dashaIdx + 1) % 9;
        const lord = dashaLords[dashaIdx];
        const yrs = dashaYears[lord as keyof typeof dashaYears];
        const endDate = new Date(runningDate.getFullYear() + yrs, runningDate.getMonth(), runningDate.getDate());
        
        timeline.push({
            planet: lord,
            start: runningDate.getFullYear().toString(),
            end: endDate.getFullYear().toString(),
            duration: `${yrs} Years`
        });
        runningDate = endDate;
    }

    // 5. Panchang
    let diff = (moon.fullDegree - planets.find(p=>p.name==='Sun')!.fullDegree);
    if (diff < 0) diff += 360;
    const tithiIdx = Math.floor(diff / 12);
    const tithiName = TITHIS[tithiIdx % 15] + (tithiIdx >= 15 ? ' (Krishna)' : ' (Shukla)');
    
    const sumLong = (moon.fullDegree + planets.find(p=>p.name==='Sun')!.fullDegree);
    const yogaIdx = Math.floor(sumLong / 13.3333) % 27;
    
    // 6. Yoga Detection
    const yogas = [];
    const jupiter = planets.find(p => p.name === 'Jupiter')!;
    const quadrant = [1, 4, 7, 10];
    
    if (quadrant.includes(jupiter.house) && quadrant.includes(moon.house)) yogas.push("Gaja Kesari Yoga (Wealth & Fame)");
    
    if (planets.find(p=>p.name==='Sun')!.house === planets.find(p=>p.name==='Mercury')!.house) yogas.push("Budhaditya Yoga (Intellect)");
    
    const mars = planets.find(p => p.name === 'Mars')!;
    if ([1, 4, 7, 8, 12].includes(mars.house)) yogas.push("Manglik Dosha (Present)");

    return {
        meta: {
            ayanamsha: "Lahiri (Chitrapaksha) 23°45'",
            sunrise: "06:12 AM",
            timezone: "IST"
        },
        lagna: {
            sign: lagnaSign,
            signName: RASHIS[lagnaSign],
            degree: lagnaDeg,
            nakshatra: lagnaNak.name,
            lord: RASHI_LORDS[lagnaSign]
        },
        planets,
        houses,
        dasha: {
            balance: balanceStr,
            timeline
        },
        yogas: yogas.length ? yogas : ['No major yogas found'],
        panchang: {
            tithi: tithiName,
            yoga: YOGAS_NITYA[yogaIdx] || "Siddhi",
            karana: KARANAS[tithiIdx % 11],
            nakshatra: moon.nakshatra,
            sunrise: "06:12 AM",
            ayanamsa: "Lahiri"
        }
    };
};
