import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) return res.status(401).send('Unauthorized');

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');
      const { email, password } = credentials;

      if (!email || !password) return res.status(401).send('Unauthorized');

      const user = await dbClient.db.collection('users').findOne({ email });
      const hashedPassword = sha1(password);
      if (user.password !== hashedPassword) return res.status(401).send('Unauthorized');

      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
      return res.status(200).send({ token });
    } catch (err) {
      console.error('Error signing in:', err);
      return res.status(500).send('Server error');
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).send('Unauthorized');

      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (err) {
      console.error('Error signing out:', err);
      return res.status(500).send('Server error');
    }
  }
}

export default AuthController;
