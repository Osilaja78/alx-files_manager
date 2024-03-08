import Bull from 'bull';

const fileQueue = new Bull('fileQueue');

module.exports = fileQueue;
