import axios from 'axios';
import _ from 'lodash';
import watchState from './watchState';
import validateURL from './validateURL';
import parse from './parse';

const send = (url) => {
  const URL_FOR_CROSS_ORIGINS_REQUESTS = 'https://hexlet-allorigins.herokuapp.com/get';

  const generatedUrl = new URL(URL_FOR_CROSS_ORIGINS_REQUESTS);
  generatedUrl.searchParams.set('url', url);

  return axios.get(generatedUrl).then((response) => {
    const { data } = response;

    if (data.status.error && data.status.error.code === 'ENOTFOUND') {
      throw new Error('Ошибка сети. Попробуйте снова или повторите попытку позже.');
    }

    return data;
  });
};

export default () => {
  const state = {
    form: {
      errorMessage: '',
      processState: 'filling',
    },
    addedRssUrls: [],
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

  const watchedState = watchState(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (watchedState.form.processState === 'sending') {
      return;
    }

    const formData = new FormData(e.target);
    const url = formData.get('url');

    validateURL(url, watchedState.addedRssUrls)
      .then(() => {
        watchedState.form.errorMessage = '';
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
        watchedState.addedRssUrls = [url, ...watchedState.addedRssUrls];

        watchedState.form.processState = 'success';
        watchedState.form.processState = 'filling';
      })
      .catch((error) => {
        watchedState.form.errorMessage = error.message;
        watchedState.form.processState = 'filling';
      });
  });
};
