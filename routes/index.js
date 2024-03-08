import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const routes = express.Router();

// App Controllers
routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);

// Users Controllers
routes.post('/users', UsersController.postNew);
routes.get('/users/me', UsersController.getMe);

// Auth Controllers
routes.get('/connect', AuthController.getConnect);
routes.get('/disconnect', AuthController.getDisconnect);

// Files controller
routes.post('/files', FilesController.postUpload);
routes.get('/files/:id', FilesController.getShow);
routes.get('/files', FilesController.getIndex);
routes.put('/files/:id/publish', FilesController.putPublish);
routes.put('/files/:id/unpublish', FilesController.putUnpublish);
routes.get('/files/:id/data', FilesController.getFile);

export default routes;
