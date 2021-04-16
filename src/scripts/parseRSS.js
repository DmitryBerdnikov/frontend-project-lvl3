export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const hasRSS = !!doc.querySelector('rss');

  if (!hasRSS) {
    throw new Error('Parsing RSS error');
  }

  const result = {
    title: '',
    description: '',
    posts: [],
  };

  const titleEl = doc.querySelector('title');
  if (titleEl) {
    result.title = titleEl.textContent;
  }

  const descriptionEl = doc.querySelector('description');
  if (descriptionEl) {
    result.description = descriptionEl.textContent;
  }

  doc.querySelectorAll('item').forEach((element) => {
    const postTitleEl = element.querySelector('title');
    const postLinkEl = element.querySelector('link');
    const postDescriptionEl = element.querySelector('description');
    const newItem = {};

    if (postTitleEl) {
      newItem.title = postTitleEl.textContent;
    }

    if (postLinkEl) {
      newItem.link = postLinkEl.textContent;
    }

    if (postDescriptionEl) {
      newItem.description = postDescriptionEl.textContent;
    }

    result.posts = [...result.posts, newItem];
  });

  return result;
};
