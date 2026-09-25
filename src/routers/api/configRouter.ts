import { Router } from 'express';
import ConfigController from '../../controllers/api/configController';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';
import { isAdmin } from '../../middlewares/auth/isAdmin';

const configController = new ConfigController();

const ConfigRouter = Router();

ConfigRouter.use('/', isAuthenticated);

ConfigRouter.get('/s3', configController.isS3Enabled);

ConfigRouter.get('/smtp', configController.isSMTPEnabled);

ConfigRouter.get('/version', isAdmin, configController.getVersion);

ConfigRouter.put('/notice/dismissed', isAdmin, configController.dismissNotice);

export default ConfigRouter;