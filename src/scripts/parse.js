export default (xmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const hasRSS = !!doc.querySelector('rss');

  if (!hasRSS) {
    throw new Error('Ресурс не содержит валидный RSS');
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
    const newItem = {
      title: element.querySelector('title').textContent,
      link: element.querySelector('link').textContent,
    };

    result.posts = [...result.posts, newItem];
  });

  return result;
};
