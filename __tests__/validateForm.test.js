import validateForm from '../src/scripts/validateForm';

test('validation form', () => {
  const realUrl = 'http://yandex.ru';
  expect(validateForm({ url: realUrl })).toBeTruthy();

  const fakeUrl = 'http:yandex.ru';
  expect(() => validateForm({ url: fakeUrl })).toThrow('Ссылка должна быть валидным URL');

  const emptyUrl = '';
  expect(() => validateForm({ url: emptyUrl })).toThrow('Нужно заполнить поле');
});
