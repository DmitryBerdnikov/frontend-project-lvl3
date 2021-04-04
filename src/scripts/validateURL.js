import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const urlValidation = yup
  .string()
  .test('empty-check', 'Нужно заполнить поле', (value) => value.length !== 0)
  .test('existing-value-test', 'RSS уже добавлен', function wasAdded(value) {
    return !this.options.context.includes(value);
  })
  .url();

export default (data, existingValues = []) => urlValidation
  .validate(data, { context: existingValues });
