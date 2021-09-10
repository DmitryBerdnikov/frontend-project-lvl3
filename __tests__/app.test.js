import { join, resolve } from 'path';
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

const getFixturePath = (filename) => join(__dirname, '__fixtures__', filename);
const readFixtureFile = (filename) =>
  fs.readFileSync(getFixturePath(filename), 'utf-8');
const rss1 = readFixtureFile('rss1.xml');
const rss2 = readFixtureFile('rss2.xml');
const notRssUrl = 'https://yandex.ru';
const rssUrl1 = 'http://lorem-rss.herokuapp.com/feed';
const rssUrl2 = 'https://ru.hexlet.io/lessons.rss';
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

test('Validation for not empty and valid URL', async () => {
  userEvent.click(elements.submit);
  const regexpTextRequired = new RegExp(texts.errors.required, 'i');
  expect(screen.getByText(regexpTextRequired)).toBeInTheDocument();

  userEvent.type(elements.input, 'not valid url');
  userEvent.click(elements.submit);
  const regexpTextNotValidUrl = new RegExp(texts.errors.url, 'i');
  expect(screen.getByText(regexpTextNotValidUrl)).toBeInTheDocument();
});

test('Invalid RSS', async () => {
  applyNock(notRssUrl, '<html></html>');

  userEvent.type(elements.input, notRssUrl);
  userEvent.click(elements.submit);
  const regexpTextInvalidRSS = new RegExp(texts.errors.parsingRSS, 'i');
  expect(await screen.findByText(regexpTextInvalidRSS)).toBeInTheDocument();
});

test("Same RSS can't be loaded more than once", async () => {
  applyNock(rssUrl1, rss1);

  userEvent.type(elements.input, rssUrl1);
  userEvent.click(elements.submit);
  const regexpTextSuccess = new RegExp(texts.form.success, 'i');
  expect(await screen.findByText(regexpTextSuccess)).toBeInTheDocument();

  userEvent.type(elements.input, rssUrl1);
  userEvent.click(elements.submit);
  const regexpTextUniqueRSS = new RegExp(texts.errors.unique, 'i');
  expect(await screen.findByText(regexpTextUniqueRSS)).toBeInTheDocument();
});

test('Load multiple RSS', async () => {
  applyNock(rssUrl1, rss1);
  applyNock(rssUrl2, rss2);

  userEvent.type(elements.input, rssUrl1);
  userEvent.click(elements.submit);

  expect(await screen.findByText(/W3Schools Home Page/i)).toBeInTheDocument();

  const rss1Feed1Link = screen.getByRole('link', {
    name: 'RSS Tutorial',
  });
  expect(rss1Feed1Link).toBeInTheDocument();
  expect(rss1Feed1Link).toHaveAttribute(
    'href',
    'https://www.w3schools.com/xml/xml_rss.asp',
  );

  userEvent.type(elements.input, rssUrl2);
  userEvent.click(elements.submit);

  expect(await screen.findByText(/RSS Title/i)).toBeInTheDocument();

  const rss2Feed1Link = screen.getByRole('link', {
    name: 'RSS Tutorial',
  });
  expect(rss2Feed1Link).toBeInTheDocument();
  expect(rss2Feed1Link).toHaveAttribute(
    'href',
    'https://www.w3schools.com/xml/xml_rss.asp',
  );

  expect(await screen.findByText(/W3Schools Home Page/i)).toBeInTheDocument();
  expect(await screen.findByText(/RSS Tutorial/i)).toBeInTheDocument();
});

test.todo('Form becomes disabled while loading RSS');
