import { resolve } from 'path';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import fs from 'fs';
import nock from 'nock';
import axios from 'axios';
import axiosHTTPAdapter from 'axios/lib/adapters/http';
import initApp from '../src/app';
import locales from '../src/locales/ru';
import { BASE_URL, ENDPOINT, QUERY_PARAMS } from '../src/api';

// If you are using jsdom, axios will default to using the XHR adapter which
// can't be intercepted by nock. So, configure axios to use the node adapter.
//
// References:
// https://github.com/nock/nock/issues/699#issuecomment-272708264
// https://github.com/axios/axios/issues/305
axios.defaults.adapter = axiosHTTPAdapter;

nock.disableNetConnect();

const notRssURL = 'https://yandex.ru';
const { translation: texts } = locales;
const elements = {};

const applyNock = (url, response) => {
  nock(BASE_URL)
    .get(ENDPOINT)
    .query({ ...QUERY_PARAMS, url })
    .reply(200, { contents: response });
};

beforeEach(async () => {
  const pathToHtml = resolve(__dirname, '../index.html');
  const html = fs.readFileSync(pathToHtml, 'utf8');
  document.body.innerHTML = html;

  elements.input = screen.getByRole('textbox', { name: 'url' });
  elements.submit = screen.getByRole('button', { name: 'add' });

  await initApp();
});

test('Validation: URL', async () => {
  userEvent.click(elements.submit);
  const regexpTextRequired = new RegExp(texts.errors.required, 'i');
  expect(screen.getByText(regexpTextRequired)).toBeInTheDocument();

  userEvent.type(elements.input, 'not valid url');
  userEvent.click(elements.submit);
  const regexpTextNotValidUrl = new RegExp(texts.errors.url, 'i');
  expect(screen.getByText(regexpTextNotValidUrl)).toBeInTheDocument();
});

test('Validation: invalid RSS', async () => {
  applyNock(notRssURL, '<html></html>');

  userEvent.type(elements.input, notRssURL);
  userEvent.click(elements.submit);
  const regexpTextInvalidRSS = new RegExp(texts.errors.parsingRSS, 'i');
  expect(await screen.findByText(regexpTextInvalidRSS)).toBeInTheDocument();
});
