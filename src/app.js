import 'bootstrap';
import uniqueId from 'lodash/uniqueId';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import i18next from 'i18next';
import * as yup from 'yup';
import initView from './view';
import parse from './parseRSS';
import resources from './locales';
import { send, subscribe } from './api';

const subscribeToRSS = (url, watchedState, feedId) => {
  subscribe(url, (data) => {
    const { posts: receivedPosts } = parse(data);
    const { posts: statePosts } = watchedState;
    const mappedreceivedPosts = receivedPosts.map((item) => ({
      feedId,
      ...item,
    }));

    const newPosts = differenceWith(
      mappedreceivedPosts,
      statePosts,
      isEqual,
    );

    if (newPosts.length > 0) {
      // eslint-disable-next-line no-param-reassign
      watchedState.posts = [...newPosts, ...watchedState.posts];
    }
  });
};

const processRSS = (watchedState, url, data) => {
  const { title, description, posts } = parse(data);
  const feedId = uniqueId();
  const newFeed = {
    url,
    id: feedId,
    title,
    description,
  };
  const mappedPosts = posts.map((item) => ({ feedId, ...item }));

  watchedState.feeds = [newFeed, ...watchedState.feeds];
  watchedState.posts = [...mappedPosts, ...watchedState.posts];

  watchedState.error = null;
  watchedState.form.status = 'success';

  subscribeToRSS(url, watchedState, feedId);
};

const validateUrl = (url, feeds) => {
  const feedUrls = feeds.map((feed) => feed.url);
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(feedUrls);

  try {
    schema.validateSync(url);
    return null;
  } catch (error) {
    return error.type;
  }
};

const init = (i18n) => {
  yup.setLocale({
    string: {
      url: i18n.t('errors.url'),
    },
    mixed: {
      required: i18n.t('errors.required'),
      notOneOf: i18n.t('errors.unique'),
    },
  });

  const state = {
    form: {
      status: 'filling',
      error: null,
      valid: true,
    },
    error: null,
    posts: [],
    feeds: [],
    uiState: {
      readedPostsIds: new Set(),
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
    const formError = validateUrl(url, watchedState.feeds);

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
        processRSS(watchedState, url, data);
      })
      .catch((err) => {
        if (err.isAxiosError) {
          watchedState.form.error = 'networkError';
          watchedState.form.status = 'filling';
          return;
        }

        if (err.isParsingError) {
          watchedState.form.error = 'parsingError';
          watchedState.form.status = 'filling';
          return;
        }

        throw new Error(`Undefined error ${err.message}`);
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
