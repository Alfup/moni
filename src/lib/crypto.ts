import { supabase } from './supabase';

interface CryptoData {
  price: number;
  marketCap: number;
  "24hVolume": number;
  change: number;
  rank: number;
}

// Increase cache duration to reduce API calls
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const API_TIMEOUT = 8000; // 8 seconds timeout
const RETRY_DELAY = 1000; // 1 second between retries
const MAX_RETRIES = 2; // Maximum number of API retry attempts

const coinIds = {
  eth: 'razxDUgYGNAdQ',
  bsc: 'WcwrkfNI4FUAe',
  arb: '1Uo6s62Oc',
  base: 'aFCovYtljC',
  mult: 'omwkOTglq',
  pol: 'iDZ0tG-wI',
  sol: 'zNZHO_Sjf',
  tron: 'qUhEFk1I61atv'
} as const;

// Fallback data in case API and database both fail
const fallbackData: Record<string, CryptoData> = {
  eth: { price: 2317.32, marketCap: 279420000000, "24hVolume": 25090000000, change: -5.33, rank: 2 },
  bsc: { price: 605.27, marketCap: 91000000000, "24hVolume": 1120000000, change: -2.74, rank: 5 },
  arb: { price: 0.43, marketCap: 1900000000, "24hVolume": 143990000, change: 0.66, rank: 59 },
  base: { price: 2398.28, marketCap: 12570000, "24hVolume": 2660000, change: -4.18, rank: 3416 },
  mult: { price: 21.81, marketCap: 609940000, "24hVolume": 29850000, change: 0.56, rank: 116 },
  pol: { price: 0.28, marketCap: 2390000000, "24hVolume": 120400000, change: -0.40, rank: 49 },
  sol: { price: 149.32, marketCap: 72900000000, "24hVolume": 2870000000, change: 1.25, rank: 6 },
  tron: { price: 0.23, marketCap: 19730000000, "24hVolume": 1110000000, change: -1.02, rank: 11 }
};

// In-memory cache
const cache = new Map<string, { data: CryptoData; timestamp: number }>();

// Sleep function for retry mechanism
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCryptoData(planet: string): Promise<CryptoData | null> {
  try {
    const normalizedPlanet = planet.toLowerCase();
    
    if (!coinIds[normalizedPlanet as keyof typeof coinIds]) {
      console.warn(`Invalid planet: ${planet}`);
      return fallbackData[normalizedPlanet] || null;
    }

    // Check memory cache first
    const cachedData = cache.get(normalizedPlanet);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    // Try to get data from database first to reduce API calls
    try {
      const { data: dbData } = await supabase
        .from('crypto_data')
        .select('*')
        .eq('planet', normalizedPlanet)
        .single();

      if (dbData && new Date(dbData.updated_at) > new Date(Date.now() - CACHE_DURATION)) {
        const cryptoData = {
          price: Number(dbData.price),
          marketCap: Number(dbData.market_cap),
          "24hVolume": Number(dbData.volume_24h),
          change: Number(dbData.change_24h),
          rank: dbData.rank
        };

        // Update memory cache
        cache.set(normalizedPlanet, {
          data: cryptoData,
          timestamp: Date.now()
        });

        return cryptoData;
      }
    } catch (dbError) {
      console.warn('Failed to fetch from database:', dbError);
    }

    // If database doesn't have fresh data, try API with retry mechanism
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Add random delay between retries to avoid hitting rate limits simultaneously
        if (attempt > 0) {
          await sleep(RETRY_DELAY + Math.random() * 1000);
        }

        const response = await fetch(
          `https://api.coinranking.com/v2/coin/${coinIds[normalizedPlanet as keyof typeof coinIds]}`,
          {
            headers: {
              'x-access-token': 'coinranking3dc21bcfbf427db91bdb338105fdba2a948b081530382ec2',
              // Add cache control headers to help with API caching
              'Cache-Control': 'max-age=7200',
              'Pragma': 'no-cache'
            },
            signal: AbortSignal.timeout(API_TIMEOUT)
          }
        );

        if (response.status === 429) {
          console.warn(`Rate limit hit on attempt ${attempt + 1}, retrying...`);
          if (attempt === MAX_RETRIES) {
            throw new Error('Rate limit exceeded after all retry attempts');
          }
          continue; // Try again after delay
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result?.data?.coin) {
          throw new Error('Invalid API response format');
        }

        const apiData = result.data.coin;
        const cryptoData = {
          price: Number(apiData.price),
          marketCap: Number(apiData.marketCap),
          "24hVolume": Number(apiData["24hVolume"]),
          change: Number(apiData.change),
          rank: apiData.rank
        };

        // Update memory cache
        cache.set(normalizedPlanet, {
          data: cryptoData,
          timestamp: Date.now()
        });

        // Try to update database if available
        try {
          await supabase
            .from('crypto_data')
            .upsert({
              planet: normalizedPlanet,
              price: apiData.price,
              market_cap: apiData.marketCap,
              volume_24h: apiData["24hVolume"],
              change_24h: apiData.change,
              rank: apiData.rank,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'planet'
            });
        } catch (dbError) {
          console.warn('Failed to update database:', dbError);
        }

        return cryptoData;
      } catch (apiError) {
        console.warn(`API request failed on attempt ${attempt + 1}:`, apiError);
        if (attempt === MAX_RETRIES) {
          // All retries failed, use fallback data
          console.warn('All API retries failed, using fallback data');
          
          // Return fallback data as last resort
          const fallbackCryptoData = fallbackData[normalizedPlanet];
          if (fallbackCryptoData) {
            // Still cache the fallback data to prevent repeated failures
            cache.set(normalizedPlanet, {
              data: fallbackCryptoData,
              timestamp: Date.now() - CACHE_DURATION/2 // Set to half expired so we retry sooner
            });
            return fallbackCryptoData;
          }
        }
      }
    }

    return fallbackData[normalizedPlanet] || null;
  } catch (error) {
    console.error('Error in getCryptoData:', error);
    return fallbackData[planet.toLowerCase()] || null;
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);