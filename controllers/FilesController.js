/* eslint-disable radix */
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import ObjectID from 'mongodb';
import dbClient from '../utils/db';
import UsersController from './UsersController';

class FilesController {
  static async postUpload(req, res) {
    try {
      const userId = await UsersController.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');

      const {
        name,
        type,
        parentId,
        isPublic,
        data,
      } = req.body;

      if (!name) return res.status(400).send('Missing name');
      const acceptedTypes = ['folder', 'file', 'image'];
      if (!type || !acceptedTypes.includes(type)) return res.status(400).send('Missing type');
      if (type !== 'folder' && !data) return res.status(400).send('Missing data');

      if (parentId) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
        if (!parentFile) return res.status(400).send('Parent not found');
        if (parentFile.type !== 'folder') return res.status(400).send('Parent is not a folder');
      }

      let localPath;
      if (type !== 'folder') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        await fs.mkdir(folderPath, { recursive: true });
        localPath = `${folderPath}/${uuidv4()}`;
        await fs.writeFile(localPath, Buffer.from(data, 'base64'));
      }

      const newFile = {
        userId,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath,
      };

      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json(result.ops[0]);
    } catch (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Server error');
    }
  }

  static async getShow(req, res) {
    try {
      const { id } = req.params;
      const userId = await UsersController.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');

      const fileId = id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(fileId) });
      if (!file || file.userId.toString() !== userId) return res.status(404).send('Not found');

      return res.json(file);
    } catch (err) {
      console.error('Error retrieving file:', err);
      return res.status(500).send('Server error');
    }
  }

  static async getIndex(req, res) {
    try {
      const userId = await UsersController.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');

      const parentId = req.query.parentId || '0';
      const page = parseInt(req.query.page) || 0;

      const pipeline = [
        { $match: { userId: new ObjectID(userId), parentId } },
        { $skip: page * 20 },
        { $limit: 20 },
      ];

      const [files] = await dbClient.database.collection('files').aggregate(pipeline).toArray();
      return res.json(files);
    } catch (err) {
      console.error('Error retrieving files:', err);
      return res.status(500).send('Server error');
    }
  }

  static async putPublish(req, res) {
    try {
      const userId = await UsersController.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');

      const { id } = req.params;
      const updateResult = await dbClient.db.collection('files').findOneAndUpdate(
        { _id: new ObjectID(id), userId: new ObjectID(userId) },
        { $set: { isPublic: true } },
        { returnOriginal: false },
      );

      if (!updateResult.value) return res.status(404).send('Not found');

      return res.json(updateResult.value);
    } catch (err) {
      console.error('Error publishing file:', err);
      return res.status(500).send('Server error');
    }
  }

  static async putUnpublish(req, res) {
    try {
      const userId = await UsersController.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');

      const { id } = req.params;
      const updateResult = await dbClient.database.collection('files').findOneAndUpdate(
        { _id: new ObjectID(id), userId: new ObjectID(userId) },
        { $set: { isPublic: false } },
        { returnOriginal: false },
      );

      if (!updateResult.value) return res.status(404).send('Not found');

      return res.json(updateResult.value);
    } catch (err) {
      console.error('Error unpublishing file:', err);
      return res.status(500).send('Server error');
    }
  }

  static async getFile(req, res) {
    try {
      const userId = await UsersController.getUserIdFromToken(req);

      const { fileId } = req.params;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(fileId) });
      if (!file) return res.status(404).send('Not found');

      // eslint-disable-next-line prefer-destructuring
      const isPublic = file.isPublic;
      const isOwner = userId && userId.toString() === file.userId.toString();
      if (!isPublic && !isOwner) return res.status(404).send('Not found');

      if (file.type === 'folder') return res.status(400).send('A folder doesn\'t have content');

      const filePath = file.localPath;
      const fileData = await fs.readFile(filePath);
      const mimeType = mime.lookup(file.name);

      res.contentType(mimeType);
      return res.send(fileData);
    } catch (err) {
      console.error('Error retrieving file content:', err);
      if (err.code === 'ENOENT') return res.status(404).send('Not found');
      return res.status(500).send('Server error');
    }
  }
}

export default FilesController;
