import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(_, res) {
    const isAlive = redisClient.isAlive();
    const isDb = dbClient.isAlive();

    res.status(200).send({ redis: isAlive, db: isDb });
  }

  static async getStats(_, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    res.status(200).send({ users, files });
  }
}

export default AppController;
