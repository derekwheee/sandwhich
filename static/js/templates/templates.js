this["templates"] = this["templates"] || {};
this["templates"]["geocoding"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"loading geocoding\">\n    Locating your location...\n</div>\n";
},"useData":true});
this["templates"]["gettingVenues"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"loading venues\">\n    Getting hungry?\n</div>\n";
},"useData":true});
this["templates"]["nope"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"error nope\">\n    <img src=\"https://media.giphy.com/media/10oRQhnkcc72Le/giphy.gif\">\n    <p>\n        <a href=\"/\">Try Again</a>\n    </p>\n</div>\n";
},"useData":true});
this["templates"]["which"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "<div class=\"which\">\n    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.which : depth0)) != null ? stack1.name : stack1), depth0))
    + " from "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.venue : depth0)) != null ? stack1.name : stack1), depth0))
    + "\n</div>\n";
},"useData":true});