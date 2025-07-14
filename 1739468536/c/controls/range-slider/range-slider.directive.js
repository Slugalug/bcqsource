angular.module('rainApp').directive('rangeSlider', function ($document) {
    return {
        restrict: 'E',
        scope: {
            min: '=',
            max: '=',
            minValue: '=',
            maxValue: '=',
            isPriceFilter: '@',
            isFloat: '=',
            useDynamicRanges: '=',
            onUpdate: '&',
        },
        templateUrl: function () {
            return '/c/controls/range-slider/range-slider.template.html';
        },
        link: function (scope, element) {
            var container = element[0].querySelector('.slider-container');
            var track = container.querySelector('.slider-track');
            var range = container.querySelector('.slider-range');
            var thumbMin = container.querySelector('.slider-thumb.min');
            var thumbMax = container.querySelector('.slider-thumb.max');

            scope.inputMinValue = formatWithCommasAndCurrency(scope.minValue);
            scope.inputMaxValue = formatWithCommasAndCurrency(scope.maxValue);

            var activeThumb = null;

            function getAdjustedRanges(dynamicRanges) {
                var adjustedRanges = [];

                for (var i = 0; i < dynamicRanges.length; i++) {
                    var range = dynamicRanges[i];

                    if (range.min >= scope.max) {
                        break;
                    }

                    adjustedRanges.push({
                        min: range.min,
                        max: Math.min(range.max, scope.max),
                        increment: range.increment
                    });
                }

                return adjustedRanges;
            }

            function getTotalWeight(ranges) {
                return ranges.reduce((sum, range) => sum + (range.max - range.min) / range.increment, 0);
            }

            function getValueFromPercentageDynamic(percent, ranges) {
                var targetWeight = (percent / 100) * getTotalWeight(ranges);
                var accumulatedWeight = 0;

                for (var i = 0; i < ranges.length; i++) {
                    var rangeWeight = (ranges[i].max - ranges[i].min) / ranges[i].increment;

                    if (targetWeight <= accumulatedWeight + rangeWeight) {
                        var stepsInRange = targetWeight - accumulatedWeight;
                        return ranges[i].min + stepsInRange * ranges[i].increment;
                    }

                    accumulatedWeight += rangeWeight;
                }

                return scope.max;
            }

            function getPercentageFromValueDynamic(value, ranges) {
                var accumulatedWeight = 0;

                for (var i = 0; i < ranges.length; i++) {
                    if (value <= ranges[i].max) {
                        var stepsInRange = (value - ranges[i].min) / ranges[i].increment;
                        return ((accumulatedWeight + stepsInRange) / getTotalWeight(ranges)) * 100;
                    }

                    accumulatedWeight += (ranges[i].max - ranges[i].min) / ranges[i].increment;
                }

                return 100;
            }

            function getValueFromPercentageLinear(percent) {
                return scope.min + (percent / 100) * (scope.max - scope.min);
            }

            function getPercentageFromValueLinear(value) {
                return ((value - scope.min) / (scope.max - scope.min)) * 100;
            }

            function getValueFromPercentage(percent) {
                if (scope.useDynamicRanges) {
                    var ranges = getAdjustedRanges(scope.useDynamicRanges);
                    return getValueFromPercentageDynamic(percent, ranges);
                }

                return getValueFromPercentageLinear(percent);
            }

            function getPercentageFromValue(value) {
                if (scope.useDynamicRanges) {
                    var ranges = getAdjustedRanges(scope.useDynamicRanges);
                    return getPercentageFromValueDynamic(value, ranges);
                }

                return getPercentageFromValueLinear(value);
            }

            function updatePositions() {
                var percentMin = getPercentageFromValue(scope.minValue);
                var percentMax = getPercentageFromValue(scope.maxValue);

                thumbMin.style.left = `${percentMin}%`;
                thumbMax.style.left = `${percentMax}%`;

                range.style.left = `${percentMin}%`;
                range.style.right = `${100 - percentMax}%`;

                if (percentMin > 50) {
                    thumbMin.style.zIndex = 2;
                    thumbMax.style.zIndex = 1;
                } else {
                    thumbMin.style.zIndex = 1;
                    thumbMax.style.zIndex = 2;
                }
            }

            function setModelValue(percent) {
                var isMin = activeThumb.classList.contains('min');
                var value = getValueFromPercentage(percent);

                if (isMin) {
                    scope.minValue = Math.min(value, scope.maxValue);
                    scope.inputMinValue = formatWithCommasAndCurrency(Math.min(value, scope.maxValue));
                } else {
                    scope.maxValue = Math.max(value, scope.minValue);
                    scope.inputMaxValue = formatWithCommasAndCurrency(Math.max(value, scope.minValue));
                }

                scope.$apply();
            }

            function startDrag(event, thumb) {
                event.preventDefault();
                activeThumb = thumb;

                $document.on('mousemove', onDrag);
                $document.on('mouseup', stopDrag);
            }

            function onDrag(event) {
                if (!activeThumb) {
                    return;
                }

                var rect = track.getBoundingClientRect();
                var percent = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));

                setModelValue(percent);
            }

            function stopDrag() {
                activeThumb = null;

                $document.off('mousemove', onDrag);
                $document.off('mouseup', stopDrag);
            }

            scope.applyMinKeyUp = function (event) {
                if (13 === event.keyCode) {
                    scope.triggerMinUpdate();
                }
            }

            scope.applyMaxKeyUp = function (event) {
                if (13 === event.keyCode) {
                    scope.triggerMaxUpdate();
                }
            }

            scope.applyMinValue = function () {
                validateMinValue();

                scope.minValue = scope.inputMinValue;
                scope.inputMinValue = formatWithCommasAndCurrency(scope.inputMinValue);

                updatePositions();
            }

            scope.setMinValueWithoutCommas = function () {
                if (scope.isFloat) {
                    scope.inputMinValue = parseFloat(scope.minValue).toFixed(2);
                } else {
                    scope.inputMinValue = scope.minValue;
                }
            }

            function validateMinValue() {
                scope.inputMinValue = String(scope.inputMinValue).replace(/[^\d.]/g, '');

                var minRangeValue = scope.min;
                var maxRangeValue = scope.maxValue;

                if (scope.inputMinValue < minRangeValue) {
                    scope.inputMinValue = minRangeValue;
                }
                if (scope.inputMinValue > maxRangeValue) {
                    scope.inputMinValue = maxRangeValue;
                }
            }

            function formatWithCommasAndCurrency(value) {
                var options = scope.isFloat
                    ? { minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'decimal' }
                    : { minimumFractionDigits: 0, maximumFractionDigits: 0, style: 'decimal' };

                var formatter = new Intl.NumberFormat(false, options);
                return scope.isPriceFilter ? (window.currencySymbol || '$') + ' ' + formatter.format(value) : formatter.format(value);
            }

            scope.applyMaxValue = function () {
                validateMaxValue();

                scope.maxValue = scope.inputMaxValue;
                scope.inputMaxValue = formatWithCommasAndCurrency(scope.inputMaxValue);

                updatePositions();
            }

            scope.setMaxValueWithoutCommas = function () {
                if (scope.isFloat) {
                    scope.inputMaxValue = parseFloat(scope.maxValue).toFixed(2);
                } else {
                    scope.inputMaxValue = scope.maxValue;
                }
            }

            function validateMaxValue() {
                scope.inputMaxValue = parseFloat(String(scope.inputMaxValue).replace(/[^\d.]/g, ''));

                var minRangeValue = scope.minValue;
                var maxRangeValue = scope.max;

                if (scope.inputMaxValue > maxRangeValue) {
                    scope.inputMaxValue = maxRangeValue;
                }

                if (scope.inputMaxValue < minRangeValue) {
                    scope.inputMaxValue = minRangeValue;
                }
            }

            scope.triggerMinUpdate = function () {
                scope.applyMinValue()
                scope.onUpdate({ $event: { update: true } });
            };

            scope.triggerMaxUpdate = function () {
                scope.applyMaxValue()
                scope.onUpdate({ $event: { update: true } });
            };

            thumbMin.addEventListener('mousedown', function (event) {
                startDrag(event, thumbMin)
            });
            thumbMax.addEventListener('mousedown', function (event) {
                startDrag(event, thumbMax)
            });

            scope.$watchGroup(['minValue', 'maxValue'], updatePositions);
            scope.$watchGroup(['min', 'max'], updatePositions);

            updatePositions();
        },
    };
});
