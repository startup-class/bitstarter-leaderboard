/*
   The Coinbase API limits the number of orders that can be mirrored at a
   time to 25, with subsequent orders on new pages.

   The following code hits the API once to determine the number of pages,
   and then uses this input to set up an async.mapLimit that pulls
   the order data and merges it together.

   Note that there are several improvements possible here:

    - You can add much more sophisticated error handling for each Coinbase
      API call, along with retries for fails, delays between requests, and
      the like.

    - You can make each Coinbase API call write directly to the database,
      rather than aggregating them and writing in one block. Depending
      on what you want to do, this might be preferable.

    - If you have a very large number of orders, you might have an issue
      with the default Heroku deployment process, which requires a port to
      be bound within 60 seconds of deployment. In this case you might not
      be able to do database update and deploy in one step and would have to
      revisit how web.js is set up; for example you might only download as
      many orders as you can get in the first 60 seconds, and then have the
      rest downloaded after the app boots. Or you might mirror all the
      Coinbase data offline and have the database separate from the main
      app.

   Overall, though, this is another good illustration of using async.compose
   to manage asynchrony.
*/
var async = require('async');
var request = require('request');
var uu = require('underscore');

var coinbase_api_url = function(page) {
    return "https://coinbase.com/api/v1/orders?page=" +
        page.toString() + "&api_key=" + process.env.COINBASE_API_KEY;
};

var get_ncoinbase_page = function(init, cb) {
    request.get(coinbase_api_url(init), function(err, resp, body) {
        var orders_json = JSON.parse(body);
        console.log("Finished get_ncoinbase_page");
        cb(null, orders_json.num_pages);
    });
};

var ncoinbase_page2coinbase_json = function(npage, cb) {
    console.log("Starting ncoinbase_page2coinbase_json with npage = " + npage);
    var inds = uu.range(1, npage + 1);
    var LIMIT = 5;
    var getjson = function(item, cb2) {
        request.get(coinbase_api_url(item), function(err, resp, body) {
            var orders_json = JSON.parse(body);
            console.log("Finished API request for Coinbase Order Page " + item);
            cb2(null, orders_json.orders);
        });
    };
    async.mapLimit(inds, LIMIT, getjson, function(err, results) {
        cb(null, uu.flatten(results));
    });
};

var get_coinbase_json = async.compose(ncoinbase_page2coinbase_json,
                                      get_ncoinbase_page);
/*
  Example of API use.

  The 1 argument to get_coinbase_json is used to specify that page=1
  is requested and parsed to get the num_pages. That is, we create
  a URL of the form:

    https://coinbase.com/api/v1/orders?page=1&api_key=YOUR-COINBASE-API-KEY

  ...and parse the num_pages field from it first.
*/
var debug_get_coinbase_json = function() {
    get_coinbase_json(1, function(err, result) {
        console.log(result);
    });
};

module.exports = { 'get_coinbase_json': get_coinbase_json,
                   'debug_get_coinbase_json': debug_get_coinbase_json};
