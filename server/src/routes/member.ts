import { Router, Response, Request } from 'express';
import axios from "axios";
import { Member } from './members';
import requireAuth from "../middleware/requireAuth";
import _ from "underscore";

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
    const { Name, Tools, STR, DEX, INT, WIS, CHA } = req.body;

    const member:Member = {
        Name,
        Tools,
        STR,
        DEX,
        INT,
        WIS,
        CHA
    }

    try {
        const appsScriptUrl = process.env.APPS_SCRIPT_URL;
        if (!appsScriptUrl) {
            console.warn('APPS_SCRIPT_URL not set — returning mock data.');
            return res.status(500).json([]);
        }

        // Verify the order exists first
        const response = await axios.get(appsScriptUrl, {
            params: { type: "MEMBERS" }
        });

        if (response.status != 200) {
            throw new Error(`Apps Script responded with status ${response.status}`);
        }

        const memberFound = _.find(response.data.members, (o: Member) => o.Name === Name);
        if (memberFound) {
            return res.status(404).json({ error: 'Member Info already exists.' });
        }

        const patchResponse = await axios.post(appsScriptUrl, {
            action:  "ADD_MEMBER",
            member,
        });

        return res.status(patchResponse.status).json(patchResponse.data);
    }
    catch (error) {
        console.error('Error adding order:', error);
        return res.status(500).json({ error: 'Failed to add member info.' });
    }
})

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    const { Name, Tools, STR, DEX, INT, WIS, CHA } = req.body;

    try {
        const appsScriptUrl = process.env.APPS_SCRIPT_URL;
        if (!appsScriptUrl) {
            console.warn('APPS_SCRIPT_URL not set — returning mock data.');
            return res.status(500).json([]);
        }

        // Verify the order exists first
        const response = await axios.get(appsScriptUrl, {
            params: { type: "MEMBERS" }
        });

        if (response.status != 200) {
            throw new Error(`Apps Script responded with status ${response.status}`);
        }

        const order = _.find(response.data.members, (o: Member) => o.Name === Name);
        if (!order) {
            return res.status(404).json({ error: 'Member Info not found.' });
        }

        const updates: Record<string, any> = {};
        updates.Name      = Name;
        updates.Tools     = Tools;
        updates.STR       = STR;
        updates.DEX       = DEX;
        updates.INT       = INT;
        updates.WIS       = WIS;
        updates.CHA       = CHA;

        const patchResponse = await axios.post(appsScriptUrl, {
            action:  "UPDATE_MEMBER",
            name:    Name,
            updates: updates,
        });

        return res.status(patchResponse.status).json(patchResponse.data);
    }
    catch (error) {
        console.error('Error updating order:', error);
        return res.status(500).json({ error: 'Failed to update member info.' });
    }
});

export default router;
