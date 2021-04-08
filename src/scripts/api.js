import axios from 'axios';
import { NetworkError } from './errors';

const URL_FOR_CROSS_ORIGINS_REQUESTS = 'https://hexlet-allorigins.herokuapp.com/get';

export default (url) => {
  const generatedUrl = new URL(URL_FOR_CROSS_ORIGINS_REQUESTS);
  generatedUrl.searchParams.set('url', url);
  generatedUrl.searchParams.set('disableCache', true);

  return axios
    .get(generatedUrl)
    .then((response) => {
      const { data } = response;

      if (data.status.error && data.status.error.code === 'ENOTFOUND') {
        throw new NetworkError();
      }

      return data;
    });
};
