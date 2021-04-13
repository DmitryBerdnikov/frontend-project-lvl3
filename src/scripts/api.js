import axios from 'axios';
import { NetworkError } from './errors';

const proxyURL = 'https://hexlet-allorigins.herokuapp.com/get';
const updatingRSSTime = 5000;

export const send = (url) => {
  const instanceURL = new URL(proxyURL);
  instanceURL.searchParams.set('url', url);
  instanceURL.searchParams.set('disableCache', true);
  const urlString = instanceURL.toString();

  return axios.get(urlString).then((response) => {
    const { data } = response;

    if (data.status.error && data.status.error.code === 'ENOTFOUND') {
      throw new NetworkError();
    }

    return data;
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
