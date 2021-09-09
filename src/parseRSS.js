export default (xmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');

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
      const postTitleEl = element.querySelector('title');
      const postLinkEl = element.querySelector('link');
      const postDescriptionEl = element.querySelector('description');

      const newItem = {
        title: postTitleEl.textContent,
        link: postLinkEl.textContent,
        description: postDescriptionEl.textContent,
      };

      result.posts = [...result.posts, newItem];
    });

    return result;
  } catch (e) {
    const error = new Error(e.message);

    error.isParsingError = true;
    error.name = 'ParsingError';

    throw error;
  }
};
