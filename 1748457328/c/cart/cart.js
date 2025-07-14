/* Shopping Cart (2017 version) */

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if (!window.domesticCountry) {
    window.domesticCountry = 'United States';
}

var linkStyles = 'color: #fff !important; text-decoration:underline !important; font-family: Arial !important; font-size: 12px !important; font-weight: normal !important;';
var checkoutUrl = window.CheckoutUrl;
if (checkoutUrl.indexOf('?') < 0) {
    checkoutUrl += "?1";
}
var editcartUrl = window.EditCartUrl;
if (editcartUrl.indexOf('?') < 0) {
    editcartUrl += "?1";
}

//module to make cart requests synchronous
var requestModule = (function() {
    var instance;
    var readyForNext = true;

    var addItemToCart = function(postData) {
        return new Promise(function (resolve) {
            var intervalId = setInterval(function() {
                if (readyForNext === true) {
                    var cartUuid = getCartUuidFromCookie();

                    resolve(sendCartItem(cartUuid, postData));

                    clearInterval(intervalId);
                }
            }, 100);
        });
    }

    var sendCartItem = function(cartUuid, postData) {
        readyForNext = false;
        var axios = getAxiosInstance();

        return axios.post("/api/cart/" + cartUuid + "/item", postData).then(function(response) {
            if (response && response.data && response.data.success) {
                if (response.data.uuid) {
                    setCartUuidCookie(response.data.uuid);
                }
                if (response.data.data) {
                    CreateCartArray(response.data.data);
                    ShowCart(true);
                }
            } else {
                alert('There was an error adding this item to your cart.');
            }
        })
            .catch(function (error) {
                var errorMessage = error.response && error.response.data && error.response.data.error;
                
                alert(errorMessage || 'There was an error adding this item to your cart.');
            })
            .finally(function() {
                readyForNext = true;
            });
    }

    var createInstance = function() {
        return {
            addItemToCart: addItemToCart
        }
    }

    return {
        getInstance: function() {
            return instance || (instance = createInstance());
        }
    }
}());

function Set_Cart_Cookie_Cookie(name, value, expires, path, domain, secure) {
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

    while (value.substring(0, 4) == 'null') {
        value = value.substring(4);
    }

    value = escape(value);
    var count = 0;
    var lastIndex = 0;

    while (value.length > lastIndex) {

        var segment = value.substring(lastIndex, lastIndex + 4000);
        if (value.length > lastIndex + 4000) {
            var lastPos = segment.lastIndexOf('%');
            if (lastPos > 0) {
                segment = segment.substring(0, lastPos);
                lastIndex = lastIndex + lastPos;
            }
            else {
                lastIndex = lastIndex + 4000;
            }
        }
        else {
            lastIndex = lastIndex + 4000;
        }

        document.cookie = name + (count > 0 ? count : '') + "=" + segment +
            ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
            ( ( path ) ? ";path=" + path : "" ) +
            ( ( domain ) ? ";domain=" + domain : "" ) +
            ( ( secure ) ? ";secure" : "" );

        count++;
    }

    if (count > 0) {
        // Delete any leftover cookies if the amount to be stored is shrinking (they are removing items from the shopping cart)
        document.cookie = name + (count > 0 ? count : '') + "=" +
            ( ( path ) ? ";path=" + path : "") +
            ( ( domain ) ? ";domain=" + domain : "" ) +
            ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    }
}

function trimUuid(uuid) {
    var trimmed = '';
    if(typeof uuid === 'string') {
        trimmed = uuid.substr(0,36);
    }
    return trimmed;
}

function setCartUuidCookie(uuid) {
    uuid = trimUuid(uuid);
    var name = 'cart_id';
    var days = 31;
    var expires = "";
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (uuid || "")  + expires + "; path=/";
}
function getCartUuidFromCookie() {
    var name = 'cart_id';
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            var uuid = c.substring(nameEQ.length,c.length);
            return trimUuid(uuid);
        }
    }
    return null;
}

function getAxiosInstance() {
    var instance = axios.create();
    if (window.cartJWT) {
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + window.cartJWT;
    }
    return instance;
};


function addItemToCartData(data, classPackageData) {
    var postData = {
        'item_data': encodeURIComponent(data)
    };

    // Pass Class packageData with the class to avoid async race conditions
    if (classPackageData && Array.isArray(classPackageData) && classPackageData.length > 0){
        postData['class_package_data'] = classPackageData;
    }

    return requestModule.getInstance().addItemToCart(postData);
}

function Set_Cart_Cookie_Db(name, value, expires, path, domain, secure) {
    var cartUuid = getCartUuidFromCookie(); // may be null, server will return one

    var axios = getAxiosInstance();
    var data = {};
    data.uuid = cartUuid;
    data.cart_contents = value;

    axios.post("/api/cart/data", data).then(function(response) {
        if(response && response.data && response.data.uuid) {
            setCartUuidCookie(response.data.uuid);
        }
    });

    // TODO - handle the unhappy cases
    // TODO - no, really do it.
}

// Cart
function Set_Cart_Cookie(name, value, expires, path, domain, secure) {
    if(name == 'cart') {
        Set_Cart_Cookie_Db(name, value, expires, path, domain, secure);
        CreateCartArray(value);
    } else {
        Set_Cart_Cookie_Cookie(name, value, expires, path, domain, secure);
    }
}

function Get_Cart_Cookie_Cookie(check_name) {
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false;
    var retVal = null;
    var count = 0;

    do {

        b_cookie_found = false;

        for (i = 0; i < a_all_cookies.length; i++) {
            a_temp_cookie = a_all_cookies[i].split('=');

            cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

            if (cookie_name == check_name + (count > 0 ? count : '')) {
                b_cookie_found = true;

                if (a_temp_cookie.length > 1) {
                    cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
                }

                retVal = (retVal === null ? '' : retVal) + cookie_value;
                break;
            }
            a_temp_cookie = null;
            cookie_name = '';
        }

        count++;

    } while (b_cookie_found == true);

    return retVal;
}

// Cart
function Get_Cart_Cookie(check_name) {
    if(check_name == 'cart') {
        return BuildCookieFromArray();
    } else {
        return Get_Cart_Cookie_Cookie(check_name);
    }
}

function Delete_Cart_Cookie(name, path, domain) {
    var count = 0;
    while (Get_Cart_Cookie(name + (count > 0 ? count : ''))) {

        if (domain == '') {
            domain = document.domain.split('.');
            if (domain[domain.length - 1].toLowerCase() == 'au' || domain[domain.length - 1].toLowerCase() == 'uk' || domain[domain.length - 1].toLowerCase() == 'nz' || domain[domain.length - 1].toLowerCase() == 'za') {
                domain = domain[domain.length - 3] + '.' + domain[domain.length - 2] + '.' + domain[domain.length - 1];
            } else {
                domain = domain[domain.length - 2] + '.' + domain[domain.length - 1];
            }
        }

        document.cookie = name + (count > 0 ? count : '') + "=" +
            ( ( path ) ? ";path=" + path : "") +
            ( ( domain ) ? ";domain=" + domain : "" ) +
            ";expires=Thu, 01-Jan-1970 00:00:01 GMT";

        count++;
    }

}

// Item Page?
function showAddToWaitlistDialog(id, title, storeId, type) {

    window.storeId = storeId;

    if (type === "PSLR") {

        var key = '';
        var titleAddOn = ' ';
        for (var i = 0; i < window['numAttributes' + id]; i++) {
            key += (key.length > 0 ? '-' : '') + $('#attribute_' + id + '_' + i).val();
            titleAddOn += (titleAddOn.length > 0 ? ' - ' : '') + window['attributeValues' + id][i][$('#attribute_' + id + '_' + i).val()];
        }

        title += titleAddOn;

        if (key == '') {
            key = '0';
        }

        window.currentProductId = id;
        window.selected_wait_list_item_id = window['prices' + id][key]['pslrId'];
        window.selected_wait_list_type_id = 1;
    } else if (type === "EVENT") {

        window.currentProductId = id;
        window.selected_wait_list_item_id = id;
        window.selected_wait_list_type_id = 2;
    } else {

        return;
    }

    $("#wait_list_added_span").html("");
    $("#overlayWaitListForm").replaceWith('');

    var markup = getWaitListDialogMarkup(title);

    $(document.body).append(markup);

    populateWaitListFormWithCookie();

    showWaitListSaveButton();

    $("#wait_list_contact_email").change(function() {

        var email = $("#wait_list_contact_email").val();
        var collection = new WaitListCollection(window.storeId);
        collection.getExistingContactInfoByEmail(window.selected_wait_list_item_id, email, function(data) {

            populateWaitListFormWithData(data);
            showWaitListSaveButton(email);
        });
    });

    $("#wait_list_contact_first_name").change(function() {

        showWaitListSaveButton();
    });

    $("#wait_list_contact_last_name").change(function() {

        showWaitListSaveButton();
    });

    $("#overlayWaitListForm").dialog({width: 300, dialogClass: 'dlgWaitList'});

    // For some reason the close button is removed with responsive websites.  We'll put it back here.
    $(".dlgWaitList > .ui-dialog-titlebar > .ui-dialog-titlebar-close").html('<span class="ui-button-icon-primary ui-icon ui-icon-closethick"></span>');
}

function getWaitListDialogMarkup(title) {

    var appendString = '';

    appendString += '<div id="overlayWaitListForm" title="ADD TO WAIT LIST" class="wait-list-container">';

    appendString += '<div class="form-container">';
    appendString += '<div class="form-row">';
    appendString += '<div class="product-name">';
    appendString += title;
    appendString += '</div>';
    appendString += '</div>';

    appendString += '<div class="form-row">';
    appendString += '<div class="form-title">';
    appendString += 'Email Address:';
    appendString += '</div><input class="form-input" placeholder="" id="wait_list_contact_email">';
    appendString += '</div>';

    appendString += '<div class="form-row">';
    appendString += '<div class="form-title">';
    appendString += 'First Name:';
    appendString += '</div><input class="form-input" placeholder="" id="wait_list_contact_first_name">';
    appendString += '</div>';

    appendString += '<div class="form-row">';
    appendString += '<div class="form-title">';
    appendString += 'Last Name:';
    appendString += '</div><input class="form-input" placeholder="" id="wait_list_contact_last_name">';
    appendString += '</div>';

    appendString += '<div class="form-row">';
    appendString += '<div class="form-title">';
    appendString += 'Phone:';
    appendString += '</div><input class="form-input" placeholder="" id="wait_list_contact_phone">';
    appendString += '</div>';

    appendString += '<div class="form-row">';
    appendString += '<div class="form-title">';
    appendString += 'Quantity:';
    appendString += '</div><input class="form-input" value="1" id="wait_list_quantity">';
    appendString += '</div>';

    appendString += '<button class="wait-list-btn" onClick="javascript:SaveToWaitList()" id="wait_list_save_button">Add to Wait List</button>'
    appendString += '</div>';
    appendString += '</div>';
    return appendString;
}

function populateWaitListFormWithCookie() {

    var waitlist_data = Get_Cart_Cookie('waitlist');
    if (waitlist_data !== null) {

        var contact = JSON.parse(waitlist_data);
        populateWaitListFormWithData(contact);
    }
}

function populateWaitListFormWithData(contact) {

    if (contact === null) {

        $("#wait_list_contact_first_name").val("");
        $("#wait_list_contact_last_name").val("");
        $("#wait_list_contact_phone").val("");
        window.selected_wait_list_id = null;
        window.selected_wait_list_contact_rel_id = null;
        window.selected_pos_customer_id = null;
    }
    else {
        if (contact.email !== null) {

            $("#wait_list_contact_email").val(contact.email);
        }
        if (contact.first_name !== undefined && contact.first_name !== null) {

            $("#wait_list_contact_first_name").val(contact.first_name);
        }
        if (contact.last_name !== undefined && contact.last_name !== null) {

            $("#wait_list_contact_last_name").val(contact.last_name);
        }
        if (contact.phone !== undefined && contact.phone !== null) {

            $("#wait_list_contact_phone").val(contact.phone);
        }
        if (contact.wait_list_id !== undefined && contact.wait_list_id !== null) {

            window.selected_wait_list_id = contact.wait_list_id;
        }
        if (contact.wait_list_contact_rel_id !== undefined && contact.wait_list_contact_rel_id !== null) {

            window.selected_wait_list_contact_rel_id = contact.wait_list_contact_rel_id;
        }
        if (contact.pos_customer_id !== undefined && contact.pos_customer_id !== null) {

            window.selected_pos_customer_id = contact.pos_customer_id;
        }
    }
}

function showWaitListSaveButton(email) {

    if (email === undefined) {

        email = $("#wait_list_contact_email").val();
    }

    var first_name = $("#wait_list_contact_first_name").val();
    var last_name = $("#wait_list_contact_last_name").val();

    if (isEmailValid(email) && first_name.length > 0 && last_name.length > 0) {

        $("#wait_list_save_button").show();
        return true;
    }
    else {

        $("#wait_list_save_button").hide();
        return false;
    }
}

function isEmailValid(email) {

    if (email !== undefined && email.length > 0) {

        var reg = /^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return (reg.test(email));
    } else {

        return false;
    }
}

function SaveToWaitList() {

    var wait_list = new WaitList();
    var contact = new WaitListContact();
    contact.email = $("#wait_list_contact_email").val();
    contact.first_name = $("#wait_list_contact_first_name").val();
    contact.last_name = $("#wait_list_contact_last_name").val();
    contact.phone = $("#wait_list_contact_phone").val();
    contact.quantity = $("#wait_list_quantity").val();
    if (window.selected_pos_customer_id !== undefined) {
        contact.pos_customer_id = window.selected_pos_customer_id;
    }
    if (window.selected_wait_list_contact_rel_id !== undefined) {
        contact.wait_list_contact_rel_id = window.selected_wait_list_contact_rel_id;
    }
    if (window.selected_wait_list_id !== undefined) {
        contact.wait_list_id = window.selected_wait_list_id;
    }
    wait_list.contacts.push(contact);
    wait_list.store_id = window.storeId;
    wait_list.item_id = window.selected_wait_list_item_id;
    wait_list.item_type_id = window.selected_wait_list_type_id;
    wait_list.save(function(response) {

        if (response.contact !== undefined && response.contact !== null) {

            Set_Cart_Cookie('waitlist', JSON.stringify(response.contact), '', '/', '', '');
            $("#wait_list_added_span_" + window.currentProductId).html(' ' + contact.quantity + ' added to wait list');
        }
    });

    closeWaitListModal();
}

// Class
function closeWaitListModal() {

    $("#overlayWaitListForm").dialog("close");
}

// Class
function SaveWaitListContact(contact) {

    var wait_list = new WaitList();
    wait_list.contacts.push(contact);
    wait_list.store_id = contact.store_id;
    wait_list.item_id = contact.item_id;
    wait_list.item_type_id = contact.item_type_id;
    wait_list.save(function (response) {

        if (response.contact !== undefined && response.contact !== null) {

            Set_Cart_Cookie('waitlist', JSON.stringify(response.contact), '', '/', '', '');
            $("#wait_list_added_span_" + contact.item_id).html(' ' + contact.quantity + ' added to wait list');
        }
    });
}

// Cart
function CreateCartArray(cart) {
    tuples = cart.split(";;");
    window.cartArray = new Array();
    for (i = 0; i < tuples.length; i++) {
        parts = tuples[i].split("##");
        window.cartArray[i] = parts;
    }
}

// Cart - Makes cart visible and shows actual cart
function ShowCart(forceExpand) {
    var oldCart = window.cartVersion != 2017;
    var cartDiv = $("#cartDiv");
    var cartDivMobile = $("#cartDivMobile");

    if (window.cartMode === undefined || window.cartMode == false) {
        window.cartMode = 'normal';
    }

    if (window.cartMode == 'hidden') {
        cartDiv.hide();
        cartDivMobile.hide();
    } else {
        if (oldCart) {
          var cart = '';
          if (Get_Cart_Cookie('cart')) {
              cart = Get_Cart_Cookie('cart');
          }

          if (window.cartMode == 'wide') {
              CreateCartArray(cart);
              cartDiv.hide();
              cartDivMobile.hide();
              WideCart();
          } else if (window.cartMode == 'mobile') {
              CreateCartArray(cart);
              cartDiv.hide();
              cartDivMobile.hide();
              MobileCart(forceExpand);
          } else {
              if (cart.length > 0) {
                  CreateCartArray(cart);
                  var toShow = true;
                  if (GetCartArrayValueByKey('mode') == 'collapsed' && forceExpand != true) {
                      CollapseCart();
                  } else {
                      toShow = ExpandCart();
                  }

                  if (toShow !== false) {
                      cartDiv.fadeIn();
                      cartDivMobile.fadeIn();
                  }

                  return;
              } else {
                  cartDiv.hide();
                  cartDivMobile.hide();
              }
          }
        } else {
          var cart = Get_Cart_Cookie('cart');
          if (cart && cart.length > 0) {
              CreateCartArray(cart);
              toShow = ExpandCart();
              if (toShow !== false) {
                  cartDiv.fadeIn();
              }
          } else {
              cartDiv.hide();
              cartDivMobile.hide();
          }
        }
    }
}

// Cart
function BuildCookieFromArray() {
    var newCart = '';
    for (var i = 0; i < window.cartArray.length; i++) {
        if (i > 0) {
            newCart += ';;';
        }
        newCart += window.cartArray[i].join("##");
    }
    return newCart;
}

function dataToCookieString(productId,productTitle,productPrice,productCount,productWeight,productCountType,productSku,requiresDownloadEmailAddress,minQuantity,maxQuantity,notes
    ,isTimed,holdingId,in_shipping,in_taxes,in_productType,pslrId,in_hasAttendees,isDiscountEligible,productImagePath,productImageStyle,class_attendees
    ,deptId,categoryIdList,displayPrice,unitType,soldInIncrements,wishlistItemId, rto_items) {

    //delimiter is ## so if this string ends with # we need to change it so I just add a space to the end of the string

    if (
        isNaN(productCount)
        || isNaN(minQuantity)
        || isNaN(minQuantity)
    ) {
        return '';
    }
    productCount = parseFloat(productCount);
    minQuantity = parseFloat(minQuantity);
    maxQuantity = parseFloat(maxQuantity);

    if (productTitle.length > 0 && productTitle.charAt(productTitle.length - 1) == '#') {
        productTitle = productTitle + " ";
    }
    if (productCount < minQuantity) {
        var humanQuantity = minQuantity;
        if (!!window.measurementUnit && window.measurementUnit == 'Yard') {

            if (humanQuantity === '0.25') {
                humanQuantity = '1/4';
            } else if (humanQuantity === '0.5') {
                humanQuantity = '1/2';
            } else if (humanQuantity === '0.75') {
                humanQuantity = '3/4';
            }

        }

        alert('Please select a quantity greater than ' + humanQuantity);
        return '';
    }
    if (productCount > maxQuantity) {
        alert('Please select a quantity less than ' + maxQuantity);
        return '';
    }




    var cookieData = ';;product##' + productId +
        '##' + productTitle +
        '##' + productPrice +
        '##' + productCount +
        '##' + productWeight +
        '##' + productCountType +
        '##' + productSku +
        '##' + requiresDownloadEmailAddress +
        '##' + minQuantity +
        '##' + maxQuantity +
        '##' + notes +
        '##' + isTimed +
        '##' + holdingId +
        '##' + in_shipping +
        '##' + in_taxes +
        '##' + in_productType +
        '##' + pslrId +
        '##' + in_hasAttendees +
        '##' + isDiscountEligible +
        '##' + productImagePath +
        '##' + productImageStyle +
        '##' + class_attendees +
        '##' + deptId +
        '##' + categoryIdList +
        '##' + displayPrice +
        '##' + unitType +
        '##' + soldInIncrements +
        '##' + wishlistItemId;

    if (rto_items !== undefined) {
        cookieData += '##' + rto_items;
    }
    return cookieData;

}

// Cart - This is what renders the expanded version of the cart in the upper corner
/** @return {boolean} */
function ExpandCart() {
    var oldCart = window.cartVersion != 2017;
    var cartDiv = $("#cartDiv");
    var cartDivMobile = $("#cartDivMobile");

    var products = '';
    var subtotal = 0;
    var subtotal_to_discount = 0;
    var giftCardSubtotal = 0;
    var totalItems = 0;
    var numProducts = 0;
    var numGiftCards = 0;

    if (oldCart) {
        UpdateCouponsInCartArrayAndCookie();
    }

    // Item totals
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        var row = window.cartArray[i];
        if (row[0] == 'product') {
            if (row[1].indexOf('PITEM') > -1) {
                continue;
            }
            totalItems += Number(row[4]);
            var displayPrice = 0;
            if (row[25]) {
                displayPrice = row[25];
            } else {
                displayPrice = row[3];
            }

            var amount = Math.round(fractionalMultiplication(parseFloat(displayPrice), row[4]) * 100) / 100;

            if (row.length > 16 && row[16] == 'GC') {
                giftCardSubtotal += amount;
                numGiftCards++;
            } else {
                numProducts++;
                subtotal += amount;

                // 19 - discount_eligible
                if (row[19] === "true") {
                    subtotal_to_discount += amount;
                }
            }

            if (oldCart) {
                var replaceTitle = window.cartArray[i][2].replace(/\+/g, ' ');
                try {
                    replaceTitle = JSON.parse(replaceTitle);
                } catch (e) {}

                products +=
                    '<div style="font-size: 12px !important; line-height: 20px; border-bottom: 1px solid #999; padding-bottom:5px; margin-bottom: 10px;">' +
                    '<div style="line-height: 14px; font-size: 11px !important; margin-bottom:4px;">' +
                    replaceTitle +
                    '</div>' +
                    '<div><b>' + formatCurrency(displayPrice) + '</b></div>' +
                    '<span style="font-size: 10px; color: #999;">quantity: ' + row[4] + '</span><br><br>' +
                    '</div>';
            }
        }
    }

    // Don't show cart div if there are no items
    if (numProducts == 0 && giftCardSubtotal == 0) {
        return false;
    }

    // Calculate discounts
    // This version of the cart should not require calculating the coupon as it only intends to show quantity of items
    // however, I've kept it as the mobile version still shows a total amount
    for (var i = window.cartArray.length - 1; i >= 0; i--) {
        if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
            if (oldCart) {
                var couponInfo = GetCouponInfo(window.cartArray[i]);
                var discount = Math.round(CalculateDiscount(subtotal_to_discount, i) * 100) / 100;
                if (discount > 0) {
                    subtotal -= discount;
                    products +=
                        '<div style="font-size: 12px !important; line-height: 20px; border-bottom: 1px solid #999; padding-bottom:5px; margin-bottom: 10px;">' +
                        '<div style="line-height: 14px; font-size: 11px !important; margin-bottom:4px;">' +
                        couponInfo.title.replace(/\+/g, ' ') +
                        '</div>' +
                        '<div><b>- ' + formatCurrency(discount) + '</b></div>' +
                        '</div>';
                }

            }
        }
    }

    // Update subtotal
    subtotal += giftCardSubtotal;
    subtotal = Math.round(subtotal * 100) / 100;

    if (oldCart) {
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
            giftCardRows = '<span style="color: #ccc; font-size: 14px;"><b>Gift Cards = ' + formatCurrency(giftCardPayments) + '</b></span><br>';
            subtotal -= giftCardPayments;
        }

    }

    // Mobile bottom div
    cartDivMobile.html(
        '<div style="padding:10px;" onclick="location=\'' + editcartUrl + '\'">' +
        '<table width="100%"><tr>' +
        '<td style="text-align: left; cursor: pointer; color: #fff;">' +
        '<img style="width:23px; height:18px; vertical-align:middle; margin-bottom: 4px;" src="https://images.rainpos.com/view-cart.png">&nbsp;&nbsp;&nbsp;Cart - ' + (totalItems) + ' items' +
        '</td>' +
        '<td style="text-align: right; cursor: pointer; color: #fff;">' + formatCurrency(subtotal) + '</td>' +
        '</tr></table></div>'
    );

    if (!oldCart || window.ABCart == 'B') {
        // Full page upper corner bullet
        cartDiv.attr('style', 'display:none; top: 10px; right: 10px; padding: 0px; width: 150px; background: none;');
        cartDiv.html(
            '<div class="btnViewCart" onclick="location=\'' + editcartUrl + '\'" >' +
            '<img style="width:23px; height:18px; vertical-align:middle; margin-bottom: 4px;" src="https://images.rainpos.com/view-cart.png">' +
            ' &nbsp;' + (totalItems) + ' Item' + (totalItems != 1 ? 's' : '') +
            '</div>'
        );
    } else {
        cartDiv.html(
            '<div style="display:table; height:28px; text-align:right; width:100%;">' +
            '  <span style="display:table-cell; width:20px;"></span>' +
            '  <span style="vertical-align:middle; text-align:center; display:table-cell; color: #ccc; font-family: Arial; font-size: 12px !important;">' +
            '    <a href="' + editcartUrl + '" style="' + linkStyles + '">View Cart</a>' +
            '  </span>' +
            '  <span style="vertical-align:middle; width:20px; display:table-cell; color: #ccc; font-family: Arial; font-size: 12px !important;">' +
            '    <a href="javascript:CollapseCart();"><img border=0 width=16 height=11 src="https://images.rainpos.com/btn-collapse.png"></a>' +
            '  </span>' +
            '</div>' +

            '<div style="width: 100%; top: 30px; right: 0px; border-top: 1px solid #888; margin-bottom:10px;"></div>' +
            '<div class="btnViewCart" onclick="ProceedToCheckout(\'no\');" style="font-size:14px; font-family: Arial !important;">Proceed to Checkout &raquo;</div>' +
            '<div style="text-align:left; margin-top:10px; margin-bottom:10px; padding: 10px; color: #fff; height: 200px; overflow:auto; background: url(https://images.rainpos.com/cart-bg-2a.png) repeat;">' +
            products +
            '</div>' +
            giftCardRows +
            '<div style="color: #ddd; font-size: 14px !important; padding:4px;">Subtotal = ' + formatCurrency(subtotal) + '</div>' +
            '<div style="line-height:20px;">' +
            '<a href="' + editcartUrl + '&enterCoupon=true" style="' + linkStyles + '">Enter Coupon</a><br>' +
            (window.paymentProcessor === undefined || window.paymentProcessor == false || window.paymentProcessor == 'paypal' ? '' : '<a href="' + editcartUrl + '&enterGiftcard=true" style="' + linkStyles + '">Enter Gift Card</a><br>') +
            '<a href="' + editcartUrl + '" style="' + linkStyles + '">View Cart</a>' +
            '</div>' +
            '<div class="btnViewCart" onclick="ProceedToCheckout(\'no\');" style="font-size:14px; font-family: Arial !important; margin-bottom: 10px; margin-top: 5px;">Proceed to Checkout &raquo;</div>' +
            MakeCartForm() +
            '');
    }

    return true;
}

/** @return {string} */
function ProductAttributeKeyGet(in_productId, in_attributeIndex) {
    // Get the key
    var key = '';
    for (var i = 0; i < window['numAttributes' + in_productId]; i++) {
        key += (key.length > 0 ? '-' : '') + $('#attribute_' + in_productId + '_' + i).val();
    }

    if (key == '') {
        key = '0';
    }

    return key;
}

// Used by the product page - probably does not belong in this file
function handleProductOptionChanged(in_productId, in_attributeIndex) {
    var newPrice = '';
    var isSale;
    var integer = $("#integer" + in_productId);
    var fraction = $("#fraction" + in_productId);
    var currentIntegerVal = parseInt(integer.val());
    var currentFractionVal = parseFloat(fraction.val());
    var minFraction = window.siteMinimumFraction;

    // Get the key

    var key = ProductAttributeKeyGet(in_productId, in_attributeIndex);

    // Set font colors to black for attributes that are available for the just-selected attribute, and gray for those that aren't available

    var reserve = 0;
    var outOfStock = false;

    if (window['prices' + in_productId][key]) {
        var temp = window['prices' + in_productId][key]['salePrice'];
        // Is the selected product option on sale?
        isSale = (parseFloat(window['prices' + in_productId][key]['salePrice']) > 0.0 ? true : false);

        // Set price label
        $('#spanPriceLabel' + in_productId).html((isSale == true ? 'SALE:' : 'Price:'));

        // Set price value
        if (isSale == true) {
            newPrice = '<strike>' + formatCurrency(window['prices' + in_productId][key]['price']) + '</strike> &nbsp;<b><span style="color:#ff0000;">' + formatCurrency(window['prices' + in_productId][key]['salePrice']) + '</span></b>';
        } else {
            newPrice = formatCurrency(window['prices' + in_productId][key]['finalDisplayPrice']);
        }
        $('#spanPrice' + in_productId).html(newPrice);

        // Set quantity dropdowns

        // Integer
        var maxInteger = Math.floor(parseFloat(window['prices' + in_productId][key]['quantity']));
        if (currentIntegerVal > maxInteger) {
            currentIntegerVal = maxInteger;
        }
        var startInteger = (window['isFabric' + in_productId] == true ? 0 : 1);
        var soldInIncrements = window['soldInIncrements' + in_productId];
        integer.html("");
        for (var i = startInteger; i <= maxInteger; i++) {
                if ((i === 0) && ((minFraction === 1) || (minFraction === '1'))) {
                    continue;
                }


            if ((i % soldInIncrements) > 0) {
                continue;
            }
            integer.append("<option value=\'" + i + "\' " + (currentIntegerVal == i ? 'selected' : '') + ">" + i + "</option>");
        }
        $('#maxInteger' + in_productId).val(maxInteger);

        if(maxInteger <= 0 && (typeof maxFraction === 'undefined' && !window['isFabric' + in_productId])) {
            outOfStock = true;
        }

        // Fraction
        if (window['isFabric' + in_productId] == true) {
            var increment = (window.measurementUnit == 'Meter' ? 10 : 25);
            var maxFraction = Math.floor(parseFloat(window['prices' + in_productId][key]['quantity']) * 100) % 100;
            maxFraction = (maxFraction - (maxFraction % increment)) / 100;
            if (currentIntegerVal == 0 && currentFractionVal == 0) {
                currentFractionVal = maxFraction;
            } else if (currentIntegerVal == maxInteger && currentFractionVal > maxFraction) {
                currentFractionVal = maxFraction;
            }
            $('#maxFraction' + in_productId).val(maxFraction);

            fraction.html("");
            var startVal = 0;
            if (currentIntegerVal == 0) {
                if (minFraction && (minFraction > 0) && (minFraction < 1)) {
                    startVal = Math.floor(window.siteMinimumFraction * 100);
                } else {
                    startVal = (window.measurementUnit === 'Meter') ? 10 : 25;
                }

            }
            for (var i = startVal; i < 100; i += increment) {
                var decimal = (i / 100);
                if (maxInteger == currentIntegerVal && maxFraction < decimal) {
                    break;
                }
                var appendStr = '';
                if (window.measurementUnit == 'Meter' && currentIntegerVal == 0 && decimal == .3 && window.siteMinimumFraction == 'fat quarter') {
                    appendStr += "<option value=\'0.25\' " + (currentFractionVal == 0.25 ? 'selected' : '') + ">Fat Quarter</option>";
                }
                appendStr += "<option value=\'" + decimal + "\' " + (currentFractionVal == decimal ? 'selected' : '') + ">";
                if (window.measurementUnit == 'Meter') {
                    appendStr += decimal;
                } else {
                    appendStr += (decimal == 0.25 ? (currentIntegerVal == 0 && window.siteMinimumFraction == 'fat quarter' ? 'Fat Quarter' : '1/4') : (decimal == 0.5 ? '1/2' : (decimal == 0.75 ? '3/4' : decimal)));
                }
                appendStr += "</option>";
                fraction.append(appendStr);
            }
        }

        // WishList
        if (typeof wishlistApp != 'undefined' && wishlistApp) {

            var qtyInteger = $("#integer" + in_productId);
            var qtyFraction = $("#fraction" + in_productId);
            var qtyIntegerVal = parseInt(qtyInteger.val());
            var qtyFractionVal = parseFloat(qtyFraction.val());

            // Handle NaN
            if (!qtyIntegerVal) {
                qtyIntegerVal = 0;
                if ((minFraction === 1) || (minFraction === '1')) {
                    qtyIntegerVal = 1;
                }
            }
            if (!qtyFractionVal) {
                qtyFractionVal = 0;
            }

            var pslrId = parseInt(window['prices' + in_productId][key]['pslrId']);

            wishlistApp.$root.$emit('update_pslr_qty', {pslr_id: pslrId, qty: (qtyIntegerVal + qtyFractionVal)});
        }
    } else {
        outOfStock = true
    }

    if (window['isFabric' + in_productId] === true && window['prices' + in_productId][key]['quantity'] < minimumQuantity) {
        outOfStock = true;
    }

    var newPriceNumber = Number(newPrice.replace(/[^0-9\.-]+/g,""));
    var freeProductNotAllowed =
        newPriceNumber <= 0 &&
        (typeof window['freeProductsAllowed'] !== 'undefined' && window['freeProductsAllowed'] === false);

    if (freeProductNotAllowed) {
        $('[id^=add-to-cart-btn-' + in_productId + ']').attr('disabled','disabled');
        $('[id^=add-to-cart-btn-' + in_productId + ']').html('Product Unavailable');
    } else {
        $('[id^=add-to-cart-btn-' + in_productId + ']').removeAttr("disabled");
        $('[id^=add-to-cart-btn-' + in_productId + ']').html('Add to Cart');
    }

    if (outOfStock || (reserve > 0 && maxInteger == 0 && (window['isFabric' + in_productId] != true || maxFraction == 0))) {
        $('[id^=integer' + in_productId + ']').hide();
        $('[id^=fraction' + in_productId + ']').hide();
        $('[id^=add-to-cart-btn-' + in_productId + ']').hide();
        $('[id^=reserve' + in_productId + ']').html('<span style="color:#f00;">Out of Stock</span>').show();
    } else {
        $('[id^=integer' + in_productId + ']').show();
        $('[id^=fraction' + in_productId + ']').show();
        $('[id^=add-to-cart-btn-' + in_productId + ']').show();
        $('[id^=reserve' + in_productId + ']').hide();
    }

    var conditionalSelect = $('#conditional-select');
    if (!conditionalSelect) {
        return;
    }

    var conditionOptions = window['prices' + in_productId][key]['conditional_option']

    if (conditionOptions) {
        $.each(conditionOptions, function (i, item) {
            conditionalSelect.append($('<option>', {
                value: item.value,
                text : item.label,
                selected: i === 0.
            }));
        });
        conditionalSelect.attr('data-key', key);
        conditionalSelect.trigger('change');
    } else {
        conditionalSelect.parent().parent().css('display','none');
    }
}

// Cart
function formatCurrency(num) {
    num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
        num = "0";
    }
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000001);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = "0" + cents;
    }
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' +
            num.substring(num.length - (4 * i + 3));
    }
    return (((sign) ? '' : '-') + window.displayCurrencySymbol + num + '.' + cents + ' ' + window.displayCurrency);
}

// Rental Cart (Outdoor)
function addRentalToCart(rentalDataId, price) {
    if (isRentalInCart(rentalDataId)) {
        updateRentalPrice(rentalDataId, price);
    } else {
        AddProductToCart('', 'sale', rentalDataId, 'Rental', price, 0, 'integer', '', 'no', 1, 1, 0, '', '', 0, '', 'RENTAL', '', 'false', '', '');
    }
}

function isRentalInCart(rentalDataId) {
    var cart = Get_Cart_Cookie('cart');
    if (cart && cart.length > 0 && window.cartArray) {
        for (var i = 0; i < window.cartArray.length; i++) {
            if (window.cartArray[i][1] == 'RENTAL' + rentalDataId) {
                return true;
            }
        }
    }
    return false;
}

function updateRentalPrice(rentalDataId, price) {
    var cart = Get_Cart_Cookie('cart');
    if (cart && cart.length > 0 && window.cartArray) {
        for (var i = 0; i < window.cartArray.length; i++) {
            if (window.cartArray[i][1] == 'RENTAL' + rentalDataId) {
                window.cartArray[i][3] = price;
                updateCart();
                return;
            }
        }
    }
}

function updateCart() {
    Set_Cart_Cookie('cart', BuildCookieFromArray(), '', '/', '', '');
}

function addWishlistProductToCart(item, qty, maxQty, unitType) {

    var productId = item.product_id;
    var pslrId = item.item_id;

    var prices = item.prices;
    var price = prices['price'];
    if(prices['sale_price'] > 0 && prices['sale_price'] < price) {
        price = prices['sale_price'];
    }

    var notes = '';
    console.log('add '+ qty +'product ' + productId + ' pslr ' + pslrId);

    var min = 0;
    if(item.qty_on_hand > 0 || item.unlimitedWebInventory === 1) {
        min = 1;
    }
    var discountEligibility = item.discount_eligible;

    // (in_businessEmail, in_paymentAction, productId, productTitle, productPrice, productWeight, productCountType, productSku, requiresDownloadEmailAddress, minQuantity, maxQuantity, isTimed, in_notes, in_shipping, in_taxes, inlineAddToCartBtn, in_productType, in_hasAttendees, isDiscountEligible, productImagePath, productImageStyle, requireClassAttendees,
    // pslrId, packageData, holdingId, deptId, categoryIdList, displayPrice, unitType, soldInIncrements,qty, wishlist_id
    AddProductToCart(
        '',
        'sale',
        productId,
        item.title,
        price,
        item.weight,
        item.productCountType,
        item.sku,
        'no',
        min,
        maxQty,
        0,
        notes,
        '',
        item.bitmap_tax,
        '',
        'PSLR',
        '',
        discountEligibility,
        item.thumbnail,
        '',
        false,
        pslrId,
        null,
        null,
        item.department_id,
        JSON.parse(item.category_ids),
        null,
        unitType,
        null,
        qty,
        item.wishlist_item_id
    );
}


// RTO Cart (Music)
function addRtoToCartWithCondition(token, pslrId, conditionId, schoolDistrictId, schoolId, studentName, selectedMaintenance, selectedProtection, conditionPiiId) {
    conditionPiiId = (conditionPiiId === undefined) ? null : conditionPiiId;
    var request = {
        pslr_id: pslrId,
        condition_id: conditionId,
        school_district_id: schoolDistrictId,
        school_id: schoolId,
        student_name: studentName,
        selected_maintenance: selectedMaintenance,
        selected_protection: selectedProtection,
        condition_pii_id: conditionPiiId
    };

    $.ajax({
        url: '/api/rto/online/contract',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(request),
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: function(result) {
            if (result.result != 'success') {
                alert('There was an error adding your rental to the cart.');
            } else {

                var notes = '';
                if(result.taxable_amount) {

                    notes = JSON.stringify({taxable_amount:result.taxable_amount});
                }
                rto_items = null;
                if(result.rto_items !== undefined) {
                    rto_items = JSON.stringify({
                        rto_principle_payment:result.rto_items.rto_principle_payment,
                        rto_down_payment:result.rto_items.rto_down_payment,
                        rto_product_tax_bitmap:result.rto_items.rto_product_tax_bitmap,
                        rto_maintenance_payment:result.rto_items.rto_maintenance_payment,
                        rto_maintenance_tax_bitmap:result.rto_items.rto_maintenance_tax_bitmap,
                        rto_insurance_payment:result.rto_items.rto_insurance_payment,
                        rto_insurance_tax_bitmap:result.rto_items.rto_insurance_tax_bitmap,
                        rto_security_deposit:result.rto_items.rto_security_deposit,
                        rto_initial_payments:result.rto_items.rto_initial_payments
                    });
                }
                AddProductToCart('', 'sale', result.rto_id, result.title + ' - Rental', result.due, result.weight, 'integer', '', 'no', 1, 1, 0, notes, '', 0, '', 'RTO', '', 'false', '', '', false, pslrId, null, conditionId, null, null, null, null, null, null, null, rto_items);
            }
        }
    });
}

function createAndAddOsrToCart(token, rentalId, variationId, conditionId, maintenance, protection, student, customerInfo, image, addons) {
    var config = {
        headers: {
            Authorization: 'Bearer ' + token,
        }
    };

    var data = {
        rentalId: rentalId,
        variationId: variationId,
        conditionId: conditionId,
        maintenance: maintenance,
        protection: protection,
        student: student,
        customerInfo: customerInfo,
        addons: addons,
    };

    return axios.post('/api/online-school-rentals/cart-contract', data, config)
        .then(function (response) {
            var data = response.data;

            if (!data || !data.rto_id) {
                return Promise.reject(new Error('Error on contract creation'));
            }

            var rtoItems = data.rto_items ? {
                rto_principle_payment: data.rto_items.rto_principle_payment,
                rto_down_payment: data.rto_items.rto_down_payment,
                rto_product_tax_bitmap: data.rto_items.rto_product_tax_bitmap,
                rto_maintenance_payment: data.rto_items.rto_maintenance_payment,
                rto_maintenance_tax_bitmap: data.rto_items.rto_maintenance_tax_bitmap,
                rto_insurance_payment: data.rto_items.rto_insurance_payment,
                rto_insurance_tax_bitmap: data.rto_items.rto_insurance_tax_bitmap,
                rto_security_deposit: data.rto_items.rto_security_deposit,
                rto_initial_payments: data.rto_items.rto_initial_payments,
            } : null;

            return AddOsrToCart(
                data.rto_id,
                data.title,
                data.due,
                data.weight,
                {taxable_amount: data.taxable_amount},
                image,
                data.pslr_id,
                conditionId,
                rtoItems
            );
        });
}

function AddOsrToCart(productId, productTitle, productPrice, productWeight, notes, productImagePath, pslrId, holdingId, rtoItems) {
    // Get custom fields & notes
    productId = 'RTO' + productId;
    notes = notes ? JSON.stringify(notes) : '';
    rtoItems = rtoItems ? JSON.stringify(rtoItems) : null;

    var cookieData = dataToCookieString(
        productId, productTitle, productPrice, 1, productWeight, 'integer', '',
        'no', 1, 1, notes, 0, holdingId, '',
        0, 'OSR', pslrId || '', '', 'false', productImagePath, '',
        '', null, JSON.stringify(null), productPrice, 'each', 1, null, rtoItems
    );

    if (cookieData === '') {
        return Promise.reject(new Error('Wrong cart item data'));
    }

    var promise = addItemToCartData(cookieData);

    if (window.facebookPixelId) {
        fbq('track', 'AddToCart', {
            currency: window.currency,
            value: productPrice,
            content_name: productTitle,
            content_ids: [productId],
            content_type: 'product',
            contents: [{
                'id': productId,
                'quantity': 1
            }]
        });
    }

    addGAEvent(productId, productTitle, productPrice, 1);

    return promise;
}

// Cart


function yardLoop(maxFractionVal, siteMinimumFraction, fraction, currFractionVal, intVal, maxIntVal){
    //we could probably be clever and do something cool like the meter loop...but not enough values to make it worth it
    fraction.html("");
    if(currFractionVal > maxFractionVal && intVal >= maxIntVal){
        currFractionVal = maxFractionVal;
    }
    if (intVal === 0) {
        if (window.siteMinimumFraction === 'fat quarter') {
            fraction.append("<option " + (currFractionVal < 0.5 ? "selected" : "") + " value=\'0.25\'>Fat Quarter</option>");
        }
        if (window.siteMinimumFraction === '0.25' || window.siteMinimumFraction === '') {
            fraction.append("<option " + (currFractionVal < 0.5 ? "selected" : "") + " value=\'0.25\'>1/4</option>");
        }
    } else {
        fraction.append("<option value=\'0\'>0</option>");
        if (intVal < maxIntVal || maxFractionVal >= 0.25) {
            fraction.append("<option " + (currFractionVal === 0.25 ? "selected" : "") + " value=\'0.25\'>1/4</option>");
        }
    }
    if (intVal < maxIntVal || maxFractionVal >= 0.5) {
        fraction.append("<option " + (currFractionVal === 0.5 ? "selected" : "") + " value=\'0.5\'>1/2</option>");
    }
    if (intVal < maxIntVal || maxFractionVal >= 0.75) {
        fraction.append("<option " + (currFractionVal === 0.75 ? "selected" : "") + " value=\'0.75\'>3/4</option>");
    }
}

function meterLoop(startingFraction, currentFraction, fraction, maxFractionValue, intVal, maxIntVal){

    var i = parseFloat(startingFraction);
    if(intVal<maxIntVal){
        maxFractionValue = .9
    }
    if(currentFraction < i ){
        currentFraction = i;
    }
    if(currentFraction > maxFractionValue && intVal >= maxIntVal){
        currentFraction = maxFractionValue;
    }
    if (startingFraction === .25 ){
        fraction.append("<option " + (currentFraction === .25  ? "selected" : "") + " value=\'0.25\'>Fat Quarter</option>");
        i = parseFloat(.3);
    }
    for(i; i <= maxFractionValue ; i += .1 ){
        var count = i.toFixed(1);
        fraction.append("<option " + (currentFraction == count ? "selected" : "") + " value=\'"+ count +"\'>"+ count.replace(/^0+/,"")+"</option>");
        if (i === .2 && intVal === 0 ){
            fraction.append("<option " + (currentFraction === .25  ? "selected" : "") + " value=\'0.25\'>Fat Quarter</option>");
        }
    }
    return fraction;
}

// TODO - This function is a little better, but still messy, and needs additional refactoring and automated tests
function checkFabricMinimum(id, maxQuantity)
{
    var minFraction = window.siteMinimumFraction;
    var minFractionVal = (minFraction === 'fat quarter') ? 0.25 : minFraction;

    var intVal = parseInt($("#integer" + id).val());
    var fraction = $("#fraction" + id);
    var currFractionVal = parseFloat(fraction.val());

    var maxIntVal;
    var maxFractionVal;

    if (typeof maxQuantity === 'undefined') {
        maxIntVal = parseInt($("#maxInteger" + id).val());
        maxFractionVal = parseFloat($("#maxFraction" + id).val());
    } else {
        maxQuantity = parseFloat(maxQuantity);
        maxIntVal = Math.floor(maxQuantity);
        maxFractionVal = Math.floor((maxQuantity * 100) % 100) / 100;
    }

    // WishList

    if ((typeof wishlistApp !== 'undefined') && wishlistApp) {
        var key = ProductAttributeKeyGet(id, 0);
        var pslrId = parseInt(window['prices' + id][key]['pslrId']);

        wishlistApp.$root.$emit('update_pslr_qty', {pslr_id: pslrId, qty: (intVal + currFractionVal)});
    }

    // Fractional handling

    if (window.measurementUnit === 'Meter') {
        fraction.html("");
        if (intVal === 0) {
            meterLoop(minFractionVal, currFractionVal, fraction, maxFractionVal, intVal, maxIntVal);
        } else {
            meterLoop('0', currFractionVal, fraction, maxFractionVal, intVal, maxIntVal);
        }

    } else {
            yardLoop(maxFractionVal, siteMinimumFraction, fraction, currFractionVal, intVal, maxIntVal);
    }
}

function getPslrIdFromUI(productId)
{
    // Find which PSLR is selected
    var key = '';
    for (var i = 0; i < window['numAttributes' + productId]; i++) {
        key += (key.length > 0 ? '-' : '') + $('#attribute_' + productId + '_' + i).val();
    }
    if (key == '') {
        key = '0';
    }
    pslrId = window['prices' + productId][key]['pslrId'];
    return pslrId;
}

function getQuantityFromUI(productId)
{
    quantity = 1;
    if (typeof inlineAddToCartBtn !== 'undefined') {
        quantity = parseInt(document.getElementById('inlineInteger' + productId).value) + parseFloat(document.getElementById('inlineFraction' + productId).value);
    } else {
        var element = document.getElementById('integer' + productId);
        var element2 = document.getElementById('fraction' + productId);
        quantity = 0;
        if (element) {
            quantity += parseInt(element.value);
        }
        if (element2) {
            quantity += parseFloat(element2.value);
        }
    }
    return quantity;
}

function getNotesFromUI(productId) {
    var notes = '';
    var noteObjects = $(".class" + productId);
    noteObjects.each(function(i) {
        if (notes === 'return') {
            return;
        }
        var noteName = $(this).attr('name');
        var noteValue = '';

        if ($(this).is(':checkbox')) {
            noteValue = ($(this).is(":checked") ? 'checked' : 'not checked');
        }
        else {
            noteValue = $.trim($(this).val());
        }

        if ($(this).attr('required') == true && noteValue == '') {
            alert(noteName + ' is a required field.');
            notes = 'return';
            return;
        }

        if (notes == '') {
            notes = {};
        }
        notes[noteName] = noteValue;
    });

    if (notes == 'return') {
        return;
    }
    return notes;
}

function createItem(productId, productTitle, productPrice, productWeight, productCountType, productSku, requiresDownloadEmailAddress, minQuantity, maxQuantity, isTimed, in_notes, in_shipping, in_taxes, inlineAddToCartBtn, in_productType, in_hasAttendees, isDiscountEligible, productImagePath, productImageStyle, requireClassAttendees, pslrId, packageData, holdingId, deptId, categoryIdList, displayPrice, unitType, soldInIncrements, quantity, wishlistItemId, rto_items, conditionId, conditions) {
    if (in_productType === 'PSLR') {
        if (!pslrId) {
            pslrId = getPslrIdFromUI(productId);
        }

        // Get Quantity
        if (!quantity) {
            quantity = getQuantityFromUI(productId);
        }

        var notes = in_notes;
        if (!notes) {
            notes = getNotesFromUI(productId);
        }

        var pslr = {
            type: in_productType,
            pslr_id: pslrId,
            product_id: productId,
            quantity: quantity,
            notes: notes,
            wishlistItemId: wishlistItemId || 0,
            title: productTitle,
        };

        if (conditionId) {
            pslr['condition'] = conditionId;
        } else {
            var condition = getConditional(productId);
            if (condition) {
                pslr['condition'] = condition.id;
            }
        }

        if (conditions) {
            pslr['conditions'] = conditions;
        }

        if (window.knobby && window.knobby['module_comment_sold']) {
            pslr.sku = productSku;
            pslr.price = productPrice;
        }

        return pslr;
    }
    return null;
}

function getConditional(productId) {
    if (!document.getElementById('conditional-select')) {
        return null;
    }

    if (document.getElementById('conditional-select') === null) {
        return null;
    }

    var key = ProductAttributeKeyGet(productId, 0);

    var value = document.getElementById('conditional-select').value;

    var conditional = window['prices' + productId][key]['conditional'];

    if (!conditional) {
        return null;
    }

    return conditional.find(function (v) {
        return parseInt(v.item_condition_id) === parseInt(value);
    });
}

function getConditionQuantity(productId, conditionId, key = null) {
    key = key === null ? ProductAttributeKeyGet(productId, 0) : key;

    var conditionQuantity = window['prices' + productId][key]['conditional_quantity'].find(function (v) {
        return parseInt(v.condition_id) === parseInt(conditionId);
    });

    return conditionQuantity ? parseInt(conditionQuantity.quantity) : 0;
}

function addClassToCart(classId, eventId, requireAttendees, packageData, class_id_str) {
    if (requireAttendees) {
        var result = verifyClassAttendees('CLASS' + eventId);
        if (!result) {
            return;
        }
    }

    var selectedComponents = [];
    var packageId = null;
    if (packageData && packageData.available && packageData.option === 'classAndPackage') {
        packageId = packageData.packageId;
        if (packageData.components) {
            packageData.components.forEach(function(c) {
                selectedComponents.push(c.selectedItem);
            });
        }
    }

    var item = {
        type: 'CLASS',
        event_id: eventId,
        class_id: classId,
        package_id: packageId,
        components: selectedComponents,
        class_attendees: getClassAttendees('CLASS' + eventId),
    }
    addItemToCart(item);
}

function addItemToCart(item, productId) {
    if (!isValidConditionQuantityInCart(item, productId)) {
        if (!item.hasOwnProperty('conditions')) {
            decreaseActualConditionQuantity(productId, item.condition);
        }

        alert('There was an error adding this item to your cart.');
        return Promise.resolve();
    }

    var promise = requestModule.getInstance().addItemToCart({
        item: item,
    });

    // Google Analytics
    if (item.type === 'PSLR') {
        if (item.quantity > 0) {
            addGAEvent(item.product_id, item.title, item.price, item.quantity);
        }
    }

    if (window.knobby && window.knobby['module_comment_sold']) {
        if (typeof item.type !== 'undefined' && item.type.toLowerCase() === 'pslr') {
            //we want to fire event only for pslr items
            var data = {
                product: {
                    sku: item.pslr_id || item.sku,
                    price: parseFloat(item.price),
                    currency: window.currency || 'USD',
                    quantity: item.quantity,
                }
            }
            try {
                videeoCommand('addToCart', data);
            } catch (e) {
                console.warn(e);
            }
        }
    }

    return promise;
}

/**
 * Adds a product to the cart (pre-2017 version).
 * When adding parameters, make sure to also add them for GetAttendees()
 */
function AddProductToCart(in_businessEmail, in_paymentAction, productId, productTitle, productPrice, productWeight, productCountType, productSku, requiresDownloadEmailAddress, minQuantity, maxQuantity, isTimed, in_notes, in_shipping, in_taxes, inlineAddToCartBtn, in_productType, in_hasAttendees, isDiscountEligible, productImagePath, productImageStyle, requireClassAttendees, pslrId, packageData, holdingId, deptId, categoryIdList, displayPrice, unitType, soldInIncrements, quantity, wishlistItemId, rto_items, conditionId, conditions) {
    if (window.location.search.indexOf('ie') == -1) { // IE still can't use the new product page.
        if (requireClassAttendees) {
            var result = verifyClassAttendees(productId);
            if (!result) {
                return;
            }
        }

        var item = createItem(productId, productTitle, productPrice, productWeight, productCountType, productSku, requiresDownloadEmailAddress, minQuantity, maxQuantity, isTimed, in_notes, in_shipping, in_taxes, inlineAddToCartBtn, in_productType, in_hasAttendees, isDiscountEligible, productImagePath, productImageStyle, requireClassAttendees, pslrId, packageData, holdingId, deptId, categoryIdList, displayPrice, unitType, soldInIncrements, quantity, wishlistItemId, rto_items, conditionId, conditions);
        if (item) {
            addItemToCart(item, productId);
            return;
        }
    }

    unitType = unitType || 'each';
    soldInIncrements = soldInIncrements || 1;

    if (in_businessEmail !== null) {
        window.businessEmail = in_businessEmail;
    }

    if(typeof deptId === 'undefined') {
        deptId = null;
    }
    if(typeof categoryIdList === 'undefined') {
        categoryIdList = [];
    }

    // Class Package Items
    var classPackage = false;
    var classPackageData = [];
    if (productId.indexOf('CLASS') > -1) {
        // Overloading here - it's just too much work to add new fields and we want to redo all this anyway
        var classUid = new Date().getTime();
        productSku = classUid;
        if (packageData && packageData.available) {
            classPackage = true;
            if (packageData.option == 'classAndPackage') {
                in_productType = 'PACKAGE';
                pslrId = packageData.packageId;
                productWeight = packageData.class_price;
                if (packageData.components) {
                    packageData.components.forEach(function(c) {
                        var s = c.selectedItem;
                        var packageItemData = AddProductToCart(null, null, 'PITEM' + packageData.packageId, s.title, s.price, 0, null, '', 'no', 1, 1, 0, null, 0, 0, false, 'PSLR', '', false, '', '', '', s.pslrId, null, classUid);
                        if (packageItemData) {
                            classPackageData.push(packageItemData);
                        }
                    });
                }
            }
        }
    }

    categoryIdList = JSON.stringify(categoryIdList);

    var class_attendees = "";
    if (requireClassAttendees) {

        class_attendees = getClassAttendees(productId);
        if (class_attendees.no_value != undefined) {

            alert("Attendee Name Required");
            $("#" + class_attendees.input_id).focus();
            return;
        }
    }

    // Set defaults
    if (!pslrId) {
        pslrId = '';
    }

    if (!requiresDownloadEmailAddress || requiresDownloadEmailAddress == 'undefined') {
        requiresDownloadEmailAddress = "no";
    }

    if (!minQuantity || minQuantity == 'undefined') {
        if (productCountType == 'fraction') {
            minQuantity = 0.25;
        } else {
            minQuantity = 1;
        }
    }

    if (!maxQuantity || maxQuantity == 'undefined') {
        maxQuantity = 100;
    }

    if (!isTimed || isTimed == 'undefined') {
        isTimed = 0;
    }

    if ((!in_shipping || in_shipping == 'undefined') && in_shipping !== 0) {
        in_shipping = '';
    }

    if ((!in_taxes || in_taxes == 'undefined') && in_taxes !== 0) {
        in_taxes = '';
    }

    // Get current cart
    var cart = '';
    if (Get_Cart_Cookie('cart')) {
        cart = Get_Cart_Cookie('cart');
    }

    var productCount = null;
    if (quantity > 0) {
        productCount = quantity;
    } else if (productCountType !== null) {
        if (in_productType == 'RENTAL' || in_productType == 'RTO') {
            productCount = 1;
        } else if (inlineAddToCartBtn) {
            productCount = parseInt(document.getElementById('inlineInteger' + productId).value) + parseFloat(document.getElementById('inlineFraction' + productId).value);
        } else {
            var element = document.getElementById('integer' + productId);
            var element2 = document.getElementById('fraction' + productId);
            productCount = 0;
            if (element) {
                productCount += parseInt(element.value);
            }
            if (element2) {
                productCount += parseFloat(element2.value);
            }
        }
    } else {
        productCount = 1;
    }

    // Get custom fields & notes
    var notes = '';
    if (in_notes != 'undefined' && in_notes != '') {
        notes = in_notes;
    } else {
        var noteObjects = $(".class" + productId);
        noteObjects.each(function(i) {
            if (notes == 'return') {
                return;
            }
            var noteName = $(this).attr('name');
            var noteValue = '';

            if ($(this).is(':checkbox')) {
                noteValue = ($(this).is(":checked") ? 'checked' : 'not checked');
            }
            else {
                noteValue = $.trim($(this).val());
            }
            if ($(this).attr('requiredField') == 'true' && noteValue == '') {
                noteName = noteName.replace(/_/g, ' ');
                alert(noteName + ' is a required field.');
                notes = 'return';
                return;
            }


            if (notes == '') {
                notes = {};
            }
            notes[noteName] = noteValue;
        });

        if (notes == 'return') {
            return;
        }
        if (notes != '') {
            notes = JSON.stringify(notes);
        }
    }

    // Product ID is modified here, so make sure it goes after anything that relies on the Product ID.
    // Handle PSLR information
    if (in_productType == 'PSLR') {
        // Find selected PSLR
        var key = '';
        var titleAddOn = '';
        for (var i = 0; i < window['numAttributes' + productId]; i++) {
            key += (key.length > 0 ? '-' : '') + $('#attribute_' + productId + '_' + i).val();
            titleAddOn += (titleAddOn.length > 0 ? ' - ' : '') + window['attributeValues' + productId][i][$('#attribute_' + productId + '_' + i).val()];
        }
        if (key == '') {
            key = '0';
        }

        // Fix data
        productTitle += (titleAddOn.length > 0 ? ': ' : '') + titleAddOn;
        if (window['prices' + productId]) {
            productWeight = window['prices' + productId][key]['weight'];
            productPrice = window['prices' + productId][key]['finalPrice'];
            displayPrice = window['prices' + productId][key]['finalDisplayPrice'];
            productSku = window['prices' + productId][key]['sku'];
            maxQuantity = window['prices' + productId][key]['quantity'];
            pslrId = window['prices' + productId][key]['pslrId'];
        }

        // Get the option image if no image specified
        if (!productImagePath && $('#productImage' + productId).length) {
            var optionImage = $('#productImage' + productId).attr('src');
            if (optionImage && optionImage.length > 0) {
                productImagePath = optionImage;
            }
        }
    }
    // Gift Cards
    else if (in_productType == 'GC') {
        productPrice = $("#GCValue").val();
        displayPrice = productPrice;
        productId += Math.floor(Math.random() * 1000);
    } else if (in_productType == 'RENTAL') {
        productId = 'RENTAL' + productId;
    } else if (in_productType == 'RTO') {
        productId = 'RTO' + productId;
    } else if (in_productType == 'SUBSCRIPTION') {
        productId = 'SUBSCRIPTION' + productId;
    }

    if (!displayPrice) {
        displayPrice = productPrice;
    }

    // create path for timed inventory ajax calls
    if (isTimed == 1) {
        var cartUrl = '/module/product.htm?timed=1';
        if (isAdminUrl(location.host)) {
            cartUrl = location.pathname.substring(0, location.pathname.indexOf('/', 2)) + cartUrl;
        }
    }
    if (!holdingId) {
        holdingId = ''; // timed inventory variable
    }

    var cookieData = dataToCookieString(productId,productTitle,productPrice,productCount,productWeight,productCountType,productSku,requiresDownloadEmailAddress,minQuantity,maxQuantity,notes
        ,isTimed,holdingId,in_shipping,in_taxes,in_productType,pslrId,in_hasAttendees,isDiscountEligible,productImagePath,productImageStyle,class_attendees
        ,deptId,categoryIdList,displayPrice,unitType,soldInIncrements,wishlistItemId, rto_items);

    // For packageData, we add it as part of the class
    if (productId.indexOf('PITEM') > -1) {
        return encodeURIComponent(cookieData);
    }

    if (cookieData === '') {
        return ;
    }
    addItemToCartData(cookieData, classPackageData);

    var contentId = productSku ? productSku : productId;
    if (window.facebookPixelId) {
        fbq('track', 'AddToCart', {
            currency: window.currency,
            value: productPrice,
            content_name: productTitle,
            content_ids: [contentId],
            content_type: 'product',
            contents: [{
                'id': contentId,
                'quantity': productCount
            }]
        });
    }

    addGAEvent(contentId, productTitle, productPrice, productCount);
}

function verifyClassAttendees(productId) {
    var classAttendees = getClassAttendees(productId);
    if (classAttendees.no_value !== undefined) {
        // TODO: No alerts
        alert("Attendee Name Required");
        $("#" + classAttendees.input_id).focus();
        return false;
    }
    return true;
}

function getClassAttendees(class_id_str) {

    var return_value = "";
    var classToken = "CLASS";
    var pos = class_id_str.indexOf(classToken);
    if (pos > -1) {

        var event_id = class_id_str.substr(pos + classToken.length);
        return_value = getAttendeesJson(event_id);
    }
    return return_value;
}

function getAttendeesJson(in_event_id) {

    var jsn = "";
    var attendees = $(".attendee");
    if (attendees) {

        var names = [];

        for (var i = 0; i < attendees.length; i++) {

            var ele = attendees[i];
            var event_id = ele.attributes["eventid"].value;

            if (in_event_id == event_id && ele.value.length > 0) {

                names.push(ele.value);
            }
        }
        if (names.length === 0) {

            jsn = {no_value: 1, input_id: "event_" + in_event_id + "_attendee_1", numberOfAttendees: parseInt($('#qty').val())};
        } else {

            jsn = JSON.stringify(names);
        }
    }
    return jsn;
}

function CalculateDiscount(subtotal, i) {
    var discount = 0;
    if (window.cartArray[i][0] == 'coupon' || window.cartArray[i][0] == 'couponV2') {
        var couponInfo = GetCouponInfo(window.cartArray[i]);
        if (couponInfo.couponType == 'dollar_off') {
            // Calculate discount
            if (subtotal > couponInfo.minDollarAmount) {
                discount = couponInfo.dollarOffAmount;
            }
            discount = Math.round(discount * 100) / 100;
        }
        else if (couponInfo.couponType == 'percent_off') {
            if (subtotal > couponInfo.minDollarAmount) {
                discount = Number(subtotal) * (Number(couponInfo.percentOff) / 100);
                discount = Math.round(discount * 100) / 100;
            }

        }
        if(couponInfo.maxDiscount && couponInfo.maxDiscount < discount) {
            discount = couponInfo.maxDiscount;
        }
    }

    if (discount + 0.01 > subtotal) {
        discount = subtotal - 0.01;
    }

    return discount;
}

function GetCouponInfo(row) {
    if (!row) {
        return null;
    }

    var couponInfo = {};
    couponInfo['version'] = row[0];
    couponInfo['couponType'] = row[1];
    couponInfo['title'] = row[2];
    if (couponInfo.version == 'couponV2') {
        couponInfo['number'] = row[3];
        couponInfo['couponId'] = row[4];
        if (couponInfo.couponType == 'dollar_off') {
            couponInfo['minDollarAmount'] = row[5];
            couponInfo['dollarOffAmount'] = row[6];
        } else if (couponInfo.couponType == 'percent_off') {
            couponInfo['percentOff'] = row[5];
        }
    } else {
        if (couponInfo.couponType == 'dollar_off') {
            couponInfo['minDollarAmount'] = row[3];
            couponInfo['dollarOffAmount'] = row[4];
            couponInfo['maxDiscount'] = row[5];
        }

        if (couponInfo.couponType == 'percent_off') {
            couponInfo['percentOff'] = row[3];
            couponInfo['minDollarAmount'] = row[4];
            couponInfo['maxDiscount'] = row[5];
        }

        if (row.length >= 7) {
            couponInfo['number'] = row[6]; // coupon_id
        }
        if (row.length >= 8) {
            couponInfo['start_date'] = row[7];
        }
        if (row.length >= 9) {
            couponInfo['end_date'] = row[8];
        }
    }
    return couponInfo;
}

function isAdminUrl(url) {
    if (typeof adminUrls != 'undefined') {
        var length = adminUrls.length;
        for (var i = 0; i < length; i++) {
            if (adminUrls[i] == url || 'www.' + adminUrls[i] == url || 'my-' + adminUrls[i] == url || 'www.my-' + adminUrls[i] == url) {
                return true;
            }
        }
    }
    return false;
}

function onChangeConditionalSelect(productId) {
    changeConditional(productId);
    window.vueEventHub.$eventHub.$emit('product-style-variant-changed');
}

function changeConditional(productId) {
    var condition = getConditional(productId);

    if (!condition) {
        return;
    }

    if (window.knobby && window.knobby['module_improved_waitlist']) {
        var conditionSelect = $('#conditional-select');
        conditionSelect.attr('selected-id', condition.id);
        conditionSelect.attr('selected-name', condition.name);
    }

    var price = condition.hasOwnProperty('display_price') ? condition.display_price.price : 0;

    var priceHtml = formatCurrency(price);

    var sale = condition.hasOwnProperty('display_price') ? condition.display_price.sale_price : 0;

    if (+sale > 0) {
        priceHtml = '<strike>' + formatCurrency(price) + '</strike>&nbsp;<b><span style="color: #ff0000">' + formatCurrency(sale) + '</span></b>'
    }

    document.getElementById('spanPrice' + productId).innerHTML = priceHtml;
    changQuantity(productId, condition.id);
}

function changQuantity(productId, conditionId) {
    var isUnlimited = +$('#maxInteger' + productId).val() === 1000;

    var quantity = isUnlimited === true ? 1000 : getConditionQuantity(productId, conditionId);

    var quantitySelect = $('#integer' + productId);
    quantitySelect.find('option').remove()

    var reserve = $('#reserve' + productId);
    var addBtn = $('#add-to-cart-btn-' + productId);
    var addToWaitlistBtn = $('#waitlist-wrapper');

    if (quantity === 0) {
        reserve.css('display', 'block');
        quantitySelect.css('display', 'none')
        addBtn.css('display', 'none');
        addToWaitlistBtn.css('display', 'inline-block');

        return;
    }
    reserve.css('display', 'none');
    quantitySelect.css('display', 'block');
    addToWaitlistBtn.css('display', 'none');
    addBtn.css('display', 'inline-block');

    for(var i = 0; i < quantity; i++) {
        quantitySelect.append($('<option>', {
            value: i + 1,
            text : i + 1,
        }));
    }
}
function findCartItemsByProductId(productId) {
    return window.cartArray.filter(function (item) {
        if (item[0] !== 'product'){
            return false;
        }

        return parseInt(item[1].replace('PSLR', '')) === parseInt(productId);
    });
}
function isValidConditionQuantityInCart(item, currentProductId) {
    if (!window.cartArray.length) {
        return true;
    }

    var cart = findCartItemsByProductId(currentProductId);

    if (!cart.length) {
        return true;
    }

    var isValidConditionQuantity = function (condition, inCartQuantity) {
        var quantity = getConditionQuantity(currentProductId, condition);

        return quantity >= inCartQuantity;
    };

    var CONDITION_INDEX = 30;
    var QUANTITY_INDEX = 4;

    for (var i = 0; i < cart.length; i++) {
        var cartItem = cart[i];

        var condition = +cartItem[CONDITION_INDEX];
        var quantity = +cartItem[QUANTITY_INDEX];

        if (item.conditions) {
            for (var j = 0; j < item.conditions; j++) {
                if (!isValidConditionQuantity(item.conditions[j].condition, quantity) && +item.conditions[j].condition === condition) {
                    return false;
                }
            }

            return true;
        }

        if (condition !== +item.condition) {
            continue;
        }

        if (!isValidConditionQuantity(condition, quantity)) {
            return false;
        }
    }

    return true;
}

function getInCartQuantity(productId, conditionId, defaultQuantity = 1) {
    var cart = findCartItemsByProductId(productId);

    if (!cart) {
        return defaultQuantity;
    }

    var CONDITION_INDEX = 30;
    var QUANTITY_INDEX = 4;

    for (var i = 0; i < cart.length; i++) {
        var cartItem = cart[i];
        if (+cartItem[CONDITION_INDEX] === +conditionId) {
            return +cartItem[QUANTITY_INDEX];
        }
    }

    return defaultQuantity;
}

function decreaseActualConditionQuantity(productId, conditionId, key = null) {
    key = key === null ? ProductAttributeKeyGet(productId, 0) : key;

    var conditionQuantity = window['prices' + productId][key]['conditional_quantity'].find(function (v) {
        return parseInt(v.condition_id) === parseInt(conditionId);
    });

    conditionQuantity.quantity = conditionQuantity.quantity - getInCartQuantity(productId, conditionId);
}

function addGAEvent(productId, productTitle, productPrice, productCount) {
    if (window.knobby && window.knobby['module_flag_google_analytics_v4']) {
        if (window.googleAnalyticsId) {
            gtag('event', 'add_to_cart', {
                currency: window.currency || 'USD',
                value: parseFloat(productPrice),
                items: [{
                    item_id: productId,
                    item_name: productTitle,
                    quantity: productCount,
                    price: productPrice,
                }]
            });
        }
    } else {
        if (window.googleAnalyticsId) {
            gtag('event', 'add_to_cart', {
                "items": [{
                    id: productId,
                    name: productTitle,
                    quantity: productCount,
                    price: productPrice,
                    currency: window.currency,
                }]
            });
        }
    }
}
