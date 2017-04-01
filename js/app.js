
(function () {
	'use strict';

	// The model that is used for each contact
	var Contact = Backbone.Model.extend({
		defaults: {
			photo: "./img/placeholder.png"
		}
	});

	// Used to store a collection of contacts
	var Directory = Backbone.Collection.extend({
		model: Contact
	});

	var ContactView = Backbone.View.extend({
		tagName: "article",
		
		className: "contact-container",
		
		template: $("#contactTemplate").html(),

		render: function () {
			var template = _.template(this.template);
			this.$el.html(template(this.model.toJSON()));
			return this;
		}
	});

	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),

		initialize: function () {
			this.collection = new Directory(CONTACTS);
			this.render();
		},

		render: function () {
			var that = this;
			_.each(this.collection.models, function (model) {
				that.renderContact(model);
			}, this);
		},

		renderContact: function (model) {
			var contactView = new ContactView({
				model: model
			});
			this.$el.append(contactView.render().el);
		}
	});

	var directory = new DirectoryView();
}());