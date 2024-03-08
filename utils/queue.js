import Bull from 'bull';

export const fileQueue = new Bull('fileQueue');
export const userQueue = new Bull('userQueue');
