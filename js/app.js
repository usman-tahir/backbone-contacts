
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

		editTemplate: _.template($("#contactEditTemplate").html()),

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		events: {
			"click button.delete": "deleteContact",
			"click button.edit": "editContact",
			"change select.type": "addType",
			"click button.save": "saveEdits",
			"click button.cancel": "cancelEdit"
		},

		deleteContact: function () {
			var removedType = this.model.get("type").toLowerCase();
			this.model.destroy();
			this.remove();

			if (_.indexOf(directory.getTypes(), removedType) === -1) {
				directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
			}
		},

		editContact: function () {
			this.$el.html(this.editTemplate(this.model.toJSON()));
			var newOptions = $("<option/>", {
				html: "<em>Add new ...</em>",
				value: "addType"
			});

			this.select = directory.createSelect().addClass("type")
				.val(this.$el.find("#type").val()).append(newOptions)
				.insertAfter(this.$el.find(".name"));

			this.$el.find("input[type='hidden']").remove();
		},

		addType: function () {
			if (this.select.val() === "addType") {
				this.select.remove();

				$("<input/>", {
					"class": "type"
				}).insertAfter(this.$el.find(".name")).focus();
			}
		},

		saveEdits: function (e) {
			e.preventDefault();

			var formData = {},
				previous = this.model.previousAttributes();

			$(e.target).closest("form").find(":input").not("button").add(".photo").each(function () {
				var element = $(this);
				formData[element.attr("class")] = element.val();
			});

			if (formData.photo === "") {
				delete formData.photo;
			}

			this.model.set(formData);
			this.render();

			if (previous.photo === "/img/placeholder.png") {
				delete previous.photo;
			}

			_.each(contacts, function (contact) {
				if (_.isEqual(contact, previous)) {
					CONTACTS.splice(_.indexOf(CONTACTS, contact), 1, formData);
				}
			});
		},

		cancelEdit: function () {
			this.render();
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
			this.collection.on("remove", this.removeContact, this);
		},

		render: function () {
			this.$el.find("article").remove();
			_.each(this.collection.models, function (model) {
				this.renderContact(model);
			}, this);
		},

		events: {
			"change #filter select": "setFilter",
			"click #add": "addContact",
			"click #showForm": "showForm"
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

		removeContact: function (removedModel) {
			var removed = removedModel.attributes;

			if (removed.photo === "/img/placeholder.png") {
				delete removed.photo;
			}

			_.each(CONTACTS, function (contact) {
				if (_.isEqual(contact, removed)) {
					CONTACTS.splice(_.indexOf(contacts, contact), 1);
				}
			});
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

		showForm: function () {
			this.$el.find("#addContact").slideToggle();
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