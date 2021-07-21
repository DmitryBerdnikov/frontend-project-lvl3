import axios from 'axios';

const updatingRSSTime = 4000;

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', true);
  return urlWithProxy.toString();
};

export const send = (url) => {
  const urlWithProxy = addProxy(url);

  return axios
    .get(urlWithProxy)
    .then((response) => {
      const { data } = response;

      return data.contents;
    });
};

export const subscribe = (url, callback) => {
  setTimeout(() => {
    send(url).then((data) => {
      callback(data);
      subscribe(url, callback);
    });
  }, updatingRSSTime);
};
