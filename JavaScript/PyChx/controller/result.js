//vars
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var salary = 40;
var total = 0;
var fixed_num;


//Populate restult table
var content = function(){
	this.httpContent();
	this.eventlistener();
}

content.prototype.httpContent = function() {

	 //Get content and display new preset buttons dynamicly
    $.ajax({
    url: '/get_result',
    type: 'POST',
    success: function (response) {
   	console.log(response);

$('.date').append(response.paychex[0].TimeDate);

	var element = "";


$.each(response.data, function(value){
		//console.log(value);
		for(p in response.paychex){
			//console.log(response.paychex[p].Name);
			if(response.paychex[p].Email == response.data[value].email){

				//console.log(response.paychex[p].Vacation);
				if(response.paychex[p].Vacation != "" && response.paychex[p].Vacation != undefined){
					if(response.paychex[p].Vacation >= response.data[value].hours){
				      total = response.paychex[p].Vacation  - response.data[value].hours;
					}else{
							total = response.data[value].hours - response.paychex[p].Vacation;
					}
					var role = response.data[value].role;
				  fixed_num = parseFloat(total).toFixed( 2 );
					element += "<tr class='info' ><td>" + value + "</td><td>"+response.data[value].email+"</td><td>"+response.data[value].role+"</td><td>"+response.paychex[p].Vacation+"</td><td>"+response.data[value].hours+"</td><td>"+fixed_num+"</td><td><input type='checkbox' value='"+response.data[value].email+"'></td></tr>";
					//element += "<tr style='display:none'><td colspan='6'><p>monday</p></td><td>tus</td></tr>";

					//parsing date
					for(d in response.data[value].Date){
						var dynamic_date = response.data[value].Date[d];
						var paychex_date = response.paychex[p].TimeDate;


						wee = new Date(dynamic_date);
						pay = new Date(paychex_date);

						//parsing manven dates
						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();

						//parsing paychex dates
						payday = pay.getDay();
						paydate = pay.getDate();
						paymonth = pay.getMonth();
						payyear = pay.getFullYear();

							element += "<tr class='vac_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
												 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
												 " <td class='agenda-time'>"+response.data[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
												 "</i>"+' Hrs From Maven'+"</div></td></td><td><center><strong>Maven VS PayChex</strong></center></td><td>"+paydate+'</br>'+week[payday]+'</br>'+months[paymonth]+','+ payyear+
												 "</td><td class='agenda-time'>"+response.paychex[p].Vacation+"</td><td>Hrs From PayChex</td></tr>";

					}




					//------------

				}else{

					var same = response.data[value].hours;
					element += "<tr class='info'><td>" + value + "</td><td>"+response.data[value].email+"</td><td>"+response.data[value].role+"</td><td>"+0+"</td><td>"+response.data[value].hours+"</td><td>"+same+"</td><td><input type='checkbox'  value='"+response.data[value].email+"'></td></tr>";

					//parsing date
					for(d in response.data[value].Date){
						var dynamic_date = response.data[value].Date[d];


						wee = new Date(dynamic_date)

						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();
						date_fix = date+1;


						element += "<tr class='vac_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
											 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
											 " <td class='agenda-time'>"+response.data[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
											 "</i>"+' Hrs From Maven'+"</div></td></td><td><center><strong>Maven VS PayChex</strong></center></td><td>"+0+'</br>'+0+'</br>'+0+','+ 0+
											 "</td><td class='agenda-time'>"+0+"</td><td>Hrs From PayChex</td></tr>";

					}




				}

			}

		}



    //element += "<tr><td>" + value + "</td><td>"+response.data[value].email+"</td><td>"+response.data[value].vacation+"</td><td>"+response.data[value].sick+"</td><td>"+response.data[value].diference+"</td></tr>";
});


$('#myTable').append(element);

$('.vacation').click(function(e) {
			e.preventDefault();

			console.log($(this).css('display'));

			$('.vac_details').toggle('show');


 })


//Populate sick table results
var element_sick = '';
$.each(response.sick, function(value){
		//console.log(value);
		for(p in response.paychex){
			//console.log(response.paychex[p].Name);
			if(response.paychex[p].Email == response.sick[value].email){
				//console.log(response.paychex[p].Sick);
				if(response.paychex[p].Sick != "" && response.paychex[p].Sick != undefined){
					if(response.paychex[p].Sick >= response.sick[value].hours){
				      total = response.paychex[p].Sick  - response.sick[value].hours;
					}else{
							total = response.sick[value].hours - response.paychex[p].Sick;
					}

					fixed_num = parseFloat(total).toFixed( 2 );
					element_sick += "<tr class='warning'><td>" + value + "</td><td>"+response.sick[value].email+"</td><td>"+response.sick[value].role+"</td><td>"+response.paychex[p].Sick+"</td><td>"+response.sick[value].hours+"</td><td>"+fixed_num+"</td><td><input type='checkbox'  value='"+value+"'></td></tr>";

					//parsing date
					for(d in response.sick[value].Date){
						var dynamic_date = response.sick[value].Date[d];
						//console.log(response.data[value].Date[d]);

						wee = new Date(dynamic_date)

						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();
						date_fix = date+1;

							element_sick += "<tr class='sick_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
												 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
												 " <td class='agenda-time'>"+response.sick[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
												 "</i>"+' Hrs From Maven'+"</div></td></td><td>'PayChex Comming soon'</td></tr>";

					}



				}else{

					var same = response.sick[value].hours;
					element_sick += "<tr class='warning'><td>" + value + "</td><td>"+response.sick[value].email+"</td><td>"+response.sick[value].role+"</td><td>"+0+"</td><td>"+response.sick[value].hours+"</td><td>"+same+"</td><td><input type='checkbox'  value='"+value+"'></td></tr>";

					//parsing date
					for(d in response.sick[value].Date){
						var dynamic_date = response.sick[value].Date[d];
						//console.log(response.data[value].Date[d]);

						wee = new Date(dynamic_date)

						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();
						date_fix = date+1;

							element_sick += "<tr class='sick_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
												 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
												 " <td class='agenda-time'>"+response.sick[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
												 "</i>"+' Hrs From Maven'+"</div></td></td><td>'PayChex Comming soon'</td></tr>";

					}


				}

			}

		}


});

$('#sickTable').append(element_sick);

$('.sick').click(function(e) {
			e.preventDefault();

			console.log($(this).css('display'));

			$('.sick_details').toggle('show');


 })

//Populate regular hours table results
var element_reg = '';
$.each(response.reg, function(value){
		//console.log(value);
		for(p in response.paychex){
			//console.log(response.paychex[p].Name);
			if(response.paychex[p].Email == response.reg[value].email){
				//console.log(response.paychex[p].Sick);
				if(response.paychex[p]['Total Weekly'] != "" && response.paychex[p]['Total Weekly'] != undefined){
					if(response.paychex[p]['Total Weekly'] >= response.reg[value].hours){
				      total = response.paychex[p]['Total Weekly']  - response.reg[value].hours;
					}else{
							total = response.reg[value].hours - response.paychex[p]['Total Weekly'];
					}

					var fixed_num = parseFloat(total).toFixed( 2 );
					element_reg += "<tr class='info'><td>" + value + "</td><td>"+response.reg[value].email+"</td><td>"+response.reg[value].role+"</td><td>"+response.paychex[p]['Total Weekly']+"</td><td>"+response.reg[value].hours+"</td><td>"+fixed_num+"</td><td><input type='checkbox'  value='"+value+"'></td></tr>";

					//parsing date
					for(d in response.reg[value].Date){
						var dynamic_date = response.reg[value].Date[d];
						//console.log(response.data[value].Date[d]);

						wee = new Date(dynamic_date)

						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();


							element_reg += "<tr class='reg_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
												 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
												 " <td class='agenda-time'>"+response.reg[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
												 "</i>"+' Hrs From Maven'+"</div></td></td><td>'PayChex Comming soon'</td></tr>";

					}



				}else{

					var same = response.reg[value].hours;
					element_reg += "<tr class='info'><td>" + value + "</td><td>"+response.reg[value].email+"</td><td>"+response.reg[value].role+"</td><td>"+0+"</td><td>"+response.reg[value].hours+"</td><td>"+same+"</td><td><input type='checkbox'  value='"+value+"'></td></tr>";

					//parsing date
					for(d in response.reg[value].Date){
						var dynamic_date = response.reg[value].Date[d];
						//console.log(response.data[value].Date[d]);

						wee = new Date(dynamic_date)

						day = wee.getDay();
						date = wee.getDate();
						month = wee.getMonth();
						year = wee.getFullYear();


							element_reg += "<tr class='reg_details' style='display:none'><td class='agenda-date' class='active' rowspan='1'><div class='dayofmonth'>"+date+
												 "</div><div class='dayofweek'>"+week[day]+"</div><div class='shortdate text-muted'>"+months[month]+', '+year+"</div>"+
												 " <td class='agenda-time'>"+response.reg[value].timedays[d]+"</td><td class='agenda-events'><div class='agenda-event'><i class='glyphicon glyphicon-repeat text-muted' title='Repeating event'>"+
												 "</i>"+' Hrs From Maven'+"</div></td></td><td>'PayChex Comming soon'</td></tr>";

					}


				}

			}

		}


});

$('#regTable').append(element_reg);

$('.regular').click(function(e) {
			e.preventDefault();

			console.log($(this).css('display'));

			$('.reg_details').toggle('show');


 })


  },
  error: function(error){
      console.log(error);
  }
  });


}


content.prototype.eventlistener =  function(){
//vars
var emails = [];


//Varify if the fiels are no amptys=
$('#submit').click(function(e){


if($('#start').val() != "" && $('#start').val() != undefined && $('#end').val() != "" && $('#end').val() != undefined){
	console.log('send data here ');

	data = {
		start : $('#start').val(),
		end : $('#end').val()
	}

	$.ajax({
      url: '/get_dates',
      type: 'POST',
			//dataType: "json",
      data: data,
      success: function(data){
				//console.log(data);
        if(data == 'success'){
					alert('Your data it will be compare in this moment pleas wait !...');
					console.log('dates successfully sent it.. ', data);
				}else{
					console.log('OOpps en error happend!');
				}
      },
      error: function(jqXHR, textStatus, errorThrown){
        console.log(errorThrown);
      }

  });//End ajax here




}else{
	console.log('both imputs are require!');
	alert('Make sure start and end date inputs were selected.!');
}






}); //end submit listener


//selecting all checkboxes
$('#select_all').click(function(e){

	var checkboxes = document.getElementsByTagName('input');
	for (var i = 0; i < checkboxes.length; i++) {
	var node = checkboxes[i];

	if (node.getAttribute('type') == 'checkbox') {
			// do something here with a <input type="text" .../>
			// we alert its value here
			node.checked = true;
			console.log(node.id);
			 var val = node.value;
			 emails.push(val);


	}//end if startement

}

//console.log(emails);


});//end checkbox listener

//get selection one by one
$('#myTable').on('change', 'input[type=checkbox]', function(e) {

        console.log(this.name +' '+this.value+' '+this.checked);
				if(!this.checked){
					//console.log('Do some logic here !');
					var exiting_item_index = emails.indexOf(this.value);
					if(exiting_item_index > -1){
						emails.splice(exiting_item_index, 1);
					}

				}else{
					emails.push(this.value);
				}

				//console.log(emails);

    });//end the individual checkbox event

//email click event with teh updated email array data.
	$('#email').click(function(e){

		if(emails !="" && emails != undefined){
			console.log('Ready to send emails');
			data = {
				emails : emails
			}


			$.ajax({
					url: '/get_emails',
					type: 'POST',
					data: data,
					success: function(data){
						//console.log(data);
						if(data == 'success'){
							console.log('dates successfully sent it.. ', data);
						}else{
							console.log('OOpps en error happend!');
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
						console.log(errorThrown);
					}

			});//End ajax here



		}else{
			alert('You have to select at least one user to send an email!');
		}


	});//end emial click event here



}//End prototype listener
