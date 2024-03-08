import dbClient from "../utils/db";
import sha1 from 'sha1';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.params;

    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }

    const exitingEmail = await dbClient.db.collection('users').findOne({ email });

    if (exitingEmail) {
      return res.status(400).send({ error: 'Already exist'})
    }

    const hashedPassword =  sha1(password);
    try {
      const newUser = await dbClient.db.collection('users').insertOne(
        { email, password: hashedPassword }
      );
      res.status(201).json({ email: email, id: newUser.insertedId });
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).send('Server error');
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
      const userId = await this.getUserIdFromToken(req);
      if (!userId) return res.status(401).send('Unauthorized');
  
      const user = await dbClient.db.collection('users').findOne({ _id: userId });
      return res.status(200).send({ email: user.email, id: user._id });
    } catch (err) {
      console.error('Error retrieving user:', err);
      return res.status(500).send('Server error');
    }
  }
}

export default UsersController;
