"use strict";

angular.module('rainApp').directive("webSiteFacets", function () {

    var controller = function ($scope, $window, $timeout, $httpParamSerializer) {

        $scope.facetsViewLimit = 6;

        $scope.isStonesFacetsEnable = function () {
            return window.isJewelry && !!window.knobby && window.knobby.module_stone_management && window.knobby.module_stones_facets;
        };

        $scope.DYNAMIC_FACETS_META = {
            __type__: {
                sorder: 2,
                title: 'Item Type',
                hideIfOne: true,
            },
            class_category: {
                sorder: 1,
                title: 'Class Categories',
                normalizer: function (item) {
                    return $scope.classGroups[item] || item.key;
                },
                filter: function (value, index, allValues) {
                    if (+value.key === -1 && allValues.length <= 2) {
                        // we don't need to show root All Classes category if there is only one class category
                        return false;
                    }

                    return true;
                },
                no_checkbox: true
            },
            custom_field: {
                normalizer: function(item) {
                    if (item.custom_field_type === 'currency' && $scope.currencySymbol) {
                        return $scope.currencySymbol + item.key;
                    }

                    if (item.custom_field_type === 'dropdown') {
                        return item.value;
                    }

                    return item.key;
                },
            },
            mfg_name: {
                sorder: 3,
                title: 'Brand',
                capitalizeValue: false
            },
            instructor: {
                sorder: 4,
                title: 'Instructor'
            },
            skill_level: {
                sorder: 5,
                title: 'Skill Level',
                sort: (function () {
                    var order = ['beginner', 'intermediate', 'advanced'];
                    return function (a, b) {
                        return order.indexOf(a.key) - order.indexOf(b.key)
                    }
                })(),
            },
        };

        $scope.viewAllDynamicFacets = {};
        $scope.viewAllVariationsFacets = {};

        $scope.init = function () {
            $scope.classGroups = $window.classGroups;

            $scope.showFacetsNumbers = $window.showFacetsNumbers;
            $scope.currencySymbol = $window.currencySymbol;
            $scope.decodedCurencySymbol = $window.currencySymbol;
            $scope.search_keyword = $window.search_keyword;
            $scope.category = $window.facetsCategory;
            $scope.dynamicFacets = $window.facetsDynamicFacets;
            $scope.dynamicFacetsNormalized = prepareDynamicFacets($window.facetsDynamicFacets);

            $scope.dynamicFilters = $window.facetsDynamicFilters;
            $scope.variationsFilters = $window.facetsVariationsFilters;
            $scope.minFilterPrice = $window.minFilterPrice || 0;
            $scope.maxFilterPrice = $window.maxFilterPrice || 2000000;
            $scope.priceFilter = {
                min: null,
                max: null,
            };

            if ($scope.isStonesFacetsEnable()) {
                $scope.stoneOptionsFilter = {
                    carat: {
                        min: $window.stoneMinCaratFilter || 0.01,
                        max: $window.stoneMaxCaratFilter || 100,
                        filterMin: 0.01,
                        filterMax: 100,
                    },
                    colors: $window.stoneColorsFilters || [],
                    types: $window.stoneTypesFilter || [],
                    clarities: $window.stoneClaritiesFilter || [],
                    cuts: $window.stoneCutsFilter || [],
                    shapes: $window.stoneShapesFilter || [],
                };
            }

            $scope.variationsFacets = {};
            angular.forEach($window.facetsVariationsFacets, function (values, key) {
                $scope.variationsFacets[key] = [];
                angular.forEach(values, function (value) {
                    $scope.variationsFacets[key].push(value);
                })
            });

            $scope.hasClasses = $window.facetsHasClasses;

            $scope.classDateFilter = $window.facetsClassDateFilter;

            $scope.isJewelry = $window.isJewelry;

            $scope.visibleColorGroups = {};
            $scope.getStoneFacets = [];

            if ($scope.isStonesFacetsEnable()) {
                $scope.getStoneFacets = [
                    $scope.createStoneFilter('Type', window.stoneTypesFacets, 'types'),
                    $scope.createStoneFilter('Clarity', window.stoneClaritiesFacets, 'clarities'),
                    $scope.createStoneFilter('Cut', window.stoneCutsFacets, 'cuts'),
                ];
            }

            if ($scope.isStonesFacetsEnable()) {
                $scope.visibleColorGroups = JSON.parse(localStorage.getItem('visible-color-groups')) || {};
            }

            if ($scope.isExpandCollapseWebFiltersFlagEnabled()) {
                if (localStorage.getItem('expand-collapse-state')) {
                    $scope.expandCollapseState = JSON.parse(localStorage.getItem('expand-collapse-state'));
                } else {
                    if ($scope.collapseFiltersOnInit()) {
                        $scope.expandCollapseState = $scope.getExpandCollapseState(false);
                    } else {
                        $scope.expandCollapseState = $scope.getExpandCollapseState(true);
                    }
                }
            }

            $timeout(initDatePicker);

            $timeout(initPriceFilter)
        };

        $scope.createStoneFilter = function(filterName, options, arrayName) {
            return {
                filterName: filterName,
                filterOptions: Array.isArray(options) ? options : [],
                isOptionChecked: function (value) {
                    return $scope.stoneOptionsFilter[arrayName].includes(value);
                },
                toggleAction: function (value) {
                    $scope.toggleStoneFilterAction(arrayName, value);
                },
            };
        }

        $scope.toggleStoneFilterAction = function (filterName, value) {
            var index = $scope.stoneOptionsFilter[filterName].indexOf(value);

            if (index === -1) {
                $scope.stoneOptionsFilter[filterName].push(value);
            } else {
                $scope.stoneOptionsFilter[filterName].splice(index, 1);
            }

            $scope.applyFilters();
        };

        $scope.handleCategoryClick = function (category) {
            var location = category.url,
                filtersString = $scope.getFiltersString();

            if (filtersString) {
                location += '?';
            }

            var uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
            var match = window.location.href.match(uuidRegex);

            if ('/iishop' === location && match) {
                location = '/' + match[0];
            }

            $window.location = location + filtersString;
        };

        $scope.applyFilters = function (url) {
            $timeout(function () {
                var location = url || $window.location.pathname;

                var filtersString = $scope.getFiltersString();

                if (filtersString) {
                    location += '?';
                }

                $window.location = location + filtersString;
            });
        };

        $scope.priceDynamicRanges = [
            {min: 0, max: 30, increment: 2},
            {min: 30, max: 100, increment: 5},
            {min: 100, max: 500, increment: 10},
            {min: 500, max: 3000, increment: 20},
            {min: 3000, max: 5000, increment: 100},
            {min: 5000, max: 10000, increment: 200},
            {min: 10000, max: 20000, increment: 2000},
            {min: 20000, max: 50000, increment: 10000},
            {min: 50000, max: Infinity, increment: 20000},
        ];

        $scope.caratDynamicRanges = [
            {min: 0, max: 2, increment: 0.01},
            {min: 2, max: 3, increment: 0.05},
            {min: 3, max: 5, increment: 0.1},
            {min: 5, max: 10, increment: 0.5},
            {min: 10, max: Infinity, increment: 10},
        ];

        $scope.getFiltersString = function () {
            var dataToSerialize = {};

            if ($scope.search_keyword) {
                dataToSerialize.search_keyword = $scope.search_keyword;
            }

            if (!angular.equals({}, $scope.dynamicFilters)) {
                dataToSerialize.dynamicFilters = $scope.dynamicFilters;
            }

            if (!angular.equals({}, $scope.variationsFilters)) {
                dataToSerialize.variationsFilters = $scope.variationsFilters;
            }

            if ($scope.priceFilter.min !== null && $scope.priceFilter.min !== $scope.minFilterPrice) {
                dataToSerialize.minPrice = $scope.priceFilter.min;
            }

            if ($scope.priceFilter.max !== null &&  $scope.priceFilter.max !== $scope.maxFilterPrice) {
                dataToSerialize.maxPrice = $scope.priceFilter.max;
            }

            if ($scope.classDateFilter !== null) {
                dataToSerialize.classDateFilter = $scope.classDateFilter;
            }

            if ($scope.isStonesFacetsEnable()) {
                if ($scope.stoneOptionsFilter.shapes?.length) {
                    dataToSerialize.stnshps = $scope.stoneOptionsFilter.shapes.join('|');
                }

                if ($scope.stoneOptionsFilter.colors?.length) {
                    dataToSerialize.stnclrs = $scope.stoneOptionsFilter.colors.join('|');
                }

                if ($scope.stoneOptionsFilter.clarities?.length) {
                    dataToSerialize.stnclrt = $scope.stoneOptionsFilter.clarities.join('|');
                }

                if ($scope.stoneOptionsFilter.types?.length) {
                    dataToSerialize.stntps = $scope.stoneOptionsFilter.types.join('|');
                }

                if ($scope.stoneOptionsFilter.cuts?.length) {
                    dataToSerialize.stncuts = $scope.stoneOptionsFilter.cuts.join('|');
                }

                if ($scope.stoneOptionsFilter.carat.min !== $scope.stoneOptionsFilter.carat.filterMin || $scope.stoneOptionsFilter.carat.max !== $scope.stoneOptionsFilter.carat.filterMax) {
                    dataToSerialize.stncrtmn = $scope.stoneOptionsFilter.carat.min;
                    dataToSerialize.stncrtmx = $scope.stoneOptionsFilter.carat.max;
                }
            }

            var urlParams= $scope.getQueryParams();
            if (urlParams['sort']) {
                dataToSerialize.sort = urlParams['sort'];
            }
            if (urlParams['order']) {
                dataToSerialize.order = urlParams['order'];
            }

            return $httpParamSerializer(dataToSerialize);
        };

        $scope.getQueryParams = function () {
            var params = {};
            var queryString = $window.location.search.substring(1);
            var pairs = queryString.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                var key = decodeURIComponent(pair[0]);
                var value = decodeURIComponent(pair[1] || "");
                if (key) {
                    params[key] = value;
                }
            }
            return params;
        };

        $scope.handleAllCategoriesClick = function () {
            $scope.clearAllFilters(false);
            $timeout(function () {
                $scope.handleCategoryClick({url: '/iishop'})
            });
        };

        $scope.clearAllFilters = function (apply) {
            angular.forEach($scope.variationsFilters, function (filter, key) {
                $scope.clearVariationFilter(key, false);
            });
            angular.forEach($scope.dynamicFilters, function (filter, key) {
                $scope.clearDynamicFacetFilter(key, false);
            });
            $scope.clearPriceFilters(false);
            $scope.clearClassDateFilter(false);

            if ($scope.isExpandCollapseWebFiltersFlagEnabled()) {
                $scope.clearSearchFilter();
                if ($scope.isStonesFacetsEnable()) {
                    $scope.clearStonesFilters();
                }
                $timeout(function () {
                    $scope.handleCategoryClick({url: '/iishop'})
                });
            }

            if (apply) {
                $scope.applyFilters();
            }
        };

        $scope.clearSearchFilter = function () {
            $scope.search_keyword = '';
        }

        $scope.clearStonesFilters = function () {
            $scope.stoneOptionsFilter = {
                carat: {},
                colors: [],
                types: [],
                clarities: [],
                cuts: [],
                shapes: [],
            };
        }

        $scope.clearDynamicFacetFilter = function (key, apply) {
            $scope.dynamicFilters[key] = {};

            if (apply) {
                $scope.applyFilters();
            }
        };

        $scope.clearPriceFilters = function (apply) {
            $scope.priceFilter.min = $scope.minFilterPrice;
            $scope.priceFilter.max = $scope.maxFilterPrice;

            if (apply) {
                $scope.applyFilters();
            }
        };

        $scope.clearVariationFilter = function (key, apply) {
            $scope.variationsFilters[key] = {};

            if (apply) {
                $scope.applyFilters();
            }
        };

        $scope.clearClassDateFilter = function (apply) {
            $scope.classDateFilter = null;
            if (apply) {
                $scope.applyFilters();
            }
        };

        $scope.isDynamicFacetVisible = function (key, item) {
            if ($scope.viewAllDynamicFacets[key]) {
                return true;
            }

            var index = $scope.dynamicFacets[key].map(function (v) {
                return v.key;
            }).indexOf(item.key);

            if (index < $scope.facetsViewLimit) {
                return true;
            }

            if ($scope.dynamicFilters[key] !== undefined && $scope.dynamicFilters[key][item.key] !== undefined) {
                return $scope.dynamicFilters[key][item.key];
            }

            return false;
        };

        $scope.isVariationFacetVisible = function (key, item) {
            if ($scope.viewAllVariationsFacets[key]) {
                return true;
            }

            var index = $scope.variationsFacets[key].map(function (v) {
                return v.key;
            }).indexOf(item.key);

            if (index < $scope.facetsViewLimit) {
                return true;
            }

            if ($scope.variationsFilters[key] !== undefined && $scope.variationsFilters[key][item.key] !== undefined) {
                return $scope.variationsFilters[key][item.key];
            }

            return false;
        };

        $scope.allVariationsFacetsVisible = function (key) {
            if ($scope.viewAllVariationsFacets[key]) {
                return true;
            }

            return $scope.variationsFacets[key].every(function (item) {
                return $scope.isVariationFacetVisible(key, item)
            });
        };

        $scope.allDynamicFacetsVisible = function (key) {
            if ($scope.viewAllDynamicFacets[key]) {
                return true;
            }

            return $scope.dynamicFacets[key].every(function (item) {
                return $scope.isDynamicFacetVisible(key, item)
            });
        };

        $scope.$watch('dynamicFilters', function () {
            clearEmpty($scope.dynamicFilters);
        }, true);

        $scope.$watch('variationsFilters', function () {
            clearEmpty($scope.variationsFilters);
        }, true);

        var clearEmpty = function (object) {
            angular.forEach(object, function (values) {
                for (var key in values) {
                    if (values.hasOwnProperty(key) && !values[key]) {
                        delete values[key];
                    }
                }
            });

            for (var key in object) {
                if (object.hasOwnProperty(key)
                    && (!object[key] || Object.keys(object[key]).length <= 0)) {
                    delete object[key];
                }
            }
        };

        $scope.toggleColorGroup = function (event, colorGroup) {
            event.preventDefault();

            var cgKey = $scope.generateStoneColorGroupKey(colorGroup);

            $scope.visibleColorGroups[cgKey] = !$scope.visibleColorGroups[cgKey];
            localStorage.setItem('visible-color-groups', JSON.stringify($scope.visibleColorGroups));
        };

        $scope.generateStoneColorGroupKey = function (colorGroup) {
            return colorGroup.replace(/[^a-zA-Z0-9]/g, '');
        };

        $scope.getStoneColorsFacets = function () {
            return window.stoneColorsFacets || [];
        };

        $scope.getStoneShapesFacets = function () {
            return window.stoneShapesFacets || [];
        };

        var prepareDynamicFacets = function (facets) {
            var result = [];

            angular.forEach(facets, function (facet, key) {
                var meta = $scope.DYNAMIC_FACETS_META[key] || {};

                if (meta.sort) {
                    facet.sort(meta.sort);
                }

                if (meta.filter) {
                    facet = facet.filter(meta.filter);
                }

                if (facet.length > 0 && facet[0].custom_field) {
                    meta = $scope.DYNAMIC_FACETS_META['custom_field'];

                    if (facet[0].title) {
                        meta.title = facet[0].title;
                    }
                }

                result.push({
                    sorder: meta.sorder || Infinity,
                    values: facet,
                    key: key,
                    title: meta.title || key,
                    capitalizeValue: meta.capitalizeValue = true,
                    meta: meta
                });
            });

            if (window.knobby && window.knobby.module_facet_fields_order_web_fix) {
                result.sort(function (a, b) {
                    var keyA = (a.key && a.key.includes('::') && a.key.split('::')[1]) ? a.key.split('::')[1] : '';
                    var keyB = (b.key && b.key.includes('::') && b.key.split('::')[1]) ? b.key.split('::')[1] : '';

                    return keyA.localeCompare(keyB);
                });
            } else {
                result.sort(function (a,b) {
                    return a.sorder - b.sorder;
                });
            }

            return result;
        };

        var initPriceFilter = function () {
            $scope.priceFilter = {
                min: $window.facetsMinPriceFilter
                && $window.facetsMinPriceFilter > $scope.minFilterPrice
                && $window.facetsMinPriceFilter < $scope.maxFilterPrice
                    ? $window.facetsMinPriceFilter
                    : $scope.minFilterPrice,
                max: $window.facetsMaxPriceFilter
                && $window.facetsMaxPriceFilter < $scope.maxFilterPrice
                && $window.facetsMaxPriceFilter > $scope.minFilterPrice
                    ? $window.facetsMaxPriceFilter
                    : $scope.maxFilterPrice,
            };
        };

        var initDatePicker = function() {
            var datePickerOptions = {
                linkedCalendars: false,
                minDate: moment(),
                startDate: moment(),
                endDate: moment(),
                locale: {
                    format: 'MMM D, YYYY',
                    cancelLabel: 'Clear'
                },
                drops: 'up',
                autoApply: true,
                autoUpdateInput: false,
                opens: 'right',
                ranges: {
                    'Today': [moment(), moment()],
                    'Tomorrow': [moment().add(1, 'days'), moment().add(1, 'days')],
                    'Next 7 Days': [moment(), moment().add(6, 'days')],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                }
            };

            if ($scope.$element.find('#filterDateRange').length > 0) {
                $scope.$element.find('#filterDateRange').daterangepicker(datePickerOptions);

                $scope.$element.find('#filterDateRange').on('apply.daterangepicker', function(ev, picker) {
                    $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));

                    $scope.classDateFilter = picker.startDate.format('YYYY-MM-DD HH:mm:ss')+'|'+picker.endDate.format('YYYY-MM-DD HH:mm:ss');
                    $scope.applyFilters();
                });

                if ($scope.classDateFilter !== null) {
                    var parts = $scope.classDateFilter.split('|');
                    $scope.$element.find('#filterDateRange').val(
                        moment(parts[0]).format('MM/DD/YYYY') + ' - ' + moment(parts[1]).format('MM/DD/YYYY')
                    );
                }
            }
        };

        $scope.toggleFilters = function (event) {
            var element = document.getElementById('fn_filter_wrapper');
            if (element.style.display === "block") {
                element.style.display = "none";
            } else {
                element.style.display = "block";
            }
            if (event.target.innerText === event.target.dataset.show) {
                event.target.innerText = event.target.dataset.hide;
            } else {
                event.target.innerText = event.target.dataset.show;
            }
        }

        $scope.handleExpandCollapse = function (parent, key) {
            if (!$scope.isExpandCollapseWebFiltersFlagEnabled()) {
                return;
            }

            if ($scope.expandCollapseState[parent] !== undefined) {
                $scope.expandCollapseState[parent][key] = !$scope.expandCollapseState[parent][key];
            } else {
                $scope.expandCollapseState[parent] = {[key]: true};
            }

            localStorage.setItem('expand-collapse-state', JSON.stringify($scope.expandCollapseState));
        }

        $scope.isExpandCollapseWebFiltersFlagEnabled = function () {
            return !!window.knobby && window.knobby.module_expand_collapse_web_filters;
        };

        $scope.getButtonExpandCollapseAllTitle = function () {
            const isCollapseAll = Object.values($scope.expandCollapseState).every(child =>
                Object.values(child).every(value => value === true)
            );

            return isCollapseAll ? 'Collapse All' : 'Expand All';
        };

        $scope.handleExpandCollapseAll = function (action) {
            if (action === 'Collapse All') {
                $scope.expandCollapseState = $scope.getExpandCollapseState(false);
            } else {
                $scope.expandCollapseState = $scope.getExpandCollapseState(true);
            }

            localStorage.setItem('expand-collapse-state', JSON.stringify($scope.expandCollapseState));
        };

        $scope.collapseFiltersOnInit = function () {
            return $scope.isStonesFacetsEnable() || ($scope.dynamicFacetsNormalized.length + Object.keys($scope.variationsFacets).length) > 3;
        };

        $scope.getExpandCollapseState = function (value) {
            return {
                static: {
                    search: value,
                    categories: value,
                    price: value,
                },
                dynamic: Object.fromEntries(
                    $scope.dynamicFacetsNormalized.map(facet => [facet.key, value])
                ),
                variations: Object.fromEntries(
                    Object.keys($scope.variationsFacets).map(key => [key, value])
                ),
                ...($scope.isStonesFacetsEnable() ? {
                    stones: {
                        Clarity: value,
                        Cut: value,
                        Type: value,
                        carat: value,
                        color: value,
                        shapes: value,
                    }
                } : {})
            };
        };

        $scope.isAnyFilterSelected = function () {
            return !!(Object.keys($scope.dynamicFilters).length || Object.keys($scope.variationsFilters).length || $scope.search_keyword || (!$scope.priceFilter.min && $scope.priceFilter.max !== 50000) || ($scope.isStonesFacetsEnable() && !$scope.isStoneOptionsFiltersEmpty()) || $scope.category.current);
        }

        $scope.isStoneOptionsFiltersEmpty = function () {
            var stoneOptionsFilter = $scope.stoneOptionsFilter;
            var arraysAreEmpty = ['clarities', 'colors', 'cuts', 'shapes', 'types'].every(function (key) {
                return !stoneOptionsFilter[key].length;
            });
            var caratFilterIsDefault = stoneOptionsFilter.carat?.filterMin === 0.01 &&
                stoneOptionsFilter.carat?.filterMax === 100;

            return arraysAreEmpty && caratFilterIsDefault;
        };
    };

    return {
        restrict: 'E',
        scope: {},
        controller: controller,
        templateUrl: '/c/js/website-facets/webSiteFacetsTemplate.html?v=1.0.4',
        link: function ($scope, $element) {
            $scope.$element = $element;
            $scope.init();
        }
    };
});

angular.module('rainApp').filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});


angular.module('rainApp').filter('trust', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    };
});
