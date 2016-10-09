var App = {
  init: function() {
    this.Items = new ItemsCollection(items_json); // create new collection seeded with items_json data
    this.View = new ItemsView({ collection: this.Items }); // create new view and pass in collection as property
    this.Items.sortByName(); // sort collection by name
  }
};

var ItemModel = Backbone.Model.extend({ // item model constructor
  idAttribute: "id",
  initialize: function() {
    this.collection.incrementID();
    this.set("id", this.collection.last_id);
  }
});

var ItemsView = Backbone.View.extend({
  el: "tbody",
  events: {
    "click a": "removeItem" // bind removeItem method to click event
  },
  template: Handlebars.compile($("#items").html()),
  render: function() { // render collection of models to the page
    this.$el.html(this.template({
      items: this.collection.toJSON()
    }));
  },
  removeItem: function(e) {
    e.preventDefault();
    var model = this.collection.get(+$(e.target).attr("data-id"));
    this.collection.remove(model);
  },
  initialize: function() {
    this.listenTo(this.collection, "remove reset rerender", this.render); // render view in response to remove, reset, or rerender events from collection
  }
});

// Create collection constructor
var ItemsCollection = Backbone.Collection.extend({
  last_id: 0,
  model: ItemModel,
  incrementID: function() {
    this.last_id++;
  },
  sortByProp: function(prop) { // sorts collection based on specified property and re-renders it
    this.comparator = prop; // change comparator and sort
    this.sort();
    this.trigger("rerender"); // trigger rerender event so that view can respond
  },
  sortByName: function() {
    this.sortByProp("name");
  },
  initialize: function() {
    this.on("add", this.sortByName);
  }
});

// register partial
Handlebars.registerPartial("item", $("#item").html());

$("form").on("submit", function(e) {
  e.preventDefault();
  var inputs = $(this).serializeArray(),
      attrs = {},
      item;
  inputs.forEach(function(input) {
    attrs[input.name] = input.value; // store form input names and corresponding values on attrs obj
  });

  item = App.Items.add(attrs);

  this.reset();
});

$("th").on("click", function() { // bind click event to table headings to sort table by heading property
  var prop = $(this).attr("data-prop");
  App.Items.sortByProp(prop);
});

$("p a").on("click", function(e) { // bind click event to 'Delete All' link
  e.preventDefault();
  App.Items.reset();
});

App.init();
