import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const schema = yup.object().shape({
  url: yup
    .string()
    .test(
      'empty-check',
      'Нужно заполнить поле',
      (value) => value.length !== 0,
    )
    .url(),
});

export default (formData) => schema.validateSync(formData);
