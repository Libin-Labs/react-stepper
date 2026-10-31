import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { setup, click } from './helpers.mjs';
import { Stepper } from '../dist/index.js';
let ui;
beforeEach(async () => (ui = await setup()));
afterEach(async () => ui.cleanup());
test('validation gates progress and successful completion is awaited', async () => {
  let allow = false,
    complete = 0;
  await ui.render(
    createElement(Stepper, {
      steps: [
        { id: 'a', label: 'First', content: 'Alpha', validate: async () => allow || 'Required' },
        { id: 'b', label: 'Second', content: 'Beta' },
      ],
      onComplete: async () => complete++,
    }),
  );
  const button = (text) =>
    [...ui.container.querySelectorAll('button')].find((node) => node.textContent === text);
  await click(button('Next'));
  assert.match(ui.container.querySelector('[role="alert"]').textContent, /Required/);
  allow = true;
  await click(button('Next'));
  assert.equal(button('Second').getAttribute('aria-current'), 'step');
  await click(button('Finish'));
  assert.equal(complete, 1);
});
