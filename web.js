var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , async   = require('async')
  , db      = require('./models')
  , ROUTES  = require('./routes');

/*
  Initialize the Express app, the E in the MEAN stack (from mean.io).

  Templates: First, we configure the directory in which the Express app will
  look for templates, as well as the engine it'll use to interpret them (in
  this case Embedded JS). So we can use the views/orderpage.ejs and
  views/homepage.ejs files in response.render (see routes.js).

  Port: We then set up the port that the app will listen on by parsing the
  variable that's configured in .env (or else using a default).

  Static file serving: Then we set up express for static file serving, by
  making the entire content under '/public' accessible on the WWW. Thus
  every file <file-name> in /public is served at example.com/<file-name>. We
  specifically instruct the app to look for a particular file called the
  favicon.ico; this is what browsers use to represent minified sites in
  tabs, bookmarks, and favorites (hence 'favicon = favorite icon'). By
  default the query would go to example.com/favicon.ico, but we redirect it
  to example.com/public/img/favicon.ico as shown.

  Logging: We set up a convenient dev logger so that you can watch
  network requests to express in realtime. Run foreman start in the home
  directory after following the instructions in README.md and Express
  will begin printing logging information to the command line.

  Routes: We have separated the routing information into a separate
  routes.js file, which we import. This tell the app what function to
  execute when a client accesses a URL like example.com/ or
  example.com/orders. See routes.js for more details.

  Init: Finally, we synchronize the database, start the HTTP server, and
  also start a simple 'daemon' in the background via the setInterval
  command.

  Regarding the daemon: this is a great example of the use of asynchronous
  programming and object-oriented programming.

  First, some background: A daemon is a process that runs in the background
  at specified intervals; for example, you'd use it to keep a search index
  up to date, run an antivirus scan, or periodically defrag a hard
  drive. You also want to use daemons to synchronize with remote services
  and update dashboards. Why? Let's say you have 10000 people visiting your
  website per hour, and on the front page you have some kind of statistic
  that depends on an API call to a remote website (e.g. the number of Tweets
  that mention a particular string). If you do it naively and query the
  remote servers each time, you will repeat work for each new HTTP request
  and issue 10000 API calls in just an hour. This will probably get you
  banned. The underlying problems is that you do not want to have the number
  of API calls scale with the number of viewers. So instead you have a
  'daemon' running asynchronously in the background that refreshes the
  displayed statistic every 10 minutes (say), such that you only make 6 API
  calls per hour rather than N=10000 or more.

  In our app, the statistic we are displaying on the front page is the
  thermometer and the remote service is Coinbase. The idea is that we want
  to hit the remote Coinbase servers at regular intervals to mirror the
  order data locally. Previously, we added the capability to manually force
  mirroring of the Coinbase data to the local server by navigating to
  example.com/refresh_orders, which will trigger the refresh_orderfn in
  routes.js. However, by isolating the refresh code to a single method
  invocation (global.db.Order.refreshFromCoinbase), we can also call it in
  another function. We do so within the scope of a setInterval invocation
  (below), which calls the specified function periodically.  Now we can
  refresh in two places.

  So, to recap: by isolating the refresh code within a method call on the
  Order object, we could call it in two places. And by using the built-in
  asynchronous features of node, we can easily have both the HTTP server and
  the setInterval daemon working at the same time: the server is listening
  for requests while the daemon is working in the background on a periodic
  schedule.
*/
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(express.logger("dev"));

for(var ii in ROUTES) {
    app.get(ROUTES[ii].path, ROUTES[ii].fn);
}

global.db.sequelize.sync().complete(function(err) {
    if (err) {
	throw err;
    } else {
	var DB_REFRESH_INTERVAL_SECONDS = 600;
	async.series([
	    function(cb) {
		// Mirror the orders before booting up the server
		console.log("Initial mirror of Coinbase orders at " + new Date());
		global.db.Order.refreshFromCoinbase(cb);
	    },
	    function(cb) {
		// Begin listening for HTTP requests to Express app
		http.createServer(app).listen(app.get('port'), function() {
		    console.log("Listening on " + app.get('port'));
		});

		// Start a simple daemon to refresh Coinbase orders periodically
		setInterval(function() {
		    console.log("Refresh db at " + new Date());
		    global.db.Order.refreshFromCoinbase(cb);
		}, DB_REFRESH_INTERVAL_SECONDS*1000);
		cb(null);
	    }
	]);
    }
});
