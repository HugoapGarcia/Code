// DEFINE DEPENDENCIES
const express  = require('express');
const bodyParser = require('body-parser');
const WebSocketServer = require('ws').Server;
const http = require('http');
const https = require('https');
const USERS = require('./back-end/controller/getUsers');
// DEFINE PORT
const port = process.env.PORT || '3000';

// START EXPRESS
let app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
//app.use('/', require('./back-end/routes/api'));

app.set('port', port);

var test = {username: 'browse-1234', password:'hugo', firstName:'hugo', lastName:'HG', connectionId:'browse-1234'}
var login = {username:'browse-1234', password:'hugo'}
var opps = USERS.setUserSignUp(test)
console.log(opps)

let server = http.createServer(app, (request, response) => {
  console.log(`new Date() Received request for request.url`);
  response.writeHead(404);
  response.end();
});

server.listen(port, () => console.log(new Date(), `Server is listening on port ${port}`));

// CREATING A WEBSOCKET SERVER AT PORT 900
var wss = new WebSocketServer({ server: server, autoAcceptConnections: true });

//ALL CONNECTED TO THE SERVER USERS
var users = {};

// When user connets to server
wss.on('connection', function(connection) {
   console.log("\nUser connected : \n");
   // When server gets a message from a connected user
   connection.on('message', function(message) {
	 console.log('received: %s\n', message);
      var data;

      // Accepting only JSON messages
      try {
         data = JSON.parse(message);
      } catch (e) {
         console.log("Invalid JSON");
         data = {};
      }

      // Switching command of the user message
      switch (data.command) {
         // When a user tries to login
         case "login":
            // If anyone is logged in with this username then refuse
            if(users[data.name]) {
              let userRefuse = {command: "login", success: false, description: "User already logged in"};
              sendTo(connection, userRefuse);
            } else {
        			 // Broadcast the message to all online users in the room
        				for(var key in users)
        				{
                  let broadcast = {command: "newMember", description: data.name}
                  sendTo(users[key], broadcast);
        				}
               // Save user connection on the server and DB
               users[data.name] = connection;
               connection.name = data.name;
               let saveUserLoggedIn = {command:"login", success:true};
               // Create a route to send data to mongo here ....
               sendTo(connection, saveUserLoggedIn);
               //USERS.getUserSignUp(connection, data);
            }

         break;

         case "offer":
            // For ex. UserA wants to call UserB
			      console.log("Sending offer from : ", connection.name);
            console.log("Sending offer to   : ", data.name);

            //if UserB exists then send him offer details
            var conn = users[data.name];

            if(conn != null) {
               // Setting that UserA connected with UserB
               connection.otherName = data.name;
               let userOfferConnection = {command: "offer", offer: data.offer, name: connection.name};
               sendTo(conn, userOfferConnection);
            }

         break;

         case "answer":
            console.log("Sending answer to: ", data.name);
            //for ex. UserB answers UserA
            var conn = users[data.name];

            if(conn != null) {
               connection.otherName = data.name;
               let userAnswerConnection = {command: "answer", answer: data.answer};
               sendTo(conn, userAnswerConnection);
            }

         break;

		     case "browse":

      			var conn = users[data.name];
      			var memberList = [];
      			var index = 0 ;
      			for(var key in users)
      			{
      				memberList.push(key);
      			};
      			console.log("Users Online: " + memberList);
      			if(conn != null) {
              let userBrowse = {command: "usersOnline", usersOnline: memberList};
              sendTo(conn, userBrowse);
            }

    		 break;

         case "candidate":
            console.log("Sending candidate to:",data.name);
            var conn = users[data.name];

            if(conn != null) {
              let candidateSend = {command: "candidate", candidate: data.candidate, sdpMLineIdx: data.sdpMLineIdx, sdpMid: data.sdpMid};
              sendTo(conn, candidateToSend);
            }

         break;

         case "userDisconnected":
            console.log("Disconnecting from ", data.name);
            var conn = users[data.name];
            // Notify the other user so he can disconnect his peer connection
            if(conn != null) {
      				if(conn.otherName){
        					delete users[conn.otherName];
        					conn.otherName = null;
				       }
               	sendTo(conn, {
                  "command": "closeOut"
              	});

              for(var key in users)
      				{
      					delete users[key];
      				}
          }

         break;

         default:
         let errorMsg = {command:"error", message: "Command not found: " + data.command};
         sendTo(connection, errorMsg);

         break;
      }

   });

   // When user exits, for example closes a browser window
   // This may help if we are still in "offer","answer" or "candidate" state
   connection.on("close", function() {

      if(connection.name) {
         delete users[connection.name];

         if(connection.otherName) {
            console.log("Disconnecting from ", connection.otherName);
            var conn = users[connection.otherName];

            if(conn != null) {
               sendTo(conn, {
                  "command": "closeOut",
               });
            }
         }
      }

   });

   //connection.send("Hello from Inhance Signaling Server");
});

function sendTo(connection, message) {
   connection.send(JSON.stringify(message));
}
