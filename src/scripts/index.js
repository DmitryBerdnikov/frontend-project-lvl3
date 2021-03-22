import * as yup from 'yup';

import '../styles/main.scss';

yup.setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

// Посмотреть можно ли сделать test(match)
// и также добавить на проверку пустой строки и написать текст ошибки пустой строки

const schema = yup.string().url();

document.querySelector('.js-form-rss').addEventListener('submit', (e) => {
  const { target } = e;
  const formData = new FormData(target);

  const inputUrl = target.elements.url;

  e.preventDefault();

  const url = formData.get('url');

  try {
    schema.validateSync(url);
  } catch (error) {
    const { parentNode } = inputUrl;

    parentNode.querySelector(
      '.invalid-feedback',
    ).textContent = error.errors.join();
    inputUrl.classList.add('is-invalid');
  }

  e.preventDefault();
});
