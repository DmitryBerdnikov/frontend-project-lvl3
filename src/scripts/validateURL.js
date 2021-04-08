import * as yup from 'yup';

const validateURL = yup
  .string()
  .test(
    'isEmpty',
    (value) => value.length !== 0,
  )
  .url();

export default (data) => validateURL.validate(data);
