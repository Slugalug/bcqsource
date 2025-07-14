var fnToJason = function() {
    var tmp = {};
    for(var key in this) {
        if(typeof this[key] !== 'function') {
            tmp[key] = this[key];
    	}
    }
    return tmp;
};

var arrayDiff = function(a1, a2) {
  var a=[], diff=[];
  for(var i=0;i<a1.length;i++)
    a[a1[i]]=true;
  for(var i=0;i<a2.length;i++)
    if(a[a2[i]]) delete a[a2[i]];
    else a[a2[i]]=true;
  for(var k in a)
    diff.push(k);
  return diff;
}

function checkAndFixNumber(number) {
	"use strict";
	var return_value = number;
	if(typeof number === 'undefined' || number === null || number === '') {
		return_value = 0.00;
	}
	if(typeof number === 'number' && isNaN(number)) {
		return_value = 0.00;
	}
	if (return_value !== 0) {
		return_value = parseFloat(number);
	}

	return return_value;
}

function fractionalMultiplication(firstNumber, secondNumber) {
	if (isNaN(firstNumber) || isNaN(secondNumber)) {
		return 0;
	}

	return Number(new Big(Number(firstNumber)).times(Number(secondNumber)));
}

function roundAndReturnNumber(number, precision) {
	"use strict";
	var checked_number = checkAndFixNumber(number);
	if((typeof precision === 'undefined') || (isNaN(precision)) || (null === precision)) {
		precision = 2;
	}

	var isNegative = false;
	if (checked_number < 0) {
	    isNegative = true;
        checked_number = -checked_number;
    }

	var value = Number(Math.round(checked_number + 'e+' + precision)  + ('e-' + precision));
	if (isNegative) {
	    value = -value;
    }

	return value;
}

function fixFloat(input_number, min) {
    "use strict";
	var number = checkAndFixNumber(input_number);

	if((typeof min === 'undefined') || (isNaN(min))) {
		min = 2;
	}
	var tmp = parseFloat(number);
	if (isNaN(tmp)) {
		tmp = parseInt(tmp);    // this stupid step should remove the formatting from the string...
		if (isNaN(tmp)) {
			return 0;
		} else {
			tmp = tmp + parseFloat('0.00000000');
		}
	}

	var rounding_power = Math.pow(10,min);
	number = parseFloat(number);
	number = Math.round(number * rounding_power) / rounding_power; // should round to 2 decimal places...
	//number = parseFloat(number).toPrecision(min);
	return parseFloat(number);
}

function subFloats(input_number1, input_number2, min) {
    "use strict";

	if((typeof min === 'undefined') || (isNaN(min))) {
		min = 2;
	}
	var number1 = fixFloat(input_number1, min);
	var number2 = fixFloat(input_number2, min);

	var rounding_power = Math.pow(10,min);
	var result = (Math.round(number1 * rounding_power) - Math.round(number2 * rounding_power)) / rounding_power;

	return parseFloat(result);
}

// function used to clearly delineate what type of object something is...
// returns a string
Object.toType = (function toType(global) {
    "use strict";
    return function(obj) {
        if (obj === global) {
            return "global";
        }
        return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };
})(this);

Object.jsonifyStringifiedJsonAttributes = (function(Obj) {
    "use strict";

    for (var attribute in Obj) {
        if (Obj.hasOwnProperty(attribute)) {
            if (typeof Obj[attribute] === 'string') {
                try {
                   if ( /^[\[|\{].*[\]|\}]$/.test(Obj[attribute])) {
                       Obj[attribute] = JSON.parse(Obj[attribute]);
                   }
                } catch (error) {
                }
            }
        }
    }
});

var typingTimeout;
var t0 = 0;
var t1 = 0;
var typeSpeedCounter = 0;
var barcodeInput = false;
function typeSpeed(time) {
	if (t0 === 0) {
		t0 = time;
	} else {
		t1 = time;
	}
	typeSpeedCounter++;
}

function isBarcode() {
	barcodeScan = false;
	if (t0 > 0 && t1 > 0 && typeSpeedCounter >= 4) {
		var tDiff = t1-t0;
		//console.log('Diff = ' + tDiff);
		var tAvg = tDiff / typeSpeedCounter;
		//console.log('Avg = ' + tAvg);
		if (tAvg < 50) {		
			barcodeScan = true;
		}
	}
	t0 = 0;
	t1 = 0;
	typeSpeedCounter = 0;	
	barcodeInput = barcodeScan;
	//console.log("Return " + barcodeScan);
	return barcodeScan;
}


