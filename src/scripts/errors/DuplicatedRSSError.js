export default class DuplicatedRSSError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DuplicatedRSSError';
  }
}
