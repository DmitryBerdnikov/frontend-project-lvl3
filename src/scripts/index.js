import axios from 'axios';
import validateForm from './validateForm';

import '../styles/main.scss';

const request = (url) => {
  const URL_FOR_CROSS_ORIGINS_REQUESTS = 'https://hexlet-allorigins.herokuapp.com/get';

  axios.get(`${URL_FOR_CROSS_ORIGINS_REQUESTS}?url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { data } = response;

      const parser = new DOMParser();

      const xmlString = data.contents;
      const doc1 = parser.parseFromString(xmlString, 'application/xml');

      console.log(doc1.querySelector('title'));

      console.log(doc1);
    });
};

request('https://ru.hexlet.io/lessons.rss');

document.querySelector('.js-form-rss').addEventListener('submit', (e) => {
  const { target } = e;
  const formData = new FormData(target);

  const inputUrl = target.elements.url;

  e.preventDefault();

  const url = formData.get('url');

  const { parentNode } = inputUrl;

  try {
    validateForm({ url });

    parentNode.querySelector(
      '.invalid-feedback',
    ).textContent = '';
    inputUrl.classList.remove('is-invalid');
  } catch (error) {
    parentNode.querySelector(
      '.invalid-feedback',
    ).textContent = error.errors.join();
    inputUrl.classList.add('is-invalid');
  }

  e.preventDefault();
});
