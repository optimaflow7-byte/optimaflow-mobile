import "dotenv/config";
import axios from 'axios';
import { getDb } from '../db';
import { europeanDealerships } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Query for car dealerships in Madrid as a test sample
const QUERY = `
[out:json][timeout:25];
area[name="Madrid"]->.searchArea;
(
  node["shop"="car"](area.searchArea);
  way["shop"="car"](area.searchArea);
);
out center;
`;

async function fetchOSMData() {
    console.log('Connecting to database...');
    const db = await getDb();
    if (!db) {
        console.error('DB not available');
        return;
    }

    console.log('Fetching data from Overpass API (Madrid Area)...');
    try {
        const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(QUERY)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        if (!data.elements) {
            console.error('No elements found in OSM response');
            return;
        }

        console.log(`Found ${data.elements.length} potential dealerships. Processing...`);

        let inserted = 0;
        let skipped = 0;

        for (const el of data.elements) {
            const tags = el.tags || {};
            // Nodes have lat/lon, Ways have center.lat/center.lon if 'out center' is used
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;

            if (!tags.name) {
                skipped++;
                continue;
            }

            // Map data to our schema
            const dealership = {
                name: tags.name,
                brand: tags.brand,
                country: tags['addr:country'] || 'España',
                city: tags['addr:city'] || 'Madrid',
                address: `${tags['addr:street'] || ''} ${tags['addr:housenumber'] || ''}`.trim() || undefined,
                postalCode: tags['addr:postcode'],
                phone: tags.phone || tags['contact:phone'],
                website: tags.website || tags['contact:website'],
                latitude: lat,
                longitude: lon,
                osmId: el.id
            };

            // Insert
            try {
                await db.insert(europeanDealerships)
                    .values(dealership)
                    .onConflictDoNothing({ target: europeanDealerships.osmId });
                inserted++;
            } catch (e) {
                console.error(`Failed to insert ${tags.name}:`, e);
            }
        }

        console.log(`Given ${data.elements.length} elements:`);
        console.log(`- Inserted/Updated: ${inserted}`);
        console.log(`- Skipped (no name): ${skipped}`);
        process.exit(0);

    } catch (error) {
        console.error('Error fetching/processing data:', error);
        process.exit(1);
    }
}

fetchOSMData();
