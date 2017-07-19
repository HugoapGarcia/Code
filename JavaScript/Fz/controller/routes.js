/*
*    Original author: Hugo Garcia , 10/01/2016
*    Client name: ?
*    Project name: ? Copyright (c) 2017 [?]
*    Project number: 16_050
**/

// Imports external dependencies
var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');
var path = require('path');
var multer = require('multer');
var network = require('net');

// Glogal variable
var data = {};

// Costumazing the save img ads localy with the original name and type
var storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './front-end/img/ads');
    },
    filename: function (request, file, callback) {
        console.log(file);
        callback(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

// Save img dishes localy with the original name and type
var storage_dishes = multer.diskStorage({
    destination: function(request, file, callback) {
        callback(null, './front-end/img/dishes/img');
    },
    filename: function(request, file, callback) {
        console.log(file +' action for dishes');
        callback(null, file.originalname)
    }
});

var uploadDishes = multer({
    storage: storage_dishes
});

// Imports/initializes internal dependencies
var crud    = require('../_utils/crud');
var models  = crud.modelsUtil.models;
var router  = crud.routesUtil.router;
var Schema  = mongoose.Schema;
var schedule = new Schema(require('../models/schedule'));
var campaign = new Schema(require('../models/campaign'));
var machines = new Schema(require('../models/machine'));
var punch    = new Schema(require('../models/punch'));
mongoose.model('Schedule', schedule);
mongoose.model('Campaign', campaign);
mongoose.model('Machine', machines);
mongoose.model('Punch', punch);
var Schedule  = mongoose.model('Schedule');
var Campaign  = mongoose.model('Campaign');
var Machine   = mongoose.model('Machine');
var Punch     = mongoose.model('Punch');

// Sets up user authentication functionality
var usersUtil = require('../_utils/usersUtil');


// Sets up all custom controllers/routes
router.put('/tickets/:ticket', function(req, res, next) {
    var ticket = req.ticket;
    console.log(ticket);
    ticket.delivered = true;

    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });
});

// Updating merge ticket selected
router.put('/tickets/:ticket/merge', function(req, res, next) {
    var ticket = req.element;
    // console.log(req.element);
    // console.log('ticket : ',ticket);
    ticket.price = req.body.price;
    ticket.items = req.body.items;

    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });
});

// Remove ticket was merged
router.delete('/tickets/:ticket', function(req, res, next) {
    req.element.remove(function(err) {
        if(err){ console.log(err); }

        res.json({});
    });
});

//  Updating ticket paid or inbalance
router.put('/tickets/:ticket/transactions', function(req, res, next) {
    var ticket  = req.element;
    ticket.transactions = req.body.transactions;
    ticket.paid =  req.body.paid;
    ticket.imbalance = req.body.imbalance;

    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });
});

// Updating items void
router.put('/items/:item/voidItems', function(req, res, next) {
    var item = req.element;

    item.void = req.body.void;
    item.save(function(err, item) {
        if(err){ console.log(err); }

        res.json(item);
    });
});

// Updating items untaxable
router.put('/items/:item/untaxableItems', function(req, res, next) {
    var item = req.element;

    item.untaxable = req.body.untaxable;
    item.save(function(err, item) {
        if(err){ console.log(err); }

        res.json(item);
    });
});

// Updated ticket discount
router.put('/tickets/:ticket/discounts', function(req, res, next) {
    var ticket = req.element;
    ticket.discounts = req.body.discounts;

    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });
});

// Updated items...
router.post('/items/:item', function(req, res, next) {

   var item = req.element;
    item.location = req.body.location;
    item.save(function(err, item) {
        if(err){ console.log(err); }

        models['item']
          .findById(item._id)
          .populate('route dish')
          .exec(function(err, item){
            if(err){ return next(err); }

            var socketio = req.app.get('socketio');
            socketio.sockets.emit('item-updated', item);

            res.json(item);
          });
    });
});

// Return all in items collection
router.get('/items', function(req, res, next) {
  models['item']
    .find()
    .populate('route dish')
    .exec(function(err, items){
      if(err){ return next(err); }

      res.json(items);
    });
});


router.get('/tickets', function(req, res, next) {
  models['ticket']
    .find({ 'items.0': { '$exists': true } })
    .populate({
        path: 'items',
        populate: {
            path: 'dish'
        }
    })
    .exec(function(err, tickets){
      if(err){ return next(err); }

      res.json(tickets);
    });
});

// Return all open tickets
router.get('/tickets/open', function(req, res, next) {
  models['ticket']
    .find({open: true})
    .populate({
        path: 'items',
        populate: {
            path: 'dish'
        }
    })
    .exec(function(err, tickets){
      if(err){ return next(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('got.tickets.open', tickets);

      res.json(tickets);
    });
});

// Return all undelivered tickets
router.get('/tickets/undelivered', function(req, res, next) {
  models['ticket']
    .find({delivered: false})
    .populate({
        path: 'items',
        populate: {
            path: 'dish'
        }
    })
    .exec(function(err, tickets) {
      if(err){ return next(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('got.tickets.open', tickets);

      res.json(tickets);
    });
});

// Return new ticket created
router.post('/tickets', function(req, res, next) {
  var ticket = new models['ticket'](req.body);
//console.log('In post method : ', ticket);
  ticket.save(function(err, ticket) {
      if(err){ console.log(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('new-ticket', ticket);

      res.json(ticket);
    });
});

// Register cash flow
router.post('/regiters', function(req, res, next) {
  var register = new models['register'](req.body);

  register.save(function(err, register) {
    if(err){console.log(err);}

    var socketio =  req.app.get('socketio');
    socketio.sockets.emit('new-register', register);

    res.json(register);

  });

});

// Updating registers cashflow in db
router.put('/registers/:register/cashflow', function(req, res, next) {
    var register  = req.element;
    register.cash = req.body;
    register.save(function(err, register) {
        if(err){ console.log(err); }

        res.json(register);
    });


});

// Updating register drawer flow
router.put('/registers/:register/drawerflow', function(req, res, next) {
    var register  = req.element;
    register.drawer = req.body.drawer;
    register.save(function(err, register) {
        if(err){ console.log(err); }

        res.json(register);
    });

});

// Splited check
router.post('/splitcheck', function(req, res, next) {
    var order = req.body;
    var items = order.data['items'];
    var ticket = order.data['ticket'];
    ticket['items'] = [];

    _.each(items, function(inputItem, i) {
        var item = new models['item'](inputItem);

        item.save(function(err, item) {
            if(err){ console.log(err); }

            models['item']
                .findById(item._id)
                .populate('route dish')
                .exec(function(err, newItem) {
                    if(err){ console.log(err); }
                    if (!newItem) { console.log(new Error('can\'t find item')); }

                    var socketio = req.app.get('socketio');
                    socketio.sockets.emit('new-item', newItem);
                });


            ticket['items'].push(item['_id']);

            if (i === items.length - 1) {
                var newTicket = new models['ticket'](ticket);

                newTicket.save(function(err, ticket) {
                    if(err){ console.log(err); }

                    models['ticket']
                      .findById(ticket._id)
                      .populate({
                          path: 'items',
                          populate: {
                              path: 'dish'
                          }
                      })
                      .exec(function(err, ticket){
                        if(err){ return next(err); }

                        var socketio = req.app.get('socketio');
                        socketio.sockets.emit('new-ticket', ticket);

                        res.json(ticket);
                      });
                });
            }
        });
    });

});

// Updated the splited original check..
router.put('/tickets/:ticket/items_splitedcheck', function(req, res, next) {
    var ticket = req.element;

    ticket.items = req.body.items;

    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });


});

// CheckOut check
router.put('/tickets/:ticket/checkOut', function(req, res, next) {
    var ticket  = req.element;
    ticket.open = req.body.open;
    ticket.cash = req.body.currentUser.cash;
    ticket.username   = req.body.currentUser.username;
    ticket.imbalance  = req.body.currentUser.imbalance;
    ticket.registerNum= req.body.regNum;
    //console.log(req.body);
    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });

});

// ReOpen check
router.put('/tickets/:ticket/reOpen', function(req, res, next) {
    var ticket = req.element;
    ticket.open = req.body.open;
    ticket.save(function(err, ticket) {
        if(err){ console.log(err); }

        res.json(ticket);
    });


});

// Return all diches open for table view
router.get('/dishes/table', function(req, res, next) {
  models['dish']
    .find()
    .populate('connections.route')
    .sort('seq')
    .exec(function(err, dishes){
      if(err){ return next(err); }

      res.json(dishes);
    });
});

// Return all courses open for table view
router.get('/courses/seq', function(req, res, next) {
  models['course'].find().sort('seq').exec(function(err, courses) {
    if(err){ return next(err); }

    res.json(courses);
  });
});

// Return all routes active
router.get('/routes/active', function(req, res, next) {
  models['route'].find({archived: {$ne: true}}).exec(function(err, routes){
    if(err){ return next(err); }

    res.json(routes);
  });
});

// Return all groups active
router.get('/groups', function(req, res, next) {
  models['groups'].find().exec(function(err, element){
    if(err){ return next(err); }

    res.json(element);
  });
});

// Return journal collection
router.get('/journal', function(req, res, next){

  models['journal'].find().exec(function(err, elements){
    if(err){ return next(err); }

    res.json(elements);
  });
});

// Return all orders active
router.post('/orders', function(req, res, next) {

    var order = req.body;
    var items = order['items'];
    var ticket = order['ticket'];

    ticket['items'] = [];

    _.each(items, function(inputItem, i) {
        var item = new models['item'](inputItem);

        item.save(function(err, item) {
            if(err){ console.log(err); }

            models['item']
                .findById(item._id)
                .populate('route dish')
                .exec(function(err, newItem) {
                    if(err){ console.log(err); }
                    if (!newItem) { console.log(new Error('can\'t find item')); }

                    var socketio = req.app.get('socketio');
                    socketio.sockets.emit('new-item', newItem);
                });


            ticket['items'].push(item['_id']);

            if (i === items.length - 1) {
                var newTicket = new models['ticket'](ticket);

                newTicket.save(function(err, ticket) {
                    if(err){ console.log(err); }

                    models['ticket']
                      .findById(ticket._id)
                      .populate({
                          path: 'items',
                          populate: {
                              path: 'dish'
                          }
                      })
                      .exec(function(err, ticket){
                        if(err){ return next(err); }

                        var socketio = req.app.get('socketio');
                        socketio.sockets.emit('new-ticket', ticket);

                        res.json(ticket);
                      });
                });
            }
        });
    });
});

// Retriving schedule elements here..
router.get('/schedule', function(req, res, next){

    Schedule.find({}, function(err, elements){
      if(err){console.log(err);}

      res.json(elements);

    });

});

// Populate schedules collection
router.post('/schedule', function(req, res, next){

  var schedule = new models['schedule'](req.body);

  schedule.save(function(err, schedule) {
      if(err){ console.log(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('new-dish', schedule);

      res.json(schedule);
    });


});


// Return schedule dishes active
router.put('/schedule/:schedule', function(req, res, next) {

    var element = req.element;
    //console.log(element);

    element = _.extend(element, req.body);

    element.save(function(err, element) {
        if(err){ console.log(err); }

        res.json(element);
    });

});

// Populate campaigns collection
router.post('/campaign', function(req, res, next){
  var campaign = new models['campaign'](req.body);

  campaign.save(function(err, campaign) {
      if(err){ console.log(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('new campaign', campaign);

      res.json(campaign);
    });


});

// Retriving campaigns elements here..
router.get('/campaign', function(req, res, next){

    Campaign.find({}, function(err, elements){
      if(err){console.log(err);}

      res.json(elements);

    });

});

// Saving ads images in local storage.
router.post('/upload', upload.single('file'), function (req, res) {
    if(req.file !=undefined){
      console.log('saved as : ', req.file) // form files
    }else{
      console.log(req.body) // form fields
    }
    res.status(204).end()
});

// Saving dishes images in local directory.
router.post('/uploadDishes', uploadDishes.single('file'), function(req, res) {
    if (req.file != undefined) {
        console.log('saved as : ', req.file) // form files
    } else {
        console.log(req.body) // form fields
    }
    res.status(204).end()
});


// Calling attendant
router.all('/callattendant', function (req, res) {
   console.log(req.method)

    if(req.method === 'POST'){
          console.log(req.body); // form fields
          data = req.body;
          res.json(data);
          res.status(204).end()
    }
    if(req.method === 'GET'){
          console.log(data);
          res.send(data);
    }

});

/*
*    Function name: getPrinter
*    Arguments: int
*    Return type: int
*    Main purpose: Returns print number if there is one in the network
**/
// Creating a theme for printing receipt
var template = 'dpX.fuduzu.lan';
function getPrinter(printNum)
{
	try
	{
		var printer = 'dp1.fuduzu.lan';

		if (printNum) { printer = template.replace('X', printNum);}
		console.log('>' + printer + '<');
		return printer;
	}
	catch (e)
	{
		console.log(arguments.callee.name + ': ' + e.message);
		return printer;
	}
}

// Print label for drinks.
router.post('/label', function (req, res) {
    var socket = network.Socket();

    //console.log(req.body);
    var printer  = req.body.printer;


        // Build a label
    	var labtext = "^XA^CFA,24";
    	var yoff = 20;	// starting Y offset
    	var xoff = 2;

    	var labelprinter = getPrinter(printer);

    	for ( var fld in req.body.drink ) {

    		labtext += "^FO"+xoff+","+yoff+"^FD"+req.body.drink[fld]+"^FS";
    		yoff += 30;
    	}


    	labtext += "^XZ";

      socket.connect(9100, labelprinter, function() {
      	console.log('Connected');
      	socket.write(labtext);
        socket.end;
      });


        socket.on('data', function(data) {
        	console.log('Received: ' + data);
        	//socket.destroy(); // kill client after server's response
        });

        // socket.on('close', function() {
        // 	console.log('Connection closed');
        // });
        socket.on('error', function(e){
			  console.log(e.toString());
		});

        res.json(labtext);
        //res.status(204).end();
         res.statusCode = 200;
	    res.end('{}');
        return;
});

// Retriving campaigns elements here..
router.get('/where', function(req, res, next){
  //var current_ip_address = req.connection.remoteAddress.substring(req.connection.remoteAddress.lastIndexOf(':') + 1);
  //console.log('IP Device : ', current_ip_address);
    var current_ip_address = '192.168.151.136';

    Machine.find({IP:current_ip_address}, function(err, elements){
      if(err){console.log(err);}
      if(Machine){
        console.log('Successful connection');
      }
      res.json(elements);

    });

});

// Retrinving User Status from Register view
router.all('/journalreport', function (req, res) {
   //console.log(req.method)

    if(req.method === 'POST'){
          //console.log(req.body); // form fields
          data = req.body;
          res.json(data);
          res.status(204).end()
    }
    if(req.method === 'GET'){
          console.log(data);
          res.send(data);
    }

});

// Saving machine battery status.
router.post('/machines_battime', function(req, res, next){
  var response = {
    _id: req.body.id,
    level : req.body.level,
    plugged: req.body.isPlugged
  }
  //console.log(response.level);

  Machine.findOne({_id:response._id}, function(err, machine){
    if(err){
      res.status(500);
      res.send('Error archiving battery status');
    }
    else if(!machine) {
      res.status(500);
      res.send('Machine could not be found');
    }
    else {
      machine.battime = response.level;
      machine.save();
      res.end('done');
    }
  });

});


// Saving user punches.
router.post('/punch', function(req, res, next){
  var response = req.body;
  var punch = new models['punch'](response);

  punch.save(function(err, punch) {
      if(err){ console.log(err); }

      var socketio = req.app.get('socketio');
      socketio.sockets.emit('new punch', punch);

      res.json(punch);
    });


});

// Archived user punches
router.put('/archivePunch', function(req, res, next){

  //console.log(req.query);
  Punch.findOne({_id:req.query.punch}, function(err, punch){
    if(err){
      res.status(500);
      res.send('Error archiving punch');
    }
    else if(!punch) {
      res.status(500);
      res.send('Punch could not be found');
    }
    else {
      punch.active = false;
      punch.save();
      res.end('done');
    }
  });
});

// Return all punches active
router.get('/punch', function(req, res, next){
  Punch.find({}, function(err, elements){
    if(err){console.log(err);}

    res.json(elements);

  });

});

// Revise user punches
router.get('/resivePunch', function(req, res, next){

  //console.log(req.query);
  Punch.findOne({_id:req.query.punch}, function(err, punch){
    if(err){
      res.status(500);
      res.send('Error archiving punch');
    }
    else if(!punch) {
      res.status(500);
      res.send('Punch could not be found');
    }
    else {
      punch.date = req.query.date;
      punch.save();
      res.end('done');
    }
  });
});





router.get('/', function(req, res, next) { res.render('_config', { title: 'Fuduzu' }); });
module.exports = router;
