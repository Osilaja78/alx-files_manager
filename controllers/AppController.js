import redisClient from "../utils/redis"
import dbClient from "../utils/db";

class AppController {
  static getStatus(_, res) {
    const isAlive = redisClient.isAlive();
    const isDb = dbClient.isAlive();

    res.status(200).send({ "redis": isAlive, "db": isDb });
  }

  static getStats(_, res) {
    const users = dbClient.nbUsers();
    const files = dbClient.nbFiles();

    res.status(200).send({ "users": users, "files": files });
  }
}

export default AppController;
