var ClassItemPerson = {
    uuid: null,
    name: null,

    setName: function(name) {
        this.name = name;
    },

    isEmpty: function() {
        if(this.name == '') {
            return true;
        }
        if(this.name == null) {
            return true;
        }
    }

};

var ClassItemModel = {

    id: null,
    people: [],
    events: [],
    sections: [],
    event: null,
    person_count: 1,
    require_names: false,
    show_add_to_cart: true,
    show_price: true,
    price: null,
    waitlist_mode: false,
    waitlist_contact: null,
    is_discountable: false,



setId: function(id) {
        this.id = id;
        this.people = [];
        var empty = Object.create(ClassItemPerson);
        this.people.push(empty);
    },

    setRequireNames: function(bool) {
        this.require_names = bool;
    },

    setShowAddToCart: function(bool) {
        this.show_add_to_cart = bool;
    },

    setShowPrice: function(bool) {
        this.show_price = bool;
    },

    getRequireNames: function() {
        if(this.require_names) {
            return 1;
        }
        return 0;
    },

    reset: function() {
        this.people = [];
        this.event = null;
        this.addPerson();
    },

    validateNames: function() {
        var slotsWithErrors = [];
        if(!this.getRequireNames()) {
            return slotsWithErrors;
        }
        for(var i = 0; i < this.people.length; i++) {
            if(this.people[i].isEmpty()) {
                slotsWithErrors.push(i + 1);
            }
        }
        return slotsWithErrors;
    },

    setEventData: function(data) {
        this.events = data;
        //console.log(this.events);
    },

    setPackageData: function(data) {
        this.package = data;
    },

    setIsDiscountable: function(bool) {
        this.is_discountable = bool;
    },

    getIsDiscountable: function() {
        return this.is_discountable;
    },

    addPerson: function() {
        var empty = Object.create(ClassItemPerson);
        empty.uuid = generateUUID();
        this.people.push(empty);
        this.person_count = this.people.length;
    },

    countNonEmptySeats: function() {
        var count = 0;
        for(var i = 0; i < this.people.length; i++) {
            if(this.people[i].isEmpty()) {
                continue;
            }
            count++;
        }
        return count;
    },

    remainingSeats: function() {
        return this.event.seats - this.person_count;
    },

    removePerson: function(uuid) {
        var tmp = [];
        for(var i = 0; i < this.people.length; i++) {
            var person = this.people[i];
            if(uuid != person.uuid)
            {
                tmp.push(person);
            }
        }
        this.people = tmp;
        this.person_count = this.people.length;

        // we don't want an empty list
        if(this.people.length == 0) {
            this.addPerson();
        }
    },

    removeEmptyOrLastPerson: function() {

        // is the last person empty? If so, get rid of them
        var last = this.people[this.people.length -1];
        if(last.isEmpty()) {
            //console.log('remove last, they are empty');
            return this.removePerson(last.uuid);
        }

        // we didn't remove the last entry - find any empty ones.
        for(var i = 0; i < this.people.length; i++) {
            var p = this.people[i];
            if(p.isEmpty()) {
                //console.log('remove loop, they are empty');
                return this.removePerson(p.uuid);
            }
        }

        // we haven't removed anyone yet - the last guy is unlucky
        //console.log('remove last - default');
        this.removePerson(last.uuid);

        // we don't want an empty list
        if(this.people.length == 0) {
            this.addPerson();
        }
    },

    setSection: function(event) {
        // do we already have an event?
        if(this.event !== null && this.event.event_id != event.event_id && event.unlimited_seats === false) {
            // we changed events, need to re-check attendee list size
            this.enforceSize(event.seats);
        }
        this.event = event;
    },

    enforceSize: function(limit) {
        while(this.person_count > limit) {
            this.removeEmptyOrLastPerson();
        }
    },

    getEventClass: function(event) {
        if (event.in_progress) {
            return 'soldOut';
        }

        if (event.unlimited_seats === true) {
            return '';
        }

        if (event.seats <= 0) {
            if (event.add_to_waitlist) {
                return 'addToWaitlist';
            } else {
                return 'soldOut';
            }
        }
    },

    getQuantityId: function() {
        var id = 'integerCLASS';
        if(this.event !== null ) {
            id += this.event.event_id;
        }
        return id;
    },

    showAddToCart: function() {
        return this.show_add_to_cart;
    },

    getPrice: function() {
        if(this.price !== null) {
            return this.price;
        }
        for (var key in this.events) {
            var first = this.events[key];
            this.price = parseFloat(first.price);
            break;
        }
        return this.price;
    }

};
