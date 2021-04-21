import axios from 'axios';

const proxyURL = 'https://hexlet-allorigins.herokuapp.com/get';
const updatingRSSTime = 1000;

export const send = (url) => {
  const instanceURL = new URL(proxyURL);
  instanceURL.searchParams.set('url', url);
  instanceURL.searchParams.set('disableCache', true);

  const apiURL = instanceURL.toString();

  return axios
    .get(apiURL)
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
