/*
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates
* and open the template in the editor.
*/

var express = require('express');
var router = express.Router();
var path = require('path');
var filestream = require('fs');
var token;

var checkValid = function(req, res, next){
    //(req.query.token) ? next() : res.redirect('/login');
    var filePath = path.join(__dirname, '../', 'users/users.json');
    var users = JSON.parse(filestream.readFileSync(filePath, 'utf8'));
    users = users.users;


    for(var user in users){

      var minute = 60 * (1000 * 30); //put this code to set the time to 30min - > 60 * (1000 * 30);
      if(users[user].username == req.body.username && users[user].password == req.body.password && users[user].category === 'admin'){
          res.cookie('is_valid', true, {maxAge: minute});
          res.cookie('is_admin', true, {maxAge: minute});
          token = true;
          res.redirect('/edit');
          return; // exit function will not read default values below
      }else{
        if(users[user].username == req.body.username && users[user].password == req.body.password){
          res.cookie('is_valid', true, {maxAge: minute});
          res.cookie('is_admin', false, {maxAge: minute});
          token = false;
          res.redirect('/edit');
          return; // exit function will not read default values below
        }

      }

    }
    // default values no valid user no admin cookie and send response to invalid user
    res.cookie('is_valid', false, {maxAge: minute});
    res.cookie('is_admin', false, {maxAge: minute});
    res.send({data: false}); //If change the value to true -> Remember to past false here to make cookie to work...


}

router.get('/login', function(req, res, next){
   res.sendFile(path.join(__dirname, '../public/views/', 'admin.html'));
});

router.get('/', function(req, res, next){
   res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

router.get('/menu', function(req, res, next){
   res.sendFile(path.join(__dirname, '../public/views/', 'cumminscontroller.html'));
});

/*router.get('/bundle.js', function(req, res, next){
    res.sendFile(path.join(__dirname, '../', 'bundle.js'));
});
router.get('/profile.js', function(req, res, next){
    res.sendFile(path.join(__dirname, '../', 'profile.js'));
});*/
router.get('/edit', function(req, res, next){
  if(req.cookies.is_valid === 'true'){
      //console.log(req.cookies);
      res.sendFile(path.join(__dirname, '../public/views/', 'edit.html'));
      return;
  }
  res.redirect('/login');
    //res.sendFile(path.join(__dirname, '../public/views/', 'edit.html'));

});

router.post('/admin', checkValid);

router.get('/get_content', function(req, res, next){
   var content,mastcontent;

    var filePath = path.join(__dirname, '../public/', 'content/default.json');
    var defaultPath = path.join(__dirname, '../public/', 'content/default2.json');

    switch (token) {
      case true:
      mastcontent = JSON.parse(filestream.readFileSync(filePath, 'utf8'));
      res.json({'status': 200, 'data': mastcontent});
        break;
        case false:
        content = JSON.parse(filestream.readFileSync(defaultPath, 'utf8'));
        res.json({'status': 200, 'data': content});
          break;
      default:
      mastcontent = JSON.parse(filestream.readFileSync(filePath, 'utf8'));
      res.json({'status': 200, 'data': mastcontent});
    }


});

/*Submiting the Specs Updated data to Json File..*/
router.get('/submit_content', function(req, res, next){
var PathFile;

  if(token){
     PathFile = path.join(__dirname, '../public/', 'content/default.json');
  }else{
    PathFile = path.join(__dirname, '../public/', 'content/default.json');
  }


        console.log('req recived!!');

        var content = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        var Specs;
        //console.log(newData);
        switch (newData.maintitle) {
          case "B6.7":

              Specs = {
                "Name" : newData.maintitle,
                "Version" : newData.subtitle,
                "Advertised Horsepower" : newData["Advertised Horsepower"],
                "Peak Torque" : newData["Peak Torque"],
                "Governed Speed" : newData["Governed Speed"],
                "Clutch Engagement Torque" : newData["Clutch Engagement Torque"],
                "Cylinders" : newData["Cylinders"],
                "System Weight" : newData["System Weight"],
                "Engine (Dry)" : newData["Engine (Dry)"],
                "Aftertreatment System" : newData["Aftertreatment System"]
              }

            break;
          case "X15":
              Specs = {
                "Name" : newData.maintitle,
                "Version" : newData.subtitle,
                "Advertised Horsepower" : newData["Advertised Horsepower"],
                "Peak Torque" : newData["Peak Torque"],
                "Governed Speed" : newData["Governed Speed"],
                "Clutch Engagement Torque" : newData["Clutch Engagement Torque"],
                "Cylinders" : newData["Cylinders"],
                "System Weight" : newData["System Weight"],
                "Engine (Dry)" : newData["Engine (Dry)"],
                "Aftertreatment System" : newData["Aftertreatment System"]
              }

            break;
          default:
          Specs = {
            "Name": newData.maintitle,
            "Version": newData.subtitle,
            "Engine Type": newData["Engine Type"],
            "Displacement": newData["Displacement"],
            "Bore and Stroke": newData["Bore and Stroke"],
            "Oil System Capacity": newData["Oil System Capacity"],
            "Coolant Capacity": newData["Coolant Capacity"],
            "Length": newData["Length"],
            "Width": newData["Width"],
            "Height": newData["Height"],
            "Wet Weight": newData["Wet Weight"],
            "Power": newData["Power"],
            "Torque": newData["Torque"]
          }
        }

        console.log(newData.HideSpot);

        var HotspotstoHide = {
          hide: newData.HideSpot
        };
        var InfographicstoHide = {
          hide : newData.HideInfo
        };

        var HeaderandSubheader = {
          Header : newData.HeaderInfo,
          Subheader : newData.SubHeadInfo
        };
        var EnginestoHide = {

          hide : newData.EnginesHide
        };

        var ButtontoHide = {

          hide : newData.ButtontoHide
        };

        //console.log(HotspotstoHide);

        //content.titles = titles;
        content.EnginetoHide = EnginestoHide;
        content.HeaderstoHide = HeaderandSubheader;
        content.HotspotstoHide= HotspotstoHide;
        content.InfographicstoHide = InfographicstoHide;
        content.ButtontoHide = ButtontoHide;
        content.Specs[newData.Id] = Specs;


        filestream.writeFile(PathFile, JSON.stringify(content, null, 4), function(err){
               if(err) {
                  console.log(err);
                  res.json({'data': 'error'});
               } else {
                   console.log("JSON saved to " + PathFile);
                   res.json({'data': 'success'});
               }
        });



});

/*Submiting HotSpots Updated data to Json File*/
router.get('/submit_hotspots', function(req, res, next){

  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var content = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));




var newData = req.query;
console.log(newData);

   var Hotspots = {
     Image : newData.Image,
     Name : newData.Name,
     Text : newData.Text,
   }


   content.Hotspots[newData.HotId] = Hotspots;


/*Dont forget to Uncomment this part to writh the changes to json fiel*/

 filestream.writeFile(PathFile, JSON.stringify(content, null, 4), function(err){
    if(err) {
       console.log(err);
       res.json({'data': 'error'});
    } else {
        console.log("JSON saved to " + PathFile);
        res.json({'data': 'success'});
    }
  });

});

/*Submiting General Tier4Final Updated data to Json File*/
router.get('/submit_general', function(req, res, next){

  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentTr = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));




var newData = req.query;
console.log(newData);

   var General = {
     Name : newData.Name,
     Subname : newData.Subname,
     "What Is Tier 4 Final?": newData["What Is Tier 4 Final?"],
     "Meeting The Challenge" : newData["Meeting The Challenge"],
     "What is Tier 4 Final?" : newData["What is Tier 4 Final?"]

   }

   var GeneraltoHide = {
     hide : newData.HideGeneral
   }


 //console.log(GeneraltoHide);
   contentTr.GeneraltoHide["56f41c4389cfca5821ed3253"] = GeneraltoHide;
   contentTr.Tier4Final[newData.GeneralId] = General;


/*Dont forget to Uncomment this part to writh the changes to json fiel*/

 filestream.writeFile(PathFile, JSON.stringify(contentTr, null, 4), function(err){
    if(err) {
       console.log(err);
       res.json({'data': 'error'});
    } else {
        console.log("JSON saved to " + PathFile);
        res.json({'data': 'success'});
    }
  });

});


/*Submiting General SCR Updated data to Json File*/
router.get('/submit_scr', function(req, res, next){

  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentscr = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));


var newData = req.query;
console.log(newData);

   var GeneralSCR = {
     Name : newData.Name,
     Subname : newData.Subname,
     "Selective Catalytic Reduction (SCR)": newData["Selective Catalytic Reduction (SCR)"],
     "Diesel Exhaust Fluid (DEF)" : newData["Diesel Exhaust Fluid (DEF)"],
     "SCR System" : newData["SCR System"]

   }

   var GeneraltoHide = {
     hide : newData.HideGeneral
   }
//console.log(content.Tier4Final[newData.GeneralId].Name);
   contentscr.GeneraltoHide["56f41c4389cfca5821ed3253"] = GeneraltoHide;
   contentscr.SCR[newData.GeneralId] = GeneralSCR;


/*Dont forget to Uncomment this part to writh the changes to json fiel*/

filestream.writeFile(PathFile, JSON.stringify(contentscr, null, 4), function(err){
    if(err) {
       console.log(err);
       res.json({'data': 'error'});
    } else {
        console.log("JSON saved to " + PathFile);
        res.json({'data': 'success'});
    }
  });



});

router.get('/submit_customer', function(req, res, next){
  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentcs = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        console.log(newData);

           var GeneralCustomer = {
              Name : newData.Name,
              Subname : newData.Subname,
             "Customer Care": newData["Customer Care"],
             "Distributor Network" : newData["Distributor Network"],
             "The Cummins Remanufacturing Process" : newData["The Cummins Remanufacturing Process"]

           }

           var GeneraltoHide = {
             hide : newData.HideGeneral
           }
        //console.log(content.Tier4Final[newData.GeneralId].Name);
        contentcs.GeneraltoHide["56f41c4389cfca5821ed3253"] = GeneraltoHide;
        contentcs.GeneralInfo[newData.GeneralId] = GeneralCustomer;


        /*Dont forget to Uncomment this part to writh the changes to json fiel*/

        filestream.writeFile(PathFile, JSON.stringify(contentcs, null, 4), function(err){
            if(err) {
               console.log(err);
               res.json({'data': 'error'});
            } else {
                console.log("JSON saved to " + PathFile);
                res.json({'data': 'success'});
            }
          });



});

router.get('/submit_about', function(req, res, next){
  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentab = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        console.log(newData);

           var GeneralAbout = {
              Name : newData.Name,
              Subname : newData.Subname,
             "Honor, Dignity, and Respect": newData["Honor, Dignity, and Respect"]
           }

           var GeneraltoHide = {
             hide : newData.HideGeneral
           }
        //console.log(content.Tier4Final[newData.GeneralId].Name);
        contentab.GeneraltoHide["56f41c4389cfca5821ed3253"] = GeneraltoHide;
        contentab.AboutCummins[newData.GeneralId] = GeneralAbout;


        /*Dont forget to Uncomment this part to writh the changes to json fiel*/

        filestream.writeFile(PathFile, JSON.stringify(contentab, null, 4), function(err){
            if(err) {
               console.log(err);
               res.json({'data': 'error'});
            } else {
                console.log("JSON saved to " + PathFile);
                res.json({'data': 'success'});
            }
          });



});

router.get('/submit_tech', function(req, res, next){
  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentint = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        console.log(newData);

           var GeneralTech = {
              "EBU" : newData["EBU"],
              "PGBU" : newData["PGBU"],
              "CBU" : newData["CBU"],
              "DBU" : newData["DBU"],
              Name : newData.Name,
              Subname : newData.Subname
           }
        //console.log(content.Tier4Final[newData.GeneralId].Name);
           contentint.IntegratedTech[newData.GeneralId] = GeneralTech;


        /*Dont forget to Uncomment this part to writh the changes to json fiel*/

        filestream.writeFile(PathFile, JSON.stringify(contentint, null, 4), function(err){
            if(err) {
               console.log(err);
               res.json({'data': 'error'});
            } else {
                console.log("JSON saved to " + PathFile);
                res.json({'data': 'success'});
            }
          });



});

router.get('/submit_people', function(req, res, next){
  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentpep = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        console.log(newData);

           var GeneralPep = {
              Name : newData.Name,
              Subname : newData.Subname,
              "Honor, Dignity, and Respect": newData["Honor, Dignity, and Respect"]
           }

           contentpep.AboutPeople[newData.GeneralId] = GeneralPep;


        /*Dont forget to Uncomment this part to writh the changes to json fiel*/

        filestream.writeFile(PathFile, JSON.stringify(contentpep, null, 4), function(err){
            if(err) {
               console.log(err);
               res.json({'data': 'error'});
            } else {
                console.log("JSON saved to " + PathFile);
                res.json({'data': 'success'});
            }
          });



});

router.get('/submit_topbuttons', function(req, res, next){
  var PathFile;

    if(token){
       PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }else{
      PathFile = path.join(__dirname, '../public/', 'content/default.json');
    }

        console.log('req recived!!');

        var contentpep = JSON.parse(filestream.readFileSync(PathFile, 'utf8'));

        var newData = req.query;
        console.log(newData);

           var TopButtons = {
             EngineId : newData.EngineId,
             EngineVersion : newData.EngineVersion,
             TopButtonsToHide : newData.TopButtons
           }

           contentpep.TopButtonstoHide = TopButtons;


        /*Dont forget to Uncomment this part to writh the changes to json fiel*/

        filestream.writeFile(PathFile, JSON.stringify(contentpep, null, 4), function(err){
            if(err) {
               console.log(err);
               res.json({'data': 'error'});
            } else {
                console.log("JSON saved to " + PathFile);
                res.json({'data': 'success'});
            }
          });



});



module.exports = router;
