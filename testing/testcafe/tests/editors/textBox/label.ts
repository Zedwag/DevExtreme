/* eslint-disable no-restricted-syntax */
import { Selector } from 'testcafe';
import { createScreenshotsComparer } from 'devextreme-screenshot-comparer';
import {
  removeStylesheetRulesFromPage, insertStylesheetRulesToPage, setStyleAttribute,
  appendElementTo, setClassAttribute,
  removeClassAttribute,
} from '../../../helpers/domUtils';
import { testScreenshot, getThemeName } from '../../../helpers/themeUtils';
import url from '../../../helpers/getPageUrl';
import { createWidget } from '../../../helpers/createWidget';
import TextBox from '../../../model/textBox';
import Guid from '../../../../../js/core/guid';

fixture.disablePageReloads`TextBox_Label`
  .page(url(__dirname, '../../container.html'));

const labelModes = ['floating', 'static', 'hidden'];
const stylingModes = ['outlined', 'underlined', 'filled'];

const TEXTBOX_CLASS = 'dx-textbox';
const HOVER_STATE_CLASS = 'dx-state-hover';
const FOCUSED_STATE_CLASS = 'dx-state-focused';
const INVALID_STATE_CLASS = 'dx-invalid';

[
  { labelMode: 'static', expectedWidths: { generic: 82, material: 68, fluent: 74 } },
  { labelMode: 'floating', expectedWidths: { generic: 82, material: 68, fluent: 74 } },
].forEach(({ labelMode, expectedWidths }) => {
  test(`Label max-width should be changed after container width was changed, labelMode is ${labelMode}`, async (t) => {
    const textBox = new TextBox('#container');

    const expectedWidth = expectedWidths[getThemeName()];

    await t
      .expect(textBox.getLabel().getStyleProperty('max-width'))
      .eql(`${expectedWidth}px`);

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    await setStyleAttribute(Selector(`#${await textBox.element.getAttribute('id')}`), `width: ${t.ctx.initialWidth + t.ctx.deltaWidth}px;`);

    await t
      .expect(textBox.getLabel().getStyleProperty('max-width'))
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      .eql(`${expectedWidth + t.ctx.deltaWidth}px`);
  }).before(async (t) => {
    t.ctx.initialWidth = 100;
    t.ctx.deltaWidth = 300;

    return createWidget('dxTextBox', {
      width: t.ctx.initialWidth,
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      labelMode,
    });
  });
});

stylingModes.forEach((stylingMode) => {
  test(`Textbox render with stylingMode=${stylingMode}`, async (t) => {
    const { takeScreenshot, compareResults } = createScreenshotsComparer(t);

    await insertStylesheetRulesToPage(`.${TEXTBOX_CLASS} { display: inline-block; width: 60px; margin: 5px; }`);

    await testScreenshot(t, takeScreenshot, `Textbox render with limited width stylingMode=${stylingMode}.png`, { element: '#container' });

    await removeStylesheetRulesFromPage();

    await insertStylesheetRulesToPage(`.${TEXTBOX_CLASS} { display: inline-block; width: 260px; margin: 5px; }`);

    await testScreenshot(t, takeScreenshot, `Textbox render stylingMode=${stylingMode}.png`);

    for (const state of [HOVER_STATE_CLASS, FOCUSED_STATE_CLASS, INVALID_STATE_CLASS, `${INVALID_STATE_CLASS} ${FOCUSED_STATE_CLASS}`] as any[]) {
      for (const id of t.ctx.ids) {
        await setClassAttribute(Selector(`#${id}`), state);
      }

      await testScreenshot(t, takeScreenshot, `Textbox render ${state.replaceAll('dx-', '').replaceAll('state-', '')},stylingMode=${stylingMode}.png`);

      for (const id of t.ctx.ids) {
        await removeClassAttribute(Selector(`#${id}`), state);
      }
    }

    await removeStylesheetRulesFromPage();

    await t
      .expect(compareResults.isValid())
      .ok(compareResults.errorMessages());
  }).before(async (t) => {
    t.ctx.ids = [];

    for (const rtlEnabled of [true, false]) {
      for (const labelMode of labelModes) {
        for (const placeholder of ['Placeholder', '']) {
          for (const text of ['Text value', '']) {
            for (const label of ['Label Text', '']) {
              const id = `${`dx${new Guid()}`}`;

              t.ctx.ids.push(id);
              await appendElementTo('#container', 'div', id, { });
              await createWidget('dxTextBox', {
                label,
                text,
                placeholder,
                labelMode,
                stylingMode,
                rtlEnabled,
              }, `#${id}`);
            }
          }
        }
      }
    }
  });
});
