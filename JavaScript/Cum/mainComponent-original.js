/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * this is the Original Version of mainComponent
 */
 /*Global Variables*/
 var trackId;
 var IdSelected;
 var Idhotspot;
 var HotspotsID;
 var counter = 0;
 var current;
 var currentGeneral;
 var globalobject;
 var General_ids;
 var HotspotsHide = [];
 var position = 0;
 var token = window.location.search;

 var ifographics;
 $('#form').hide();

var content = function(){
    this.httpContent();
    this.eventlistener();
    this.eventWriteToFile();
    this.eventWriteText();

}

content.prototype.httpContent = function(){
  var self =  this,
  loop = 0,
  loop_inception = 0,
  machine = 0;



  $.ajax({
    url: '/get_content',
    type: 'GET',
    success: function (response) {

    console.log(response);
    var object = response.data,
    specs = object.Specs,
    ids = Object.keys(specs),
    engine_version = specs[ids[loop]].Name,
    arr_of_engine_ids = [],
    arr_of_hotspot_ids = [],
    arr_of_leftpanel_ids = [],
    arr_of_spec_ids = [];
    arr_of_media_ids = [];
    globalobject = object;

      getId();
      machine_type(loop);
      $('.top_homepage_buttons').click(function() {
        var id = $(this).attr('id');
        console.log(id);
        switch ($(this).attr('id')) {

          case 'well_services_button':
          loop_inception = loop;
          break;

          case 'rail_button':
          loop_inception = loop+1;
          break;

          case 'mining_button':
          loop_inception = loop+2;
          break;
        }

          machine_type(loop_inception);

        })




    $('[id*=qsk], #qst30').click(function() {
          // solution 3
      switch ($(this).attr('id').replace(/_tab/g, '')) {

        case 'qsk19':
          loop = 3;
          break;

        case 'qsk23':
          loop = 6;
          break;

        case 'qst30':
          loop = 9;
          break;

        case 'qsk38':
          loop = 12;
          break;

        case 'qsk50':
          loop = 0;
          break;

        case 'qsk60':
          loop = 18;
          break;

        case 'qsk78':
          loop = 20;
          break;

        case 'qsk95':
          loop = 15;
          break;

        case 'qsk67':
          loop = 21;
          break;

        case 'qsk15':
          loop = 22;
          break;


      }

      machine_type(loop);

      $('.top_homepage_buttons').click(function() {
        console.log(loop)
        switch ($(this).attr('id')) {

          case 'well_services_button':
          loop_inception = loop;
          break;

          case 'rail_button':
            if (localStorage['boom'] == "qsk60") {

          loop_inception = 18;
            } else {
            loop_inception = loop+1;
          }
          break;

          case 'mining_button':
            if (localStorage['boom'] == "qsk60") {
          loop_inception = 19;
        } else if (localStorage['boom'] == "qsk78"){

            loop_inception = loop;
        } else {
          loop_inception = loop+2;

        }
          break;
        }

          machine_type(loop_inception);

        })
    })



  // function empty(){
  //   $('#header, #subheader, .hotspots_names, .specs').
  // }

  function getId() {
    var engines = object.Engine,
      specs = object.Specs,
      hotspots = object.Hotspots,
      media = object.media,
      general = object.General;


    for (i in engines) {
      var engine =  object.Engine[i].Name;
      arr_of_engine_ids.push(i)
    }
    for (i in hotspots) {
      arr_of_hotspot_ids.push(i)
    }
    for (i in specs) {
      arr_of_spec_ids.push(i)
    }
    for (i in media) {
      arr_of_media_ids.push(i)
    }


  }


  function machine_type(index_id) {
    var machine_default = arr_of_engine_ids[loop],
    machine_model = object.Engine[machine_default],
    machine_specs_id = object.Engine[machine_default].RightPanel,
    machine_specs = object.Specs[machine_specs_id],
    hotspot_ids = object.Engine[machine_default].Hotspots,
    machine_media = object.media[machine_default],
    current = machine_specs;
    Idhotspot = hotspot_ids;


    $('.hotspot_names, .the_hotspots').empty()

    $.each(arr_of_engine_ids, function(i,response) {
      var damn = object.Engine[arr_of_engine_ids[i]].LeftPanel;
      var name = object.Engine[arr_of_engine_ids[i]].Name;
      media = object.media[arr_of_media_ids[i]].Version.default.path;

    //console.log(name);
  })



    $.each(hotspot_ids, function(i,response) {
      var damn = object.Hotspots[hotspot_ids[i]]
        $('.hotspot_names').append('<li><input onclick="selected(this.id);" id="' + hotspot_ids[i]+ '" type="checkbox"><p> ' + damn.Name + '</p><img class="little_box" onclick="editor(this)" id="' + hotspot_ids[i]+ '"/><span class="input-holder"></span></li> ');
        //console.log(damn);
    })
    $.each(hotspot_ids, function(i,response) {
      var damn = object.Hotspots[hotspot_ids[i]]
          $('.the_hotspots').append('<li><button id="' + hotspot_ids[i]+'"> ' + damn.Name + '</button></li> ');

    })



switch (token) {
  case "?token=true":
  $('#header').empty().append(specs[ids[index_id]].Name);
  $('#header_tab').empty().append('<textarea rows="1">' +specs[ids[index_id]].Name + '</textarea>');


  $('#subheader').empty().append('For ' + specs[ids[index_id]].Version) + '>';
  $('#subheader_tab').empty().append('<textarea rows="1">For ' + specs[ids[index_id]].Version) + '</textarea>';
    break;
    case "?token=false":
    $('#header').empty().append(specs[ids[index_id]].Name);
    $('#header_tab').empty().append('<textarea readonly rows="1">' +specs[ids[index_id]].Name + '</textarea>');


    $('#subheader').empty().append('For ' + specs[ids[index_id]].Version) + '>';
    $('#subheader_tab').empty().append('<textarea readonly rows="1">For ' + specs[ids[index_id]].Version) + '</textarea>';
      break;
  default:
  $('#header').empty().append(specs[ids[index_id]].Name);
  $('#header_tab').empty().append('<textarea rows="1">' +specs[ids[index_id]].Name + '</textarea>');


  $('#subheader').empty().append('For ' + specs[ids[index_id]].Version) + '>';
  $('#subheader_tab').empty().append('<textarea rows="1">For ' + specs[ids[index_id]].Version) + '</textarea>';

}

   /*  $('#header').empty().append(specs[ids[index_id]].Name);
    $('#header_tab').empty().append('<textarea rows="1">' +specs[ids[index_id]].Name + '</textarea>');


    $('#subheader').empty().append('For ' + specs[ids[index_id]].Version) + '>';
    $('#subheader_tab').empty().append('<textarea rows="1">For ' + specs[ids[index_id]].Version) + '</textarea>';*/



    $('.specs, .specs_tab').empty();
    $.each(specs[ids[index_id]], function(i,
      response) {
        if(i != 'Name' && i != 'Version'){
          $('.specs').append('<li>' + response + '</li>');
        }
        if(counter == 11){
            counter = 0;
        }
      });

    $.each(specs[ids[index_id]], function(i,
      response) {
        IdSelected = ids[index_id];
        if(i != 'Name' && i != 'Version'){

          $('.specs_tab').append('<li><p>' + i + '</p><textarea id="' + ids[index_id]+ counter + '" rows="1"  >' + response + '</textarea></li>');
            counter++;
        }
        if(counter == 11){
            counter = 0;
        }
      });
    }
    var total  = $('#'+IdSelected+0).val();

    //$('#title').val(response.data.titles.maintitle);
    // $('#header').append(response.data.titles[0].maintitle);
    //$('#subtitle').val(response.data.titles.subtitle);
    // $('#subheader').append(response.data.titles[0].subtitle);


    /*Polpulating slide Pages */
       generaltr = object.Tier4Final,
       generalab = object.AboutCummins_HistoryofInnovation,
       generalpep = object.AboutPeople,
       generalcus = object.CustomerCare;
       generaltec = object.IntegratedTech;
       General_ids = Object.keys(generaltr),
       generalscr = object.SCR,
       General_idscr = Object.keys(generalscr),
       General_people = Object.keys(generalpep);
       General_ab  = Object.keys(generalab);
       General_cus = Object.keys(generalcus);
       General_tech = Object.keys(generaltec);

       console.log(generalab[General_ab].Name);
       //console.log(generaltr[General_ids]["Meeting The Challenge"]);

       /********Default Value for the new texteditor************/
       $('#new_header_tab').empty().append('<textarea rows="1">'+[generaltr[General_ids].Name]+'</textarea>');
       $('#new_subheader_tab').empty().append('<textarea rows="1">'+'Who am I ? .TR.'+'</textarea>');
       $('#editorFinal').html(generaltr[General_ids]["What is Tier 4 Final?"]);
       $('#editorchanllenge').html(generaltr[General_ids]["Meeting The Challenge"]);
       currentGeneral = General_ids;

              /**------Tier 4 Populate--------*/
        $('#content_tr').html(generaltr[General_ids]["What is Tier 4 Final?"]);
        $('#right_content_tr').html(generaltr[General_ids]["Meeting The Challenge"]);
        $('#leftcontent_tr2').click(function(){
          $('#editorFinal').hide();
          $('#editorchanllenge').show();
          $('#editorchanllenge').html(generaltr[General_ids]["Meeting The Challenge"]);
        });

       /*---------SRC Populate------------*/
       $('#left_content_scr').html(generalscr[General_idscr]["Selective Catalytic Reduction (SCR)"]);
       $('#left_content_scr2').html(generalscr[General_idscr]["Diesel Exhaust Fluid (DEF)"]);
       $('#right_content_scr').html(generalscr[General_idscr]["SCR System"]);

       /*---------Customer Populate------------*/
       $('#right_content_cs').html(generaltr[General_ids]["Customer Care"]);
       $('#right_content_cs_center').html(generaltr[General_ids]["Customer Care"]);
       $('#right_content_cs_bottom').html(generaltr[General_ids]["Customer Care"]);

       for(i in generaltr[General_ids]["Tier 4 Final"]){
         $('#tierFinalButton').val(generaltr[General_ids]["Tier 4 Final"][i].buttonlabel);
         $('#finalText').val(generaltr[General_ids]["Tier 4 Final"][i].textlabel);
         //$('#editorFinal').html(general[General_ids]["Tier 4 Final"]); //Call here the Key Id of the object in Json file..
         //$('#content_tr').html(general[General_ids]["Tier 4 Final"]);
       }

    /*End slide Pages*/
    /*Action for the new Text modal panel side***/
    $('.newpanel_tabs li').click(function(){
      var subpane = $(this).attr('id');
      console.log(subpane);

      switch(subpane) {
      case "tr":
          console.log("Banana is good!");
          $('#title_tab_2').show();
          $('#form2').show();
          $('#new_header_tab').empty().append('<textarea rows="1">'+[generaltr[General_ids].Name]+'</textarea>');
          $('#new_subheader_tab').empty().append('<textarea rows="1">'+'Compliance'+'</textarea>');
          $('#editorFinal').html(generaltr[General_ids]["What is Tier 4 Final?"]);

          currentGeneral = General_ids;
          break;
      case "scr":
          console.log("I am not a fan of orange.");
          $('#title_tab_2').show();
          $('#form2').show();
          $('#new_header_tab').empty().append('<textarea rows="1">'+'Selective Catalytic Reduction'+'</textarea>');
          $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalscr[General_idscr].Name]+'</textarea>');
          $('#editorFinal').html([generalscr[General_idscr]["Selective Catalytic Reduction (SCR)"]]);
          currentGeneral = General_idscr;
          break;
      case "cs":
          console.log("How you like them apples?");
          $('#title_tab_2').show();
          $('#form2').show();
          $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
          $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalcus[General_cus].Name]+'</textarea>');
          $('#editorFinal').html(generaltr[General_ids]["What is Tier 4 Final?"]);
          currentGeneral = General_ids;
          break;
      case "ab":
      console.log("How you like them apples in title menu?");
          $('#form2').hide();
          $('#title_tab_2').show();
          $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
          $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalab[General_ab].Name]+'</textarea>');

          currentGeneral  = generaltr;


          break;
      case "tech":
          console.log("How you like them apples in title Technology menu?");
              $('#form2').hide();
              $('#title_tab_2').show();
              $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
              $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generaltec[General_tech].Name]+'</textarea>');


          break;
       case "people":
            console.log("How you like them apples in title Technology menu?");
                $('#form2').hide();
                $('#title_tab_2').show();
                $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
                $('#new_subheader_tab').empty().append('<textarea rows="1">'+generalpep[General_people].Name+'</textarea>');


            break;

      default:

          console.log("I have never heard of that fruit...");
  }
  });
    /*End action***/
    var comparingId = "";



 /**Action for Nav var **/
 $('#tabContent_2 a').click(function(){
   var id = $(this).attr('id');

    switch(id) {
    case "tier_tab":
        console.log("Banana is good!");
        $('#new_header_tab').empty().append('<textarea rows="1">'+[generaltr[General_ids].Name]+'</textarea>');
        $('#new_subheader_tab').empty().append('<textarea rows="1">'+'Compliance'+'</textarea>');
        $('#editorFinal').html(generaltr[General_ids]["What is Tier 4 Final?"]);
        $('#form2').show();
        currentGeneral = General_ids;
        break;
    case "src_tab":
        console.log("I am not a fan of orange.");
        $('#new_header_tab').empty().append('<textarea rows="1">'+'Selective Catalytic Reduction'+'</textarea>');
        $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalscr[General_idscr].Name]+'</textarea>');
        $('#editorFinal').html(generalscr[General_idscr]["Selective Catalytic Reduction (SCR)"]);
        $('#form2').show();
        currentGeneral = General_idscr;
        break;
    case "customer_tab":
        console.log("How you like them apples?");
        $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
        $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalcus[General_cus].Name]+'</textarea>');
        $('#editorFinal').html(generaltr[General_ids]["What is Tier 4 Final?"]);
        $('#form2').show();
        currentGeneral = General_ids;
        break;
    case "about_tab":
        console.log("How you like them apples about?");
        $('#new_header_tab').empty().append('<textarea rows="1">'+'About Cummins'+'</textarea>');
        $('#new_subheader_tab').empty().append('<textarea rows="1">'+[generalab[General_ab].Name]+'</textarea>');
        $('#form2').hide();
        break;

    default:

        console.log("I have never heard of that fruit...");
}

 });
 /**End Nav**/
token = window.location.search;
console.log(token);



switch (token) {
  case "?token=true":
  $('#tier_4_final_button1').show();
  $('#scr_button2').show();
  $('#cc_button3').show();
  $('.about').show();
    break;
    case "?token=false":
    $('#tier_4_final_button1').prop("disabled",true);
    $('#scr_button2').prop("disabled",true);
    $('#cc_button3').prop("disabled",true);
    $('.about').prop("disabled",true);
    $('.little_box').prop("disabled",true);
    $('#spect1').prop("disabled",true);

    break;

  default:
  console.log("I have never heard of that fruit...");

}


    for (i in response.data.Specs) {

    $('#header_test').val(specs[ids[0]].Name);
    }
  },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}

content.prototype.eventlistener = function(){
    $('#edit').click(function(e){
        e.preventDefault();
        //window.location.href = '/login';
          window.location.href = '/menu';
        console.log('In function');
    });

}

content.prototype.eventWriteToFile = function() {
    var self = this;

   $('#save').click(function(e){


    var data = {
       maintitle: $('#header_tab').find('textarea').val(),
       subtitle: $('#subheader_tab').find('textarea').val(),
       Id: IdSelected,
       Details : current,
       "Engine Type" : $('#'+IdSelected+0).val(),
       "Displacement": $('#'+IdSelected+1).val(),
       "Bore and Stroke": $('#'+IdSelected+2).val(),
       "Oil System Capacity": $('#'+IdSelected+3).val(),
       "Coolant Capacity": $('#'+IdSelected+4).val(),
       "Length": $('#'+IdSelected+5).val(),
       "Width": $('#'+IdSelected+6).val(),
       "Height": $('#'+IdSelected+7).val(),
       "Wet Weight": $('#'+IdSelected+8).val(),
       "Power": $('#'+IdSelected+9).val(),
       "Torque": $('#'+IdSelected+10).val(),
       HideSpot : HotspotsHide

   }


          $.ajax({
          url: '/submit_content',
          contentType: 'application/json',
          type: 'GET',
          data: data,
          success: function (data) {
              console.log(data);
            (data.data == 'success') ? $('#exampleModal').modal('hide') : alert('Something went wrong oops!');
            titleVal = false;
          },
          error: function (jqXHR, textStatus, errorThrown) {
              console.log(errorThrown);
          }

        });
    });

/*Writing to Json file in Object Hotspots*/
$('#savehotspots').click(function(e, obj){
  var upddatedTextContent = $('#editor').html();
console.log($('#editor').html());
  var data = {
    HotId : HotspotsID,
    Image : hotpostImage,
    Name : $('.engine-name-edit').val(),
    Text : upddatedTextContent,

  }
  $.ajax({
      url: '/submit_hotspots',
      contentType: 'application/json',
      type: 'GET',
      data: data,
      success: function(data){
        console.log(data);
        (data.data == 'success') ? $('#form').modal('hide') : alert('Something went wrong ooops!');
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);
      }

  });




});


/*Writing to Json file in Object Genral*/
$('#superSave').click(function(e, obj){
  var updatedTextContent = $('#editorFinal').html();
  var updatedTextContent2 = $('#editorchanllenge').html();
console.log($('#editorFinal').html());
  var data = {
    GeneralId : currentGeneral,
    Name: $('#new_header_tab').find('textarea').val(),
    Subname: $('#new_subheader_tab').find('textarea').val(),
    "What Is Tier 4 Final?": "",
    "What is Tier 4 Final?" : updatedTextContent,
    "Meeting The Challenge" : updatedTextContent2
  }
  $.ajax({
      url: '/submit_general',
      contentType: 'application/json',
      type: 'GET',
      data: data,
      success: function(data){
        console.log(data);
        (data.data == 'success') ? $('#form').modal('hide') : alert('Something went wrong ooops!');
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);
      }

  });




});


}

content.prototype.eventWriteText = function(){
  var self = this;
  $('#dismiss').click(function(e){
    hideForm();
    $('.engine-name-edit').remove();
    $('#display').html("");
  });
}


function editor(obj){

$('#form').show();
  HotspotsID = globalobject.Hotspots[obj.id];
  hotpostImage = globalobject.Hotspots[obj.id].Image;

  $(obj).siblings('span').html('<input class="engine-name-edit form-control"  type="text" value=" '+globalobject.Hotspots[obj.id].Name+' ">');
  $("#editor").html(globalobject.Hotspots[obj.id].Text);

    //$('#editorFinal').html(globalobject.general[General_ids]["Tier 4 Final"]);

}
function hideForm(){
  $('#form').hide();
}

/***Showing or Hidding elements function***/

function selected(clicked_id){
position++;

  if($("#"+clicked_id).is(':checked')){
        $("#"+clicked_id).remove('checked');
        console.log('damn it ');
        HotspotsHide[position] = clicked_id;
        console.log(HotspotsHide);
      }
    else{
       $("#"+clicked_id).attr('checked');
       console.log('fuck');


       for(var x = 0; x < HotspotsHide.length; x++){
         if(HotspotsHide[x] === clicked_id){
           console.log('match');
          delete HotspotsHide[x]
           console.log(HotspotsHide);

         }
       }
     }

}


$('.infographics input').click(function(){
  children = $(this).attr('id');

  if(show){
    show = false;
    infographics = children;
  }else{show = true; infographics = children;}


  console.log(infographics + ' and hide  = ' + show);


});
/**End function here***/
