import validateUrl from '../src/scripts/validateURL';

test('url validation', () => {
  const realUrl = 'http://yandex.ru';
  expect(validateUrl(realUrl)).toBeTruthy();

  // const fakeUrl = 'http:yandex.ru';
  // expect(() => validateUrl(fakeUrl)).toThrow('Ссылка должна быть валидным URL');

  // const emptyUrl = '';
  // expect(() => validateUrl(emptyUrl)).toThrow('Нужно заполнить поле');
});
