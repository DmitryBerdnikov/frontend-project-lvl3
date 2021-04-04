import onChange from 'on-change';

const removeAllChildes = (element) => {
  while (element.firstChild) {
    element.removeChild(element.lastChild);
  }
};

const renderFeeds = ({ feeds: feedsEl }, feeds) => {
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Фиды';

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    ul.append(li);

    const h3 = document.createElement('h3');
    li.append(h3);
    h3.textContent = feed.title;

    const p = document.createElement('p');
    li.append(p);
    p.textContent = feed.description;
  });

  removeAllChildes(feedsEl);

  feedsEl.append(titleEl);
  feedsEl.append(ul);
};

const renderPosts = ({ posts: postsEl }, posts) => {
  const titleEl = document.createElement('h2');
  titleEl.textContent = 'Посты';

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
    ul.append(li);

    const linkEl = document.createElement('a');
    linkEl.classList.add('font-weight-bold');
    linkEl.textContent = title;
    linkEl.href = link;

    li.append(linkEl);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.textContent = 'Просмотр';
    li.append(button);
  });

  removeAllChildes(postsEl);

  postsEl.append(titleEl);
  postsEl.append(ul);
};

const renderMessage = ({ input, feedback: feedbackEl }, message, type = 'success') => {
  feedbackEl.textContent = ''; // eslint-disable-line no-param-reassign
  feedbackEl.classList.remove('text-success', 'invalid-feedback');
  input.classList.remove('is-invalid');

  switch (type) {
    case 'success':
      feedbackEl.classList.add('text-success');
      break;
    case 'error':
      feedbackEl.classList.add('invalid-feedback');
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Undefined type ${type} for renderMessage`);
  }

  feedbackEl.textContent = message; // eslint-disable-line no-param-reassign
};

const processStateHandler = (elements, processState) => {
  switch (processState) {
    case 'filling':
      elements.submit.removeAttribute('disabled');
      break;
    case 'sending':
      elements.submit.setAttribute('disabled', true);
      break;
    case 'success':
      elements.form.reset();
      renderMessage(elements, 'RSS успешно загружен');
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default (state, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.errorMessage':
      renderMessage(elements, value, 'error');
      break;
    case 'form.processState':
      processStateHandler(elements, value);
      break;
    case 'feeds':
      renderFeeds(elements, value);
      break;
    case 'posts':
      renderPosts(elements, value);
      break;
    default:
      break;
  }
});
