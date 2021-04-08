import onChange from 'on-change';

const removeAllChildes = (element) => {
  while (element.firstChild) {
    element.removeChild(element.lastChild);
  }
};

const renderFeeds = ({ feeds: feedsEl }, feeds, i18n) => {
  const titleEl = document.createElement('h2');
  titleEl.textContent = i18n.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const h3 = document.createElement('h3');
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.textContent = feed.description;

    li.append(h3, p);
    ul.append(li);
  });

  removeAllChildes(feedsEl);
  feedsEl.append(titleEl, ul);
};

const renderPosts = ({ posts: postsEl }, posts, i18n) => {
  const titleEl = document.createElement('h2');
  titleEl.textContent = i18n.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach(({ title, link }) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );

    const linkEl = document.createElement('a');
    linkEl.classList.add('font-weight-bold');
    linkEl.textContent = title;
    linkEl.href = link;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.textContent = i18n.t('view');

    li.append(linkEl, button);
    ul.append(li);
  });

  removeAllChildes(postsEl);
  postsEl.append(titleEl, ul);
};

const renderMessage = ({ input, feedback }, message, type = 'success') => {
  feedback.textContent = ''; // eslint-disable-line no-param-reassign
  feedback.classList.remove('text-success', 'invalid-feedback');
  input.classList.remove('is-invalid');

  if (message === '') {
    return;
  }

  switch (type) {
    case 'success':
      feedback.classList.add('text-success');
      break;
    case 'error':
      feedback.classList.add('invalid-feedback');
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Undefined type ${type} for renderMessage`);
  }

  feedback.textContent = message; // eslint-disable-line no-param-reassign
};

const processStateHandler = (elements, processState, i18n) => {
  switch (processState) {
    case 'filling':
      elements.submit.removeAttribute('disabled');
      break;
    case 'sending':
      elements.submit.setAttribute('disabled', true);
      break;
    case 'success':
      elements.form.reset();
      renderMessage(elements, i18n.t('form.success'));
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

const getErrorMessage = (errorType, i18n) => {
  switch (errorType) {
    case 'NetworkError':
      return i18n.t('errors.network');
    case 'DuplicatedRSSError':
      return i18n.t('errors.duplication.rss');
    case 'ParsingRSSError':
      return i18n.t('errors.parsingRSS');
    case 'isEmpty':
      return i18n.t('errors.validation.empty');
    case 'url':
      return i18n.t('errors.validation.url');
    default:
      return i18n.t('errors.undefined', { error: errorType });
  }
};

const errorsHandler = (elements, value, i18n) => {
  const message = value === '' ? '' : getErrorMessage(value, i18n);
  renderMessage(elements, message, 'error');
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.errorType':
      errorsHandler(elements, value, i18n);
      break;
    case 'form.processState':
      processStateHandler(elements, value, i18n);
      break;
    case 'feeds':
      renderFeeds(elements, value, i18n);
      break;
    case 'posts':
      renderPosts(elements, value, i18n);
      break;
    default:
      break;
  }
});
