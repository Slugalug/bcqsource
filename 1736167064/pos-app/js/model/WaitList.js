function WaitListCollection() {

    this.collection = [];
    this.item_types = null;
    this.store_id = null;
}

function WaitListCollection(store_id) {

    this.store_id = store_id;
    this.collection = [];
    this.item_types = null;
}

WaitListCollection.prototype = {

    collection: null,

    getAll: function(callback) {

        var that = this;
        $.blockUI({});
        $.getJSON("/api/waitlist/WaitListApi.php?storeid="+this.store_id)
            .done(function( data ) {

                that.setCollections(data.lists);
                callback(that.collection, that.item_types);
            }).fail(function() {
                $.unblockUI();
            })
            .always(function() {
                $.unblockUI();
            });;
    },

    getAllContactsView: function(callback) {

        var that = this;
        $.blockUI({});
        $.getJSON("/api/waitlist/WaitListApi.php?storeid="+this.store_id + "&contacts=1")
            .done(function( data ) {

                that.setCollections(data.lists);
                callback(that.collection);
            }).fail(function() {
                $.unblockUI();
            })
            .always(function() {
                $.unblockUI();
            });;
    },

    isClassesEnabled: function () {
        return !!window.knobby && window.knobby.module_classes;
    },

    isRespectClassesSettingInAllPlacesEnabled: function () {
        return !!window.knobby && window.knobby.module_respect_classes_setting_in_all_places;
    },

    setCollections: function(lists) {

        var that = this;
        that.collection = [];
        that.item_types = [{id:0, name:"All Types"}];

        if(lists.event_lists !== undefined && (!this.isRespectClassesSettingInAllPlacesEnabled() || this.isClassesEnabled())) {

            that.setCollection(that, lists.event_lists);
            that.item_types.push({id:1, name:"Class"});
        }

        if(lists.pslr_lists !== undefined) {

            that.setCollection(that, lists.pslr_lists);
            that.item_types.push({id:1, name:"Product"});
        }

        if(lists.contacts !== undefined) {

            that.setContactsViewCollection(that, lists.contacts);
        }
    },

    setCollection: function(that, lists) {

        for(var i = 0; i < lists.length; i++)
        {
            var row = lists[i];
            var wait_list = new WaitList();
            angular.extend(wait_list, row);
            for(var j = 0; j < wait_list.contacts.length; j++) {

                var contact = wait_list.contacts[j];
                var wait_list_contact  = new WaitListContact();
                angular.extend(wait_list_contact, contact);
                wait_list.contacts[j] = wait_list_contact;
            }
            that.collection.push(wait_list);
        }
    },

    setContactsViewCollection: function(that, lists) {

        for(var i = 0; i < lists.length; i++)
        {
            var row = lists[i];
            var contact = new WaitListContact();
            angular.extend(contact, row);
            for(var j = 0; j < contact.waitlists.length; j++) {

                var wailist = contact.waitlists[j];
                var wait_list  = new WaitList();
                angular.extend(wait_list, wailist);
                contact.waitlists[j] = wait_list;
            }
            that.collection.push(contact);
        }
    },

    getExistingContactInfoByEmail: function(item_id, email, callback) {

         $.getJSON("/public/api/waitlist.service.php?storeid="+this.store_id+"&findbyemail="+email+"&itemid="+item_id)
            .done(function( data ) {

                callback(data.contact_data);
            }).fail(function() {
            })
            .always(function() {
            });
    }
}

function WaitList() {

    var that = this;
    that.wait_list_id = null;
    that.store_id = null;
    that.store_location_id = null;
    that.item_id = null;
    that.status_id = null;
    that.item_type_id = null;
    that.item_type = null;
    that.title = null;
    that.contacts = [];
}

WaitList.prototype = {

    wait_list_id: null,
    store_id: null,
    store_location_id: null,
    item_id: null,
    status_id: null,
    item_type_id: null,
    item_type: null,
    title: null,
    contacts: [],

    save: function(callback) {
        if (window.knobby && window.knobby['module_improved_waitlist']) {
            var waitListData = {};

            waitListData.item_id = parseInt(this.item_id);
            waitListData.item_type = 'event';
            waitListData.store_id = this.store_id;
            waitListData.store_location_id = this.store_location_id;
            waitListData.quantity = this.contacts[0].quantity;
            waitListData.first_name = this.contacts[0].first_name;
            waitListData.last_name = this.contacts[0].last_name;
            waitListData.email = this.contacts[0].email;
            waitListData.mobile_phone = this.contacts[0].mobile_phone;
            waitListData.store_location_id = parseInt(this.contacts[0].store_location_id);

            axios.post('/api/waitlist-item', JSON.stringify(waitListData), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + window.cartJWT,
                }
            }).catch(function (error) {
                if (error.response && error.response.data) {
                    handleJsonFail(error.response.data.responseText);
                }

                throw error;
            }).then(function (response) {
                if (typeof callback !== 'undefined') {
                    if (window.knobby && window.knobby['module_unsubscribes_feature_flag'] &&
                        typeof response.data.confirmOptInEmailSent !== undefined &&
                        response.data.confirmOptInEmailSent === true) {
                        confirmationEmailSentPopupOpen();
                    }

                    callback(response.data);
                }
            });
        } else {
            $.post("/public/api/waitlist.service.php?storeid="+this.store_id, JSON.stringify(this), function(response) {

                callback(response);
            });
        }
    },

    getNumberOfContacts: function() {

        return this.contacts.length;
    },

    getQuantity: function() {

        var qty = 0;
        for(var i = 0; i < this.contacts.length; i++) {

            if(this.contacts[i].quantity !== null) {

                qty += parseFloat(this.contacts[i].quantity);
            }
        }
        return qty;
    }
};

function WaitListContact() {

    wait_list_contact_rel_id = null;
    wait_list_id = null;
    store_id = null;
    store_location_id = null;
    pos_customer_id = null;
    first_name = null;
    last_name = null;
    phone = null;
    email = null;
    quantity = null;
    wait_list_status_id = null;
    waitlist = [];
}

WaitListContact.prototype = {

    wait_list_contact_rel_id: null,
    wait_list_id: null,
    store_id: null,
    store_location_id: null,
    pos_customer_id: null,
    first_name: null,
    last_name: null,
    phone: null,
    email: null,
    quantity: null,
    wait_list_status_id: null,
    waitlists: [],

    getFullName: function() {

        return this.first_name + " " + this.last_name;
    },

    getWaitlistsQuantity: function() {

        var qty = 0;
        for(var i = 0; i < this.waitlists.length; i++) {

            if(this.waitlists[i].quantity !== null) {

                qty += parseFloat(this.waitlists[i].quantity);
            }
        }
        return qty;
    },

    remove: function(callback) {

        $.post("/api/waitlist/WaitListApi.php?storeid="+this.store_id+"&delcont="+this.wait_list_contact_rel_id, JSON.stringify(this), function(response) {

            callback();
        });
    },

    deleteByCustomerIdAndWaitListId: function(waitlist_id, callback) {

        $.post("/api/waitlist/WaitListApi.php?storeid="+this.store_id+"&delcust="+this.pos_customer_id + "&wid=" + waitlist_id, JSON.stringify(this), function(response) {

            callback();
        });
    }
};
