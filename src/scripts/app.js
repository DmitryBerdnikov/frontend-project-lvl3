import _ from 'lodash';
import i18next from 'i18next';
import * as yup from 'yup';
import initView from './view';
import parse from './parseRSS';
import resources from './locales';
import { send, subscribe } from './api';

const subscribeToRSS = (url, watchedState, feedId) => {
  subscribe(url, (data) => {
    try {
      const { posts } = parse(data);
      const addedPosts = watchedState.posts.filter(
        (item) => item.feedId === feedId,
      );
      const addedPostsTitles = addedPosts.map(({ title }) => title);
      const newPosts = posts
        .filter(({ title }) => !addedPostsTitles.includes(title))
        .map((item) => ({ feedId, ...item }));

      if (newPosts.length > 0) {
        watchedState.posts = [...newPosts, ...watchedState.posts]; // eslint-disable-line no-param-reassign
      }
    } catch (error) {
      console.log(error);
    }
  });
};

const validate = (value, items) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .test('unique', (item) => !items.includes(item));

  try {
    schema.validateSync(value);
    return null;
  } catch (error) {
    return error.type;
  }
};

const init = (i18n) => {
  const state = {
    form: {
      status: 'filling',
      error: null,
      valid: true,
    },
    error: null,
    RSSadded: [],
    posts: [],
    feeds: [],
    uiState: {
      readedPostsIds: [],
    },
  };

  const elements = {
    form: document.querySelector('.js-form-rss'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('.feedback'),
    input: document.querySelector('[name="url"]'),
    submitBtn: document.querySelector('[type="submit"]'),
  };

  const watchedState = initView(state, elements, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (watchedState.form.status === 'loading') {
      return;
    }

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const formError = validate(url, watchedState.RSSadded);

    if (formError) {
      watchedState.form.error = formError;
      watchedState.form.valid = false;
      return;
    }

    watchedState.form.error = null;
    watchedState.form.valid = true;
    watchedState.form.status = 'loading';

    send(url)
      .then((data) => {
        const { title, description, posts } = parse(data);
        const feedId = _.uniqueId();
        const newFeed = { id: feedId, title, description };
        const mappedPosts = posts.map((item) => {
          const id = _.uniqueId();
          return { id, feedId, ...item };
        });

        watchedState.feeds = [newFeed, ...watchedState.feeds];
        watchedState.posts = [...mappedPosts, ...watchedState.posts];
        watchedState.RSSadded = [url, ...watchedState.RSSadded];

        watchedState.form.error = null;
        watchedState.form.status = 'filling';
        watchedState.form.status = 'success';

        subscribeToRSS(url, watchedState, feedId);
      })
      .catch((error) => {
        watchedState.form.status = 'filling';
        watchedState.form.error = error.name;
      });
  });
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
