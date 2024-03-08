/* eslint-disable no-unused-expressions */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-hooks */
/* eslint-disable new-cap */
import { expect } from 'chai';
import sinon from 'sinon';
import MongoClient from 'mongodb';
import dbClient from '../utils/db';

describe('dBClient', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('Constructor', () => {
    it('should initialize the db property when connected to MongoDB', () => {
      sinon.stub(MongoClient, 'connect').callsFake((url, options, callback) => {
        callback(null, {
          db: dbClient.db,
        });
      });

      expect(dbClient.db).to.exist;
    });

    it('should handle error when unable to connect to MongoDB', () => {
      // Stub MongoClient.connect to simulate error
      sinon.stub(MongoClient, 'connect').callsFake((url, options, callback) => {
        callback(new Error('Connection failed'));
      });

      const logSpy = sinon.spy(console, 'log');

      expect(logSpy.calledOnceWith('Error Connection failed')).to.be.true;
    });
  });

  describe('isAlive', () => {
    it('should return true if connected to MongoDB', () => {
      dbClient.db = {};

      expect(dbClient.isAlive()).to.be.true;
    });

    it('should return false if not connected to MongoDB', () => {
      dbClient.db = null;

      expect(dbClient.isAlive()).to.be.false;
    });
  });

  describe('nbUsers', () => {
    it('should return the number of users in the database', async () => {
      const countDocumentsStub = sinon.stub().returns(10);
      const collectionStub = sinon.stub(dbClient.db, 'collection').returns({ countDocuments: countDocumentsStub });

      const count = await dbClient.nbUsers();

      expect(count).to.equal(10);
      expect(collectionStub.calledOnceWith('users')).to.be.true;
      expect(countDocumentsStub.calledOnce).to.be.true;
    });

    it('should return 0 if not connected to MongoDB', async () => {
      sinon.stub(dbClient, 'isAlive').returns(false);

      const count = await dbClient.nbUsers();

      expect(count).to.equal(0);
    });
  });

  describe('nbFiles', () => {
    it('should return the number of files in the database', async () => {
      const countDocumentsStub = sinon.stub().returns(20);
      const collectionStub = sinon.stub(dbClient.db, 'collection').returns({ countDocuments: countDocumentsStub });

      const count = await dbClient.nbFiles();

      expect(count).to.equal(20);
      expect(collectionStub.calledOnceWith('files')).to.be.true;
      expect(countDocumentsStub.calledOnce).to.be.true;
    });

    it('should return 0 if not connected to MongoDB', async () => {
      sinon.stub(dbClient, 'isAlive').returns(false);

      const count = await dbClient.nbFiles();

      expect(count).to.equal(0);
    });
  });
});
