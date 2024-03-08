import path from 'path';
import thumbnail from 'image-thumbnail';
import ObjectID from 'mongodb';
import dbClient from './utils/db';
import { fileQueue, userQueue } from './utils/queue';

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!userId) throw new Error('Missing userId');
  if (!fileId) throw new Error('Missing fileId');

  const file = await dbClient.db.collection('files').findOne({ _id: new ObjectID(fileId), userId: new ObjectID(userId) });
  if (!file) throw new Error('File not found');

  if (file.type !== 'image') return;

  const filePath = file.localPath;
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);

  const sizes = [500, 250, 100];
  for (const size of sizes) {
    const thumbnailPath = `${fileDir}/${fileName}_${size}.jpg`;
    try {
      // eslint-disable-next-line no-await-in-loop
      await thumbnail(filePath, { width: size, height: size, jpeg: {} });
      console.log(`Generated thumbnail: ${thumbnailPath}`);
    } catch (err) {
      console.error(`Error generating thumbnail for size ${size}:`, err);
    }
  }
});

fileQueue.on('error', (error) => {
  console.error('File Queue error:', error);
});

userQueue.process(async (job) => {
  const userId = job.data;

  if (!userId) throw new Error('Missing userId');

  const user = await dbClient.database.collection('users').findOne({ _id: new ObjectID(userId) });
  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
});

userQueue.on('error', (error) => {
  console.error('User Queue error:', error);
});
