
var express  = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var http = require('https');
var request = require('request');
var requestpro = require('request-promise');
var async = require("async");
var Promise = require("bluebird");
var fs =  require("fs");
var csv = require("fast-csv");
var parse = require('csv-parse');
var Converter = require("csvtojson").Converter;
var converter = new Converter({});

var XLS = require('xlsjs');
var excel = require('xlsx');
var Imap = require('imap'),
    inspect = require('util').inspect;
var Maven = require('node-mavenlink');
var multer  = require('multer')
var dateFormat = require('dateformat');
var nodemailer = require('nodemailer');

//Global vars.
var maven_data = [];
var maven_users = [];
var paychex_data;
var stories = [];
var time_entries = [];
var maven_stories = [];
var maven_time_entries =[];
var general_users, general_stories, general_times;


var range_dates = [];
var new_data_rg = [];
var data_to_compare = [];

var user_vac = {};
var user_sick = {};
var user_reg = {};

var users_path = path.resolve(__dirname) + '/reports/maven_users.json';
var stories_path = path.resolve(__dirname) + '/reports/maven_stories.json';
var time_path = path.resolve(__dirname) + '/reports/maven_times.json';
var csv_path = path.resolve(__dirname) + '/reports/all_time_entries_sep_29_16.csv';

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'reports/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //Appending originalname .xls
  }
})

var upload = multer({ storage: storage }); //Passing path and correct name and type file


//Header & Token Access const
const headers = {
  'Authorization': '?',
  'Content-type' : 'application/x-www-form-urlencoded'
}

const token = "?";

//Application
var app = express();

//Filtering static
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.redirect("/index.html");
});

app.post('/get_file', upload.single('file'), function(req, res, next){
  console.log(req.body);
  console.log(req.file);
  if(req.file == undefined){
      res.redirect("/error.html");
  }
  res.redirect("/");

});

app.post('/get_mv_file', upload.single('file'), function(req, res, next){
  console.log(req.body);
  console.log(req.file);
  if(req.file == undefined){
      res.redirect("/error.html");
  }
  res.redirect("/");

});

app.post('/get_dates', function(req, res, next){
    //console.log(req.body);
    start_date = req.body.start;
    end_date = req.body.end;
    //firstcall_api(start_date, end_date); //Initializing and passing data to fetch specific time entries
    res.end('success');


});

//fetch emails to send
app.post('/get_emails', function(req, res, next){

    //console.log(req.body);
    if(req.body != undefined){
      email_sender(req.body);
      res.end('success');
    }


});


//Fetching workspaces, users in this first call to MavenLink API

function first_call(){
//Url Object to use
var object = {
           //Making a call to fetch workspaces form MavenLink API
           url: 'https://api.mavenlink.com/api/v1/workspaces.json?include=participants,archived',
           headers: headers
       };


   requestpro(object)
   .then(function (response) {

       var data = JSON.parse(response);
       //console.log(data);
       //Parsing response data
       for(var keys in data){
          var dataCopy = data[keys];
          //Fetching users info form mavenlink API
          if(data.users){
            //console.log(data.users);
            maven_users.push(data.users);
            }

         //Parsing data response to get the workspaces ids.
          for(data in dataCopy){
            var mainData = dataCopy[data];
            //console.log(mainData);
            //Fetchig workspaces IDs and make a dynamic call to API urls
              if(mainData.id != undefined || mainData.id != ""){
                //console.log(mainData.title);



                //Structure story url with dynamic workspaces id.
                dynamic_url = 'https://api.mavenlink.com/api/v1/stories.json?include=assignees,workspace_id='+mainData.id+',state[completed]=true'

                var stories_url = {
                  url: dynamic_url,
                  headers: headers
                }
                stories.push(stories_url);
                //secound_request(dynamic_url);

                  //Structure time_entries url with dynamic workspaces id.
                time_dynamic_url = 'https://api.mavenlink.com/api/v1/time_entries.json?workspace_id='+mainData.id
                var time_entries_url = {
                      url: time_dynamic_url,
                      headers: headers
                    }
                time_entries.push(time_entries_url);


              }
          }

       }
       //console.log(maven_users);

       //secound_request(stories, time_dynamic_url);
       write_localusers(users_path, maven_users);


   })
   .catch(function (err) {
       console.log(err);
   });

}//end function here
first_call();

//Secound request Fetching time entries & stories with dynamic urls
var secound_request = function(stories, time_dynamic_url){
console.log('-------------- Stories & Time entries --------------------->');
  //Fetching stories
  Promise.map(stories, function(obj) {
    return requestpro(obj).then(function(body) {

      return JSON.parse(body);
    });
  }).then(function(stories_results) {
    //console.log(stories_results);
    for (var i = 0; i < stories_results.length; i++) {
      // access the result's body via results[i]
      //console.log(stories_results[i]);
      maven_stories.push(stories_results[i]);

    }
    write_localstories(stories_path, maven_stories);


  }, function(err) {
    // handle all your errors here
    console.log(err);
  });


  //Fetching time_entries
  Promise.map(time_entries, function(obj) {
    return requestpro(obj).then(function(body) {
      return JSON.parse(body);
    });
  }).then(function(time_results) {
    //console.log(time_results);
    for (var i = 0; i < time_results.length; i++) {
      // access the result's body via results[i]
      //console.log(time_results[i]);
      maven_time_entries.push(time_results[i]);

    }
    write_localtimes(time_path, maven_time_entries);

    //console.log(maven_time_entries);

  }, function(err) {
    // handle all your errors here
    console.log(err);
  });



}

//Writing data dynamicly base on responses
var write_localusers = function(path, data){
  var data_towrite;

  if(data != "" && data != undefined && data != null){
    data_towrite = JSON.stringify(data);
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven users data Successfuly wrote to file.');

      }

    });

  }else{
    data_towrite = JSON.stringify("");
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven users data unsuccessfuly wrote to file.');

      }

    });

  }

}

var write_localstories = function(path, data){
  var data_towrite;

  if(data != "" && data != undefined && data != null){
    data_towrite = JSON.stringify(data);
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven stories data Successfuly wrote to file.');

      }

    });

  }else{
    data_towrite = JSON.stringify("");
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven stories data unsuccessfuly wrote to file.');

      }

    });

  }



}
var write_localtimes = function(path, data){
  var data_towrite;

  if(data != "" && data != undefined && data != null){
    data_towrite = JSON.stringify(data);
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven times entries data Successfuly wrote to file.');

      }

    });

  }else{
    data_towrite = JSON.stringify("");
    fs.writeFile(path, data_towrite,  function(err){
      if(err){
        console.log(err)
      }else{

        console.log('Maven times entries data unsuccessfuly wrote to file.');

      }

    });

  }



}
//End function to write to local files

//Reading localfiles and populate global variables to work with
localfiles = [users_path, stories_path, time_path];

async.map(localfiles, fs.readFile, function(err, files) {
    if(err) {
        throw err;
    }

    //console.log(files[1]);
    general_users = JSON.parse(files[0]);
    general_stories = JSON.parse(files[1]);
    general_times = JSON.parse(files[2]);
    //comparing_data(general_users,general_stories,general_times);

})


 //Reading and Creating range to fecth data
 var start_end = function(star, end){

   var start = new Date('2016-09-01');
    var end = new Date('2016-09-20');


    while(start < end){
       var newDate = start.setDate(start.getDate() + 1);
       start = new Date(newDate);
       range_dates.push(dateFormat(start, 'yyyy-mm-dd'));

       //console.log(start.toISOString().substring(0, 10));

    }
    range_dates.push('2016-09-20');//pass end date


 }//end function here
 start_end();

//Reading maven users localy API
var user_content = fs.readFileSync(users_path, 'utf8');

//Reading && parsing to JSON csv file
var read_csv = function(value){
var csv_path = path.resolve(__dirname) + '/reports/all_time_entries_sep_29_16.csv';

var email = '';
var user_info = JSON.parse(user_content);

converter.on("end_parsed", function (jsonArray) {
   //console.log(jsonArray); //here is your result jsonarray



   var csv_dates = jsonArray.forEach(function(value, index){
     //console.log(value);

     for(i in range_dates){
       if(value.Date == range_dates[i]){

         //console.log(value.Person+ ' dates : ', value.Date + ' task : ', value['Task/Deliverable'] );
         switch (value['Task/Deliverable']) {
           case 'Vacation':
                //Setting up email user if there is a match
                for(c in user_info){
                   for(e in user_info[c]){
                     //console.log(user_info[c][e].full_name);
                     if(value.Person == user_info[c][e].full_name){
                       email = user_info[c][e].email_address;
                     }
                   }
                 }

                if(!user_vac[value.Person]){
                  user_vac[value.Person] = {
                      Date: [],
                      timedays: [],
                      email:'',
                      task: '',
                      role: '',
                      hours : 0
                  }

                }//end if statment here
                user_vac[value.Person].Date.push(value.Date);
                user_vac[value.Person].timedays.push(value['Time in Hours']);
                user_vac[value.Person].email = email;
                user_vac[value.Person].task = value['Task/Deliverable'];
                user_vac[value.Person].role = value.Role;
                user_vac[value.Person].hours +=  value['Time in Hours'];

             break;
             case 'Sick':
                 //Setting up email user if there is a match
                 for(c in user_info){
                    for(e in user_info[c]){
                      //console.log(user_info[c][e].full_name);
                      if(value.Person == user_info[c][e].full_name){
                        email = user_info[c][e].email_address;
                      }
                    }
                  }

                if(!user_sick[value.Person]){
                    user_sick[value.Person] = {
                        Date : [],
                        timedays: [],
                        email:'',
                        task: '',
                        role: '',
                        hours : 0
                    }

                }//end if statement
                user_sick[value.Person].Date.push(value.Date);
                user_sick[value.Person].timedays.push(value['Time in Hours']);
                user_sick[value.Person].email = email;
                user_sick[value.Person].task = value['Task/Deliverable'];
                user_sick[value.Person].role = value.Role;
                user_sick[value.Person].hours += value['Time in Hours'];

               break;
           default:

           //Setting up email user if there is a match
           for(c in user_info){
              for(e in user_info[c]){
                //console.log(user_info[c][e].full_name);
                if(value.Person == user_info[c][e].full_name){
                  email = user_info[c][e].email_address;
                }
              }
            }

           if(!user_reg[value.Person]){
               user_reg[value.Person] = {
                 Date : [],
                 timedays: [],
                 email:'',
                 task: [],
                 role: '',
                 hours : 0
               }
           }//end is statement

           user_reg[value.Person].Date.push(value.Date);
           user_reg[value.Person].timedays.push(value['Time in Hours']);
           user_reg[value.Person].email = email;
           user_reg[value.Person].task.push(value['Task/Deliverable']);
           user_reg[value.Person].role = value.Role;
           user_reg[value.Person].hours += value['Time in Hours'];

         }//end switch here


       }//end if statment


     }



   });
   //console.log(user_vac);
   //console.log(user_sick);
   //console.log(user_reg);
   populate_view(user_vac,user_sick,user_reg,paychex_data)

});

//read from file
fs.createReadStream(csv_path).pipe(converter);


}//end function here
read_csv();


//Reading excel file
var readExcel = function(req, res, next){
 var in_path = path.resolve(__dirname) + '/reports/all_time_entries_sep_29_16.xlsx';
 var workbook = excel.readFile(in_path);
 var sheet_name_list = workbook.SheetNames;

 //Parsing file to Json
 sheet_name_list.forEach(function(y) {
     var worksheet = workbook.Sheets[y];
     var headers = {};
     var data = [];
     for(z in worksheet) {
         if(z[0] === '!') continue;
         //parse out the column, row, and value
         var col = z.substring(0,1);
         var row = parseInt(z.substring(1));
         var value = worksheet[z].v;

         //store header names
         if(row == 1) {
             headers[col] = value;
             continue;
         }

         if(!data[row]) data[row]={};
         data[row][headers[col]] = value;
     }
     //drop those first two rows which are empty
     data.shift();
     data.shift();
     maven_times_data = data;
     //console.log(data);

 });



}
//readExcel();

//Redint XLS file
var readExcelXLS = function(req, res, next){
  var in_path2 = path.resolve(__dirname) + '/reports/Weekly Summary of Hours.xls';
  var workbook = XLS.readFile(in_path2);
  var worksheet = workbook.Sheets['Sheet1'];
  var sheet_name_list = workbook.SheetNames;
  
  //Parsing file to Json
  sheet_name_list.forEach(function(y) {
      var worksheet = workbook.Sheets[y];
      var headers = {};
      var data = [];
      for(z in worksheet) {
          if(z[0] === '!') continue;
          //parse out the column, row, and value
          var col = z.substring(0,1);
          var row = parseInt(z.substring(1));
          var value = worksheet[z].v;

          //store header names
          if(row == 1) {
              headers[col] = value;
              continue;
          }

          if(!data[row]) data[row]={};
          data[row][headers[col]] = value;
      }
      //drop those first two rows which are empty
      data.shift();
      data.shift();

      //console.log(data);

  });


  //console.log(data); //displaying requested data in object.
  var obXLS = XLS.utils.sheet_to_json(worksheet);
  //console.log(obXLS);
  paychex_data = obXLS;

}
readExcelXLS();



//Posting Data to Maven
var apirequest = function(req, res, next){
  var data = [];
  var maven = new Maven(token);

  body = {"time_entries": [{"date_performed": "", "created_at": "", "updated_at": "", "workspace_id": 11713187, "date_performed": "2016-09-19", "time_in_minutes": 100, "billable": "", "notes": "Testing Entrie", "rate_in_cents":"", "story_id":130412197, "user_id": 6295827 }]}

  var options = {
  method: 'post',
  body: JSON.stringify(body), // Javascript object
  json: true, // Use,If you are sending JSON data
  url: 'https://api.mavenlink.com/api/v1/time_entries.json',
  //Lets post the following key/values as form
    json: { key: 'time_entries' },
  headers: {
    'Authorization': '?',
    'Content-type' : 'application/x-www-form-urlencoded',

  }
}


request(options, function (err, res, body) {
  if (err) {
    console.log('Error :', err)

  }
  console.log(' Body :', body)


});

/**Users here***/
maven.get('account_memberships.json', function(err, stories){
    if(err) {
        console.log(err);
    } else {

        //Do stuff with users
        console.log(stories);

    }
});


}
//apirequest();
var regular;
//Sending data reults to controller
function populate_view(vacation, sick, reg, paychex){
  //console.log(compared);
    regular = reg;
    app.post('/get_result', function (req, res, next) {
    res.json({'status' : 200, 'data': vacation, sick, reg, paychex});
  });

}



//Sending Emails
var email_sender = function(names){
var user_list = {};
var dynamic_email = names;

//console.log(dynamic_email);
  //Reading maven users localy API

    for(details in regular){

      for(email  in dynamic_email){
        //console.log(dynamic_email[email]);
        for(user_email in dynamic_email[email]){
          //console.log(dynamic_email[email][user_email]);
          //console.log(details);
          if(regular[details].email == dynamic_email[email][user_email]){

            if(!user_list[regular[details].role]){
              user_list[regular[details].role] = {
                user_name : []
              }
            }
            user_list[regular[details].role].user_name.push(details);
          }

          //console.log(current_user);
        }
      }


    }
  console.log(user_list);
  //send_mail();
}

var send_mail = function(){


  //Sending multiples emails at onece
  var listofemails = ["hgarcia@inhance.com","jlaslett@inhance.com","iwong@inhance.com"];
   // Will store email sent successfully.
  var success_email = [];
   // Will store email whose sending is failed.
   var failure_email = [];
   var transporter;

   transporter = nodemailer.createTransport({
          host: "east.exch029.serverdata.net",
          port: 25,
          //secure: true, // use SSL
          auth: {
              user: "maven@inhance.com",
              pass: "#gx3rX&8"

          }
      });

      // setup e-mail data with unicode symbols
      var mailOptions = {
  // sender address
          from: 'maven@inhance.com',
  // list of receivers
          to: 'hgarcia@inhance.com',
  // Subject line
          subject: 'Testing test ✔',
  // plaintext body
          text: 'It works! ✔',

      };


      // send mail with defined transport object
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                  console.log(error);
              }else{
                  console.log('Message sent: ' + info.response);
              }
          });



}


app.listen(3000, function(){
  console.log('Server running in port 3000');
});
