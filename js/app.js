
(function () {
	'use strict';

	// The model that is used for each contact
	var Contact = Backbone.Model.extend({
		defaults: {
			photo: "./img/placeholder.png",
			name: "",
			address: "",
			tel: "",
			email: "",
			type: ""
		}
	});

	// Used to store a collection of contacts
	var Directory = Backbone.Collection.extend({
		model: Contact
	});

	var ContactView = Backbone.View.extend({
		tagName: "article",
		
		className: "contact-container",
		
		template: _.template($("#contactTemplate").html()),

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),

		initialize: function () {
			this.collection = new Directory(CONTACTS);
			this.render();

			this.$el.find("#filter").append(this.createSelect());

			this.on("change:filterType", this.filterByType, this);
			this.collection.on("reset", this.render, this);
			this.collection.on("add", this.renderContact, this);
		},

		render: function () {
			this.$el.find("article").remove();
			_.each(this.collection.models, function (model) {
				this.renderContact(model);
			}, this);
		},

		events: {
			"change #filter select": "setFilter",
			"click #add": "addContact"
		},

		setFilter: function (e) {
			this.filterType = e.currentTarget.value;
			this.trigger("change:filterType");
		},

		addContact: function (e) {
			e.preventDefault();

			var newContact = {};
			$("#addContact").children("input").each(function (id, element) {
				if ($(element).val() !== "") {
					newContact[element.id] = $(element).val();
				}
			});

			CONTACTS.push(newContact);

			if (_.indexOf(this.getTypes(), newContact.type) === -1) {
				this.collection.add(new Contact(newContact));
				this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
			} else {
				this.collection.add(new Contact(newContact));
			}
		},

		filterByType: function () {
			if (this.filterType === "all") {
				this.collection.reset(CONTACTS);
				contactsRouter.navigate("filter/all");
			} else {
				this.collection.reset(CONTACTS, { silent: true });
				var filterType = this.filterType,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("type").toLowerCase() === filterType;
					});
					this.collection.reset(filtered);
					contactsRouter.navigate("filter/" + filterType);
			}
		},

		getTypes: function () {
			return _.uniq(this.collection.pluck("type"));
		},

		createSelect: function () {
			var filter = this.$el.find("#filter"),
				select = $("<select/>", {
					html: "<option value='all'>all</Option>"
				});

			_.each(this.getTypes(), function (item) {
				// console.log(item);
				var option = $("<option/>", {
					value: item.toLowerCase(),
					text: item.toLowerCase()
				}).appendTo(select);
			});
			// console.log(select);
			return select;
		},

		renderContact: function (model) {
			var contactView = new ContactView({
				model: model
			});
			this.$el.append(contactView.render().el);
		}
	});

	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"filter/:type": "urlFilter"
		},

		urlFilter: function (type) {
			directory.filter = type;
			directory.trigger("change:filterType");
		}
	});

	var directory = new DirectoryView();
	var contactsRouter = new ContactsRouter();
	Backbone.history.start();
}());