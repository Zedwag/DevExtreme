import $ from '../../core/renderer';
import registerComponent from '../../core/component_registrator';
import dateSerialization from '../../core/utils/date_serialization';
import dateUtils from '../../core/utils/date';
import uiDateUtils from '../date_box/ui.date_utils';
import { extend } from '../../core/utils/extend';
import dateLocalization from '../../localization/date';
import pointerEvents from '../../events/pointer';
import DateBox from '../date_box';

import Calendar from './ui.date_range_box.strategy.calendar';
import Native from '../date_box/ui.date_box.strategy.native';
import { isDate as isDateType } from '../../core/utils/type';
import { addNamespace } from '../../events/utils';
import eventsEngine from '../../events/core/events_engine';
import { focused } from '../widget/selectors';

const STRATEGY_CLASSES = {
    Calendar,
    Native,
};

// STYLE dateBox

class DateRangeBox extends DateBox {
    _getDefaultOptions() {
        return extend(super._getDefaultOptions(), {
            endDate: null,
            startDate: null,
            value: [null, null],

            /**
            * @name dxDateRangeBoxOptions.adaptivityEnabled
            * @hidden
            */

            /**
            * @name dxDateRangeBoxOptions.interval
            * @hidden
            */

            /**
             * @name dxDateRangeBoxOptions.showAnalogClock
             * @hidden
             */

            /**
            * @name dxDateRangeBoxOptions.type
            * @hidden
            */
        });
    }

    _initStrategy() {
        // const strategyName = this.option('');
        // const strategy = STRATEGY_CLASSES[strategyName];
        const strategyName = 'Calendar';
        const strategy = STRATEGY_CLASSES[strategyName];

        if(!(this._strategy && this._strategy.NAME === strategyName)) {
            this._strategy = new strategy(this);
        }
    }

    _renderInput() {
        // this.callBase();
        super._renderInput();
        // debugger;
        const $inputContainer = this._$textEditorContainer;
        const $endDateInputContainer = this._$textEditorInputContainer;
        const $startDateInputContainer = $endDateInputContainer.clone();
        // $startDateInput.find('.dx-texteditor-buttons-container').remove();
        // .addClass('dx-date-range-box-separator')
        const $separator = $('<div>').text('⟶').addClass('dx-date-range-box-separator');
        $separator.prependTo($inputContainer);
        $separator.css('align-self', 'center');
        // $separator.css('width', '56px');
        $startDateInputContainer.prependTo($inputContainer);
        // $endDateInput.appendTo($inputContainer);
        // this._$textEditorInputContainer.append(this._createInput());
        // console.log($inputContainer);
        // debugger;
    }

    _renderValue() {
        // debugger;
        const value = this.dateOption('value');
        // const text = `${value[0] ?? ''} ⟶ ${value[1] ?? ''}`;
        // this.option('text', text);
        this.option('text', this._getDisplayedText(value));
        this._strategy.renderValue();

        return super._renderValue();
    }

    _focusTarget() {
        // console.log($(this._startDateInput(), this._endDateInput()));
        return $(this._startDateInput());
    }

    _renderDisplayText(text) {
        // debugger;
        const inputsText = text.split(' ⟶ ');
        this._startDateInput().val(inputsText[0]);
        this._endDateInput().val(inputsText[1]);
        this._toggleEmptinessEventHandler();
    }

    // _renderPlaceholder() {

    // }

    _renderPlaceholderMarkup() {
        const TEXTEDITOR_PLACEHOLDER_CLASS = 'dx-placeholder';
        if(this._$startDatePlaceholder) {
            this._$startDatePlaceholder.remove();
            this._$startDatePlaceholder = null;
        }

        if(this._$endDatePlaceholder) {
            this._$endDatePlaceholder.remove();
            this._$endDatePlaceholder = null;
        }

        const $startDateInput = this._startDateInput();
        const $endDateInput = this._endDateInput();
        const placeholderText = this.option('placeholder');
        const $startDatePlaceholder = this._$startDatePlaceholder = $('<div>')
            .attr('data-dx_placeholder', placeholderText);
        const $endDatePlaceholder = this._$endDatePlaceholder = $('<div>')
            .attr('data-dx_placeholder', placeholderText);

        $startDatePlaceholder.insertAfter($startDateInput);
        $endDatePlaceholder.insertAfter($endDateInput);
        $startDatePlaceholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS);
        $endDatePlaceholder.addClass(TEXTEDITOR_PLACEHOLDER_CLASS);
    }

    _attachPlaceholderEvents() {
        const startEvent = addNamespace(pointerEvents.up, this.NAME);

        eventsEngine.on(this._$startDatePlaceholder, startEvent, () => {
            eventsEngine.trigger(this._startDateInput(), 'focus');
        });
        eventsEngine.on(this._$endDatePlaceholder, startEvent, () => {
            eventsEngine.trigger(this._endDateInput(), 'focus');
        });
        this._toggleEmptinessEventHandler();
    }

    _toggleEmptinessEventHandler() {
        const startDateText = this._startDateInput().val();
        const endDateText = this._endDateInput().val();
        const isStartDateEmpty = (startDateText === '' || startDateText === null) && this._isInputValueValid(this._startDateInput());
        const isEndDateEmpty = (endDateText === '' || endDateText === null) && this._isInputValueValid(this._endDateInput());
        this._toggleEmptiness(isStartDateEmpty, this._$startDatePlaceholder);
        this._toggleEmptiness(isEndDateEmpty, this._$endDatePlaceholder);
    }

    _toggleEmptiness(isEmpty, $placeholder) {
        const TEXTEDITOR_EMPTY_INPUT_CLASS = 'dx-texteditor-empty';
        const STATE_INVISIBLE_CLASS = 'dx-state-invisible';
        $placeholder.toggleClass(TEXTEDITOR_EMPTY_INPUT_CLASS, isEmpty);
        $placeholder.toggleClass(STATE_INVISIBLE_CLASS, !isEmpty);
    }

    _isInputValueValid($input) {
        if($input.length) {
            const validity = $input.get(0).validity;

            if(validity) {
                return validity.valid;
            }
        }

        return true;
    }

    _focusInput() {
        if(this.option('disabled')) {
            return false;
        }

        if(this.option('focusStateEnabled') && !focused(this._input())) {
            this._resetCaretPosition();

            eventsEngine.trigger(this._endDateInput(), 'focus');
        }

        return true;
    }

    _startDateInput() {
        return this.$element().find('.dx-texteditor-input').first();
    }

    _endDateInput() {
        return this.$element().find('.dx-texteditor-input').last();
    }

    _getDisplayedText(value) {
        const mode = this.option('mode');
        let displayedText;

        if(mode === 'text') {
            const displayFormat = this._strategy.getDisplayFormat(this.option('displayFormat'));
            displayedText = `${dateLocalization.format(value[0], displayFormat) ?? ''} ⟶ ${dateLocalization.format(value[1], displayFormat) ?? ''}`;
        } else {
            const format = this._getFormatByMode(mode);

            if(format) {
                displayedText = `${dateLocalization.format(value[0], format) ?? ''} ⟶ ${dateLocalization.format(value[1], format) ?? ''}`;
            } else {
                displayedText = `${uiDateUtils.toStandardDateFormat(value[0], mode) ?? ''} ⟶ ${uiDateUtils.toStandardDateFormat(value[1], mode) ?? ''}`;
            }
        }

        return displayedText;
    }

    _isValueChanged(newValue) {
        const [oldStartValue, oldEndValue] = this.dateOption('value');
        const oldStartTime = oldStartValue && oldStartValue.getTime();
        const oldEndTime = oldEndValue && oldEndValue.getTime();
        const newStartTime = newValue[0] && newValue[0].getTime();
        const newEndTime = newValue[1] && newValue[1].getTime();

        return oldStartTime !== newStartTime || oldEndTime !== newEndTime;
    }

    _valueChangeEventHandler(e) {
        const { text, type, validationError } = this.option();
        const currentValue = this.dateOption('value') ?? [];
        debugger;
        if(text === this._getDisplayedText(currentValue)) {
            if(!validationError || validationError.editorSpecific) {
                this._applyInternalValidation(currentValue[0]);
                this._applyInternalValidation(currentValue[1]);
                this._applyCustomValidation(currentValue[0]);
                this._applyCustomValidation(currentValue[1]);
            }
            return;
        }

        const { parsedStartDate, parsedEndDate } = this._getParsedDate(text);
        const startDateValue = currentValue[0] ?? this._getDateByDefault();
        const endDateValue = currentValue[1] ?? this._getDateByDefault();
        const newStartDateValue = uiDateUtils.mergeDates(startDateValue, parsedStartDate, type);
        const newEndDateValue = uiDateUtils.mergeDates(endDateValue, parsedEndDate, type);
        const startDate = parsedStartDate;
        const endDate = parsedEndDate;
        const newValue = [startDate, endDate];

        if(this._applyInternalValidation(startDate).isValid && this._applyInternalValidation(endDate).isValid) {
            const displayedText = this._getDisplayedText(newValue);

            // if(value && newValue && value.getTime() === newValue.getTime() && displayedText !== text) {
            //     this._renderValue();
            // } else {
            this.dateValue(newValue, e);
            // }
        }
    }

    _applyInternalValidation(value) {
        const text = this.option('text');
        const hasText = !!text && value !== null;
        const isDate = !!value && isDateType(value) && !isNaN(value.getTime());
        const isDateInRange = isDate && dateUtils.dateInRange(value, this.dateOption('min'), this.dateOption('max'), this.option('type'));
        const isValid = !hasText && !value || isDateInRange;
        let validationMessage = '';

        if(!isDate) {
            validationMessage = this.option('invalidDateMessage');
        } else if(!isDateInRange) {
            validationMessage = this.option('dateOutOfRangeMessage');
        }

        // this.option({
        //     isValid: isValid,
        //     validationError: isValid ? null : {
        //         editorSpecific: true,
        //         message: validationMessage
        //     }
        // });

        return {
            isValid: true,
            isDate
        };
    }

    _keyPressHandler() {
        // skip datebox mask
        this.option('text', `${this._startDateInput().val()} ⟶ ${this._endDateInput().val()}`);
    }

    dateValue(value, dxEvent) {
        const isValueChanged = this._isValueChanged(value);
        console.log(isValueChanged);

        if(isValueChanged && dxEvent) { //
            this._saveValueChangeEvent(dxEvent);
        }

        if(!isValueChanged) {
            if(this._isTextChanged(value)) {
                this._updateValue(value);
            } else if(this.option('text') === '') {
                // this._applyCustomValidation(value);
            }
        }

        if(isValueChanged) {
            return this.dateOption('value', value);
        }
    }

    dateOption(optionName, value) {
        if(arguments.length === 1) {
            const serializedValue = optionName === 'value'
                ? this.option('value').map((date) => dateSerialization.deserializeDate(date))
                : dateSerialization.deserializeDate(this.option(optionName));
            return serializedValue;
        }

        const newOptionValue = optionName === 'value'
            ? value.map((date) => this._serializeDate(date))
            : this._serializeDate(value);

        this.option(optionName, newOptionValue);
    }
}

registerComponent('dxDateRangeBox', DateRangeBox);

export default DateRangeBox;
