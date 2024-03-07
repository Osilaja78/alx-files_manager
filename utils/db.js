import MongoClient from 'mongodb';


class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}`);
    this.database = this.client.db(DB_DATABASE);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    if (!this.isAlive()) return 0;
    try {
      const usersCollection = this.database.collection('users');
      const count = usersCollection.countDocuments();
      return count;
    } catch (err) {
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isAlive()) return 0;
    try {
      const filesCollection = this.database.collection('files');
      const count = filesCollection.countDocuments();
      return count;
    } catch (err) {
      return 0;
    }
  }
}

const dbClient = new DBClient();
dbClient.connect();
export default dbClient;
