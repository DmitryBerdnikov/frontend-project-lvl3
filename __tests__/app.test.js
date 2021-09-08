import { resolve } from 'path';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import fs from 'fs';
import initApp from '../src/app';
import locales from '../src/locales/ru';

const { translation: texts } = locales;
const elements = {};

beforeEach(async () => {
  const pathToHtml = resolve(__dirname, '../index.html');
  const html = fs.readFileSync(pathToHtml, 'utf8');
  document.body.innerHTML = html;

  elements.input = screen.getByRole('textbox', { name: 'url' });
  elements.submit = screen.getByRole('button', { name: 'add' });

  await initApp();
});

test('Validation: URL', async () => {
  userEvent.type(elements.input, 'not valid url');
  userEvent.click(elements.submit);
  const regexp = new RegExp(texts.errors.url, 'i');
  expect(screen.getByText(regexp)).toBeInTheDocument();
});
