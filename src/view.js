import 'jquery';
import 'bootstrap/js/dist/modal';
import onChange from 'on-change';

const linkClassNames = {
  default: ['fw-bold'],
  readed: ['fw-normal'],
};

const btnPopupHandler = (watchedState, post) => () => {
  const { uiState } = watchedState;
  const { title, link, description, id } = post;
  const modal = document.getElementById('modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-title');
  const modalLinkReadFull = modal.querySelector('.link-read-full');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalLinkReadFull.setAttribute('href', link);
  uiState.readedPostsIds.add(id);
};

const getErrorMessage = (errorType, i18n) => {
  switch (errorType) {
    case 'networkError':
      return i18n.t('errors.network');
    case 'notOneOf':
      return i18n.t('errors.unique');
    case 'parsingError':
      return i18n.t('errors.parsingRSS');
    case 'required':
      return i18n.t('errors.required');
    case 'url':
      return i18n.t('errors.url');
    case null:
      return null;
    default:
      return i18n.t('errors.undefined', { error: errorType });
  }
};

const renderFeeds = (elements, feeds, i18n) => {
  const { feeds: feedsBox } = elements;
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

  feedsBox.innerHTML = '';
  feedsBox.append(titleEl, ul);
};

const renderPosts = (watchedState, elements, i18n) => {
  const {
    posts,
    uiState: { readedPostsIds },
  } = watchedState;

  const { posts: postsBox } = elements;
  const titleEl = document.createElement('h2');
  titleEl.textContent = i18n.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach((post) => {
    const { title, link, id } = post;
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    );

    const linkEl = document.createElement('a');
    const linkResolvedClassNames = readedPostsIds.has(id)
      ? linkClassNames.readed
      : linkClassNames.default;
    linkEl.classList.add('post-link', ...linkResolvedClassNames);
    linkEl.textContent = title;
    linkEl.dataset.postId = id;
    linkEl.href = link;

    const btnPopup = document.createElement('button');
    btnPopup.classList.add('btn', 'btn-primary', 'btn-sm');
    btnPopup.setAttribute('data-bs-toggle', 'modal');
    btnPopup.setAttribute('data-bs-target', '#modal');
    btnPopup.textContent = i18n.t('view');
    btnPopup.addEventListener('click', btnPopupHandler(watchedState, post));

    li.append(linkEl, btnPopup);
    ul.append(li);
  });

  postsBox.innerHTML = '';
  postsBox.append(titleEl, ul);
};

const renderMessage = (elements, message, type = 'success') => {
  const { input, feedback: feedbackEl } = elements;
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('text-success', 'text-danger');
  input.classList.remove('is-invalid');

  if (message === '') {
    return;
  }

  switch (type) {
    case 'success':
      feedbackEl.classList.add('text-success');
      feedbackEl.textContent = message;
      break;
    case 'error':
      feedbackEl.classList.add('text-danger');
      input.classList.add('is-invalid');
      feedbackEl.textContent = message;
      break;
    default:
      throw new Error(`Undefined type ${type} for renderMessage`);
  }
};

const renderError = (elements, value, i18n) => {
  const message = getErrorMessage(value, i18n);
  renderMessage(elements, message, 'error');
};

const renderReadedPosts = (elements, ids) => {
  const { posts: postsBox } = elements;

  ids.forEach((id) => {
    const linkEl = postsBox.querySelector(`.post-link[data-post-id="${id}"]`);
    linkEl.classList.remove(...linkClassNames.default);
    linkEl.classList.add(...linkClassNames.readed);
  });
};

const handleStatus = (elements, status, i18n) => {
  switch (status) {
    case 'filling': {
      elements.submitBtn.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
      elements.input.focus();
      break;
    }
    case 'error': {
      elements.input.focus();
      break;
    }
    case 'loading': {
      elements.input.setAttribute('readonly', true);
      elements.submitBtn.setAttribute('disabled', true);
      break;
    }
    case 'success':
      elements.form.reset();
      elements.submitBtn.removeAttribute('disabled');
      elements.input.removeAttribute('readonly');
      elements.input.focus();
      renderMessage(elements, i18n.t('form.success'));
      break;
    default:
      throw new Error(`Unknown state: ${status}`);
  }
};

export default (state, elements, i18n) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'error':
        renderError(elements, value, i18n);
        break;
      case 'form.error':
        renderError(elements, value, i18n);
        break;
      case 'form.status':
        handleStatus(elements, value, i18n);
        break;
      case 'feeds':
        renderFeeds(elements, value, i18n);
        break;
      case 'posts':
        renderPosts(watchedState, elements, i18n);
        break;
      case 'uiState.readedPostsIds':
        renderReadedPosts(elements, value);
        break;
      default:
        break;
    }
  });

  elements.input.focus();

  return watchedState;
};
