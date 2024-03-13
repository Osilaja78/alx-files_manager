import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { userQueue } from '../utils/queue';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const exitingEmail = await dbClient.db.collection('users').findOne({ email });

    if (exitingEmail) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    try {
      const newUser = await dbClient.db.collection('users').insertOne(
        { email, password: hashedPassword },
      );
      await userQueue.add({ userId: newUser.insertedId });
      return res.status(201).json({ email, id: newUser.insertedId });
    } catch (err) {
      // console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async getUserIdFromToken(req) {
    const token = req.headers['x-token'];
    if (!token) return null;

    const userId = await redisClient.get(`auth_${token}`);
    return userId;
  }

  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      return res.status(200).json({ email: user.email, id: user._id });
    } catch (err) {
      // console.error('Error retrieving user:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
