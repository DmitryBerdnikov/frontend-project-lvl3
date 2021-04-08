export default class ParsingRSSError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParsingRSSError';
  }
}
