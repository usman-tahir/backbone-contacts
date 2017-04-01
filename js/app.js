
(function ($) {
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
}(jquery));