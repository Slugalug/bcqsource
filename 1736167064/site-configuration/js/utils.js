var JsUtil = new function() {
  this.isSet = function (val) {
    return ((typeof val !== typeof undefined) && val);
  };
};

var StringUtil = new function() {
    this.isNonEmptyString = function (str) {
        if ((typeof str !== 'string') && !(str instanceof String)) {
            return false;
        }
        return (str.length > 0);
    };

    this.startWith = function (str1, str2) {
        if (!this.isNonEmptyString(str1)) {
            return false;
        }
        return str1.startsWith(str2);
    };
};

var UiUtil = new function() {
    this.isElementInViewport = function (elem) {
        try {
            if ((typeof jQuery === "function") && (elem instanceof jQuery)) {
                elem = elem[0];
            }
            var rect = elem.getBoundingClientRect();

            var inViewport = (
                (rect.top >= 0) && (rect.left >= 0) &&
                (rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) &&
                (rect.right <= (window.innerWidth || document.documentElement.clientWidth))
            );
            return inViewport;
        } catch (e) {
            return false;
        }
    };
};

var PlatformUtil = new function() {
    this.UNKNOWN = 0;
    this.MAC = 1;
    this.WINDOWS = 2;

    this.getPlatform = function () {
        if (navigator.platform.indexOf('Mac') > -1) {
            return this.MAC;
        }
        if (navigator.platform.indexOf('Win') > -1) {
            return this.WINDOWS;
        }
        return this.UNKNOWN;
    };

    this.isMac = function () {
        var platform = this.getPlatform();
        return (platform === this.MAC);
    };

    this.isWindows = function () {
        var platform = this.getPlatform();
        return (platform === this.WINDOWS);
    };
};

var monthNames = ["January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"];

var dayNames = ["Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"];

/* parseFloat doesn't agree with commas */
if(typeof origParseFloat != 'function') {
	var origParseFloat = parseFloat;
	parseFloat = function(str) {
	     if(typeof str == 'string') {
	    	 str = str.replace(/,/g,'');
	     }
	     return origParseFloat(str);
	}
}

/* toFixed doesn't have a min and max number of decimal places */
/* maxDecimalPlaces if first to be compatible with traditional toFixed calls like toFixed(2) */
Number.prototype.toFixed = function(maxDecimalPlaces, minDecimalPlaces) {
	var factor = Math.pow(10, maxDecimalPlaces || 0);
	var v = (Math.round(Math.round(this * factor * 100) / 100) / factor).toString();
	var retVal;

	if (v.indexOf('.') >= 0) {
		retVal = v + factor.toString().substr(v.length - v.indexOf('.'));
	}
	else if (maxDecimalPlaces > 0) {
		retVal = v + '.' + factor.toString().substr(1);
	}
	else {
		retVal = v;
	}

	if (minDecimalPlaces != undefined && minDecimalPlaces < maxDecimalPlaces && minDecimalPlaces >= 0) {
		// Find actual precision needed.  If it is less than maxDecimalPlaces, call toFixed again with revised precision.
		var precisionNeeded = minDecimalPlaces;
		var str = retVal.toString();
		var extra = str.substring(str.indexOf('.')+minDecimalPlaces+1);
		for (var i=0; i<extra.length; i++) {
			if (parseInt(extra.substring(i,i+1)) > 0) {
				precisionNeeded = minDecimalPlaces + i + 1;
			}
		}
		if (precisionNeeded < maxDecimalPlaces) {
			retVal = Number(retVal).toFixed(precisionNeeded);
		}
	}

	return retVal;
};

function is_undefined(val) {
    return (typeof val === "undefined");
}

// This should mimic the logic of module levers
function checkFlag(flagName) {
    flagName = 'module_' + flagName;
    return !is_undefined(window.knobby) && !is_undefined(window.knobby[flagName]) && window.knobby[flagName] === true;
}

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate()+days);
}

function Spinner(toggle) {
	if (toggle == 'off') {
		$('.spinner').remove();
	}
	else if (toggle == 'on') {
		var left = Math.floor(($(window).width()-32) / 2);
		var top  = Math.floor(($(window).height()-32) / 3) + $(window).scrollTop();
		$('body').append('<div class="spinner" style="left:' + left + 'px; top:' + top + 'px; z-index:2100; position:absolute; width:32px; height:32px;"><img width=32 height=32 border=0 alt="processing" title="processing" src="/site-configuration/images/ajax-loader.gif" /></div>');
	}
}

function formatCurrency(num) {
	num = num.toString().replace(/\$|\,/g,'');
	if(isNaN(num)) {
		num = "0";
	}
	sign = (num == (num = Math.abs(num)));
	num = Math.floor(num*100+0.50000000001);
	cents = num%100;
	num = Math.floor(num/100).toString();
	if(cents < 10) {
		cents = "0" + cents;
	}
	for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
		num = num.substring(0,num.length-(4*i+3))+','+ num.substring(num.length-(4*i+3));
	}
	return (((sign)?'':'-') + num + '.' + cents);
}

function capFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getMonthName(num)
{
    return monthNames[num];
}

function getDayName(num)
{
    return dayNames[num];
}

function makeOptionList(selopt, options, defValue)
{
    var retObj = new Object();
    retObj.options = [];
    retObj.selOpt  = selopt;
    retObj.options.push({id: null, name: defValue});
    var selIdx = 0;
    for(var i = 0; i < options.length; i++)
    {
        var id = options[i];
        if(retObj.selOpt.id === id)
        {
            selIdx = i+1;
        }
        retObj.options.push({id: id, name: capFirstLetter(id)});
    }
    if(options.length > 0)
    {
        retObj.selOpt = retObj.options[selIdx];
    }

    return retObj;
}

function getStoreTypeId() {
    var id = null;
    if(typeof window.storeTypeId !== 'undefined' && window.storeTypeId > 0) {
        id = window.storeTypeId;
    }
    return id;
}

function isDemoStore() {
    var isDemo = false;
    if(typeof window.isADemoStore !== 'undefined' && window.isADemoStore === 1) {
        isDemo = true;
    }
    return isDemo;
}

function sendAnalyticsEventCheck() {
    // skip demo stores.
    if(isDemoStore()) {
        return false;
    }
    // only send for some store types.
    var storeTypeId = getStoreTypeId();
    if(storeTypeId === 5 || storeTypeId === 13) {
        return false;
    }
    return true;
}

function sendAnalyticsEvent(category, eventAction, label) {
    if (!sendAnalyticsEventCheck()) {
        return;
    }

    if (typeof gtag === "function") {
        gtag('event', eventAction, {
            'event_category': category,
            'event_label': label
        });
    }
}

//Certain events happen a lot and we have enough data for them right now. This function will disable those events, but will easily allow us to collect more information down the road if we need to
function ignoreThisEventByLabel(label) {
    const labels_to_reject = [
        'Product - Create Product',
    ];

    if (labels_to_reject.indexOf(label) > -1) {
        return true;
    }
    return false;
}

function sendMixpanelEvent(eventAction, otherProps) {
    if (typeof mixpanel === 'undefined' || !sendAnalyticsEventCheck() || typeof otherProps !== 'object' ) {
        return;
    }

    if (ignoreThisEventByLabel(eventAction)) {
        return;
    }

    let commonProperties = {
        'store_id': window.store_id,
        'store_name': window.g_store_name,
        'store_type_id': getStoreTypeId(),
    };
    let mixpanelObject = {
        ...commonProperties,
        ...otherProps
    }

    try {
        mixpanel.identify(window.g_user_id ? window.g_user_id : null);
        mixpanel.track(eventAction, mixpanelObject);
    } catch (e) {
        console.log(e);
    }
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
}

function showNotification(title, msg, seconds) {
    if (typeof seconds !== 'number') {
        seconds = 5;
    }
    var timeout = seconds * 1000;
    $.growlUI(title, msg, timeout);
}

function showSuccessNotification(successMsg, seconds) {
    if (typeof seconds !== 'number') {
        seconds = 3;
    }
    var title = '';
    var msg = successMsg + '&nbsp;&nbsp;<i class="fa fa-check text-success"></i>';
    showNotification(title, msg, seconds);
}

function showPersistentSuccessNotification(successMsg) {
    showSuccessNotification(successMsg, 0);
}

function showErrorNotification(errorMsg) {
    var title = 'Oops <i class="fa fa-exclamation text-danger"></i>';
    showNotification(title, errorMsg, 5);
}

if (!window.modalStack) {
    modalStack = [];
}
if (!window.lastModal) {
    lastModal = '';
}

function setModalStack(selector) {
    selector.on('show.bs.modal', function () {
        $('.modal.in:not(.without-stack)').css('z-index', '1020');
        $('#' + this.id).css('z-index', '1050');

        if (modalStack.length === 0 || this.id !== modalStack[modalStack.length - 1]) {
            modalStack.push(this.id);
            window.lastModal = ''; //reset last modal so that it can be used again if shown.
        }
    });

    selector.on('hide.bs.modal', function (e) {
        //Prevents Event from firing multiple times
        if (lastModal === e.target && e.target.id !== modalStack[modalStack.length - 1]) {
            return;
        }

        window.lastModal = e.target;

        if (modalStack.length > 0 && this.id === modalStack[modalStack.length - 1]) {
            modalStack.pop();
        }

        if (modalStack.length > 0) {
            var newTopModal = modalStack[modalStack.length - 1];
            $('#' + newTopModal).css('z-index', '1050');
        }
    });
}

function handleJsonFail(responseJSON) {
    if(typeof responseJSON == 'undefined') {
        return;
    }
    var msg = responseJSON.error;
    var action = responseJSON.action;
    if(action == 'login') {
        $('#loginModal').modal('show');
        $('#loginModal').on('shown.bs.modal', function() {
            $('#loginUsername').focus();
            window.isLoggedOut = true;
        }).modal('show');
        return false; // tell track js we handled it and don't need it reported
    }
}

$(function() {
    $('.modal:not(.without-stack)').each(function () {
        if ($(this).on) {
            setModalStack($(this));
        }
    });
});

function openProductboardModal() {
    window.vueEventHub.$emit('productboard-modal-open');
}

function hasUserPermission(key) {
    if (!window.hasOwnProperty('rain_permission')) {
        return true;
    }

    var permission = window.rain_permission;

    if (!permission.hasOwnProperty(key)) {
        return false;
    }

    return permission[key];
}
if (typeof getPartsDate === 'undefined') {
    function getPartsDate(date) {
        if (!date || typeof date !== 'string') {
            return {
                month: 0,
                day: 0,
                year: 0,
            };
        }
        var dateParts = date.split('/');

        return {
            month: parseInt(dateParts[0], 10),
            day: parseInt(dateParts[1], 10),
            year: parseInt(dateParts[2], 10),
        };
    }
}
function customDateForShownYears(date, numberOfShownYears) {
    if (!date) {
        return date;
    }

    var partsDate = getPartsDate(date);
    var showYear = new Date().getFullYear() - partsDate.year < numberOfShownYears;
    if (showYear) {
        return date;
    }

    return partsDate.month + '/' + partsDate.day;
}
function confirmationEmailSentPopupOpen() {
    $('#confirmationEmailSentPopup').modal('show');
}
