import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import moment from 'moment';
import $ from 'jquery';

const DateRangePicker = function(element, options, cb) {
	// by default, the daterangepicker element is placed at the bottom of HTML body
  this.parentEl = 'body';
	// element that triggered the date range picker
  this.element = $(element);
	// tracks visible state
  this.isShowing = false;

	// create the picker HTML object
  const DRPTemplate = '<div class="daterangepicker dropdown-menu">' +
					'<div class="calendar left"></div>' +
					'<div class="calendar right"></div>' +
					'<div class="ranges">' +
						'<div class="range_inputs">' +
							'<div class="daterangepicker_start_input">' +
								'<label for="daterangepicker_start"></label>' +
								'<input class="input-mini" type="text" name="daterangepicker_start" value="" />' +
							'</div>' +
							'<div class="daterangepicker_end_input">' +
								'<label for="daterangepicker_end"></label>' +
								'<input class="input-mini" type="text" name="daterangepicker_end" value="" />' +
							'</div>' +
							'<button class="applyBtn" disabled="disabled"></button>&nbsp;' +
							'<button class="cancelBtn"></button>' +
						'</div>' +
					'</div>' +
				'</div>';

	// custom options
  let customOptions = {};
  if (typeof options === 'object' || options != null) {
    customOptions = options;
  }

  this.parentEl = (typeof customOptions === 'object' && customOptions.parentEl && $(customOptions.parentEl).length) ? $(customOptions.parentEl) : $(this.parentEl);
  this.container = $(DRPTemplate).appendTo(this.parentEl);

  this.setcustomOptions(customOptions, cb);

	// apply CSS classes and labels to buttons
  const c = this.container;
  $.each(this.buttonClasses, function(idx, val) {
    c.find('button').addClass(val);
  });
  this.container.find('.daterangepicker_start_input label').html(this.locale.fromLabel);
  this.container.find('.daterangepicker_end_input label').html(this.locale.toLabel);

  if (this.applyClass.length) {
    this.container.find('.applyBtn').addClass(this.applyClass);
  }

  if (this.cancelClass.length) {
    this.container.find('.cancelBtn').addClass(this.cancelClass);
  }

  this.container.find('.applyBtn').html(this.locale.applyLabel);
  this.container.find('.cancelBtn').html(this.locale.cancelLabel);

	// event listeners
  this.container.find('.calendar')
			.on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
			.on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
			.on('click.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
			.on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
			.on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
			.on('change.daterangepicker', 'select.yearselect', $.proxy(this.updateMonthYear, this))
			.on('change.daterangepicker', 'select.monthselect', $.proxy(this.updateMonthYear, this))
			.on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.ampmselect', $.proxy(this.updateTime, this));

  this.container.find('.ranges')
			.on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
			.on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
			.on('click.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.showCalendars, this))
			.on('change.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsChanged, this))
			.on('keydown.daterangepicker', '.daterangepicker_start_input,.daterangepicker_end_input', $.proxy(this.inputsKeydown, this))
			.on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
			.on('mouseenter.daterangepicker', 'li', $.proxy(this.enterRange, this))
			.on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

  if (this.element.is('input')) {
    this.element.on({
      'click.daterangepicker': $.proxy(this.show, this),
      'focus.daterangepicker': $.proxy(this.show, this),
      'keyup.daterangepicker': $.proxy(this.updateFromControl, this)
    });
  } else {
    this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
  }
};

DateRangePicker.prototype = {
  constructor: DateRangePicker,

  setOptions: function(options, callback) {
    this.startDate = new moment().startOf('day');
    this.endDate = new moment().endOf('day');
    this.minDate = false;
    this.maxDate = false;
    this.dateLimit = false;

    this.showDropdowns = false;
    this.showWeekNumbers = false;
    this.timePicker = false;
    this.timePickerIncrement = 30;
    this.timePicker12Hour = true;
    this.singleDatePicker = false;
    this.ranges = {};

    this.opens = 'right';
    if (this.element.hasClass('pull-right')) {
      this.opens = 'left';
    }

    this.buttonClasses = ['btn', 'btn-small btn-sm'];
    this.applyClass = 'btn-success';
    this.cancelClass = 'btn-default';

    this.format = 'MM/DD/YYYY';
    this.separator = ' - ';

    this.locale = {
      applyLabel: 'Apply',
      cancelLabel: 'Cancel',
      fromLabel: 'From',
      toLabel: 'To',
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData()._week.dow
    };

    this.cb = function() { };

    if (typeof options.format === 'string') {
      this.format = options.format;
    }

    if (typeof options.separator === 'string') {
      this.separator = options.separator;
    }

    if (typeof options.startDate === 'string') {
      this.startDate = moment(options.startDate, this.format);
    }

    if (typeof options.endDate === 'string') {
      this.endDate = new moment(options.endDate, this.format);
    }

    if (typeof options.minDate === 'string') {
      this.minDate = new moment(options.minDate, this.format);
    }

    if (typeof options.maxDate === 'string') {
      this.maxDate = new moment(options.maxDate, this.format);
    }

    if (typeof options.startDate === 'object') {
      this.startDate = new moment(options.startDate);
    }

    if (typeof options.endDate === 'object') {
      this.endDate = new moment(options.endDate);
    }

    if (typeof options.minDate === 'object') {
      this.minDate = new moment(options.minDate);
    }

    if (typeof options.maxDate === 'object') {
      this.maxDate = new moment(options.maxDate);
    }

    if (typeof options.applyClass === 'string') {
      this.applyClass = options.applyClass;
    }

    if (typeof options.cancelClass === 'string') {
      this.cancelClass = options.cancelClass;
    }

    if (typeof options.dateLimit === 'object') {
      this.dateLimit = options.dateLimit;
    }

    if (typeof options.locale === 'object') {
      if (typeof options.locale.daysOfWeek === 'object') {
				// Create a copy of daysOfWeek to avoid modification of original
				// options object for reusability in multiple daterangepicker instances
        this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
      }

      if (typeof options.locale.monthNames === 'object') {
        this.locale.monthNames = options.locale.monthNames.slice();
      }

      if (typeof options.locale.firstDay === 'number') {
        this.locale.firstDay = options.locale.firstDay;
      }

      if (typeof options.locale.applyLabel === 'string') {
        this.locale.applyLabel = options.locale.applyLabel;
      }

      if (typeof options.locale.cancelLabel === 'string') {
        this.locale.cancelLabel = options.locale.cancelLabel;
      }

      if (typeof options.locale.fromLabel === 'string') {
        this.locale.fromLabel = options.locale.fromLabel;
      }

      if (typeof options.locale.toLabel === 'string') {
        this.locale.toLabel = options.locale.toLabel;
      }

      if (typeof options.locale.weekLabel === 'string') {
        this.locale.weekLabel = options.locale.weekLabel;
      }

      if (typeof options.locale.customRangeLabel === 'string') {
        this.locale.customRangeLabel = options.locale.customRangeLabel;
      }
    }

    if (typeof options.opens === 'string') {
      this.opens = options.opens;
    }

    if (typeof options.showWeekNumbers === 'boolean') {
      this.showWeekNumbers = options.showWeekNumbers;
    }

    if (typeof options.buttonClasses === 'string') {
      this.buttonClasses = [options.buttonClasses];
    }

    if (typeof options.buttonClasses === 'object') {
      this.buttonClasses = options.buttonClasses;
    }

    if (typeof options.showDropdowns === 'boolean') {
      this.showDropdowns = options.showDropdowns;
    }

    if (typeof options.singleDatePicker === 'boolean') {
      this.singleDatePicker = options.singleDatePicker;
    }

    if (typeof options.timePicker === 'boolean') {
      this.timePicker = options.timePicker;
    }

    if (typeof options.timePickerIncrement === 'number') {
      this.timePickerIncrement = options.timePickerIncrement;
    }

    if (typeof options.timePicker12Hour === 'boolean') {
      this.timePicker12Hour = options.timePicker12Hour;
    }

    // update day names order to firstDay
    if (this.locale.firstDay !== 0) {
      let iterator = this.locale.firstDay;
      while (iterator > 0) {
        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
        iterator--;
      }
    }

    // if no start/end dates set, check if an input element contains initial values
    if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
      if ($(this.element).is('input[type=text]')) {
        const val = $(this.element).val();
        const split = val.split(this.separator);
        let start = null;
        let end = null;
        if (split.length === 2) {
          start = moment(split[0], this.format);
          end = moment(split[1], this.format);
        } else {
          if (this.singleDatePicker) {
            start = moment(val, this.format);
            end = moment(val, this.format);
          }
        }

        if (start !== null && end !== null) {
          this.startDate = start;
          this.endDate = end;
        }
      }
    }

    if (typeof options.ranges === 'object') {
      options.ranges.forEach((range) => {
        let startRange = moment(range[0]);
        let endRange = moment(range[1]);

        // If we have a min/max date set, bound this range
        // to it, but only if it would otherwise fall
        // outside of the min/max.
        if (this.minDate && startRange.isBefore(this.minDate)) {
          startRange = moment(this.minDate);
        }

        if (this.maxDate && endRange.isAfter(this.maxDate)) {
          endRange = moment(this.maxDate);
        }

        // If the end of the range is before the minimum (if min is set) OR
        // the start of the range is after the max (also if set) don't display this
        // range option.
        if (!((this.minDate && endRange.isBefore(this.minDate)) || (this.maxDate && startRange.isAfter(this.maxDate)))) {
          this.ranges[range] = [startRange, endRange];
        }
      });

      let list = '<ul>';
      this.ranges.forEach((range) => list += '<li>' + range + '</li>');

      list += '<li>' + this.locale.customRangeLabel + '</li>';
      list += '</ul>';
      this.container.find('.ranges ul').remove();
      this.container.find('.ranges').prepend(list);
    }

    if (typeof callback === 'function') {
      this.cb = callback;
    }

    if (!this.timePicker) {
      this.startDate = this.startDate.startOf('day');
      this.endDate = this.endDate.endOf('day');
    }

    if (this.singleDatePicker) {
      this.opens = 'right';
      this.container.find('.calendar.right').show();
      this.container.find('.calendar.left').hide();
      this.container.find('.ranges').hide();
      if (!this.container.find('.calendar.right').hasClass('single')) {
        this.container.find('.calendar.right').addClass('single');
      }
    } else {
      this.container.find('.calendar.right').removeClass('single');
      this.container.find('.ranges').show();
    }

    this.oldStartDate = this.startDate.clone();
    this.oldEndDate = this.endDate.clone();
    this.oldChosenLabel = this.chosenLabel;

    this.leftCalendar = {
      month: moment([this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute()]),
      calendar: []
    };

    this.rightCalendar = {
      month: moment([this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute()]),
      calendar: []
    };

    if (this.opens === 'right') {
      // swap calendar positions
      const left = this.container.find('.calendar.left');
      const right = this.container.find('.calendar.right');

      if (right.hasClass('single')) {
        right.removeClass('single');
        left.addClass('single');
      }

      left.removeClass('left').addClass('right');
      right.removeClass('right').addClass('left');

      if (this.singleDatePicker) {
        left.show();
        right.hide();
      }
    }

    if (typeof options.ranges === 'undefined' && !this.singleDatePicker) {
      this.container.addClass('show-calendar');
    }

    this.container.addClass('opens' + this.opens);
    this.updateView();
    this.updateCalendars();
  },

  setStartDate: function(startDate) {
    if (typeof startDate === 'string') {
      this.startDate = moment(startDate, this.format);
    }

    if (typeof startDate === 'object') {
      this.startDate = moment(startDate);
    }

    if (!this.timePicker) {
      this.startDate = this.startDate.startOf('day');
    }

    this.oldStartDate = this.startDate.clone();

    this.updateView();
    this.updateCalendars();
    this.updateInputText();
  },

  setEndDate: function(endDate) {
    if (typeof endDate === 'string') {
      this.endDate = moment(endDate, this.format);
    }

    if (typeof endDate === 'object') {
      this.endDate = moment(endDate);
    }

    if (!this.timePicker) {
      this.endDate = this.endDate.endOf('day');
    }

    this.oldEndDate = this.endDate.clone();

    this.updateView();
    this.updateCalendars();
    this.updateInputText();
  },

  updateView: function() {
    this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
    this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
    this.updateFormInputs();
  },

  updateFormInputs: function() {
    this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.format));
    this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.format));

    if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
      this.container.find('button.applyBtn').removeAttr('disabled');
    } else {
      this.container.find('button.applyBtn').attr('disabled', 'disabled');
    }
  },

  updateFromControl: function() {
    if (!this.element.is('input')) return;
    if (!this.element.val().length) return;

    const dateString = this.element.val().split(this.separator);
    let start = null;
    let end = null;

    if (dateString.length === 2) {
      start = moment(dateString[0], this.format);
      end = moment(dateString[1], this.format);
    }

    if (this.singleDatePicker || start === null || end === null) {
      start = moment(this.element.val(), this.format);
      end = start;
    }

    if (end.isBefore(start)) return;

    this.oldStartDate = this.startDate.clone();
    this.oldEndDate = this.endDate.clone();

    this.startDate = start;
    this.endDate = end;

    if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)) {
      this.notify();
    }

    this.updateCalendars();
  },

  notify: function() {
    this.updateView();
    this.cb(this.startDate, this.endDate, this.chosenLabel);
  },

  move: function() {
    let parentOffset = { top: 0, left: 0 };
    let parentRightEdge = $(window).width();

    if (!this.parentEl.is('body')) {
      parentOffset = {
        top: this.parentEl.offset().top - this.parentEl.scrollTop(),
        left: this.parentEl.offset().left - this.parentEl.scrollLeft()
      };
      parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
    }

    if (this.opens === 'left') {
      this.container.css({
        top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
        right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
        left: 'auto'
      });

      if (this.container.offset().left < 0) {
        this.container.css({
          right: 'auto',
          left: 9
        });
      }
    } else {
      this.container.css({
        top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
        left: this.element.offset().left - parentOffset.left,
        right: 'auto'
      });
      if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
        this.container.css({
          left: 'auto',
          right: 0
        });
      }
    }
  },

  toggle: function() {
    if (this.element.hasClass('active')) {
      this.hide();
    } else {
      this.show();
    }
  },

  show: function() {
    if (this.isShowing) return;

    this.element.addClass('active');
    this.container.show();
    this.move();

    // Create a click proxy that is private to this instance of datepicker, for unbinding
    this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);
    // Bind global datepicker mousedown for hiding and
    $(document)
    .on('mousedown.daterangepicker', this._outsideClickProxy)
    // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
    .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
    // and also close when focus changes to outside the picker (eg. tabbing between controls)
    .on('focusin.daterangepicker', this._outsideClickProxy);

    this.isShowing = true;
    this.element.trigger('show.daterangepicker', this);
  },

  outsideClick: function(e) {
    const target = $(e.target);
    // if the page is clicked anywhere except within the daterangerpicker/button
    // itself then call this.hide()
    if (
    target.closest(this.element).length ||
    target.closest(this.container).length ||
    target.closest('.calendar-date').length
    ) return;

    this.hide();
  },

  hide: function() {
    if (!this.isShowing) return;

    $(document)
    .off('mousedown.daterangepicker')
    .off('click.daterangepicker', '[data-toggle=dropdown]')
    .off('focusin.daterangepicker');

    this.element.removeClass('active');
    this.container.hide();

    if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)) {
      this.notify();
    }

    this.oldStartDate = this.startDate.clone();
    this.oldEndDate = this.endDate.clone();

    this.isShowing = false;
    this.element.trigger('hide.daterangepicker', this);
  },

  enterRange: function(e) {
    // mouse pointer has entered a range label
    const label = e.target.innerHTML;
    if (label === this.locale.customRangeLabel) {
      this.updateView();
    } else {
      const dates = this.ranges[label];
      this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.format));
      this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.format));
    }
  },

  showCalendars: function() {
    this.container.addClass('show-calendar');
    this.move();
    this.element.trigger('showCalendar.daterangepicker', this);
  },

  hideCalendars: function() {
    this.container.removeClass('show-calendar');
    this.element.trigger('hideCalendar.daterangepicker', this);
  },

  // when a date is typed into the start to end date textboxes
  inputsChanged: function(e) {
    const el = $(e.target);
    const date = moment(el.val());

    if (!date.isValid()) return;

    let startDate;
    let endDate;

    if (el.attr('name') === 'daterangepicker_start') {
      startDate = date;
      endDate = this.endDate;
    } else {
      startDate = this.startDate;
      endDate = date;
    }

    this.setCustomDates(startDate, endDate);
  },

  inputsKeydown: function(e) {
    if (e.keyCode === 13) {
      this.inputsChanged(e);
      this.notify();
    }
  },

  updateInputText: function() {
    if (this.element.is('input') && !this.singleDatePicker) {
      this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
    } else if (this.element.is('input')) {
      this.element.val(this.startDate.format(this.format));
    }
  },

  clickRange: function(e) {
    const label = e.target.innerHTML;
    this.chosenLabel = label;

    if (label === this.locale.customRangeLabel) {
      this.showCalendars();
    } else {
      const dates = this.ranges[label];

      this.startDate = dates[0];
      this.endDate = dates[1];

      if (!this.timePicker) {
        this.startDate.startOf('day');
        this.endDate.endOf('day');
      }

      this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
      this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
      this.updateCalendars();

      this.updateInputText();

      this.hideCalendars();
      this.hide();
      this.element.trigger('apply.daterangepicker', this);
    }
  },

  clickPrev: function(e) {
    const cal = $(e.target).parents('.calendar');

    if (cal.hasClass('left')) {
      this.leftCalendar.month.subtract(1, 'month');
    } else {
      this.rightCalendar.month.subtract(1, 'month');
    }
    this.updateCalendars();
  },

  clickNext: function(e) {
    const cal = $(e.target).parents('.calendar');

    if (cal.hasClass('left')) {
      this.leftCalendar.month.add(1, 'month');
    } else {
      this.rightCalendar.month.add(1, 'month');
    }
    this.updateCalendars();
  },

  hoverDate: function(e) {
    const title = $(e.target).attr('data-title');
    const row = title.substr(1, 1);
    const col = title.substr(3, 1);
    const cal = $(e.target).parents('.calendar');

    if (cal.hasClass('left')) {
      this.container.find('input[name=daterangepicker_start]').val(this.leftCalendar.calendar[row][col].format(this.format));
    } else {
      this.container.find('input[name=daterangepicker_end]').val(this.rightCalendar.calendar[row][col].format(this.format));
    }
  },

  setCustomDates: function(startDate, candidateEndDate) {
    this.chosenLabel = this.locale.customRangeLabel;
    let endDate = candidateEndDate;

    if (startDate.isAfter(endDate)) {
      const difference = this.endDate.diff(this.startDate);
      endDate = moment(startDate).add(difference, 'ms');
    }
    this.startDate = startDate;
    this.endDate = endDate;

    this.updateView();
    this.updateCalendars();
  },

  clickDate: function(e) {
    const title = $(e.target).attr('data-title');
    const row = title.substr(1, 1);
    const col = title.substr(3, 1);
    const cal = $(e.target).parents('.calendar');

    let startDate;
    let endDate;

    if (cal.hasClass('left')) {
      startDate = this.leftCalendar.calendar[row][col];
      endDate = this.endDate;
      if (typeof this.dateLimit === 'object') {
        const maxDate = moment(startDate).add(this.dateLimit).startOf('day');
        if (endDate.isAfter(maxDate)) {
          endDate = maxDate;
        }
      }
    } else {
      startDate = this.startDate;
      endDate = this.rightCalendar.calendar[row][col];
      if (typeof this.dateLimit === 'object') {
        const minDate = moment(endDate).subtract(this.dateLimit).startOf('day');
        if (startDate.isBefore(minDate)) {
          startDate = minDate;
        }
      }
    }

    if (this.singleDatePicker && cal.hasClass('left')) {
      endDate = startDate.clone();
    } else if (this.singleDatePicker && cal.hasClass('right')) {
      startDate = endDate.clone();
    }

    cal.find('td').removeClass('active');

    $(e.target).addClass('active');

    this.setCustomDates(startDate, endDate);

    if (!this.timePicker) {
      endDate.endOf('day');
    }

    if (this.singleDatePicker) {
      this.clickApply();
    }
  },

  clickApply: function() {
    this.updateInputText();
    this.hide();
    this.element.trigger('apply.daterangepicker', this);
  },

  clickCancel: function() {
    this.startDate = this.oldStartDate;
    this.endDate = this.oldEndDate;
    this.chosenLabel = this.oldChosenLabel;
    this.updateView();
    this.updateCalendars();
    this.hide();
    this.element.trigger('cancel.daterangepicker', this);
  },

  updateMonthYear: function(e) {
    const isLeft = $(e.target).closest('.calendar').hasClass('left');
    const leftOrRight = isLeft ? 'left' : 'right';
    const cal = this.container.find('.calendar.' + leftOrRight);

    // Month must be Number for new moment versions
    const month = parseInt(cal.find('.monthselect').val(), 10);
    const year = cal.find('.yearselect').val();

    this[leftOrRight + 'Calendar'].month.month(month).year(year);
    this.updateCalendars();
  },

  updateTime: function(e) {
    const cal = $(e.target).closest('.calendar');
    const isLeft = cal.hasClass('left');

    let hour = parseInt(cal.find('.hourselect').val(), 10);
    const minute = parseInt(cal.find('.minuteselect').val(), 10);

    if (this.timePicker12Hour) {
      const ampm = cal.find('.ampmselect').val();

      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      }

      if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
    }

    if (isLeft) {
      const start = this.startDate.clone();
      start.hour(hour);
      start.minute(minute);
      this.startDate = start;
      this.leftCalendar.month.hour(hour).minute(minute);
    } else {
      const end = this.endDate.clone();
      end.hour(hour);
      end.minute(minute);
      this.endDate = end;
      this.rightCalendar.month.hour(hour).minute(minute);
    }

    this.updateCalendars();
  },

  updateCalendars: function() {
    this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), 'left');
    this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), 'right');
    this.container.find('.calendar.left').empty().html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));

    let minDate = this.minDate;
    if (!this.singleDatePicker) {
      minDate = this.startDate;
    }

    this.container.find('.calendar.right').empty().html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, minDate, this.maxDate));

    this.container.find('.ranges li').removeClass('active');
    let customRange = true;
    let i = 0;

    for (const range in this.ranges) {
      if (this.timePicker) {
        if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
          customRange = false;
          this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')')
          .addClass('active').html();
        }
      } else {
        // ignore times when comparing dates if time picker is not enabled
        if (this.startDate.format('YYYY-MM-DD') === this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') === this.ranges[range][1].format('YYYY-MM-DD')) {
          customRange = false;
          this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
        }
      }
      i++;
    }

    if (customRange) {
      this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
      this.showCalendars();
    }
  },

  buildCalendar: function(month, year, hour, minute) {
    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]);
    const lastDay = moment([year, month, daysInMonth]);
    const lastMonth = moment(firstDay).subtract(1, 'month').month();
    const lastYear = moment(firstDay).subtract(1, 'month').year();

    const daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
    const dayOfWeek = firstDay.day();
    let i;

    // initialize a 6 rows x 7 columns array for the calendar
    const calendar = [];
    calendar.firstDay = firstDay;
    calendar.lastDay = lastDay;

    for (i = 0; i < 6; i++) {
      calendar[i] = [];
    }

    // populate the calendar with date objects
    let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
    if (startDay > daysInLastMonth) {
      startDay -= 7;
    }

    if (dayOfWeek === this.locale.firstDay) {
      startDay = daysInLastMonth - 6;
    }

    let curDate = moment([lastYear, lastMonth, startDay, 12, minute]);
    let col;
    let  row;

    for (i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
      if (i > 0 && col % 7 === 0) {
        col = 0;
        row++;
      }
      calendar[row][col] = curDate.clone().hour(hour);
      curDate.hour(12);
    }

    return calendar;
  },

  renderDropdowns: function(selected, minDate, maxDate) {
    const currentMonth = selected.month();
    let monthHtml = '<select class="monthselect">';
    const inMinYear = false;
    const inMaxYear = false;

    for (let m = 0; m < 12; m++) {
      if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
        monthHtml += "<option value='" + m + "'" +
        (m === currentMonth ? " selected='selected'" : '') +
        '>' + this.locale.monthNames[m] + '</option>';
      }
    }
    monthHtml += '</select>';

    const currentYear = selected.year();
    const maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
    const minYear = (minDate && minDate.year()) || (currentYear - 50);
    let yearHtml = '<select class="yearselect">';

    for (let y = minYear; y <= maxYear; y++) {
      yearHtml += '<option value="' + y + '"' +
      (y === currentYear ? ' selected="selected"' : '') +
      '>' + y + '</option>';
    }

    yearHtml += '</select>';

    return monthHtml + yearHtml;
  },

  renderCalendar: function(calendar, selected, minDate, maxDate) {
    let html = '<div class="calendar-date">';
    html += '<table class="table-condensed">';
    html += '<thead>';
    html += '<tr>';

    // add empty cell for week number
    if (this.showWeekNumbers) {
      html += '<th></th>';
    }

    if (!minDate || minDate.isBefore(calendar.firstDay)) {
      html += '<th class="prev available"><i class="fa fa-arrow-left icon-arrow-left glyphicon glyphicon-arrow-left"></i></th>';
    } else {
      html += '<th></th>';
    }

    let dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(' YYYY');

    if (this.showDropdowns) {
      dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
    }

    html += '<th colspan="5" class="month">' + dateHtml + '</th>';
    if (!maxDate || maxDate.isAfter(calendar.lastDay)) {
      html += '<th class="next available"><i class="fa fa-arrow-right icon-arrow-right glyphicon glyphicon-arrow-right"></i></th>';
    } else {
      html += '<th></th>';
    }

    html += '</tr>';
    html += '<tr>';

    // add week number label
    if (this.showWeekNumbers) {
      html += '<th class="week">' + this.locale.weekLabel + '</th>';
    }

    $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
      html += '<th>' + dayOfWeek + '</th>';
    });

    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';

    for (let row = 0; row < 6; row++) {
      html += '<tr>';

      // add week number
      if (this.showWeekNumbers) {
        html += '<td class="week">' + calendar[row][0].week() + '</td>';
      }

      for (let col = 0; col < 7; col++) {
        let cname = 'available ';
        cname += (calendar[row][col].month() === calendar[1][1].month()) ? '' : 'off';

        if ((minDate && calendar[row][col].isBefore(minDate, 'day')) || (maxDate && calendar[row][col].isAfter(maxDate, 'day'))) {
          cname = ' off disabled ';
        } else if (calendar[row][col].format('YYYY-MM-DD') === selected.format('YYYY-MM-DD')) {
          cname += ' active ';
          if (calendar[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD')) {
            cname += ' start-date ';
          }
          if (calendar[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD')) {
            cname += ' end-date ';
          }
        } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
          cname += ' in-range ';
          if (calendar[row][col].isSame(this.startDate)) { cname += ' start-date '; }
          if (calendar[row][col].isSame(this.endDate)) { cname += ' end-date '; }
        }

        const title = 'r' + row + 'c' + col;
        html += '<td class="' + cname.replace(/\s+/g, ' ').replace(/^\s?(.*?)\s?$/, '$1') + '" data-title="' + title + '">' + calendar[row][col].date() + '</td>';
      }
      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';
    html += '</div>';

    let i;
    if (this.timePicker) {
      html += '<div class="calendar-time">';
      html += '<select class="hourselect">';
      let start = 0;
      let end = 23;
      let selectedHour = selected.hour();
      if (this.timePicker12Hour) {
        start = 1;
        end = 12;

        if (selectedHour >= 12) {
          selectedHour -= 12;
        }

        if (selectedHour === 0) {
          selectedHour = 12;
        }
      }

      for (i = start; i <= end; i++) {
        if (i === selectedHour) {
          html += '<option value="' + i + '" selected="selected">' + i + '</option>';
        } else {
          html += '<option value="' + i + '">' + i + '</option>';
        }
      }

      html += '</select> : ';

      html += '<select class="minuteselect">';

      for (i = 0; i < 60; i += this.timePickerIncrement) {
        let num = i;
        if (num < 10) {
          num = '0' + num;
        }

        if (i === selected.minute()) {
          html += '<option value="' + i + '" selected="selected">' + num + '</option>';
        } else {
          html += '<option value="' + i + '">' + num + '</option>';
        }
      }

      html += '</select> ';

      if (this.timePicker12Hour) {
        html += '<select class="ampmselect">';
        if (selected.hour() >= 12) {
          html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
        } else {
          html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
        }
        html += '</select>';
      }
      html += '</div>';
    }

    return html;
  },

  remove: function() {
    this.container.remove();
    this.element.off('.daterangepicker');
    this.element.removeData('daterangepicker');
  }
};

$.fn.daterangepicker = function(options, cb) {
  this.each(function() {
    const el = $(this);
    if (el.data('daterangepicker')) {
      el.data('daterangepicker').remove();
    }

    el.data('daterangepicker', new DateRangePicker(el, options, cb));
  });

  return this;
};

const validateDate = function(props, propName) {
  if (!moment(props).isValid()) {
    throw new Error(propName + ' must be a valid date');
  }
};

class DateRangeFilter extends React.Component {
  static propTypes = {
    format: PropTypes.string.isRequired,
    ranges: PropTypes.object.isRequired,
    onApply: PropTypes.func,
    title: PropTypes.string.isRequired,
    onblur: PropTypes.func,
    startDate: validateDate,
    endDate: validateDate
  };

  state = { dateRange: '' };

  componentDidMount() {
    // initialise jQuery date range widget -
    const $calendarNode = $(ReactDOM.findDOMNode(this.refs.calendar));
    const $calendar = $calendarNode.daterangepicker({ ranges: this.props.ranges, format: this.props.format, opens: 'left', locale: { cancelLabel: 'Clear' }, applyClass: 'btn-primary'  });
    this.calendar = $calendar.data('daterangepicker');
    if (this.props.startDate) {
      this.calendar.setStartDate(this.props.startDate);
    }
    if (this.props.endDate) {
      this.calendar.setEndDate(this.props.endDate);
    }

    $calendar.on('apply.daterangepicker', this.handleApply).on('cancel.daterangepicker', this.handleClear);
  }

  componentWillUnmount() {
    // destroy widget on unMount
    this.calendar.remove();
  }

  handleApply = (ev, picker) => {
    if (this.props.onApply) {
      // return moment instances for start and end date ranges
      this.props.onApply(picker.startDate, picker.endDate);
    }

    this.setState({ dateRange: picker.startDate.format(picker.format) + ' - ' + picker.endDate.format(picker.format) });
  };

  handleClear = () => {
    this.setState({ dateRange: '' });
    if (this.props.onApply) {
      // return moment instances for start and end date ranges
      this.props.onApply(null, null);
    }
  };

  getTitle = () => {
    return this.state.dateRange !== '' ? this.state.dateRange : this.props.title;
  };

  render() {
    return (
      <input ref={node => this.calendar = node} onBlur={this.props.onblur}/>
    );
  }
}

export default DateRangeFilter;
