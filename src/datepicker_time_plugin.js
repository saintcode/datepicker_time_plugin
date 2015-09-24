(function($) {
    /**
     * autor: saint_code
     * based on: http://mabp.kiev.ua/2009/08/11/customized-datepicker/
     * last update: 22-11-2014
     * version: 0.11
     */

    function pad(num, size){
        var s = "00" + num;
        return s.substr(s.length-size);
    }


    //generate HTML
    var old_generateHTML = $.datepicker._generateHTML;
    $.datepicker._generateHTML = function(inst) {
        var _new_HTML = old_generateHTML.apply(this, arguments), inst;

        if (inst.settings.timeFormat == 24) {
            //set class with_time
            inst.dpDiv.addClass('with_time');

            //set time from value
            var timeStrInp = inst.input.val();
            if(timeStrInp.indexOf(':')!=-1) var timeHours = (new Date(timeStrInp)).getHours(); //set value
            else var timeHours = inst.settings.timeDefaultHour;//set default
            //console.log('timeHours=',timeHours, ' timeStrInp=',timeStrInp);

            var times_html = "<div class='times_wrapper'>";
            times_html += "<div class='time-nav time-nav-up'><i class='ui icon up arrow'></i></div>";

            times_html += "<div class='times_scroll'>";

            for (var i = 0; i < 24; i++) {
                var time_str = pad(i,2)+':00',
                    class_active='';

                if(timeHours==i) class_active=' active';

                times_html += '<div class="time hour'+class_active+'" data-val="'+time_str+'">' + time_str + '</div>'
            }

            times_html += "</div>";

            times_html += "<div class='time-nav time-nav-down'><i class='ui icon down arrow'></i></div>";
            times_html += "</div>";

            _new_HTML = "<div class='datepicker-inner-align'>" +
                            "<div class='align-cell left-align-cell'><div class='dates_wrapper'>" + _new_HTML + "</div></div>" +
                            "<div class='align-cell right-align-cell'>" + times_html + "</div>" +
                        "</div>";
        }
        else if (inst.settings.timeFormat == 12){
            console.log('format 12 hours (not ready)');
        }
        //console.log('SETTINGS=', inst.settings.timeFormat);
        return _new_HTML;
    }


    //min max
    $.datepicker.old_restrictMinMax = $.datepicker._restrictMinMax;
    $.datepicker._restrictMinMax = function(inst,date) {
        var res=$.datepicker.old_restrictMinMax.apply(this, arguments), inst, date;
        var minDate = $.datepicker._getMinMaxDate(inst, "min"),
            maxDate = $.datepicker._getMinMaxDate(inst, "max");
        //if(date < minDate){
        //    console.log('restriction hit!'+date);
        //}
        return res;
    }


    //offset
    $.datepicker.old_checkOffset = $.datepicker._checkOffset;
    $.datepicker._checkOffset = function(inst, offset, isFixed) {
        var res = $.datepicker.old_checkOffset.apply(this, arguments), inst, offset, isFixed;
        if(inst.settings.deltaTop) res.top += inst.settings.deltaTop;
        if(inst.settings.deltaLeft) res.left += inst.settings.deltaLeft;
        if(inst.settings.fixedTop) res.top = inst.settings.fixedTop;
        if(inst.settings.fixedLeft) res.top = inst.settings.fixedFeft;
        //console.log(res);
        return res;
    }


    //update alternate field
    $.datepicker.old_updateAlternate = $.datepicker._updateAlternate;
    $.datepicker._updateAlternate = function(inst) {
        $.datepicker.old_updateAlternate.apply(this, arguments), inst;
        if (inst.settings.timeFormat == 24 || inst.settings.timeFormat == 12) {
            var altField = $(this._get(inst, "altField"));
            if(inst.input.val()) {
                //var date_val = new Date(inst.input.val()); //.replace(' ', 'T')
                if(inst.input.val().indexOf(':')==-1){
                    var date_val = new Date(inst.input.val());
                    date_val.setHours( parseInt(inst.currentTime) );
                }
                else
                    var date_val = new Date(inst.input.val());
                //console.log('date_val=', date_val, ' date=', inst.input.val(), ' inst.currentTime=',inst.currentTime);
                if(date_val.getHours()) {
                    altField.val(altField.val() + ', ' + pad(date_val.getHours(), 2) + ':' + pad(date_val.getMinutes(), 2));
                }
                inst.input.val(inst.input.val()+ 'T' + pad(date_val.getUTCHours(), 2)+':'+pad(date_val.getUTCMinutes(), 2)+'Z');
            }
        }
    }


    //format date
    $.datepicker.old_formatDate = $.datepicker._formatDate;
    $.datepicker._formatDate = function(inst, day, month, year) {
        var res = $.datepicker.old_formatDate.apply(this, arguments), inst, day, month, year;
        //if (inst.settings.timeFormat == 24 || inst.settings.timeFormat == 12) {
        //    if(inst.currentTime) {
        //        res = res + ' ' + inst.currentTime;
        //    }
        //    console.log('_formatDate formated=', res, ' inst=', inst, inst.currentTime);
        //}
        return res;
    }


    //Select date - Don't hide the date picker when clicking a date
    $.datepicker.old_selectDate = $.datepicker._selectDate;
    $.datepicker._selectDate = function(id, dateStr) {
        var target = $(id);
        var inst = this._getInst(target[0]);

        if (inst.settings.timeFormat == 24 || inst.settings.timeFormat == 12) {
            inst.inline = true; //Don't hide
            var times = inst.dpDiv.closest('.ui-datepicker').find('.times_wrapper .time.active');
            //console.log('selectDate times=',times);
            if(times.size()>0){   //add time str to result
                var time_str = times.data('val');
                inst.currentTime = time_str;
                //var newDateStr = (new Date(dateStr+' '+time_str)).toISOString();
                //inst.input.val(dateStr);
                //console.log('selectDate  dateStr=', dateStr, ' timestr=',time_str);
            }
        }

        $.datepicker.old_selectDate(id, dateStr);
        inst.inline = false;
        this._updateDatepicker(inst);
        //inst.input.val(newDateStr);
    }


    //Scroll events, Select time events, afterShow - custom call back
    var old_updateDatepicker = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
        old_updateDatepicker.apply(this, arguments), inst;

        if (inst.settings.timeFormat == 24 || inst.settings.timeFormat == 12) {
            //scroll events
            inst.dpDiv.find('.icon.up,.icon.down').click(function (event) {
                var $list = $(event.target || event.srcElement).closest('.times_wrapper').find('.times_scroll'),
                    margin = parseInt($list.find('.time').css('marginTop'));

                if ($(this).hasClass('up')) {//console.log('scroll up', list );
                    $list.animate({scrollTop: $list.scrollTop() - $list.height() + margin}, 200);
                }
                else {//console.log('scroll down', list );
                    $list.animate({scrollTop: $list.scrollTop() + $list.height() - margin}, 200);
                }
            });

            //select time events
            inst.dpDiv.closest('.ui-datepicker').find('.times_wrapper .time').click(function (event) {
                var elem = $(event.target || event.srcElement);
                //console.log('select time ', elem);
                elem.closest('.ui-datepicker').find('.times_wrapper .time').removeClass('active');
                elem.addClass('active');
                $.datepicker._selectDate(inst.input, $.datepicker._formatDate(inst,
                    inst.currentDay, inst.currentMonth, inst.currentYear));
                $.datepicker._hideDatepicker();
            });

            //scroll to selected time
            var $time_active = inst.dpDiv.closest('.ui-datepicker').find('.times_wrapper .time.active');

            if($time_active.length > 0 ){
                var $list = inst.dpDiv.closest('.ui-datepicker').find('.times_scroll');
                $list.scrollTop($time_active.position().top - ($list.height()/2));
            }
        }

        //afterShow - custom call back
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null));  // trigger custom callback
    }

})(jQuery);