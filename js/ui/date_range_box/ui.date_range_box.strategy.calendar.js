import DateBoxCalendarStrategy from '../date_box/ui.date_box.strategy.calendar';
import dateUtils from '../../core/utils/date';
import { extend } from '../../core/utils/extend';
import dateLocalization from '../../localization/date';

const CalendarStrategy = DateBoxCalendarStrategy.inherit({
    supportedKeys: function() {
        return extend(this.callBase(), {
            enter: (function(e) {
                if(this.dateBox.option('opened')) {
                    e.preventDefault();

                    if(this._widget.option('zoomLevel') === this._widget.option('maxZoomLevel')) {
                        const viewValue = this._getContouredValue();
                        const lastActionElement = this._lastActionElement;
                        const shouldCloseDropDown = this._closeDropDownByEnter();

                        if(shouldCloseDropDown && viewValue && lastActionElement === 'calendar') {
                            this.dateBoxValue(viewValue, e);
                        }

                        shouldCloseDropDown && this.dateBox.close();
                        this.dateBox._valueChangeEventHandler(e);

                        return !shouldCloseDropDown;
                    } else {
                        return true;
                    }
                } else {
                    this.dateBox._valueChangeEventHandler(e);
                }
            }).bind(this)
        });
    },

    _getWidgetOptions: function() {
        return extend(this.callBase(), {
            value: null,
            values: this.dateBoxValue() ?? [null, null],
            selectionMode: 'range',
            viewsCount: 2,
            width: 260
        });
    },

    getParsedText: function(text, format) {
        debugger;
        const [startDateText, endDateText] = text.split(' ⟶ ');
        const parsedStartDate = dateLocalization.parse(startDateText, format) ?? dateLocalization.parse(startDateText);
        const parsedEndDate = dateLocalization.parse(endDateText, format) ?? dateLocalization.parse(endDateText);
        // const value = dateLocalization.parse(text, format);
        // return value ? value : dateLocalization.parse(text);
        return {
            parsedStartDate,
            parsedEndDate
        };
    },

    _valueChangedHandler: function(e) {
        // debugger;
        console.log('_valueChangedHandler');

        const value = e.value ?? [null, null];
        const prevValue = e.previousValue ?? [null, null];

        if((dateUtils.sameDate(value[0], prevValue[0]) || value[0] === prevValue[0]) && (dateUtils.sameDate(value[1], prevValue[1]) || value[1] === prevValue[1])) {
            return;
        }

        if(this.dateBox.option('applyValueMode') === 'instantly') {
            this.dateBoxValue(this.getValue(), e.event);
        }
    },

    _updateValue: function() {
        this._widget?.option('values', this.dateBoxValue());
    },

    getValue: function() {
        return this._widget.option('values');
    },

    dateBoxValue: function() {
        if(arguments.length) {
            // todo
            return this.dateBox.dateValue.apply(this.dateBox, arguments);
        } else {
            return this.dateBox.dateOption.apply(this.dateBox, ['value']);
        }
    },

    _cellClickHandler: function(e) {
        // debugger;
        const dateBox = this.dateBox;

        if(dateBox.option('applyValueMode') === 'instantly') {
            const value = this.getValue();
            const shouldHidePopup = value[0] && value[1];

            if(shouldHidePopup) {
                console.log('closing');
                dateBox.option('opened', false);
            }

            this.dateBoxValue(value, e.event);
        }

    },
});

export default CalendarStrategy;
