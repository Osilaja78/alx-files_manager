import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
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
}

export default FilesController;
