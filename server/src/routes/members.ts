import { Router, Response, Request } from 'express';
import axios from "axios";

const router = Router();

interface Member {
    Name: string;
    Tools: string;
    STR: number;
    DEX: number;
    INT: number;
    WIS: number;
    CHA: number;
}

router.get('/', async (req: Request, res: Response) => {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
        console.warn('APPS_SCRIPT_URL not set — returning mock data.');
        return res.status(200).json([]);
    }

    try {
        const response = await axios.get(appsScriptUrl, {
            params: { type: "MEMBERS" }
        });

        if (response.status != 200) {
            throw new Error(`Apps Script responded with status ${response.status}`);
        }

        const data: Member = await response.data as Member;

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching from Apps Script:', error);
        return res.status(500).json({ error: 'Failed to retrieve forge blueprints from Google Sheets.' });
    }
});

export default router;
