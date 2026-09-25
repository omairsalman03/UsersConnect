import { Request, Response } from "express";
import { isS3Configured } from "../../utils/s3Config";
import { isSMTPConfigured } from "../../utils/smtpConfig";
import logger from "../../config/logger";
import { APP_VERSION } from "../../config/version";
import { getVisibleUpdateInfo, setDismissedNotice } from "../../services/updateCheckService";

export default class ConfigController
{
    isS3Enabled(request: Request, response: Response)
    {
        const s3Enabled = isS3Configured();
        response.json({ s3Enabled });
    }

    isSMTPEnabled(request: Request, response: Response)
    {
        const smtpEnabled = isSMTPConfigured();
        response.json({ smtpEnabled });
    }

    getVersion(request: Request, response: Response)
    {
        response.json({ version: APP_VERSION, update: getVisibleUpdateInfo() });
    }

    async dismissNotice(request: Request, response: Response)
    {
        const id = request.body?.id;
        if (typeof id !== 'string' || !/^[a-z0-9-]{1,100}$/.test(id))
        {
            return response.status(400).json({ message: "Invalid notice id" });
        }

        try
        {
            await setDismissedNotice(id);
            return response.status(204).send();
        }
        catch (error)
        {
            logger.error('Failed to dismiss notice:', error);
            return response.status(500).json({ message: "Could not dismiss notice" });
        }
    }
}