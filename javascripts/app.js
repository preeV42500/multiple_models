var ItemModel = Backbone.Model.extend({ // item model constructor
  idAttribute: "id"
});

var Items = { // represents collection of models and methods related to the collection
  $body: $("tbody"),
  collection: [],
  create: function(item_data) {
    item_data.id = this.collection.length + 1;
    var item = new ItemModel(item_data); // use item data to create new item model
    this.collection.push(item); // add newly created model to the collection

    return item;
  },
  render: function() { // render collection of models to the page
    this.$body.html(template({
      items: this.collection
    }));
  },
  seedCollection: function() { // create a new model for each obj in items_json array
    items_json.forEach(this.create.bind(this));
  },
  sortBy: function(prop) { // sorts collection based on specified property and re-renders it
    this.collection = _(this.collection).sortBy(function(model) {
      return model.attributes[prop];
    });
    this.render();
  },
  empty: function() { // delete models from view and from collection
    this.collection = [];
    this.render();
  },
  remove: function(e) {
    e.preventDefault();
    var $e = $(e.target),
        model = _(this.collection).findWhere({ id: +$e.attr("data-id") });

    this.collection = _(this.collection).without(model); // reset collection to array without the model
    this.render();
  },
  bind: function() {
    this.$body.on("click", "a", this.remove.bind(this)); // delegate click event on delete anchor to tbody element
  },
  init: function() {
    this.seedCollection();
    this.render();
    this.bind();
  }

};

// compile Handlebars template
var template = Handlebars.compile($("#items").html());
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

  item = Items.create(attrs);
  Items.$body.append(Handlebars.partials.item(item.toJSON())); // append new item to end of table body
  this.reset();
});

$("th").on("click", function() { // bind click event to table headings to sort table by heading property
  var prop= $(this).attr("data-prop");
  Items.sortBy(prop);
});

$("p a").on("click", function(e) { // bind click event to 'Delete All' link
  e.preventDefault();
  Items.empty();
});

Items.init();
