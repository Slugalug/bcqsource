"use strict";

/**
 * Controller for class item page (v2 classes).
 */

var Web = angular.module('rainWebApp',['ui.bootstrap.modal','ngSanitize']);
angular.module('rainWebApp').controller("classItemCtrl", function ($scope)
{
    $scope.quilt_class_id = null;
    $scope.errorMessage = null;
    $scope.waitlist_contact_errorMessage = null;
    $scope.waitlist_contact_error = null;
    $scope.classPackagesEnabled = window.classPackagesEnabled;
    $scope.customerFirstName = window.customerFirstName;
    $scope.customerLastName = window.customerLastName;
    $scope.customerEmail = window.customerEmail;
    $scope.customerPhone = window.customerPhone;
    $scope.storeLocationId = window.store_location_id;

    $scope.init = function(quilt_class_id, require_names, show_add_to_cart, show_price, event_id, is_discountable) {
        $scope.price = +window.price;
        $scope.currencySymbol = window.currencySymbol;
        $scope.quilt_class_id = quilt_class_id;
        $scope.event_id = event_id;
        $scope.model = Object.create(ClassItemModel);
        $scope.model.setId(quilt_class_id);
        $scope.model.setEventData(JSON.parse(window.event_data));
        $scope.model.setPackageData(JSON.parse(window.package_data));
        $scope.model.setIsDiscountable(is_discountable);

        $scope.model.canSelectDate = null;

        if ($scope.model.package.available) {
            $scope.model.package.option = 'classAndPackage';
        }

        if (require_names) {
            $scope.model.setRequireNames(true);
        }

        if (show_add_to_cart === 1) {
            $scope.model.setShowAddToCart(true);
        } else {
            $scope.model.setShowAddToCart(false);
        }

        if (show_price === 0) {
            $scope.model.setShowPrice(false);
        } else {
            $scope.model.setShowPrice(true);
        }

        if ($scope.model.show_add_to_cart) {
            angular.forEach($scope.model.events, function(event){
                if (event.event_id == $scope.event_id) {
                    if (!event.in_progress && (event.unlimited_seats === true || event.seats > 0)) {
                        $scope.setSection(event);
                    }
                }
            });
        }
    };

    $scope.showAddToCart = function() {
        var isUnsupportedPackagedClass = (!$scope.classPackagesEnabled && $scope.model.package.available);
        var canShowAddToCart = ($scope.canSelectDate() && !isUnsupportedPackagedClass);

        return canShowAddToCart;
    };

    $scope.canSelectDate = function() {
        if ($scope.model.canSelectDate !== null) {
            return $scope.model.canSelectDate;
        }
        $scope.model.canSelectDate = false;

        var currentDate = new Date();
        currentDate.setHours(0,0,0,0);

        angular.forEach($scope.model.events, function(event){
            var eventDate = new Date(event.last_date);

            if (eventDate >= currentDate) {
                $scope.model.canSelectDate = true;
            }
        });

        return $scope.model.canSelectDate;
    };

    $scope.getPrice = function() {
        var priceStr = $scope.price;

        if ($scope.model.package && ($scope.model.package.option === 'classAndPackage') && ($scope.model.package.price > $scope.price)) {
            priceStr = $scope.model.package.price;
        }
        if ($.isNumeric(priceStr)) {
            priceStr = parseFloat(priceStr).toFixed(2);
        }

        if (priceStr === 0) {
            priceStr = "FREE";
        }

        return priceStr;
    };

    if (navigator.userAgent.match(/MSIE|Trident/)) {
        $("#select_date").on("shown.bs.modal", function () {
            var rows = $(".availableDatesList").find("tr");
            $.each(rows, function (i, row) {
                var height = row.clientHeight;

                var buttons = $(row).find("button");

                $.each(buttons, function (i, button) {
                    $(button).css("height", height);
                });
            });
        });
    }

    $scope.openSelectDate = function() {
        $('#select_date').modal('show');
    };

    $scope.setSection = function(event) {
        $scope.model.waitlist_contact = null;
        $scope.model.waitlist_mode = false;
        $scope.model.setSection(event);
        $scope.closeSelectDate();
    };

    $scope.setWaitlistSection = function (event) {
        $scope.model.waitlist_contact = new WaitListContact();

        if ($scope.isModuleImprovedWaitlist()) {
            if ($scope.customerFirstName) {
                $scope.model.waitlist_contact.first_name = $scope.customerFirstName;
            }

            if ($scope.customerLastName) {
                $scope.model.waitlist_contact.last_name = $scope.customerLastName;
            }

            if ($scope.customerEmail) {
                $scope.model.waitlist_contact.email = $scope.customerEmail;
            }

            if ($scope.customerPhone) {
                var mobileNumber = '';

                mobileNumber = libphonenumber.parsePhoneNumberFromString($scope.customerPhone, 'US');
                if (mobileNumber) {
                    $scope.model.waitlist_contact.mobileCountryCode = mobileNumber.countryCallingCode;
                    $scope.model.waitlist_contact.mobile_phone = mobileNumber.formatNational();
                }
            }
        }

        $scope.model.waitlist_mode = true;
        $scope.model.event = event;
        $scope.closeSelectDate();

        if ($scope.isModuleImprovedWaitlist()) {
            $scope.openWaitlistWebModal();
        }
    };

    $scope.formatMobileNumber = function () {
        var mobileNumber = libphonenumber.parsePhoneNumberFromString($scope.model.waitlist_contact.mobile_phone, 'US');

        if (mobileNumber) {
            $scope.model.waitlist_contact.mobileCountryCode = mobileNumber.countryCallingCode;
            $scope.model.waitlist_contact.mobile_phone = mobileNumber.formatNational();
        }
    };

    $scope.openWaitlistWebModal = function () {
        $('#waitlist_contact_first_name').removeClass('validation-failed');
        $('#waitlist_contact_last_name').removeClass('validation-failed');
        $('#waitlist_contact_email').removeClass('validation-failed');
        $('#waitlist_web_modal').modal('show');
    };

    $scope.closeSelectDate = function () {
        $('#select_date').modal('hide');
    };

    $scope.closeWaitlistModal = function () {
        $('#waitlist_web_modal').modal('hide');
    };

    $scope.closeConfirmationEmailSentPopup = function () {
        $('#confirmationEmailSentPopup').modal('hide');
    };

    $scope.addPerson = function() {

        if($scope.showWaitlistFields()) {

            $scope.model.person_count++;
            return true;
        }
        if($scope.model.event === null) {
            $scope.openSelectDate();
            return false;
        }
        if($scope.model.event.unlimited_seats === false) {
            if($scope.model.person_count >= $scope.model.event.seats) {
                // TODO - something better...
                // alert('no way');
                return false;
            }
        }
        $scope.model.addPerson();
        return true;
    };

    $scope.removePerson = function(uuid) {
        if($scope.model.event === null) {
            return $scope.openSelectDate();
        }
        $scope.model.removePerson(uuid);
    };

    $scope.removeEmptyOrLastPerson = function() {

        if($scope.showWaitlistFields()) {

            if($scope.model.person_count > 1) {

                $scope.model.person_count--;
            }
            return true;
        }
        $scope.model.removeEmptyOrLastPerson();
    };

    /*
     * NOTE: The following is a necessary workaround for a browser issue only found in Safari,
     * where clicking an attendee input causes an additional click event to be triggered,
     * for the first attendee input, resulting in the focus being set to the first attendee input.
     */
    $scope.attendeeClicked = function ($event) {
        $event.preventDefault();
    };

    $scope.qtyChange = function() {

        var totalSeats = $scope.model.event.seats;
        var desired = $scope.model.person_count;
        var current = $scope.model.people.length;
        var max = 100;
        while(desired != current) {

            if(current > totalSeats) {
                break;
            }

            if(current > desired) {
                $scope.removeEmptyOrLastPerson();
                current--;
            } else if(current < desired) {
                var added = $scope.addPerson();
                if(added) {
                    current++;
                } else {
                    $scope.model.person_count = current;
                }
            } else {
                break;
            }
            if(!max--) {
                break;
            }
        }
    };

    $scope.validateAttendees = function() {
        $scope.errorMessage = null;
        var slotsWithErrors = $scope.model.validateNames();
        if (slotsWithErrors.length == 0) {
            return true;
        }
        $scope.errorMessage = 'Please fill out all attendee names.';
        for (var i = 0; i < slotsWithErrors.length; i++) {
            var id = '#event_' + $scope.model.event.event_id + '_attendee_' + slotsWithErrors[i];
            $(id).focus();
            break;
        }
        return false;
    };

    $scope.validateWaitlistContactFirstName = function() {

        $scope.waitlist_contact_errorMessage = null;
        if($scope.model.waitlist_contact.first_name != undefined && $scope.model.waitlist_contact.first_name != null) {

            return true;
        }
        $scope.waitlist_contact_errorMessage = 'Please fill out the first name.';
        $('#waitlist_contact_first_name').focus();
        return false;
    };

    $scope.validateWaitlistContactLastName = function() {
        $scope.waitlist_contact_errorMessage = null;
        if($scope.model.waitlist_contact.last_name != undefined && $scope.model.waitlist_contact.last_name != null) {
            return true;
        }
        $scope.waitlist_contact_errorMessage = 'Please fill out the last name.';
        $('#waitlist_contact_last_name').focus();
        return false;
    };

    $scope.validateWaitlistContactEmail = function() {
        $scope.waitlist_contact_errorMessage = null;
        if($scope.model.waitlist_contact.email != undefined && $scope.model.waitlist_contact.email != null) {
            return true;
        }
        $scope.waitlist_contact_errorMessage = 'Please fill out the contact email.';
        $('#waitlist_contact_email').focus();
        return false;
    };

    $scope.validateWaitlistModalInputs = function () {
        $scope.waitlist_contact_error = false;

        if ($scope.model.waitlist_contact.first_name === undefined || !$scope.model.waitlist_contact.first_name) {
            $scope.waitlist_contact_error = true;
            $('#waitlist_contact_first_name').addClass('validation-failed');
        } else {
            $('#waitlist_contact_first_name').removeClass('validation-failed');
        }

        if ($scope.model.waitlist_contact.last_name === undefined || !$scope.model.waitlist_contact.last_name) {
            $scope.waitlist_contact_error = true;
            $('#waitlist_contact_last_name').addClass('validation-failed');
        } else {
            $('#waitlist_contact_last_name').removeClass('validation-failed');
        }

        if ($scope.model.waitlist_contact.email === undefined || !$scope.model.waitlist_contact.email) {
            $scope.waitlist_contact_error = true;
            $('#waitlist_contact_email').addClass('validation-failed');
        } else {
            $('#waitlist_contact_email').removeClass('validation-failed');
        }
    };

    $scope.isNumberKey = function(evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
           evt.preventDefault();
        }
    };

    $scope.validatePackageItems = function() {
        var retval = true;
        var p = $scope.model.package;
        if (p.available && p.option == 'classAndPackage') {
            p.components.forEach(function(c) {
                c.errorMessage = null;
                c.selectedItem = null;

                if (c.items.length == 1) {
                    c.selectedItemId = c.items[0].pslrId;
                }

                if (!c.selectedItemId) {
                    c.errorMessage = 'Please select a ' + c.title + ' from the list';
                    retval = false;
                } else {
                    c.selectedItem = $scope.getItemById(c.items, c.selectedItemId);
                }
            });
        }
        return retval;
    };

    $scope.getItemById = function(items, id) {
        var item = null;
        if (items && id) {
            items.forEach(function(i) {
               if (i.pslrId == id) {
                   item = i;
               }
            });
        }
        return item;
    };

    $scope.addToCart = function() {
        if($scope.model.event === null) {
            return $scope.openSelectDate();
        }

        if(!$scope.validateAttendees()) {
            return;
        }

        if (!$scope.validatePackageItems()) {
            return;
        }

        var productId = 'CLASS' + $scope.model.event.event_id;
        var hasAttendees = false; // a lie
        var isDiscountable = $scope.model.getIsDiscountable();
        var requireAttendees = $scope.model.getRequireNames();
        var title = $scope.model.event.title + ' - ' + $scope.model.event.first_date;
        var packageData = $scope.model.package;
        var price = $scope.getPrice();

        addClassToCart($scope.quilt_class_id, $scope.model.event.event_id, requireAttendees, packageData)
        $scope.reset();
    };

    $scope.showWaitlistFields = function() {

        return ($scope.model.waitlist_mode && $scope.model.event != undefined && $scope.model.event != null && parseInt($scope.model.event.seats) == 0);
    };

    $scope.isModuleImprovedWaitlist = function() {
        return window.knobby && window.knobby['module_improved_waitlist'];
    };

    $scope.addToWaitlist = function() {
        if ($scope.isModuleImprovedWaitlist()) {
            $scope.validateWaitlistModalInputs();

            if($scope.waitlist_contact_error) {
                return;
            }

            $scope.model.waitlist_contact.quantity = parseInt($scope.model.person_count);
            $scope.model.waitlist_contact.item_id = $scope.model.event.event_id;
            $scope.model.waitlist_contact.item_type_id = 2;
            $scope.model.waitlist_contact.store_id = $scope.model.event.store_id;
            $scope.model.waitlist_contact.store_location_id = $scope.storeLocationId;

            var mobilePhone = '';
            var nonFormattedPhone = '';
            if ($scope.model.waitlist_contact.mobile_phone) {
                if ($scope.model.waitlist_contact.mobile_country_code) {
                    nonFormattedPhone = '+'+$scope.model.waitlist_contact.mobile_country_code;
                }
                mobilePhone = $scope.model.waitlist_contact.mobile_phone.replace(/\D/g, '');
                nonFormattedPhone += mobilePhone;
            }
            $scope.model.waitlist_contact.mobile_phone = nonFormattedPhone;

            SaveWaitListContact($scope.model.waitlist_contact);

            $scope.model.waitlist_mode = false;
            $scope.closeWaitlistModal();
            $scope.reset();
        } else {
            //Removing the flag check these validation methods if we still need them
            if (!$scope.validateWaitlistContactFirstName()) {
                return;
            }

            if (!$scope.validateWaitlistContactLastName()) {
                return;
            }

            if (!$scope.validateWaitlistContactEmail()) {
                return;
            }

            $scope.model.waitlist_contact.quantity = $scope.model.person_count;
            $scope.model.waitlist_contact.item_id = $scope.model.event.event_id;
            $scope.model.waitlist_contact.item_type_id = 2;
            $scope.model.waitlist_contact.store_id = $scope.model.event.store_id;
            SaveWaitListContact($scope.model.waitlist_contact);

            $scope.model.waitlist_mode = false;
            $scope.reset();
        }
    };

    $scope.reset = function() {
        $scope.errorMessage = null;
        $scope.model.reset();
    };

    $scope.addToCartClass = function() {
        if ($scope.model.event === null) {
            // disabled
            console.log('disabled');
            return 'add_to_cart_disabled';
        } else if ($scope.model.event.add_to_waitlist) {

            return 'addToWaitlist';
        }
        return '';
    };

    $scope.getDifferenceText = function(option) {
        if ($scope.model.package.option != option) {
            var diff = $scope.model.package.price - $scope.model.package.class_price;
            if (option == 'classOnly') {
                return ' (-' + $scope.currencySymbol + diff.toFixed(2) + ')';
            }

            if (option == 'classAndPackage') {
                return ' (+' + $scope.currencySymbol + diff.toFixed(2) + ')';
            }
        }
        return '';
    };
});

Web.directive('focusOnShow', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            if ($attr.ngShow){
                $scope.$watch($attr.ngShow, function(newValue){
                    if(newValue){
                        $timeout(function(){
                            $element[0].focus();
                        }, 0);
                    }
                })
            }
            if ($attr.ngHide){
                $scope.$watch($attr.ngHide, function(newValue){
                    if(!newValue){
                        $timeout(function(){
                            $element[0].focus();
                        }, 0);
                    }
                })
            }

        }
    };
})
