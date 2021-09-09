import axios from 'axios';

export const BASE_URL = 'https://hexlet-allorigins.herokuapp.com';
export const ENDPOINT = '/get';
export const QUERY_PARAMS = { disableCache: true };

const updatingRSSTime = 4000;

export const addProxy = (url) => {
  const urlWithProxy = new URL(ENDPOINT, BASE_URL);
  urlWithProxy.searchParams.set('url', url);
  Object.entries(QUERY_PARAMS).forEach(([key, value]) => {
    urlWithProxy.searchParams.set(key, value);
  });
  return urlWithProxy.toString();
};

export const send = (url) => {
  const urlWithProxy = addProxy(url);

  return axios.get(urlWithProxy).then((response) => {
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
