import { getDb } from "../db";
import { opportunities, activities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

interface NotebookLead {
    companyName: string;
    country: string;
    companyType: string;
    website?: string;
    opportunityScore: number;
    weaknesses?: string[];
    contactPerson?: string;
    notes?: string;
}

export async function importLeadsFromNotebook(leads: NotebookLead[], userId: number) {
    const db = await getDb();
    if (!db) {
        console.error("Database not available");
        return;
    }

    console.log(`Starting import of ${leads.length} leads for user ID: ${userId}...`);
    let importedCount = 0;
    let skippedCount = 0;

    for (const lead of leads) {
        try {
            // Check for duplicates based on company name
            const existing = await db
                .select()
                .from(opportunities)
                .where(eq(opportunities.companyName, lead.companyName))
                .limit(1);

            if (existing.length > 0) {
                console.log(`Skipping duplicate: ${lead.companyName}`);
                skippedCount++;
                continue;
            }

            // Create opportunity
            const result = await db
                .insert(opportunities)
                .values({
                    userId,
                    companyName: lead.companyName,
                    country: lead.country,
                    companyType: lead.companyType,
                    status: "contactado", // Default status for new leads
                    opportunityScore: lead.opportunityScore,
                    contactDate: new Date(),
                    lastActivityDate: new Date(),
                })
                .returning({ insertedId: opportunities.id });

            const opportunityId = result[0]?.insertedId;

            // Add initial note with details from NotebookLM
            const initialNotes = [
                lead.notes ? `Notas: ${lead.notes}` : "",
                lead.website ? `Website: ${lead.website}` : "",
                lead.contactPerson ? `Contacto: ${lead.contactPerson}` : "",
                lead.weaknesses && lead.weaknesses.length > 0 ? `Debilidades detectadas: ${lead.weaknesses.join(", ")}` : ""
            ].filter(Boolean).join("\n\n");

            if (initialNotes) {
                await db.insert(activities).values({
                    opportunityId: opportunityId,
                    type: "nota",
                    title: "Importado desde NotebookLM",
                    notes: initialNotes,
                });
            }

            importedCount++;
        } catch (error) {
            console.error(`Error importing ${lead.companyName}:`, error);
        }
    }

    console.log(`Import complete! Imported: ${importedCount}, Skipped: ${skippedCount}`);
}

// Example usage script (to be run manually or via API)
// Example usage script (to be run manually or via API)
import { fileURLToPath } from 'url';

async function runImport() {
    // Check if run directly
    const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
    if (isMainModule) {
        // MOCK DATA - Replace this with the JSON output from NotebookLM
        const mockLeads: NotebookLead[] = [
            {
                companyName: "Ejemplo Auto Haus Berlin",
                country: "Alemania",
                companyType: "Concesionario Oficial",
                website: "www.example-autohaus.de",
                opportunityScore: 8,
                weaknesses: ["Falta seguimiento online", "Inventario desactualizado"],
                contactPerson: "Hans Muller",
                notes: "Gran inventario de usados, pero web lenta."
            }
        ];

        // Default to user ID 1 (owner/admin) for now
        await importLeadsFromNotebook(mockLeads, 1);
        process.exit(0);
    }
}

runImport();
