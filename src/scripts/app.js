import _ from 'lodash';
import i18next from 'i18next';
import watchState from './watchState';
import validateURL from './validateURL';
import parse from './parseRSS';
import resources from './locales';
import send from './api';
import { DuplicatedRSSError } from './errors';

const init = (i18n) => {
  const state = {
    form: {
      errorType: '',
      processState: 'filling',
    },
    RSSadded: [],
    posts: [],
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.js-form-rss'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  elements.input = elements.form.querySelector('[name="url"]');
  elements.feedback = elements.form.querySelector('.feedback');
  elements.submit = elements.form.querySelector('[type="submit"]');

  const watchedState = watchState(state, elements, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (watchedState.form.processState === 'sending') {
      return;
    }

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const normalizedURL = url.trim();

    try {
      if (watchedState.RSSadded.includes(normalizedURL)) {
        throw new DuplicatedRSSError();
      }
    } catch (error) {
      watchedState.form.errorType = error.name;
      return;
    }

    validateURL(normalizedURL, watchedState.RSSadded)
      .then(() => {
        watchedState.form.processState = 'sending';
        return send(url);
      })
      .then((data) => {
        const parsedData = parse(data.contents);
        const { title, description, posts } = parsedData;
        const id = _.uniqueId();

        const newFeed = { id, title, description };
        const mappedPosts = posts.map((item) => ({ id, ...item }));

        watchedState.feeds = [newFeed, ...watchedState.feeds];
        watchedState.posts = [...mappedPosts, ...watchedState.posts];
        watchedState.RSSadded = [url, ...watchedState.RSSadded];

        watchedState.form.errorType = '';
        watchedState.form.processState = 'success';
      })
      .catch((error) => {
        const { name } = error;
        const errorType = name === 'ValidationError' ? error.type : name;

        watchedState.form.errorType = errorType;
      })
      .finally(() => {
        watchedState.form.processState = 'filling';
      });
  });

  elements.form.elements.url.focus();
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => init(i18nInstance));
};
