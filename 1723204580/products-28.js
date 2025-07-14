/* products-28.js
* Includes Shopping Cart (pre-2017 version)
* Below are function I have determined are needed by the new cart
* */

/*Code developed by Posin Begin*/

//Function used to store value in cookie
function setDesignWallCookie(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());

    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));

    if (domain == '') {
        domain = document.domain.split('.');
        if (domain[domain.length - 1].toLowerCase() == 'au' || domain[domain.length - 1].toLowerCase() == 'uk' || domain[domain.length - 1].toLowerCase() == 'nz' || domain[domain.length - 1].toLowerCase() == 'za') {
            domain = domain[domain.length - 3] + '.' + domain[domain.length - 2] + '.' + domain[domain.length - 1];
        } else {
            domain = domain[domain.length - 2] + '.' + domain[domain.length - 1];
        }
    }

    document.cookie = name + "=" + escape(value) +
        ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
        ( ( path ) ? ";path=" + path : "" ) +
        ( ( domain ) ? ";domain=" + domain : "" ) +
        ( ( secure ) ? ";secure" : "" );
}
//Function used to get product id from cookie
function getDesignWallCookie(check_name) {
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false;

    for (i = 0; i < a_all_cookies.length; i++) {
        a_temp_cookie = a_all_cookies[i].split('=');

        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

        if (cookie_name == check_name) {
            b_cookie_found = true;

            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }

            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}

//Function used to open a design wall popup
function o(href, height, width) {
    var w = window.open(href, "popup", "height=" + height + ",width=" + width + ",resizable,scrollbars=yes");
    w.focus();
}

//Function used to store  product id in cookie
function AddProductToDesignWall(store_url, productId) {
    var designWall = '';
    if (getDesignWallCookie('designWallCookie')) {
        designWall = getDesignWallCookie('designWallCookie');
    }
    var designWallArray = new Array();
    designWallArray = designWall.split('|');
    var itemFlag = 0;
    for (var i = 0; i < designWallArray.length; i++) {
        if (designWallArray[i] != '') {
            if (designWallArray[i] == productId) {
                itemFlag = 1;
                break;
            }
        }
    }

    if (itemFlag == 0) {
        if (designWall == "") {
            setDesignWallCookie('designWallCookie', productId, '', '/', '', '');
        }
        else {
            setDesignWallCookie('designWallCookie', designWall + '|' + productId, '', '/', '', '');
        }
    }
    o(store_url, 630, 800)

}

/*Code developed by Posin End*/

function checkLength(o, n, min, max) {
    if (o.val().length > max || o.val().length < min) {
        o.addClass("ui-state-error");
        alert("Length of " + n + " must be between " +
            min + " and " + max + ".");
        return false;
    } else {
        return true;
    }
}

function alertAndRemoveCoupon(i, message) {
    alert(message);
    $('#code').val('');
    window.cartArray.remove(i);
    Set_Cart_Cookie('cart', BuildCookieFromArray(), '', '/', '', '');
}

function getCouponExpiredString(data) {
    var date_str = 'Coupon "' + data.code + '"';
    if (data.status === 'expired') {
        date_str += ' has expired.';
        if (data.date !== undefined) {
            date_str += '  Exp date: ' + data.date;
        }
    }
    else if (data.status === 'invalid') {
        date_str += ' is not valid yet.';
        if (data.date !== undefined) {
            date_str += '  Start date: ' + data.date;
        }
    }
    return date_str;
}

var productParams = [];

function GetAttendees(in_businessEmail, in_paymentAction, productId, productTitle, productPrice, productWeight, productCountType, productSku, requiresDownloadEmailAddress, minQuantity, maxQuantity, isTimed, in_notes, in_shipping, in_taxes, inlineAddToCartBtn, in_productType, in_hasAttendees, isDiscountEligible, productImagePath, productImageStyle, requireClassAttendees, pslrId, packageData, holdingId, deptId, categoryIdList, displayPrice, unitType, soldInIncrements) {
    productParams[productId] = [];
    productParams[productId]['in_businessEmail'] = in_businessEmail;
    productParams[productId]['in_paymentAction'] = in_paymentAction;
    productParams[productId]['productId'] = productId;
    productParams[productId]['productTitle'] = productTitle;
    productParams[productId]['productPrice'] = productPrice;
    productParams[productId]['displayPrice'] = productPrice;
    productParams[productId]['productWeight'] = productWeight;
    productParams[productId]['productCountType'] = productCountType;
    productParams[productId]['productSku'] = productSku;
    productParams[productId]['requiresDownloadEmailAddress'] = requiresDownloadEmailAddress;
    productParams[productId]['minQuantity'] = minQuantity;
    productParams[productId]['maxQuantity'] = maxQuantity;
    productParams[productId]['isTimed'] = isTimed;
    productParams[productId]['in_notes'] = in_notes;
    productParams[productId]['in_shipping'] = in_shipping;
    productParams[productId]['in_taxes'] = in_taxes;
    productParams[productId]['inlineAddToCartBtn'] = inlineAddToCartBtn;
    productParams[productId]['in_productType'] = in_productType;
    productParams[productId]['in_hasAttendees'] = in_hasAttendees;
    productParams[productId]['isDiscountEligible'] = isDiscountEligible;
    productParams[productId]['productImagePath'] = productImagePath;
    productParams[productId]['productImageStyle'] = productImageStyle;
    productParams[productId]['requireClassAttendees'] = requireClassAttendees;

    productParams[productId]['pslrId'] = pslrId;
    productParams[productId]['packageData'] = packageData;
    productParams[productId]['holdingId'] = holdingId;

    productParams[productId]['deptId'] = deptId;
    productParams[productId]['categoryIdList'] = categoryIdList;
    productParams[productId]['unitType'] = unitType;
    productParams[productId]['soldInIncrements'] = soldInIncrements;

    // Make a dialog box if needed
    if ($('#attendees-form').length == 0) {
        $('body').append(
            '<div id="attendees-form" title="Attendees">' +
            '<form>' +
            '<span id="attendeeInputs"></span>' +
            '</form>' +
            '</div>'
        );

        $("#attendees-form").dialog({
            autoOpen: false,
            height: 330,
            width: 570,
            modal: true,
            buttons: {
                "Add to Cart": function() {
                    var bValid = true;
                    var attendeeCount;
                    var productId = $('#attendeeProductId').val();
                    if (inlineAddToCartBtn) {
                        attendeeCount = parseInt(document.getElementById('inlineInteger' + productId).value) + parseFloat(document.getElementById('inlineFraction' + productId).value);
                    } else {
                        attendeeCount = parseInt(document.getElementById('integer' + productId).value) + parseFloat(document.getElementById('fraction' + productId).value);
                    }
                    $('.attendeeField').removeClass("ui-state-error");

                    for (var i = 0; i < attendeeCount; i++) {
                        if (!($('#attendeeName' + i).val().replace(/^\s+|\s+$/g, '').indexOf(' ') > 0)) {
                            alert('Both first and last names must be entered.');
                            $('#attendeeName' + i).addClass("ui-state-error");
                            bValid = false;
                            break;
                        }
                        bValid = bValid && checkLength($('#attendeePhone' + i), "phone", 10, 16);
                        if (bValid == false) {
                            break;
                        }
                        bValid = bValid && checkLength($('#attendeeEmail' + i), "email", 6, 100);
                        if (bValid == false) {
                            break;
                        }
                    }

                    if (bValid) {
                        var attendeeVal = '';
                        for (var i = 0; i < attendeeCount; i++) {
                            attendeeVal += $('#attendeeName' + i).val() + '::' + $('#attendeePhone' + i).val() + '::' + $('#attendeeEmail' + i).val() + ';;';
                        }

                        AddProductToCart(
                            productParams[productId]['in_businessEmail'],
                            productParams[productId]['in_paymentAction'],
                            productParams[productId]['productId'],
                            productParams[productId]['productTitle'],
                            productParams[productId]['productPrice'],
                            productParams[productId]['productWeight'],
                            productParams[productId]['productCountType'],
                            productParams[productId]['productSku'],
                            productParams[productId]['requiresDownloadEmailAddress'],
                            productParams[productId]['minQuantity'],
                            productParams[productId]['maxQuantity'],
                            productParams[productId]['isTimed'],
                            productParams[productId]['in_notes'],
                            productParams[productId]['in_shipping'],
                            productParams[productId]['in_taxes'],
                            productParams[productId]['inlineAddToCartBtn'],
                            productParams[productId]['in_productType'],
                            attendeeVal,
                            productParams[productId]['isDiscountEligible'],
                            productParams[productId]['productImagePath'],
                            productParams[productId]['productImageStyle'],
                            productParams[productId]['requireClassAttendees'],

                            productParams[productId]['pslrId'],
                            productParams[productId]['packageData'],
                            productParams[productId]['holdingId'],

                            productParams[productId]['deptId'] = deptId,
                            productParams[productId]['categoryIdList'],
                            productParams[productId]['productPrice'],
                            productParams[productId]['unitType'],
                            productParams[productId]['soldInIncrements']
                        );

                        $(this).dialog("close");
                    }
                },
                Cancel: function() {
                    $(this).dialog("close");
                }
            },
            close: function() {
            }
        });
    }

    var str = '';
    str += '' +
        '<input type=hidden id="attendeeProductId" value="' + productId + '" />' +
        '<table cellpadding=10 cellspacing=0 border=0>' +
        '	<tr>' +
        '		<td>&nbsp;</td>' +
        '		<td><b>Full Name</b></td>' +
        '		<td><b>Phone</b></td>' +
        '		<td><b>Email</b></td>' +
        '	</tr>';

    var attendeeCount;
    if (inlineAddToCartBtn) {
        attendeeCount = parseInt(document.getElementById('inlineInteger' + productId).value) + parseFloat(document.getElementById('inlineFraction' + productId).value);
    } else {
        attendeeCount = parseInt(document.getElementById('integer' + productId).value) + parseFloat(document.getElementById('fraction' + productId).value);
    }

    for (var i = 0; i < attendeeCount; i++) {
        str += '' +
            '<tr>' +
            '	<td>#' + (i + 1) + '</td>' +
            '	<td><input id="attendeeName' + i + '" type=text class="attendeeField" style="width:150px;" /></td>' +
            '	<td><input id="attendeePhone' + i + '" type=text class="attendeeField" style="width:110px;" /></td>' +
            '	<td><input id="attendeeEmail' + i + '" type=text class="attendeeField" style="width:150px;" /></td>' +
            '</tr>';
    }

    str += '</table>';

    $("#attendeeInputs").html(str);
    $("#attendees-form").dialog("open");

}

// Below this point are function need by the old cart but not the new cart

function CollapseCart() {
    var cartDiv = $("#cartDiv");
    var cartDivMobile = $("#cartDivMobile");
    var totalItems = window.cartArray.length;

    UpdateCouponsInCartArrayAndCookie();

    cartDivMobile.html(
        '<div style="padding:10px;"><table width="100%"><tr>' +
        '<td style="text-align: left; color: #fff;"><a href="' + editcartUrl + '" style="">Cart - ' + totalItems + ' items</a></td>' +
        '</tr></table></div>'
    );

    cartDiv.html(
        '<div style="display:table; height:28px; text-align:right; width:100%;">' +
        '  <span style="vertical-align:middle; display:table-cell; color: #ccc; font-family: Arial; font-size: 12px !important;">' +
        '    <a href="javascript:ProceedToCheckout(\'no\');" style="' + linkStyles + '">Check Out</a>' +
        '    &nbsp; | &nbsp; ' +
        '    <a href="' + editcartUrl + '" style="' + linkStyles + '">View Cart</a>' +
        '    &nbsp;&nbsp;&nbsp; ' +
        '  </span>' +
        '  <span style="vertical-align:middle; display:table-cell; color: #ccc; font-family: Arial; font-size: 12px !important;">' +
        '    <a href="#" onclick="ExpandCart();"><img border=0 width=16 height=11 src="https://siteimages.s3.amazonaws.com/btn-expand.png"></a>' +
        '  </span>' +
        '</div>' +
        MakeCartForm() +
        '');

    var cart = Get_Cart_Cookie('cart');
    cart = 'mode##collapsed' + cart.substring(cart.indexOf(';'));
    Set_Cart_Cookie('cart', cart, '', '/', '', '');
}

// Test to see if in_email is a valid email address--as far as we can tell with Javascript
function IsValidEmail(in_email) {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(in_email) == false) {
        return false;
    } else {
        return true;
    }
}

function ProceedToCheckout(skip) {

    // do normal checkout
    if (window.paymentProcessor === undefined || window.paymentProcessor == false) {
        window.paymentProcessor = 'paypal';
    }

    // see if we need to get their email address for digital downloads
    var needEmail = false;
    var cart = '';
    if (Get_Cart_Cookie('cart')) {
        cart = Get_Cart_Cookie('cart');
    }

    for (var i = 0; i < window.cartArray.length; i++) {
        if (window.cartArray[i][0] == 'product' && window.cartArray[i][8] == 'yes') {
            needEmail = true;
            break;
        }
    }

    // if needed, get email address for digital download
    if (needEmail && cart.indexOf("downloadEmail") == -1 && (window.checkoutVersion == '' || window.checkoutVersion == '2014')) {
        var email = prompt("At least 1 item in your shopping cart will be emailed to you.  Please enter your email address:");
        if (IsValidEmail(email)) {
            Set_Cart_Cookie('cart', cart + ';;downloadEmail##' + email, '', '/', '', '');
        } else {
            alert('The email address you entered was not a valid email address.');
            return;
        }
    }

    // Get shipping method id (if possible)
    var shippingMethod = $('input[name=shipRadio]:checked');
    var shippingId = '';
    if (shippingMethod.attr('id') != undefined) {
        shippingId = parseInt(shippingMethod.attr('id').substring(10));
    }

    if (window.paymentProcessor == 'NMI3S') {
        if (window.checkoutVersion == '' || window.checkoutVersion == '2014') {
            location = window.CheckoutUrl;
        }
        else {
            location = window.EditCartUrl;
        }
    }
    else if (window.paymentProcessor == 'wholesaleCheckoutNoCC') {
        if (window.checkoutVersion == '' || window.checkoutVersion == '2014') {
            $.post(document.location.protocol + "//" + document.domain + "/module/product.htm?save_shopping_cart_contents=1&shippingCalcId=" + shippingId + "&shopping_cart_contents_id=" + window.shopping_cart_contents_id, $("#cartform").serialize(),
                function(data) {
                    location = "/module/product.htm?wholesaleCheckoutNoCC=1&shoppingCartContentsId=" + parseInt(data);
                });
        } else {
            location = window.EditCartUrl;
        }
    }
    else {
        // paypal
        if (window.checkoutVersion == '' || window.checkoutVersion == '2014') {
            if (skip !== 'yes' && useShipping == 'yes') {
                // See if we have anything that needs to be shipped
                var needsShipping = false;
                for (var i = 0; i < window.cartArray.length; i++) {
                    if (window.cartArray[i][0] == 'product' && window.cartArray[i].length > 16 && window.cartArray[i][16] != 'GC' && window.cartArray[i][16] != 'class' && window.cartArray[i][8] != 'yes') {
                        needsShipping = true;
                        break;
                    }
                }

                if (needsShipping == true) {
                    showShippingOptions('yes', 0, 0, 0);
                }
                else {
                    $("#cartform").append(' <input type=hidden name=shipping_1 id=shipping_1 value=0>');
                    ProceedToCheckout('yes');
                }
            }
            else {
                $.post(document.location.protocol + "//" + document.domain + "/module/product.htm?save_shopping_cart_contents=1&shippingCalcId=" + shippingId + "&shopping_cart_contents_id=" + window.shopping_cart_contents_id, $("#cartform").serialize(),
                    function(data) {
                        $("#cartform #notify_url").val(document.location.protocol + '//' + document.domain + '/module/product.htm?ipn=1&shopping_cart_contents_id=' + parseInt(data));
                        document.cartform.submit();
                    });
            }
        }
        else {
            location = window.EditCartUrl;
        }
    }
}

function showShippingOptions(dialogvar, weight, subtotal, quantity) {
    var appendString = '';
    if (dialogvar == 'yes') {
        $("#overlayShipping").replaceWith('');
        appendString += '<div id="overlayShipping" style="display:none;" title="Shipping Options"><br>Estimate shipping and tax<br><br>';
    }

    if (window.domesticCountry == 'United States') {
        appendString += '<select id="selectState">' +
            '<option selected="selected">Select State</option>' +
            '<option disabled="disabled">----------</option>' +
            '<option value="AL">Alabama</option>' +
            '<option value="AK">Alaska</option>' +
            '<option value="AS">American Samoa</option>' +
            '<option value="AZ">Arizona</option>' +
            '<option value="AR">Arkansas</option>' +
            '<option value="CA">California</option>' +
            '<option value="CO">Colorado</option>' +
            '<option value="CT">Connecticut</option>' +
            '<option value="DE">Delaware</option>' +
            '<option value="DC">District of Columbia</option>' +
            '<option value="FM">Federated States of Micronesia</option>' +
            '<option value="FL">Florida</option>' +
            '<option value="GA">Georgia</option>' +
            '<option value="GU">Guam</option>' +
            '<option value="HI">Hawaii</option>' +
            '<option value="ID">Idaho</option>' +
            '<option value="IL">Illinois</option>' +
            '<option value="IN">Indiana</option>' +
            '<option value="IA">Iowa</option>' +
            '<option value="KS">Kansas</option>' +
            '<option value="KY">Kentucky</option>' +
            '<option value="LA">Louisiana</option>' +
            '<option value="ME">Maine</option>' +
            '<option value="MH">Marshall Islands</option>' +
            '<option value="MD">Maryland</option>' +
            '<option value="MA">Massachusetts</option>' +
            '<option value="MI">Michigan</option>' +
            '<option value="MN">Minnesota</option>' +
            '<option value="MS">Mississippi</option>' +
            '<option value="MO">Missouri</option>' +
            '<option value="MT">Montana</option>' +
            '<option value="NE">Nebraska</option>' +
            '<option value="NV">Nevada</option>' +
            '<option value="NH">New Hampshire</option>' +
            '<option value="NJ">New Jersey</option>' +
            '<option value="NM">New Mexico</option>' +
            '<option value="NY">New York</option>' +
            '<option value="NC">North Carolina</option>' +
            '<option value="ND">North Dakota</option>' +
            '<option value="MP">Northern Mariana Islands</option>' +
            '<option value="OH">Ohio</option>' +
            '<option value="OK">Oklahoma</option>' +
            '<option value="OR">Oregon</option>' +
            '<option value="PW">Palau</option>' +
            '<option value="PA">Pennsylvania</option>' +
            '<option value="PR">Puerto Rico</option>' +
            '<option value="RI">Rhode Island</option>' +
            '<option value="SC">South Carolina</option>' +
            '<option value="SD">South Dakota</option>' +
            '<option value="TN">Tennessee</option>' +
            '<option value="TX">Texas</option>' +
            '<option value="UT">Utah</option>' +
            '<option value="VT">Vermont</option>' +
            '<option value="VI">Virgin Islands</option>' +
            '<option value="VA">Virginia</option>' +
            '<option value="WA">Washington</option>' +
            '<option value="WV">West Virginia</option>' +
            '<option value="WI">Wisconsin</option>' +
            '<option value="WY">Wyoming</option>' +
            '<option value="AA">Armed Forces AA</option>' +
            '<option value="AE">Armed Forces AE</option>' +
            '<option value="AP">Armed Forces AP</option>' +
            '</select>';
    } else if (window.domesticCountry == 'Canada') {
        appendString += '<select id="selectState">' +
            '<option selected="selected">Select Province</option>' +
            '<option disabled="disabled">----------</option>' +
            '<option>Alberta</option>' +
            '<option>British Columbia</option>' +
            '<option>Manitoba</option>' +
            '<option>New Brunswick</option>' +
            '<option>Newfoundland</option>' +
            '<option>Northwest Territories</option>' +
            '<option>Nova Scotia</option>' +
            '<option>Nunavut</option>' +
            '<option>Ontario</option>' +
            '<option>Prince Edward Island</option>' +
            '<option>Quebec</option>' +
            '<option>Saskatchewan</option>' +
            '<option>Yukon</option>' +
            '</select>';
    } else if (window.domesticCountry == 'Australia') {
        appendString += '<select id="selectState">' +
            '<option selected="selected">Select State</option>' +
            '<option disabled="disabled">----------</option>' +
            '<option>Australian Capital Territory</option>' +
            '<option>New South Wales</option>' +
            '<option>Northern Territory</option>' +
            '<option>Queensland</option>' +
            '<option>South Australia</option>' +
            '<option>Tasmania</option>' +
            '<option>Victoria</option>' +
            '<option>Western Australia</option>' +
            '</select>';
    }

    appendString += '<select id="selectIntState" style="display:none">' +
        '<option selected="selected">Select Country</option>' +
        '<option disabled="disabled">----------</option>' +
        '<option>Afghanistan</option>' +
        '<option>Aland Islands</option>' +
        '<option>Albania</option>' +
        '<option>Algeria</option>' +
        '<option>American Samoa</option>' +
        '<option>Andorra</option>' +
        '<option>Angola</option>' +
        '<option>Anguilla</option>' +
        '<option>Antarctica</option>' +
        '<option>Antigua and Barbuda</option>' +
        '<option>Argentina</option>' +
        '<option>Armenia</option>' +
        '<option>Aruba</option>' +
        '<option>Australia</option>' +
        '<option>Austria</option>' +
        '<option>Azerbaijan Republic</option>' +
        '<option>Bahamas</option>' +
        '<option>Bahrain</option>' +
        '<option>Bangladesh</option>' +
        '<option>Barbados</option>' +
        '<option>Belarus</option>' +
        '<option>Belgium</option>' +
        '<option>Belize</option>' +
        '<option>Benin</option>' +
        '<option>Bermuda</option>' +
        '<option>Bhutan</option>' +
        '<option>Bolivia</option>' +
        '<option>Bosnia and Herzegonvina</option>' +
        '<option>Botswana</option>' +
        '<option>Bouvet Island</option>' +
        '<option>Brazil</option>' +
        '<option>British Indian Ocean Territory</option>' +
        '<option>British Virgin Islands</option>' +
        '<option>Brunei</option>' +
        '<option>Bulgaria</option>' +
        '<option>Burkina Faso</option>' +
        '<option>Burundi</option>' +
        '<option>Cambodia</option>' +
        '<option>Cameroon</option>' +
        '<option>Canada</option>' +
        '<option>&nbsp;&nbsp; Alberta</option>' +
        '<option>&nbsp;&nbsp; British Columbia</option>' +
        '<option>&nbsp;&nbsp; Manitoba</option>' +
        '<option>&nbsp;&nbsp; New Brunswick</option>' +
        '<option>&nbsp;&nbsp; Newfoundland</option>' +
        '<option>&nbsp;&nbsp; Northwest Territories</option>' +
        '<option>&nbsp;&nbsp; Nova Scotia</option>' +
        '<option>&nbsp;&nbsp; Nunavut</option>' +
        '<option>&nbsp;&nbsp; Ontario</option>' +
        '<option>&nbsp;&nbsp; Prince Edward Island</option>' +
        '<option>&nbsp;&nbsp; Quebec</option>' +
        '<option>&nbsp;&nbsp; Saskatchewan</option>' +
        '<option>&nbsp;&nbsp; Yukon</option>' +
        '<option>Cape Verde</option>' +
        '<option>Cayman Islands</option>' +
        '<option>Central African Republic</option>' +
        '<option>Chad</option>' +
        '<option>Chile</option>' +
        '<option>China</option>' +
        '<option>Christmas Island</option>' +
        '<option>Cocos Island</option>' +
        '<option>Colombia</option>' +
        '<option>Comoros</option>' +
        '<option>Cook Islands</option>' +
        '<option>Costa Rica</option>' +
        '<option>Cote DIvoire</option>' +
        '<option>Croatia</option>' +
        '<option>Cuba</option>' +
        '<option>Cyprus</option>' +
        '<option>Czech Republic</option>' +
        '<option>Democratic Republic of the Congo</option>' +
        '<option>Denmark</option>' +
        '<option>Djibouti</option>' +
        '<option>Dominica</option>' +
        '<option>Dominican Republic</option>' +
        '<option>East Timor</option>' +
        '<option>Ecuador</option>' +
        '<option>Egypt</option>' +
        '<option>El Salvador</option>' +
        '<option>Equatorial Guinea</option>' +
        '<option>Eritrea</option>' +
        '<option>Estonia</option>' +
        '<option>Ethiopia</option>' +
        '<option>Falkland Islands</option>' +
        '<option>Faroe Islands</option>' +
        '<option>Federated States of Micronesia</option>' +
        '<option>Fiji</option>' +
        '<option>Finland</option>' +
        '<option>France</option>' +
        '<option>French Guiana</option>' +
        '<option>French Polynesia</option>' +
        '<option>French Southern Territories</option>' +
        '<option>Gabon Republic</option>' +
        '<option>Gambia</option>' +
        '<option>Georgia</option>' +
        '<option>Germany</option>' +
        '<option>Ghana</option>' +
        '<option>Gibraltar</option>' +
        '<option>Greece</option>' +
        '<option>Greenland</option>' +
        '<option>Grenada</option>' +
        '<option>Guadeloupe</option>' +
        '<option>Guam</option>' +
        '<option>Guatemala</option>' +
        '<option>Guernsey</option>' +
        '<option>Guinea</option>' +
        '<option>Guinea Bissau</option>' +
        '<option>Guyana</option>' +
        '<option>Haiti</option>' +
        '<option>Heard and McDonald Islands</option>' +
        '<option>Honduras</option>' +
        '<option>Hong Kong</option>' +
        '<option>Hungary</option>' +
        '<option>Iceland</option>' +
        '<option>India</option>' +
        '<option>Indonesia</option>' +
        '<option>Iran</option>' +
        '<option>Iraq</option>' +
        '<option>Ireland</option>' +
        '<option>Isle of Man</option>' +
        '<option>Israel</option>' +
        '<option>Italy</option>' +
        '<option>Jamaica</option>' +
        '<option>Japan</option>' +
        '<option>Jersey</option>' +
        '<option>Jordan</option>' +
        '<option>Kazakhstan</option>' +
        '<option>Kenya</option>' +
        '<option>Kiribati</option>' +
        '<option>Kuwait</option>' +
        '<option>Kyrgyzstan</option>' +
        '<option>Laos</option>' +
        '<option>Latvia</option>' +
        '<option>Lebanon</option>' +
        '<option>Lesotho</option>' +
        '<option>Liberia</option>' +
        '<option>Libya</option>' +
        '<option>Liechtenstein</option>' +
        '<option>Lithuania</option>' +
        '<option>Luxembourg</option>' +
        '<option>Macau</option>' +
        '<option>Macedonia</option>' +
        '<option>Madagascar</option>' +
        '<option>Malawi</option>' +
        '<option>Malaysia</option>' +
        '<option>Maldives</option>' +
        '<option>Mali</option>' +
        '<option>Malta</option>' +
        '<option>Marshall Islands</option>' +
        '<option>Martinique</option>' +
        '<option>Mauritania</option>' +
        '<option>Mauritius</option>' +
        '<option>Mayotte</option>' +
        '<option>Mexico</option>' +
        '<option>Moldova</option>' +
        '<option>Monaca</option>' +
        '<option>Mongolia</option>' +
        '<option>Montenegro</option>' +
        '<option>Montserrat</option>' +
        '<option>Morocco</option>' +
        '<option>Mozambique</option>' +
        '<option>Myanmar</option>' +
        '<option>Namibia</option>' +
        '<option>Nauru</option>' +
        '<option>Nepal</option>' +
        '<option>Netherlands</option>' +
        '<option>Netherlands Antilles</option>' +
        '<option>New Caledonia</option>' +
        '<option>New Zealand</option>' +
        '<option>Nicaragua</option>' +
        '<option>Niger</option>' +
        '<option>Nigeria</option>' +
        '<option>iue</option>' +
        '<option>Norfolk Island</option>' +
        '<option>North Korea</option>' +
        '<option>Northern Mariana Islands</option>' +
        '<option>Norway</option>' +
        '<option>Oman</option>' +
        '<option>Pakistan</option>' +
        '<option>Palau</option>' +
        '<option>Palestine</option>' +
        '<option>Panama</option>' +
        '<option>Papua New uinea</option>' +
        '<option>Paraguay</option>' +
        '<option>Peru</option>' +
        '<option>Philippines</option>' +
        '<option>Pitcairn Islands</option>' +
        '<option>Poland</option>' +
        '<option>Portugal</option>' +
        '<option>Puerto Rico</option>' +
        '<option>Qatar</option>' +
        '<option>Republic of the Congo</option>' +
        '<option>Reunion</option>' +
        '<option>Romania</option>' +
        '<option>Russia</option>' +
        '<option>Rwanda</option>' +
        '<option>Saint Vincent and the Grenadin</option>' +
        '<option>Samoa</option>' +
        '<option>San Marino</option>' +
        '<option>Sao Tome and Principe</option>' +
        '<option>Saudi Arabia</option>' +
        '<option>Senegal</option>' +
        '<option>Serbia</option>' +
        '<option>Serbia and Montenegro</option>' +
        '<option>Seychelles</option>' +
        '<option>Sierra Leone</option>' +
        '<option>Singapore</option>' +
        '<option>Slovakia</option>' +
        '<option>Slovenia</option>' +
        '<option>Soloman Islands</option>' +
        '<option>Somalia</option>' +
        '<option>South Africa</option>' +
        '<option>South Georgia</option>' +
        '<option>South Korea</option>' +
        '<option>Spain</option>' +
        '<option>Sri Lanka</option>' +
        '<option>St. Helena</option>' +
        '<option>St. Kitts and Nevis</option>' +
        '<option>St. Lucia</option>' +
        '<option>St. Pierre and Miquelon</option>' +
        '<option>Sudan</option>' +
        '<option>Suriname</option>' +
        '<option>Svalbard and Jan Mayen Island</option>' +
        '<option>Swaziland</option>' +
        '<option>Sweden</option>' +
        '<option>Switzerland</option>' +
        '<option>Syria</option>' +
        '<option>Taiwan</option>' +
        '<option>Tajikistan</option>' +
        '<option>Tanzania</option>' +
        '<option>Thailand</option>' +
        '<option>Timor-Leste</option>' +
        '<option>Togo</option>' +
        '<option>Tokelau</option>' +
        '<option>Tonga</option>' +
        '<option>Trinidad and Tobago</option>' +
        '<option>Tunisia</option>' +
        '<option>Turkey</option>' +
        '<option>Turkmenistan</option>' +
        '<option>Turks and Caicos Islands</option>' +
        '<option>Tuvalu</option>' +
        '<option>Uganda</option>' +
        '<option>Ukraine</option>' +
        '<option>United Arab Emirates</option>' +
        '<option>United Kingdom</option>' +
        '<option>United States</option>' +
        '<option>Uruguay</option>' +
        '<option>US Minor Outlying Islands</option>' +
        '<option>Uzbekistan</option>' +
        '<option>Vanuatu</option>' +
        '<option>Vatican City State</option>' +
        '<option>Venezuela</option>' +
        '<option>Vietnam</option>' +
        '<option>Virgin Islands (USA)</option>' +
        '<option>Wallis and Futuna Islands</option>' +
        '<option>Western Sahara</option>' +
        '<option>Yemen</option>' +
        '<option>Yugoslavia</option>' +
        '<option>Zambia</option>' +
        '<option>Zimbabwe</option>' +
        '</select>';

    appendString += '&nbsp&nbsp&nbsp';
    appendString += '<a href="#" id="selectUs" style="display:none">Ship to ' + window.domesticCountry + '</a>';
    appendString += '<a href="#" id="selectOutside">Ship outside ' + window.domesticCountry + '</a>';
    appendString += '<br><br><table width="100%" id="shippingOptionsTable"><tbody id="shippingOptionsTableBody"></tbody><tfoot id="shippingOptionsTableFoot"></tfoot></table>';

    if (dialogvar == 'yes') {
        appendString += '</div>';
        $(document.body).append(appendString);
        $("#overlayShipping").dialog({width: 500, height: 400});
    } else {
        $("#shippingDiv").append(appendString);
    }

    $("#selectUs").bind("click", function(event) {
        $("#selectOutside").show();
        $("#selectState").show();
        if (window.domesticCountry == 'United States' || window.domesticCountry == 'Australia') {
            $("#selectState").val('Select State');
        } else if (window.domesticCountry == 'United Kingdom') {
            StateSelect('N/A');
        } else {
            $("#selectState").val('Select Province');
        }
        $("#selectIntState").hide();
        $("#selectUs").hide();

        $("#shippingOptionsTableBody").html('');
        $("#shippingOptionsTableFoot").html('');

        if (dialogvar !== 'yes') {
            $("#shipCountry").val('1');
            $("#x_ship_to_state").val('');
            $("#x_ship_to_state").attr('disabled', 'disabled');
            $("#x_ship_to_country").val('');
            $("#x_ship_to_country").attr('disabled', 'disabled');
            if (typeof(calculateTotal) == 'function') {
                calculateTotal(0);
            }
        }
    });

    $("#selectOutside").bind("click", function(event) {
        $("#selectState").hide();
        $("#selectIntState").val('Select Country');
        $("#selectIntState").show();
        $("#selectOutside").hide();
        $("#selectUs").show();

        $("#shippingOptionsTableBody").html('');
        $("#shippingOptionsTableFoot").html('');

        if (dialogvar !== 'yes') {
            $("#shipCountry").val('2');
            $("#x_ship_to_state").val('');
            $("#x_ship_to_state").removeAttr('disabled');
            $("#x_ship_to_country").val('');
            $("#x_ship_to_country").attr('disabled', 'disabled');
            if (typeof(calculateTotal) == 'function') {
                calculateTotal(0);
            }
        }
    });

    var cartUrlBase = '';
    if (isAdminUrl(location.host)) {
        cartUrlBase = location.pathname.substring(0, location.pathname.indexOf('/', 2)) + cartUrlBase;
    }

    function StateSelect(selectedState) {
        $("#shippingOptionsTableBody").html('');
        $("#shippingOptionsTableFoot").html('');
        if (typeof showShippingAddress != "undefined") {
            showShippingAddress();
        }

        if (selectedState !== 'Select State' && selectedState !== 'Select Province') {
            cartUrl = cartUrlBase + '/module/product.htm?shipping=1&nation=' + window.domesticCountry + '&location=' + selectedState;

            GetShippingOptions(cartUrl, dialogvar, weight, subtotal, quantity);
            $("#x_ship_to_state").val(selectedState);
            $("#x_ship_to_country").val('U.S.');
        }
        else {
            $("#x_ship_to_state").val('');
            $("#x_ship_to_country").val('');
        }
    }

    $("#selectState").bind("change", function(event) {
        var selectedState = $('select#selectState option:selected').val();
        if (selectedState !== 'Select State' && selectedState !== 'Select Province') {
            StateSelect(selectedState);
        }
    });

    $("#selectIntState").bind("change", function(event) {
        $("#shippingOptionsTableBody").html('');
        $("#shippingOptionsTableFoot").html('');
        if (typeof showShippingAddress != "undefined") {
            showShippingAddress();
        }
        var selectedCountry = $.trim($('select#selectIntState option:selected').val());
        if (selectedCountry !== 'Select Country') {
            cartUrl = cartUrlBase + '/module/product.htm?shipping=1&nation=International&location=' + selectedCountry;

            GetShippingOptions(cartUrl, dialogvar, weight, subtotal, quantity);
            //if (typeof(calculateTotal) == 'function') calculateTotal(0);
            $("#x_ship_to_country").val(selectedCountry);
            if (selectedCountry == 'Alberta' || selectedCountry == 'British Columbia' || selectedCountry == 'Manitoba' || selectedCountry == 'New Brunswick' || selectedCountry == 'Newfoundland' || selectedCountry == 'Northwest Territories' || selectedCountry == 'Nova Scotia' || selectedCountry == 'Nunavut' || selectedCountry == 'Ontario' || selectedCountry == 'Prince Edward Island' || selectedCountry == 'Quebec' || selectedCountry == 'Saskatchewan' || selectedCountry == 'Yukon') {
                $("#x_ship_to_state").val(selectedCountry);
                $("#x_ship_to_country").val('Canada');
            } else {
                $("#x_ship_to_state").val('');
            }
        } else {
            $("#x_ship_to_country").val('');
        }
    });

    if (window.domesticCountry == 'United Kingdom') {
        StateSelect('N/A');
    }
}

function GetShippingOptions(cartUrl, dialogvar, weight, subtotal, quantity) {
    var totalWeight = 0;
    var totalQuantity = 0;

    if (dialogvar == 'yes') {  // paypal
        var paypalsubtotal = 0;
        for (var i = window.cartArray.length - 1; i >= 0; i--) {
            if (window.cartArray[i][0] == 'product') {
                totalWeight += (window.cartArray[i][4] * window.cartArray[i][5]);
                paypalsubtotal += Math.round(parseFloat(parseFloat(window.cartArray[i][3]) * parseFloat(window.cartArray[i][4])) * 100) / 100;
                totalQuantity += parseFloat(window.cartArray[i][4]);
            }
        }
        for (var i = window.cartArray.length - 1; i >= 0; i--) {
            if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
                var discount = CalculateDiscount(paypalsubtotal, i);
                if (discount > 0) {
                    discount = Math.round(discount * 100) / 100;
                    paypalsubtotal -= discount;
                }
            }
        }
        subtotal = paypalsubtotal;
    } else {
        totalWeight = weight;
        totalQuantity = quantity;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    //totalWeight = Math.ceil(totalWeight);
    totalQuantity = Math.ceil(totalQuantity);
    if (totalQuantity < 1) {
        totalQuantity = 1;
    }

    cartUrl += '&weight=' + totalWeight + '&qty=' + totalQuantity + '&subtotal=' + subtotal;

    $("#shippingOptionsTableBody").html('<img src="https://s3.amazonaws.com/siteimages/loading.gif">');

    $.getJSON(cartUrl, function(data) {
        $("#shippingOptionsTableBody").html('');
        if (data) {
            if (data.shipOptions) {
                if(data.shipOptions.length > 0) {
                    var checked = 'checked="checked"';

                    // All "Store Pickup" options are removed below - The separate "Pickup" option will be used instead

                    for (var i = 0; i < data.shipOptions.length; i++) {
                        var optionName = data.shipOptions[i].name;
                        if (isStorePickupOption(optionName) || isCurbsidePickupOption(optionName)) {
                            continue;
                        }

                        if (i > 0) {
                            checked = '';
                        }

                        var selectedString = '';
                        if (i == 0) {
                            selectedString = '<span class="selectedMethodClass">$ ' + parseFloat(data.shipOptions[i].price).toFixed(2) + '</span>';
                        }

                        $("#shippingOptionsTableBody").append(
                            '<tr><td nowrap><input type="radio" name="shipRadio" id="shipRadio_' +
                            data.shipOptions[i].id + '" value="' + parseFloat(data.shipOptions[i].price).toFixed(2) +
                            '" ' + checked + '/>&nbsp&nbsp' + optionName +
                            '</td><td  width="120px" align=right>' + parseFloat(data.shipOptions[i].price).toFixed(2) +
                            '</td><td align=right id="selectedMethodTd_' + i + '" style="font-weight:bold; ' +
                            (dialogvar == 'yes' ? 'display:none;' : '') + '">' + selectedString + '</td></tr>'
                        );
                    }

                    for (var i = 0; i < data.shipOptions.length; i++) {
                        var optionName = data.shipOptions[i].name;
                        if (isStorePickupOption(optionName) || isCurbsidePickupOption(optionName)) {
                            continue;
                        }

                        $('#shipRadio_'+ data.shipOptions[i].id).bind("change", {i:i}, function(event) {
                            $('.selectedMethodClass').remove();
                            $('#selectedMethodTd_' + event.data.i).html('<span class="selectedMethodClass">$ ' + parseFloat(data.shipOptions[event.data.i].price).toFixed(2) + '</span>');
                        });
                    }

                    $('input[name=shipRadio]').bind("change", function() {
                        var newShippingAmount = parseFloat($('input[name=shipRadio]:checked').val());
                        if (typeof(calculateTotal) == 'function') {
                            calculateTotal(newShippingAmount);
                        }
                    });

                    if (dialogvar == 'yes') {  // here do a save button, if Paypal
                        $("#shippingOptionsTableFoot").append('<tr><td>&nbsp</td></tr><tr><td><input type="submit" value="Next >" name="submit" id="shippingOptionsSubmit"></td></tr>');

                        $("#shippingOptionsSubmit").bind("click", function(event) {
                            var shippingAmount = $('input[name=shipRadio]:checked').val();
                            $("#cartform").append(' <input type=hidden name=shipping_1 id=shipping_1 value=' + shippingAmount + '>');
                            ProceedToCheckout('yes');
                            return false;
                        });
                    }

                } else {
                    $("#shippingOptionsTableBody").append('<tr><td>Contact store for shipping information</td></tr>');
                }
                var newShippingAmount = parseFloat($('input[name=shipRadio]:checked').val());
                if (typeof(calculateTotal) == 'function') {
                    calculateTotal(newShippingAmount);
                }
            }
        }
    });
}

function isStorePickupOption(optionName) {
    "use strict";

    var index = optionName.search('Store Pickup');
    return (index >= 0);
}

function isCurbsidePickupOption(optionName) {
    "use strict";

    var index = optionName.search('Curbside Pickup');
    return (index >= 0);
}

function MobileCart(forceExpand) {
    var mobileCartDiv = $("#mobileCartDiv");
    if (forceExpand) {
        mobileCartDiv.show();
    }
    else {
        mobileCartDiv.hide();
    }

    var products = '';
    var subtotal = 0;
    var subtotal_to_discount = 0;
    var giftCardSubtotal = 0;
    var itemTotal = 0;
    var integer = 0;
    var remainder = 0;

    UpdateCouponsInCartArrayAndCookie();

    for (var i = 0; i < window.cartArray.length; i++) {
        if (window.cartArray[i][0] == 'product') {
            var idExt = window.cartArray[i][1];
            if (window.cartArray[i].length >= 18) {
                idExt += '-' + window.cartArray[i][17];
            }

            var amount = Math.round((parseFloat(window.cartArray[i][3]) * window.cartArray[i][4]) * 100) / 100;
            if (window.cartArray[i].length > 16 && window.cartArray[i][16] == 'GC') {
                giftCardSubtotal += amount;
            }
            else {
                subtotal += amount;
                if (window.cartArray[i][19] === "true") // 19 - discount_eligible
                {
                    subtotal_to_discount += amount;
                }
            }

            itemTotal = parseFloat(window.cartArray[i][3]) * parseFloat(window.cartArray[i][4]);
            itemTotal = Math.round(itemTotal * 100) / 100;
            integer = Math.floor(window.cartArray[i][4]);
            products +=
                '	<tr>' +
                '		<td colspan=3 style="color: #556b2f;">' + window.cartArray[i][2].replace(/\+/g, ' ') + '</td>' +
                '   </tr>' +
                '   <tr>' +
                '		<td align=right nowrap><b>' + formatCurrency(window.cartArray[i][3]) + '</b></td>' +
                '		<td align=left nowrap>' +
                '			<select onchange="checkFabricMinimum(\'' + idExt + '\', ' + window.cartArray[i][10] + ')" name=integer' + idExt + ' id=integer' + idExt + '>';
            for (var j = 0; j <= window.cartArray[i][10]; j++) {
                products +=
                    '				<option value=' + j + (j == integer ? ' selected' : '') + '>' + j + '</option>';
            }
            products += '</select>';
            products += '<script>checkFabricMinimum(\'' + idExt + '\', ' + window.cartArray[i][10] + ');</script>';

            if (window.cartArray[i][6] == 'fraction') {

                remainder = Math.round(parseFloat(window.cartArray[i][4]) * 100) % 100;

                var maxVal = parseFloat(window.cartArray[i][10]);
                var maxIntegerVal = Math.floor(maxVal);
                var maxFractionVal = Math.floor((maxVal * 100) % 100) / 100;

                if (window.measurementUnit == 'Meter') {
                    products += '<select name=fraction' + idExt + ' id=fraction' + idExt + '>';
                    products += '	<option value="0"' + (remainder == 0 ? ' selected' : '') + '>.0</option>';
                    if (integer == 0 && window.cartArray[i][9] == 'fat quarter') {
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.25) {
                            products += '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>fat quarter</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    else if (integer == 0 && (window.cartArray[i][9] == '0.25' || window.cartArray[i][9] == 'fat quarter')) {
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    else if (integer > 0) {
                        if (integer < maxIntegerVal || maxFractionVal >= 0.1) {
                            products += '	<option value="0.1"' + (remainder == 10 ? ' selected' : '') + '>.1</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.2) {
                            products += '	<option value="0.2"' + (remainder == 20 ? ' selected' : '') + '>.2</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.5) {
                        products += '	<option value="0.5"' + (remainder == 50 ? ' selected' : '') + '>.5</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.6) {
                        products += '	<option value="0.6"' + (remainder == 60 ? ' selected' : '') + '>.6</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.7) {
                        products += '	<option value="0.7"' + (remainder == 70 ? ' selected' : '') + '>.7</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.8) {
                        products += '	<option value="0.8"' + (remainder == 80 ? ' selected' : '') + '>.8</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.9) {
                        products += '	<option value="0.9"' + (remainder == 90 ? ' selected' : '') + '>.9</option>';
                    }
                    products += '</select>';
                }
                else { // Yards
                    products +=
                        '<select name=fraction' + idExt + ' id=fraction' + idExt + '>' +
                        '	<option value="0"' + (remainder == 0 ? ' selected' : '') + '>0</option>';
                    if (integer == 0 && (window.cartArray[i][9] == '0.25' || window.cartArray[i][9] == 'fat quarter')) {
                        products +=
                            '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>' + (window.cartArray[i][9] == 'fat quarter' ? 'fat quarter' : '1/4') + '</option>';
                    } else if (integer > 0) {
                        products +=
                            '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>1/4</option>';
                    }
                    products +=
                        '	<option value="0.5"' + (remainder == 50 ? ' selected' : '') + '>1/2</option>' +
                        '	<option value="0.75"' + (remainder == 75 ? ' selected' : '') + '>3/4</option>' +
                        '</select>';
                }

            }
            products +=
                '		</td>' +
                '		<td align=right nowrap><b>' + formatCurrency(itemTotal) + '</b></td>' +
                '	</tr>';
        }
    }

    for (var i = 0; i < window.cartArray.length; i++) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            var couponInfo = GetCouponInfo(window.cartArray[i]);
            var discount = Math.round(CalculateDiscount(subtotal_to_discount, i) * 100) / 100;
            if (discount > 0) {
                subtotal -= discount;
                products +=
                    '	<tr>' +
                    '		<td><b>' + couponInfo.title.replace(/\+/g, ' ') + '</b></td>' +
                    '		<td>&nbsp;</td>' +
                    '		<td align=right nowrap><b>- ' + formatCurrency(discount) + '</b></td>' +
                    '	</tr>' +
                    '';
            }
        }
    }

    subtotal += giftCardSubtotal;

    // Gift Card Payments
    var giftCardPayments = 0;
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'giftcard') {
            giftCardPayments += Math.round(window.cartArray[i][3] * 100) / 100;
        }
    }

    var giftCardRows = '';
    if (giftCardPayments > 0) {

        if (subtotal < giftCardPayments) {
            giftCardPayments = subtotal;
        }

        giftCardRows = '' +
            '	<tr>' +
            '		<td colspan=3 align=right valign=top nowrap>' +
            '			<b>Payments Made With Gift Cards</b>' +
            '		</td>' +
            '		<td align=right valign=top nowrap><b>' + formatCurrency(giftCardPayments) + '</b></td>' +
            '	</tr>' +
            '	<tr>' +
            '		<td colspan=3 align=right valign=top nowrap>' +
            '			<b>Amount Remaining</b>' +
            '		</td>' +
            '		<td align=right valign=top nowrap><b>' + formatCurrency(subtotal - giftCardPayments) + '</b></td>' +
            '	</tr>'
        ;

    }

    subtotal = Math.round(subtotal * 100) / 100;

    mobileCartDiv.html('<table width=100% cellpadding=5 cellspacing=0 border=0>' +
        '	<tr><td colspan=3><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        '	<tr>' +
        '		<td colspan=3 style="font-size: 10px;">Description</td>' +
        '   </tr>' +
        '   <tr>' +
        '		<td style="font-size: 10px;" align=right>Price</td>' +
        '		<td style="font-size: 10px;" align=left>Quantity</td>' +
        '		<td style="font-size: 10px;" align=right>Amount</td>' +
        '	</tr>' +
        '	<tr><td colspan=3><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        products +
        '	<tr>' +
        '		<td>&nbsp;</td>' +
        '		<td align=left colspan=2 nowrap>' +
        '			<a href="javascript:UpdateMobileCart()"><img width=70 height=26 border=0 src="https://siteimages.s3.amazonaws.com/btn-update-1.png" alt="Update"></a>' +
        '		</td>' +
        '	</tr>' +
        '	<tr><td colspan=3><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        '	<tr>' +
        '		<td colspan=3 align=right valign=top><br>' +
        '                   <a href="#"><img border=0 width=160 height=26 src="https://siteimages.s3.amazonaws.com/btn-enter-coupon-1.png" alt="Enter Coupon" id="mobile-enter-coupon-btn"></a>' +
        '		</td>' +
        '	</tr>' +
        '	<tr>' +
        '		<td colspan=2 align=right valign=top>' +
        '			<h2>Item Total</h2>' +
        '		</td>' +
        '		<td align=right valign=top nowrap><h2>' + formatCurrency(subtotal) + '</h2></td>' +
        '	</tr>' +

        giftCardRows +

        '	<tr>' +
        '		<td colspan=3 align=right>' +
        '			<span style="font-size: 10px;">(shipping will be calculated at checkout)</span>' +
        '		</td>' +
        '	</tr>' +
        '	<tr>' +
        '		<td colspan=3 align=right>' +
        '			<br>' +
        '			<a href="javascript:ProceedToCheckout(\'no\');"><img border=0 width=160 height=26 src="https://siteimages.s3.amazonaws.com/btn-proceed-to-checkout-1.png" alt="Proceed to Checkout"></a>' +
        '		</td>' +
        '	</tr>' +
        '</table>' +
        '' +
        MakeCartForm() +
        '');
}

function WideCart() {
    var wideCartDiv = $("#wideCartDiv");

    var products = '';
    var subtotal = 0;
    var subtotal_to_discount = 0;
    var giftCardSubtotal = 0;
    var itemTotal = 0;
    var integer = 0;
    var remainder = 0;

    UpdateCouponsInCartArrayAndCookie();

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        var row = window.cartArray[i];
        if (row[0] == 'product') {
            var idExt = row[1];

            if (row.length >= 18) {
                idExt += '-' + row[17];
            }

            var amount = Math.round((parseFloat(row[3]) * row[4]) * 100) / 100;
            if (row.length > 16 && row[16] == 'GC') {
                giftCardSubtotal += amount;
            }
            else {
                subtotal += amount;
                if (row[19] === "true")  // 19 - discount_eligible
                {
                    subtotal_to_discount += amount;
                }
            }

            itemTotal = parseFloat(row[3]) * parseFloat(row[4]);
            itemTotal = Math.round(itemTotal * 100) / 100;
            integer = Math.floor(row[4]);
            products +=
                '	<tr>' +
                '		<td>' + renderImage(row) + row[2].replace(/\+/g, ' ') + '</td>' +
                '		<td align=right nowrap>' + formatCurrency(row[3]) + '</td>' +
                '		<td align=left nowrap>' +
                '			<select onchange="checkFabricMinimum(\'' + idExt + '\', ' + row[10] + '); UpdateWideCart(true);" name=integer' + idExt + ' id=integer' + idExt + '>';
            for (var j = 0; j <= row[10]; j++) {
                products +=
                    '				<option value=' + j + (j == integer ? ' selected' : '') + '>' + j + '</option>';
            }
            products += '</select>';
            products += '<script>checkFabricMinimum(\'' + idExt + '\', ' + row[10] + ');</script>';

            if (row[6] == 'fraction') {

                remainder = Math.round(parseFloat(row[4]) * 100) % 100;

                var maxVal = parseFloat(row[10]);
                var maxIntegerVal = Math.floor(maxVal);
                var maxFractionVal = Math.floor((maxVal * 100) % 100) / 100;

                if (window.measurementUnit == 'Meter') {
                    products += '<select onchange="UpdateWideCart(true);" name=fraction' + idExt + ' id=fraction' + idExt + '>';
                    products += '	<option value="0"' + (remainder == 0 ? ' selected' : '') + '>.0</option>';
                    if (integer == 0 && row[9] == 'fat quarter') {
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.25) {
                            products += '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>fat quarter</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    else if (integer == 0 && (row[9] == '0.25' || row[9] == 'fat quarter')) {
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (maxIntegerVal > 0 || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    else if (integer > 0) {
                        if (integer < maxIntegerVal || maxFractionVal >= 0.1) {
                            products += '	<option value="0.1"' + (remainder == 10 ? ' selected' : '') + '>.1</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.2) {
                            products += '	<option value="0.2"' + (remainder == 20 ? ' selected' : '') + '>.2</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.3) {
                            products += '	<option value="0.3"' + (remainder == 30 ? ' selected' : '') + '>.3</option>';
                        }
                        if (integer < maxIntegerVal || maxFractionVal >= 0.4) {
                            products += '	<option value="0.4"' + (remainder == 40 ? ' selected' : '') + '>.4</option>';
                        }
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.5) {
                        products += '	<option value="0.5"' + (remainder == 50 ? ' selected' : '') + '>.5</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.6) {
                        products += '	<option value="0.6"' + (remainder == 60 ? ' selected' : '') + '>.6</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.7) {
                        products += '	<option value="0.7"' + (remainder == 70 ? ' selected' : '') + '>.7</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.8) {
                        products += '	<option value="0.8"' + (remainder == 80 ? ' selected' : '') + '>.8</option>';
                    }
                    if (integer < maxIntegerVal || maxFractionVal >= 0.9) {
                        products += '	<option value="0.9"' + (remainder == 90 ? ' selected' : '') + '>.9</option>';
                    }
                    products += '</select>';
                }
                else { // Yards
                    products +=
                        '<select onchange="UpdateWideCart(true);" name=fraction' + idExt + ' id=fraction' + idExt + '>' +
                        '	<option value="0"' + (remainder == 0 ? ' selected' : '') + '>0</option>';
                    if (integer == 0 && (row[9] == '0.25' || row[9] == 'fat quarter')) {
                        products +=
                            '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>' + (row[9] == 'fat quarter' ? 'fat quarter' : '1/4') + '</option>';
                    } else if (integer > 0) {
                        products +=
                            '	<option value="0.25"' + (remainder == 25 ? ' selected' : '') + '>1/4</option>';
                    }
                    products +=
                        '	<option value="0.5"' + (remainder == 50 ? ' selected' : '') + '>1/2</option>' +
                        '	<option value="0.75"' + (remainder == 75 ? ' selected' : '') + '>3/4</option>' +
                        '</select>';
                }

            }
            products +=
                '		</td>' +
                '		<td align=right nowrap>' + formatCurrency(itemTotal) + '</td>' +
                '		<td align=right nowrap><span onclick="$(\'#integer' + idExt + '\').val(0); $(\'#fraction' + idExt + '\').val(0); UpdateWideCart(false);" onmouseover="$(this).css(\'color\',\'#c00\');" onmouseout="$(this).css(\'color\',\'#ccc\');" style="color:#ccc;cursor:pointer;"><b>&nbsp;&times;&nbsp;</b></span></td>' +
                '	</tr>';
        }
    }

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            var couponInfo = GetCouponInfo(window.cartArray[i]);
            var discount = Math.round(CalculateDiscount(subtotal_to_discount, i) * 100) / 100;
            if (discount > 0) {
                subtotal -= discount;
                products +=
                    '	<tr>' +
                    '		<td>' + couponInfo.title.replace(/\+/g, ' ') + '</td>' +
                    '		<td>&nbsp;</td>' +
                    '		<td>&nbsp;</td>' +
                    '		<td align=right nowrap>- ' + formatCurrency(discount) + '</td>' +
                    '		<td>&nbsp;</td>' +
                    '	</tr>' +
                    '';
            }
        }
    }

    subtotal += giftCardSubtotal;
    subtotal = Math.round(subtotal * 100) / 100;

    // Gift Card Payments
    var giftCardPayments = 0;
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'giftcard') {
            giftCardPayments += Math.round(window.cartArray[i][3] * 100) / 100;
        }
    }

    var giftCardRows = '';
    if (giftCardPayments > 0) {

        if (subtotal < giftCardPayments) {
            giftCardPayments = subtotal;
        }

        giftCardRows = '' +
            '	<tr>' +
            '		<td colspan=3 align=right valign=top nowrap>' +
            '			<b>Payments Made With Gift Cards</b>' +
            '		</td>' +
            '		<td colspan=2 align=right nowrap><b>' + formatCurrency(giftCardPayments) + '</b></td>' +
            '	</tr>' +
            '	<tr>' +
            '		<td colspan=3 align=right nowrap>' +
            '			<b>Amount Remaining</b>' +
            '		</td>' +
            '		<td colspan=2 align=right nowrap><b>' + formatCurrency(subtotal - giftCardPayments) + '</b></td>' +
            '	</tr>'
        ;

    }

    if (typeof updateSubtotal != "undefined") {
        updateSubtotal(subtotal);
    }

    var wideCartHtml =
        '<div class="table-responsive">' +
        '<table width=100% cellpadding=5 cellspacing=0 border=0 class="table-condensed">' +
        '	<tr><td colspan=5><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        '	<tr>' +
        '		<td style="font-size: 10px;">Description</td>' +
        '		<td style="font-size: 10px;" align=right>Price</td>' +
        '		<td style="font-size: 10px;" align=left>Quantity</td>' +
        '		<td style="font-size: 10px;" align=right>Amount</td>' +
        '		<td>&nbsp;</td>' +
        '	</tr>' +
        '	<tr><td colspan=5><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        products +
        '	<tr><td colspan=5><div style="height: 1px; border-top: 1px solid #fff; border-bottom: 1px solid #bbb;"><spacer></div></td></tr>' +
        '	<tr>' +
        '		<td colspan=5 align=left valign=top nowrap>' +
        '			<a href="' + editcartUrl + '&enterCoupon=true" style="font-size:14px !important;">Enter Coupon</a>' + (window.paymentProcessor === undefined || window.paymentProcessor == false || window.paymentProcessor == 'paypal' ? '' : '&nbsp; | &nbsp; <a href="' + editcartUrl + '&enterGiftcard=true">Enter Gift Card</a>') +
        '		</td>' +
        '	</tr>' +

        '	<tr>' +
        '		<td colspan=4 align=right valign=top nowrap><h2 style="font-size: 20px !important; margin:0px !important;">Subtotal: &nbsp; ' +
        '		' + formatCurrency(subtotal) + '</h2></td>' +
        '		<td>&nbsp;</td>' +
        '	</tr>' +
        giftCardRows
    ;

    if (window.cartModeProceed !== false) {
        wideCartHtml +=
            '	<tr>' +
            '		<td colspan=4 align=right>' +
            '			<span style="font-size: 10px;">(shipping will be calculated at checkout)</span>' +
            '		</td>' +
            '		<td>&nbsp;</td>' +
            '	</tr>' +
            '	<tr>' +
            '		<td valign=middle nowrap><a href="javascript:history.go(-1);" style="font-size:14px !important;">< Continue Shopping</a></td>' +
            '		<td colspan=3 align=right>' +
            '			<a href="javascript:ProceedToCheckout(\'no\');" class="proceedToCheckout" style="display:inline-block; padding: 5px 25px; border: 1px solid #999; background: #000; font-size: 16px !important; text-decoration:none !important; color: #fff !important;">Proceed to Checkout &raquo;</a>' +
            '		</td>' +
            '		<td>&nbsp;</td>' +
            '	</tr>' +
            '</table><br><br>' +
            '</div>' +
            MakeCartForm() +
            ''
        ;
    } else {
        wideCartHtml +=
            '</table><br><br>' +
            '</div>' +
            ''
        ;
    }

    wideCartDiv.html(wideCartHtml);

}

function renderImage(row) {
    var path = row[20];
    if (path !== undefined && path !== "" && row[21] !== undefined) {
        return '<img border=0 style="width:40px; height:40px;' + row[21] + ' margin-top: 4px; margin-bottom: 4px;" src="' + row[20] + '">&nbsp;&nbsp;';
    }
    return "";
}

function handleWaitlistProductOptionChanged(in_productId, in_attributeIndex) {
    var key = '';

    // Get the key
    for (var i = 0; i < window['numAttributes' + in_productId]; i++) {
        key += (key.length > 0 ? '-' : '') + $('#attribute_' + in_productId + '_' + i).val();
    }
    if (window['prices' + in_productId][key] == undefined) {
        // We didn't find the key, so we need to choose a key that exists
        var attributeVal = $("#attribute_" + in_productId + "_" + in_attributeIndex).val();
        for (var priceKey in window['prices' + in_productId]) {
            var parts = priceKey.split('-');
            if (parts[in_attributeIndex] == attributeVal) {
                for (var k = 0; k < parts.length; k++) {
                    $("#attribute_" + in_productId + "_" + k).val(parts[k]);
                }
                key = priceKey;
                break;
            }
        }
    }
}

function UpdateCartArrayAndCookie(in_promptForDelete) {
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        var row = window.cartArray[i];
        if (row[0] == 'product') {
            var idExt = row[1];

            if (row.length >= 18) {
                idExt += '-' + row[17];
            }

            if (row[6] == 'integer') {
                productCount = parseInt(document.getElementById('integer' + idExt).value);
            }
            else {
                productCount = parseInt(document.getElementById('integer' + idExt).value) + parseFloat(document.getElementById('fraction' + idExt).value);
            }
            if (row[12] == 1) {
                var cartUrl = '/module/product.htm?timed=1';
                if (isAdminUrl(location.host)) {
                    cartUrl = location.pathname.substring(0, location.pathname.indexOf('/', 2)) + cartUrl;
                }
                $.ajax({
                    url: cartUrl,
                    type: 'POST',
                    data: 'timed=1' + '&which=1' + '&productId=' + row[1] + '&pslrId=' + row[17] + '&prevcount=' + row[4] + '&newcount=' + productCount + '&prevholdingid=' + row[13] + '&i=' + i,
                    async: false,
                    success: function(result) {
                        if (result.substring(0, 12) == 'insufficient') {
                            alert('There is no longer sufficient inventory to add the number of items you requested to your cart.');
                            window.cartArray.remove(parseInt(result.substring(13)));
                            return;
                        } else {
                            result = result.split('-');
                            if (parseInt(result[0]) == 0) {
                                window.cartArray.remove(parseInt(result[1]));
                            }
                            else {
                                window.cartArray[parseInt(result[1])][4] = parseInt(result[0]);
                                window.cartArray[parseInt(result[1])][13] = result[2];
                            }
                        }
                    }
                });
            } else {
                if (productCount == 0) {
                    if (in_promptForDelete) {
                        if (confirm('Do you want to remove this product from your shopping cart?')) {
                            window.cartArray.remove(i);
                        }
                    } else {
                        window.cartArray.remove(i);
                    }
                } else {
                    row[4] = productCount;
                }
            }
        }
    }

    var productCount = 0;
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'product') {
            productCount++;
        }
    }

    if (productCount == 0) {
        Delete_Cart_Cookie('cart', '/', '');
    } else {
        Set_Cart_Cookie('cart', BuildCookieFromArray(), '', '/', '', '');
    }
}

function UpdateCouponsInCartArrayAndCookie() {
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            var couponInfo = GetCouponInfo(window.cartArray[i]);
            checkCouponExpiration(i, couponInfo.number);
        }
    }
}

function checkCouponExpiration(i, coupon_id) {
    if(typeof coupon_id == 'undefined' || coupon_id == 0 || coupon_id == '0') {
        return;
    }
    var cartUrl = '/module/product.htm?editCart=1';
    if (isAdminUrl(location.host)) {
        cartUrl = location.pathname.substring(0, location.pathname.indexOf('/', 2)) + cartUrl;
    }

    $.ajax({
        url: cartUrl, type: 'GET', data: 'couponid=' + coupon_id,
        async: false,
        success: function(result) {
            var data = JSON.parse(result);
            if (data.status !== "ok") {
                alertAndRemoveCoupon(i, getCouponExpiredString(data));
                return;
            }
        }
    });
}

function UpdateMobileCart() {
    UpdateCartArrayAndCookie(false);
    MobileCart(true);
}

function UpdateWideCart(in_promptForDelete) {
    UpdateCartArrayAndCookie(in_promptForDelete);
    WideCart();
}

function CalculateDiscountData() {
    var subtotal = 0;
    var subtotal_to_discount = 0;
    var newGiftCardSubtotal = 0;
    var appliedGiftCardSubtotal = 0;
    var discount = 0;
    var retPercent = 0;

    var hasDollarOff = false;
    var hasPercentOff = false;
    var percentOrAmount = 'percent';

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        var row = window.cartArray[i];
        if (row[0] == 'product') {
            if (parseInt(row[4]) == row[4]) {
                var amount = Math.round((parseFloat(row[3]) * row[4]) * 100) / 100;
                if (row.length > 16 && row[16] == 'GC') {
                    newGiftCardSubtotal += amount;
                } else {
                    subtotal += amount;
                    if (row[19] === "true") // 19 - discount_eligible
                    {
                        subtotal_to_discount += amount;
                    }
                }
            } else {
                var amount = (parseFloat(row[3]) * parseFloat(row[4]));
                amount = Math.round(parseFloat(amount) * 100) / 100;
                if (row.length > 16 && row[16] == 'GC') {
                    newGiftCardSubtotal += amount;
                } else {
                    subtotal += amount;
                    if (row[19] === "true") // 19 - discount_eligible
                    {
                        subtotal_to_discount += amount;
                    }
                }
            }
        }
    }

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            var couponInfo = GetCouponInfo(window.cartArray[i]);

            if (couponInfo.couponType == 'dollar_off') {
                hasDollarOff = true;
            }
            if (couponInfo.couponType == 'percent_off') {
                hasPercentOff = true;
            }

            discount = CalculateDiscount(subtotal_to_discount, i);
            if (discount > 0) {
                // Only one coupon should be applied.  The last one is the one that will be applied.
                discount = Math.round(discount * 100) / 100;
            }
        }
    }

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'giftcard') {
            var giftCardAmount = Math.round(parseFloat(window.cartArray[i][3]) * 100) / 100;
            if (giftCardAmount > (subtotal - appliedGiftCardSubtotal)) {
                giftCardAmount = subtotal - appliedGiftCardSubtotal - 0.01;
            } // Paypal doesn't allow $0 carts
            appliedGiftCardSubtotal += giftCardAmount
        }
    }

    if (discount > 0 || appliedGiftCardSubtotal > 0) {
        retPercent = Math.round(((discount + appliedGiftCardSubtotal) / subtotal) * 10000) / 100;
    }

    if (hasDollarOff == true && hasPercentOff == false) {
        percentOrAmount = 'amount';
    }

    return {
        hasDiscount: (retPercent > 0),
        percent: retPercent,
        discount: discount,
        percentOrAmount: percentOrAmount
    };

}

function MakeCartForm() {
    var productsStr = '';
    var totalWeight = 0;
    var count = 0;
    var subtotal = 0;
    var giftCardSubtotal = 0;

    var discountData = CalculateDiscountData();
    var accumulatedDiscount = 0;
    var discountAmount = 0;

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'product') {
            count++;
            totalWeight += (window.cartArray[i][4] * window.cartArray[i][5]);
            var amount = window.cartArray[i][3];
            var weight = window.cartArray[i][5];
            var quantity = window.cartArray[i][4];
            var units = '';
            var isClass = window.cartArray[i][1].indexOf('CLASS') > -1;

            if (parseInt(window.cartArray[i][4]) == window.cartArray[i][4]) {
                if (window.cartArray[i].length > 16 && window.cartArray[i][16] == 'GC') {
                    giftCardSubtotal += Math.round((parseFloat(window.cartArray[i][3]) * window.cartArray[i][4]) * 100) / 100;
                } else {
                    subtotal += Math.round((parseFloat(window.cartArray[i][3]) * window.cartArray[i][4]) * 100) / 100;
                }
            } else {
                amount = (parseFloat(window.cartArray[i][3]) * parseFloat(window.cartArray[i][4]));
                if (window.cartArray[i].length > 16 && window.cartArray[i][16] == 'GC') {
                    giftCardSubtotal += Math.round(parseFloat(amount) * 100) / 100;
                } else {
                    subtotal += Math.round(parseFloat(amount) * 100) / 100;
                }
                amount = Math.round(amount * 100) / 100;
                weight = (parseFloat(window.cartArray[i][5]) * parseFloat(window.cartArray[i][4]));
                weight = Math.round(weight * 100) / 100;
                quantity = 1;
                units = ' (' + window.cartArray[i][4] + ' ' + window.measurementText.toLowerCase() + 's)';
            }

            productsStr += '<input type=hidden name=amount_' + count + ' id=amount_' + count + ' value="' + amount + '">';
            productsStr += '<input type=hidden name=item_name_' + count + ' id=item_name_' + count + ' value="' + window.cartArray[i][2].replace(/["']/g, "") + units + (window.cartArray[i].length >= 8 && window.cartArray[i][7] != '' ? " [" + window.cartArray[i][7] + "]" : '') + '">';
            productsStr += '<input type=hidden name=item_number_' + count + ' id=item_number_' + count + ' value="' + window.cartArray[i][1] + '">';
            productsStr += '<input type=hidden name=weight_' + count + ' id=weight_' + count + ' value="' + weight + '">';
            productsStr += '<input type=hidden name=quantity_' + count + ' id=quantity_' + count + ' value="' + quantity + '">';
            if (window.cartArray[i].length > 14 && window.cartArray[i][14].length > 0) {
                productsStr += '<input type=hidden name=shipping_' + count + ' value="' + window.cartArray[i][14] + '">';
            }
            if (window.cartArray[i].length > 16 && window.cartArray[i][16] == 'GC') {
                productsStr += '<input type=hidden name=tax_' + count + ' value="0">';
            } else if (window.cartArray[i].length > 15 && window.cartArray[i][15].length > 0) {
                if (isClass) {
                    // We always want classes to not be taxed on old cart
                    productsStr += '<input type=hidden name=tax_' + count + ' value="0">';
                } else {
                    // Let PayPal decide whether to add taxes for products
                    productsStr += '<input type=hidden name=tax_' + count + ' value="">';
                }
            }

            if (discountData.hasDiscount) {
                if (discountData.percentOrAmount == 'percent') {
                    productsStr += '<input type=hidden name=discount_rate_' + count + ' id=discount_rate_' + count + ' value="' + discountData.percent + '">';
                } else {
                    if (IsLastProduct(i)) {
                        discountAmount = Math.round((discountData.discount - accumulatedDiscount) * 100) / 100;
                        accumulatedDiscount = discountData.discount;
                    } else {
                        discountAmount = Math.round(parseFloat(amount) * (Math.round(parseFloat(quantity) * 1000) / 1000) * (parseFloat(discountData.percent) / 100) * 100) / 100;
                        accumulatedDiscount += discountAmount;
                    }
                    productsStr += '<input type=hidden name=discount_amount_' + count + ' id=discount_amount_' + count + ' value="' + discountAmount + '">';
                }
            }

        }
    }

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            var couponInfo = GetCouponInfo(window.cartArray[i]);
            if (discountData.hasDiscount) {
                count++;

                productsStr += '<input type=hidden name=amount_' + count + ' id=amount_' + count + ' value="0">';
                productsStr += '<input type=hidden name=item_name_' + count + ' id=item_name_' + count + ' value="' + couponInfo.title.replace(/["']/g, "") + '">';
                productsStr += '<input type=hidden name=item_number_' + count + ' id=item_number_' + count + ' value="0">';
                productsStr += '<input type=hidden name=weight_' + count + ' id=weight_' + count + ' value="0">';
                productsStr += '<input type=hidden name=quantity_' + count + ' id=quantity_' + count + ' value="1">';
            }
        }
    }

    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'giftcard') {
            //var giftCardAmount = window.cartArray[i][3];
            count++;

            productsStr += '<input type=hidden name=amount_' + count + ' id=amount_' + count + ' value="0">';
            productsStr += '<input type=hidden name=item_name_' + count + ' id=item_name_' + count + ' value="' + window.cartArray[i][2].replace(/["']/g, "") + '">';
            productsStr += '<input type=hidden name=item_number_' + count + ' id=item_number_' + count + ' value="' + window.cartArray[i][1] + '">';
            productsStr += '<input type=hidden name=weight_' + count + ' id=weight_' + count + ' value="0">';
            productsStr += '<input type=hidden name=quantity_' + count + ' id=quantity_' + count + ' value="1">';

        }
    }

    if (productsStr == '') {
        return '';
    } // Return nothing if we have no products

    totalWeight = Math.ceil(totalWeight);

    var paymentAction = 'sale';
    if (GetCartArrayValueByKey('businessEmail', 'paymentAction') == 'authorization') {
        paymentAction = 'authorization';
    }

    window.shopping_cart_contents_id = escape(document.domain).replace(/@/g, '').replace(/\./g, '') + Math.floor(Math.random() * 100000000) + Math.floor(Math.random() * 100000000);
    if (!window.PayPalUrl) {
        window.PayPalUrl = 'https://www.paypal.com/cgi-bin/webscr';
    }

    var str =
        '<form id=cartform name=cartform method=post action="' + window.PayPalUrl + '">' +
        '<input type="hidden" name="cmd" value="_cart">' +
        '<input type="hidden" id="notify_url" name="notify_url" value="http://' + document.domain + '/module/product.htm?ipn=1&shopping_cart_contents_id=' + window.shopping_cart_contents_id + '">' +
        '<input type=hidden name=upload id=upload value="1">' +
        '<input type=hidden name=weight_unit id=weight_unit value="' + window.weightUnit + '">' +
        '<input type=hidden name=currency_code id=currency_code value="' + window.currency + '">' +
        '<input type="hidden" name="return" value="' + location.href + (location.href.indexOf('?') > 0 ? '&' : '?') + 'emptycart=1">' +
        '<input type="hidden" name="shopping_url" value="' + location.href + '">' +
        '<input type=hidden name=business id=business value="' + GetCartArrayValueByKey('businessEmail') + '">' +
        '<input type=hidden name=paymentaction id=paymentaction value="' + paymentAction + '">' +
        '<input type="hidden" name="bn" value="Rain_SP">' +
        productsStr +
        '</form>' +
        '';

    return str;
}

function IsLastProduct(in_i) {
    var lastI = false;
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'product') {
            lastI = i;
        }
    }
    return (lastI === in_i ? true : false);
}

function GetCartArrayValueByKey(in_key, in_subKey) {
    if (window.cartArray === undefined || window.cartArray.length == 0) {
        return '';
    }

    var retVal = '';
    for (var i = 0; i < window.cartArray.length; i++) {
        if (window.cartArray[i][0] == in_key) {
            if (in_subKey != undefined) {
                for (var j = 0; j < window.cartArray[i].length; j++) {
                    if (window.cartArray[i][j] == in_subKey) {
                        if (window.cartArray[i].length >= j + 1) {
                            retVal = window.cartArray[i][j + 1];
                        }
                        break;
                    }
                }
                break;
            } else {
                if (window.cartArray[i].length >= 2) {
                    retVal = window.cartArray[i][1];
                }
            }
            break;
        }
    }

    return retVal;
}
