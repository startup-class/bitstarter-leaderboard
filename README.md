# Overview

This is a simple template app for a Bitcoin-based crowdfunding site that
adds even more server-side and client-side dynamic behavior over our
[earlier template](https://github.com/startup-class/bitstarter-ssjs-db). It
uses three of the four technologies in the so-called
[MEAN stack](http://mean.io): [Express](http://expressjs.com) (E),
[Angular](http://angularjs.com) (A), and [Node](http://nodejs.com) (N), and
replaces [MongoDB](http://mongodb.com) / [Mongoose](http://mongoosejs.com)
(M) with [PostgreSQL](http://postgresql.org) /
[Sequelize](http://sequelizejs.com). The app illustrates several of the
following conceptual topics:

- Implementing multiple routes
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/web.js#L89),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L111))

- Factoring out constants/settings into separate files
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/constants.js),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L43))

- Factoring out secure server-side configuration variables into `.env` files 
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/.env.dummy), 
     [2](https://devcenter.heroku.com/articles/config-vars))

- Using `async.series` to force a database update, followed by a launch of the
    webserver
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/web.js#L97))

- Using `async.mapLimit` and `async.eachLimit` to limit the number of simultaneous queries to a remote API and to a database respectively
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/models/coinbase.js#L60), 
     [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/models/order.js#L73))

- Using asynchronous code to set up a recurring background process (a "daemon")
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/web.js#L110))

- Visualizing ORM instances in the browser
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L55),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/views/orderpage.ejs#L24))

- Client-side templating with [AngularJS](http://angularjs.org)
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/views/homepage.ejs#L70),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/public/js/controllers.js#L17),
    [3](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L61))

- Server-side templating with [Embedded JS templates](http://embeddedjs.com/)
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L42),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/views/homepage.ejs),
    [3](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L55),
    [4](https://github.com/startup-class/bitstarter-leaderboard/blob/master/views/orderpage.ejs))

- Making a request to a remote API both on the server and in client-side code
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/models/order.js#L138),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/models/coinbase.js#L42),
    [3](https://github.com/startup-class/bitstarter-leaderboard/blob/master/models/coinbase.js#L54),
    [4](https://github.com/startup-class/bitstarter-leaderboard/blob/master/public/js/controllers.js#L18))

- Setting up a simple API
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L61),
     [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/public/js/controllers.js#L16))

- Reusing code by putting object manipulation code into instance/class methods
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/routes.js#L83),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/web.js#L101),
    [3](https://github.com/startup-class/bitstarter-leaderboard/blob/master/web.js#L112))

- Setting up a basic AngularJS controller
    ([1](https://github.com/startup-class/bitstarter-leaderboard/blob/master/views/homepage.ejs#L70),
    [2](https://github.com/startup-class/bitstarter-leaderboard/blob/master/public/js/controllers.js#L17))

Let's install the app and then take a tour of the functionality.

# Installation
To get the app up and running, execute the following commands on your EC2
instance:

```sh
curl https://raw.github.com/startup-class/setup/master/setup.sh | bash
exit # and then log in again
git clone https://github.com/startup-class/bitstarter-leaderboard.git
cd bitstarter-leaderboard
./setup-ssjs.sh
```

## Running Locally on an EC2 Instance
Once you have done this you will need to :
 
1. Copy the [.env.dummy](.env.dummy) file into `.env` and include your API
key from http://coinbase.com/account/integrations so that it looks like the
snippet below. Note that `COINBASE_API_KEY` is a secure API key that should
never be checked into a git repository; that's why we exclude it in the
[.gitignore](.gitignore).

```bash
$ cp .env.dummy .env
$ emacs -nw .env  # Add key from coinbase.com/account/integrations
$ cat .env
COINBASE_API_KEY=cb27e2ef0a8872f7923612d4d57937e70476ab8041455b00b35d1196cf80f50d
PORT=8080
```

2. Edit the [constants.js](.constants.js) file to include the
preorder button from http://coinbase.com/merchant_tools. This is a non-secure
code that is meant to be embedded in a public-facing webpage, so it's ok if
you check this into git.

```js
  COINBASE_PREORDER_DATA_CODE: "13b56883764b54e6ab56fef3bcc7229c",
```

3. Now you can run the server locally and preview at a URL like
http://ec2-54-213-131-228.us-west-2.compute.amazonaws.com:8080 as follows:

```sh
foreman start
```

You can determine the hostname of your EC2 instance conveniently with this
command:

```sh
curl -s http://169.254.169.254/latest/meta-data/public-hostname
# ec2-54-213-192-71.us-west-2.compute.amazonaws.com
```

Try placing some orders and then going to the "/orders" URL at the top to
see them recorded. Also refresh the page to see the thermometer update. Note
that you will get an error if you didn't do the `.env` step above.

## Running Remotely
Once the app works via `foreman start` on your EC2 machine, you can deploy to Heroku and push
the configuration variables defined in `.env` as follows:

```sh
git push heroku master
heroku config:push
```
Then you can go to a URL like http://safe-dawn-4440.herokuapp.com and submit
orders to test it out. Note again that you will get an "invalid api key"
error if you didn't do the `.env` step above.

# Concepts

## File Structure
Let's begin by taking a quick look at the files in the app. First, the major
differences from
[github.com/startup-class/bitstarter-ssjs-db](http://github.com/startup-class/bitstarter-ssjs-db)
are as follows:

-   `index.html` is now replaced by the more sophisticated `views/homepage.ejs` template
-   `.pgpass` has a newline added to it, and a corresponding
-   CSS and JS have been pulled out of index.html and into `public/css` and `public/js`
-   A good deal of content has been added to the static files directory to
    reduce the number of HTTP requests to external servers.

Now let's go file by file:

| Path                                                                     | Description                                                                                   |
|-------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------|
| [.env.dummy](.env.dummy)                                                 | Used as template for .env. Has COINBASE\_API\_KEY from coinbase.com/account/integrations      |
| [.pgpass](.pgpass)                                                       | Used by pgsetup.sh to instantiate the db                                                      |
| [constants.js](constants.js)                                             | Several constants, including COINBASE\_PREORDER\_DATA\_CODE from coinbase.com/merchant\_tools |
| [models/coinbase.js](models/coinbase.js)                                 | Define a set of functions that downloads and parses remote Order data from Coinbase           |
| [models/index.js](models/index.js)                                       | Initialize the connection between Sequelize and the PostgreSQL db.                            |
| [models/order.js](models/order.js)                                       | Define an Order class that works with data from the "Order" table in the PostgreSQL db        |
| [package.json](package.json)                                             | Specify dependencies for the app                                                              |
| [pgsetup.sh](pgsetup.sh)                                                 | Invoked by setup-ssjs.sh to create the Postgres DB.                                           |
| [Procfile](Procfile)                                                      | Heroku file that determines which processes are run upon deployment                           |
| [public/css/bitstarter-styles.css](public/css/bitstarter-styles.css)     | CSS styles for views/homepage.ejs                                                             |
| [public/fonts/opensans-300.woff](public/fonts/opensans-300.woff)         | Google Font file                                                                              |
| [public/fonts/ubuntu-300.woff](public/fonts/ubuntu-300.woff)             | Google Font file                                                                              |
| [public/fonts/ubuntu-700.woff](public/fonts/ubuntu-700.woff)             | Google Font file                                                                              |
| [public/img/480x300.gif](public/img/480x300.gif)                         | Placeholder image                                                                             |
| [public/img/favicon.ico](public/img/favicon.ico)                         | Favorite icon ('favicon') for bookmarks/favorites                                             |
| [public/js/angular.min.js](public/js/angular.min.js)                     | Angular JS file (see angularjs.org). Used for thermometer on frontpage.                       |
| [public/js/coinbase-post-payment.js](public/js/coinbase-post-payment.js) | Stub code to use once Coinbase fixes the coinbase\_payment\_complete event.                   |
| [public/js/controllers.js](public/js/controllers.js)                     | Angular JS controllers. Contains controller for the thermometer in homepage.ejs.              |
| [public/js/google-analytics.js](public/js/google-analytics.js)           | One of the two Google Analytics scripts. For ga.js.                                           |
| [README.md](README.md)                                                   | Documentation                                                                                 |
| [routes.js](routes.js)                                                   | Define the routes for the app: functions executed when specific URLs are requested.           |
| [setup-ssjs.sh](setup-ssjs.sh)                                           | Set up an EC2 instance. Invokes pgsetup.sh                                                    |
| [views/homepage.ejs](views/homepage.ejs)                                 | Template for the index (served up for example.com/)                                           |
| [views/orderpage.ejs](views/orderpage.ejs)                               | Template for the order page (served up for example.com/orders)                                |
| [web.js](web.js)                                                         | Initialize express app, syncs db, and start HTTP server                                       |



# Server-Side

## Express ('E' in MEAN)

We use [Express](http://expressjs.org) to set up our web server. Skim the
Express [documentation](http://expressjs.org) and then take a look at
[web.js](web.js)
and
[routes.js](routes.js)
to see how we set up the app and the valid routes. We've also factored out
many static assets into subdirectories into [/public](public/).

Recall again that static assets are files that do not change. When users
request `example.com/img/480x300.gif` they will get the same file every time
(a static response). By contrast, a web page with content that changes based
on client- or server-side parameters is a dynamic web page; for example,
when a user requests `example.com/orders` they will see something that
depends on the state of the database and thus will vary over time.

Note that in [routes.js](routes.js), we try to separate the code that
handles requests and responses from the code that actually manipulates
instances of the [Order](models/order.js) class. This illustrates a general
principle: as much as possible, you should ask objects to manipulate
themselves with instance methods and/or class methods rather than try to
work with an object's guts externally; see
[models/order.js](models/order.js) for details of doing this. We'll talk
more about how this is done in the
[ORM section](dborm-postgresql-and-sequelize-replaces-m-in-mean) below, but
for now note that most request handlers have the form of asking `global.db`
for some data and then packing that data into an HTTP response of some kind.

In sum, Express is used here to organize the functions that are executed on
the server to generate an HTTP response from an HTTP request - that is, to
structure our webapp.

## Server-Side Templating

For illustrative purposes, we do two kinds of templating in this app:
server-side templating of [views/homepage.ejs](views/homepage.ejs) and [views/orderpage.ejs](views/orderpage.ejs), and
client-side templating in the thermometer on the homepage via Angular JS
(also in [views/homepage.ejs](views/homepage.ejs#L70).

Let's talk about server-side templating first. The specific templating
engine here is set up in [web.js](web.js), where we tell Express that `.ejs`
([Embedded Javascript](http://embeddedjs.com)) files are our templates of choice via the line
[app.set('view engine', 'ejs')](web.js#L82).

Consider [indexfn](routes.js#L41) in routes.js. This uses
[response.render](http://expressjs.com/api.html#res.render) to take the file
`views/homepage.ejs` and populate it with a JSON data structure. Specifically,
the [response.render invocation](routes.js#L42) looks for variables in
`views/homepage.ejs` (like
[<%= coinbase_preorder_data_code %>](views/homepage.ejs#L115) ) and replaces
them with the corresponding field of the JSON data structure as defined in
[constants.js](constants.js#L33). It then wraps this in an HTTP response and
returns it to the client.

A slightly more complex example is in [orderfn](routes.js#L53), also in
`routes.js`.  Here we use the `orders_json` JSON data structure to populate
the `views/orderpage.ejs` file via `response.render`, similar to what we did
in `indexfn`. The main difference is that we put this logic
in a callback and send it into
[global.db.Order.allToJSON](models/order.js#L28), executing it right after
the `orders` variable is built up via ORM and database operations.

These two examples illustrate the basic idea of server-side
templating. Rather than returning a fully static file like
`public/img/480x300.gif`, we separate out the static and dynamic
portions. We put the parts that don't change (the static parts) into a
template like `views/orderpage.ejs` and then populate this template
dynamically with the remainder, returning the response to the client. All of
this is done on the server and the computation is invisible to the client;
they can't view the `orders` variable directly, for example, by looking at
[Network Requests](http://net.tutsplus.com/tutorials/chrome-dev-tools-networking-and-the-console/)
in the Chrome Developer Tools. They just see one HTTP response in response
to their HTTP request.

## DB/ORM: PostgreSQL and Sequelize (Replaces 'M' in MEAN)

In this app we have a simple PostgreSQL relational database underlying the
app that keeps a local mirror of the remote order data on Coinbase's
servers. We create the db by running [setup-ssjs.sh](setup-ssjs.sh), which
in turn invokes [pgsetup.sh](pgsetup.sh). We interface with this database
via the Sequelize Object-Relational Mapper (ORM), which provides a
Javascript API to a relational database. The following figure provides an
overview; take a look at it and then read the subsequent documentation:

<div style="text-align:center;">
  <img width="100%"
       src="https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig1.png">
</div>

While this kind of setup is canonical, it's worth asking a few questions
about why a relational database and object-relational mapper combination is
so common in web applications today.

- *Why use a DB?* First, you might ask why we don't simply keep the order data
in a simple `.json` file and then reload it when the app boots up. This is
the so-called 'flatfile' approach. We could certainly do this, but as our
app scales and we get more and more data this approach has issues. For one
thing, we would find it painful to modify the `.json` file simultaneously if
we had multiple web-servers writing to the same dataset. For another, a
naive `.json` file saved on disk will be very slow to search. As a third
point, we may wish to extract information from this `.json` file in a
different manner from the way in which we saved it. Each of these things -
parallelized reads/writes, rapid searching, and easy reporting via the
Structured Query Language (SQL) - is facilitated by converting our data from
flatfiles and keeping it in a relational database like PostgreSQL.

- *Why use an ORM with the DB?* Second, given that we are using a relational
database, you might then ask why we don't simply interface directly with the
relational database via a low-level library like `node-postgres`, which
allows us to run SQL statements directly against the database. Why take on
the overhead of an Object-Relational Mapper like Sequelize? The answer is
that the so-called 'Active Record Paradigm' is a good match for many
webapps. In a nutshell, the idea is that it is often very useful to conceive
of tables in a relational database as mapping directly to classes, while
rows of these tables contain the data for instances. In this framework the
entire database can be thought of as an elaborate
serialization/deserialization apparatus for Javascript objects. You
rehydrate individual instances of JS classes from disk during the life of a
program, and then dehydrate them and put them in cold storage (the
relational database) when no longer needed in memory. That said, it's
important to keep in mind that an ORM is a convenience and not a panacea:
just as with flatfiles it is true that sometimes the Active Record paradigm
breaks down and you need to directly interface with the database via SQL
statements, for performance reasons or because you're doing some sort of
report or dashboard that accesses the data via columns even though you saved
it across rows.

- *Why use a relational DB rather than a NoSQL DB?* As a third point, you
might note that this combination of Sequelize and PostgreSQL replaces the
Mongoose/MongoDB combination which is the 'M' in the MEAN stack. Why don't
we just use the so-called [NoSQL](http://en.wikipedia.org/wiki/NoSQL)
Mongoose/MongoDB combo? Well, Mongoose/MongoDB is certainly one way to go if
you really want a completely full-stack JS app. However, PostgreSQL has
excellent support for JS and JSON nowadays, and is more mature than
MongoDB. Moreover, the advantages of a so-called schemaless or NoSQL
approach are greatest at the beginning of an app when the
[schema](http://en.wikipedia.org/wiki/Database_schema) is changing rapidly,
but eventually it actually becomes useful to have a schema to catch errors
and prevent invalid operations. You will often find yourself reinventing a
schema in code if you go down the MongoDB path, albeit without the extent of
low-level schema support provided by a relational DB like PostgreSQL.

Once we've decided on an ORM/DB combination, in general we want to keep most
code related to manipulating data from the database in the corresponding
class or instance methods (in our case in `models/order.js`). As a rough
rule of thumb, class methods operate on every instance in the class
(e.g. counts and totals), while instance methods access data associated with
particular instances. So as an example you'd use a class method (like
`Order.totals`) to sum up the total amount of Bitcoin sent over all orders,
while you'd use an instance method (like a hypothetical
`myorder.amountInUSD` method) to determine the equivalent USD amount for a
given order in BTC. The latter method call needs the amount data on a
specific `Order` instance, so it should be an instance method (though you
might request and cache the exchange rate itself via a class method).

We put these class and instance method definitions in `order.js`, within the
the `sequelize.define` invocation (see [here](http://sequelizejs.com/documentation#models-expansion-of-models)). The main tricky part here is
the value of `this`. Within a class method it refers to the entire class (in
this case `Order`) while within an instance method it refers to a particular
instance (e.g. `myorder`). Sometimes you need to save this variable and pass
it in to a callback; we do this in `addFromJSON` to make the `Order` class
accessible within a callback that runs on each individual instance. 

Finally, here are some examples of working with the ORM in the node REPL.

```js
    // Execute from within the top level directory after pgsetup:
    > require('./models')
    > global.db.Order.numOrders()
    Executing: SELECT count(*) as "count" FROM "Orders";
    There are 25 Orders
    
    > var foo = [];
    > global.db.Order.findAll().success(function(_orders) { global['foo'].push(_orders);});
    > var orders = foo[0];
    > orders[0].repr()
    { coinbase_id: '84XZQO6L',
      amount: 0.0001,
      time: '2013-08-10T10:31:33-07:00',
      id: 131,
      createdAt: Fri Aug 10 2013 19:57:29 GMT+0000 (UTC),
      updatedAt: Fri Aug 10 2013 19:57:29 GMT+0000 (UTC) }
```

# Client-Side

## Client-Side Templating

We previously discussed server-side templating and how we combine a static
template (from `order.ejs` or `homepage.ejs`) with dynamic JSON data to create
a dynamic HTTP response that varies with the state of the database. If you
recall, our `homepage.ejs` was partially templated on the server-side in the
`indexfn` within `routes.js` by replacement of the portions surrounded by
special brackets, like the value of `name` below.

```html
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
    <a class="brand" href="#"><%= name %></a>
    <div class="nav-collapse collapse">
      <ul class="nav">
        <li class="active"><a href="#">Home</a></li>
        <li><a href="#about">About</a></li>
```

However, you might have noticed an alternative bracket syntax coexisting
within the `homepage.ejs` file, as shown surrounding `num_orders` below:

```html
    <div class="span5 actions" ng-controller="OrdersCtrl">
      <div class="row-fluid">
      <div class="span8 offset2">
        <div class="row-fluid statistics">
          <div ng-show="!error">
            <div class="span4">
              <!-- linediv-l and linediv-r give dividing lines that look
              different in horizontal and vertical layouts, illustrating
              media queries. -->
              <div class="linediv-l">
              <h3>{{num_orders}}</h3> <p>backers</p>
              </div>
            </div>
```

This is because in `homepage.ejs` we are also using a second kind of
templating: client-side templating. It is similar in concept to server-side
templating, except the population of the static template with the JSON data
occurs on the client side. Among other things, this means the client has
access to a JSON API that is returning some data. 

In this app, the place that we're doing some client-side templating is in
the thermometer element. The data that comes from `/api/orders` is being
used to update the thermometer. If you submit an order in a separate window,
and wait for the Coinbase data to be refreshed (via the `setInterval` daemon
in `web.js`) or manually refresh it yourself (by requesting
`/refresh_orders`), the thermometer will then update upon a homepage
refresh. You can think of this client-side templating implementation as
simply populating the template variables in `homepage.ejs` with data on the
client-side rather than on the server.

## Angular: Two-Way Data Binding ('A' in MEAN)

But things are a little more complicated than that. We're actually using a
client-side framework called [AngularJS](http://docs.angularjs.org/guide/concepts) which offers something much more
sophisticated than simple templating. It actually does full-on two-way
databinding; see here for the [concept](http://docs.angularjs.org/guide/dev_guide.templates.databinding) and here for a worked [example](http://docs.angularjs.org/guide/forms). The
basic difference between one-way templating and two-way databinding is that
in one-way templating the data is just used to populate variables in a
template (e.g. `homepage.ejs`). In two-way databinding, however, actions on
elements of a templated page (like clicking a button or typing into a form
field) can in turn change the underlying data. Indeed, you can set it up
such that the same data is editable from several different places within a
page. Again, see here for the [concept](http://docs.angularjs.org/guide/dev_guide.templates.databinding) and here for a worked [example](http://docs.angularjs.org/guide/forms). We
aren't using all the features of two-way databinding in our thermometer, but
it's worth understanding how Angular works in a simple use case.

To trace through the logic of how we're using Angular in our simple app,
let's start with the four Angular directives that we're using in
`homepage.ejs`: `ng-app`, `ng-show`, `ng-style`, and `ng-controller`. First,
we put `ng-app` at the top of the file and include `angular.min.js`. Once
the Javascript from `angular.min.js` is parsed and run by the browser, it
will look through the DOM, find the `ng-app` declaration, and treat
everything underneath that node as subject to control/updating by
Angular. For simplicity, in this case we put `ng-app` at the very top node,
in the `<html>` tag.

```html
    <!DOCTYPE html>
    <html lang="en" ng-app>
      <head>
        <meta charset="utf-8">
        <title><%= title %></title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://d396qusza40orc.cloudfront.net/startup/code/jquery.js"></script>
        <script src="https://d396qusza40orc.cloudfront.net/startup/code/bootstrap.js"></script>
        <script src="js/angular.min.js" ></script>
        <script src="js/controllers.js"></script>
    ...
```

Then, towards the middle of the file, we use three directives: `ng-show`,
`ng-style`, and `ng-controller`. Of these, `ng-controller` is the most
important. It sets up a relationship between this div and the code in
`public/js/controllers.js`, which defines the `OrdersCtrl` function. If you
look at [public/js/controllers.js](public/js/controllers.js), it initiates an HTTP request to
`/api/orders`, and uses the results to set up variables like `num_orders`
and `total_funded`. It then uses these variables to populate the template
expressions like `{{num_orders}}`.

We use the `ng-show` directive to set up conditional logic on the basis of
whether or not the `OrdersCtrl` function call returned an error or not. If
it did not (`!error`) then we display the thermometer stats. If an error was
returned, we display an error message. Finally `ng-style` is used to apply a
CSS style to an element dynamically based on one of the variables set up by
`OrdersCtrl`, namely `percentage_funded`.

```html
  <!-- We define a new 'actions' div to contain statistics, order, and share buttons.-->
  <div class="span5 actions" ng-controller="OrdersCtrl">
    <div class="row-fluid">
    <div class="span8 offset2">
      <div class="row-fluid statistics">
        <div ng-show="!error">
          <div class="span4">
            <!-- linediv-l and linediv-r give dividing lines that look
            different in horizontal and vertical layouts, illustrating
            media queries. -->
            <div class="linediv-l">
            <h3>{{num_orders}}</h3> <p>backers</p>
            </div>
          </div>
          <div class="span4">
            <div class="linediv-c">
              <h3>{{total_funded}}</h3> <p>of {{target}} <span class="currency">{{unit_symbol}}</span></p>
            </div>
          </div>
          <div class="span4">
            <div class="linediv-r">
            <h3>{{days_left}}</h3> <p>days left</p>
            </div>
          </div>
        </div>
        <div ng-show="error">
          <h3>{{error}}</h3>
        </div>
      </div>
    </div>
    <div class="row-fluid" ng-show="!error">
    <div class="span10 offset1">
      <!-- Bootstrap progress bar -->
      <!-- http://twitter.github.io/bootstrap/components.html#progress -->
      <div class="thermometer progress active">
        <div class="bar bar-success" ng-style="{'width': percentage_funded+'%'}"></div>
        <div class="bar bar-warning" ng-style="{'width': (100-percentage_funded)+'%'}"></div>
      </div>
    </div>
    </div>
    <div class="row-fluid">
      <div class="span6 offset3 order">
        <a class="coinbase-button" 
           data-button-style="custom_large" 
           data-button-text="Preorder with Bitcoin" 
           data-custom="Finished order"
           data-code="<%= coinbase_preorder_data_code %>" 
           href="https://coinbase.com/checkouts/<%= coinbase_preorder_data_code %>">Preorder with Bitcoin</a>
      </div>
    </div>
    <div class="row-fluid">
    <div class="span9 offset3 social">
      <!-- AddThis Button BEGIN -->
      <div class="addthis_toolbox addthis_default_style">
         <a class="addthis_button_tweet" tw:via="<%= twitter_username %>" tw:text="<%= twitter_tweet %>"></a>
      </div>
      <script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=xa-5214a5fe5dbdc2b4"></script>
      <!-- AddThis Button END -->
    </div>
    </div>
  </div>
  </div>
</div>
```

To trace through the logic of how the thermometer data is populated, see the
`/api/orders` route in the next section.

# Figures

The following figures illustrate how the server-side and client-side
components of the app work together by tracing the path of the four routes
implemented in our app: `/`, `/api/order`, `/refresh_orders`, and
`/orders/`.

Warning: these figures are large. You can also download PDF versions here:
[1](https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig1.pdf), [2](https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig2.pdf), [3](https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig3.pdf),
[4](https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig4.pdf), [5](https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig5.pdf). 


## The `/` route

First, let's take a look at how an HTTP request to `example.com/` is handled
by our app. This about as simple as it gets in terms of generating a dynamic
HTTP response from an HTTP request; there's no database interaction and a
simple template is populated with some constant JSON data and returned to
the client.

<div style="text-align:center;">
  <img width="100%"
       src="https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig2.png">
</div>

## The `/orders` route

Now let's look at a more complicated route, an HTTP request to
`/orders`. This request now involves hitting the database via the ORM and
using that data to populate the `orderpage.ejs` template. This is perhaps
the most common way to generate a dynamic response.

<div style="text-align:center;">
  <img width="100%"
       src="https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig3.png">
</div>

## The `/refresh_orders` route

Now let's increase the level of complexity a little more, and show how to
implement a route that doesn't directly return an HTTP response, but that
redirects to the `/orders` route after performing a database operation.

<div style="text-align:center;">
  <img width="100%"
       src="https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig4.png">
</div>

## The `/api/orders` route

Finally, let's take a look at a fairly sophisticated route. This route is
never meant to be called directly by the end user; it's actually used by the
client-side code in the thermometer on the front page to refresh itself from
the latest set of orders in the database.

<div style="text-align:center;">
  <img width="100%"
       src="https://d396qusza40orc.cloudfront.net/startup/images/bitstarter-leaderboard/fig5.png">
</div>

