var App = {
  $body: $("tbody"),
  template: Handlebars.compile($("#items").html()),
  render: function() { // render collection of models to the page
    this.$body.html(this.template({
      items: this.Items.models
    }));
  },
  removeItem: function(e) {
    e.preventDefault();
    var model = this.Items.get(+$(e.target).attr("data-id"));
    this.Items.remove(model);
  },
  bind: function() {
    this.$body.on("click", "a", this.removeItem.bind(this)); // delegate click event on delete anchor to tbody element
  },
  init: function() {
    this.Items = new ItemsCollection(items_json); // create new collection seeded with items_json data
    this.Items.sortByName(); // sort by name
    this.render();
    this.bind();
  }
};

var ItemModel = Backbone.Model.extend({ // item model constructor
  idAttribute: "id",
  initialize: function() {
    this.collection.incrementID();
    this.set("id", this.collection.last_id);
  }
});

// Create collection constructor
var ItemsCollection = Backbone.Collection.extend({
  last_id: 0,
  model: ItemModel,
  incrementID: function() {
    this.last_id++;
  },
  sortBy: function(prop) { // sorts collection based on specified property and re-renders it
    this.models = _(this.models).sortBy(function(model) {
      return model.attributes[prop];
    });
    App.render();
  },
  sortByName: function() {
    this.sortBy("name");
  },
  initialize: function() {
    this.on("remove reset", App.render.bind(App)); // bind remove and reset event listeners to collection to re-render it to page
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
  var prop= $(this).attr("data-prop");
  App.Items.sortBy(prop);
});

$("p a").on("click", function(e) { // bind click event to 'Delete All' link
  e.preventDefault();
  App.Items.reset();
});

App.init();
