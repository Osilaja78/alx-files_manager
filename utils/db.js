import MongoClient from 'mongodb';

class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${DB_HOST}:${DB_PORT}`;

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.db = client.db(DB_DATABASE);
      } else {
        console.log(`Error ${err}`);
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
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
export default dbClient;
