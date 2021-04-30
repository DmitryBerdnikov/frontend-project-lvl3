const createError = (name, message) => {
  const error = new Error(message);

  error.isParsingError = true;
  error.name = name;

  return error;
};

export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const errorEl = doc.querySelector('parsererror');

  if (errorEl) {
    throw createError('ParsingError', 'Parsing error');
  }

  const result = {
    title: '',
    description: '',
    posts: [],
  };

  const titleEl = doc.querySelector('title');
  const descriptionEl = doc.querySelector('description');

  result.title = titleEl.textContent;
  result.description = descriptionEl.textContent;

  doc.querySelectorAll('item').forEach((element) => {
    const newItem = {};
    const postTitleEl = element.querySelector('title');
    const postLinkEl = element.querySelector('link');
    const postDescriptionEl = element.querySelector('description');

    newItem.title = postTitleEl.textContent;
    newItem.link = postLinkEl.textContent;
    newItem.description = postDescriptionEl.textContent;

    result.posts = [...result.posts, newItem];
  });

  return result;
};
