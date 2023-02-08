$(function(){
	var questionID, message, initValue;
	var correctIDs = [];
	
	$(window).on('load', function(){
		// Make GET request to get categories list
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/get_cats', true);
		xhr.send();
		
		// Process the response
		xhr.onload = function(){
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				
				// Make categories dropdown list
				var selectOption = ''
				for (var i=0; i< data.catsList.length; i++) {
					selectOption += '<option value=' + i + '>' + data.catsList[i] + '</option>';
				}
				$('#category').html(selectOption);
				initValue = $('#category :selected').val(); // cache the initial selected option
			}
		}
		
		$('#category').fadeIn(3000);
		
	});
	
	$('#start').on('click', function(){ 
		// Deselect radiobuttons
		$(':radio[name="quiz"]:checked').removeAttr('checked'); 
		// Empty the '#message' <div>
		$('#message').html('');
		// Show the form
		$('#container').fadeIn(1500);
		// get selected category
		var selectedCat = $('#category :selected').text();
		// console.log(selectedCat);
		
		toServer = JSON.stringify({'selectedCat': selectedCat});
				
		// Make POST request to flask server to send category selected and get question & answers
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/get_quiz', true);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.send(toServer);
			
		// 2) Process the response
		
		xhr.onload = function(){
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				$('#question').html('What is the meaning of "<span>' + data.question + '</span>"?');
				
				var radios = ''
				// Make questions radiobuttons 
				for (var i=0; i < data.answers.length; i++) {
					radios += '<input id="answer' + i + '"' + ' type="radio" name="quiz"'; 
					radios += ' value="' + data.answers[i].answer_id + '"><label for="answer' + i + '">'; 
					radios += data.answers[i].answer + '</label><br>';
				}
				$('#radios').html(radios) 
				var q = document.getElementById('question');
				q.scrollIntoView();
				
				questionID = data.questionID;
							
			}
		};
		
	});
	
	$('#check').on('click', function(){
		
		// get the selected radiobutton value attribute
		var answerID = $(':radio[name="quiz"]:checked').val();	
		
		if (answerID && answerID === questionID) {
			
			if (correctIDs.includes(answerID) === false){ // includes() method to check if a value is inside an array
				correctIDs.push(answerID);	// push() method to add append a value to an array				
			}
			
			// console.log(correctIDs);
			message = 'Good Job :)! You have ' + correctIDs.length + ' correct answers.';
			
			$('#message').
			removeClass('success fail nail').
			html(message).addClass('success');
			
		} else if (answerID && answerID !== questionID) {
			correctIDs = [];
			// console.log(correctIDs);
			$('#message').
			removeClass('success fail nail').
			html('Wrong answer! Try Again!').addClass('fail');			
		}
		
		// change word category option if user answered 10 questions successfully 
		
		if (correctIDs.length == 5) {
			correctIDs = [] // make the list empty again
			
			// Show a message to the user
			message = 'Congratulations! You nailed it! You now go to next level.';
			
			$('#message').
			removeClass('success fail').
			html(message).addClass('nail');
			
			// Select next Category option
			// var selectedCat = $('#category :selected').next().text();
			var optionValue = $('#category :selected').next().val();
		
			if (optionValue && optionValue !== initValue) {
				// console.log(selectedCat);
				// console.log(optionValue);
				$('#category').val(optionValue);
			} else {
				// console.log('End of list');
				$('#category').val(initValue);
			}	
		} 
		

		
		

		
		// var toServer = JSON.stringify({'answerID': answerID});
		
		// Make POST request to send the selected answer and check it
		
		// Make the request
		
		// var xhr = new XMLHttpRequest();
		// xhr.open('POST', '/check_answer', true);
		// xhr.setRequestHeader('Content-Type', 'application/json');
		// xhr.send(toServer);
		
		// Process the response using the ".onload()" method
		
		// xhr.onload = function(){
			// if (xhr.status === 200){
				// data = JSON.parse(xhr.responseText);
				
				// if (data.feedback === 'correct') {
					// $('#message').
					// removeClass('success fail').
					// html(data.message).addClass('success');
				// } else {
					// $('#message').
					// removeClass('success fail').
					// html(data.message).addClass('fail');
				// }
						
			// }
			
		// }
		
	});
	
	$('#searchDB').on('keyup', function(){
		var userInput = $(this).val();
		
		// console.log(userInput);
		
		// Send userInput to server 
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/search_Database', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({"userInput": userInput}));
		
		// Process the response
		xhr.onload = function(){
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				
				// console.log(data.response);
				
				if (data.response.length >= 1 && data.response !== 'No results!'){
					
					var content = '<p class="results-num">' + data.response.length + ' results found...</p>';
					content +='<table><tr> <th>Word</th> <th>Category</th> <th>Meaning</th> </tr>';
					for (i=0; i < data.response.length; i++){
						content += '<tr> <td>' + data.response[i][0] + '</td> <td>' 
						content += data.response[i][1] + '</td> <td>' + data.response[i][2] + '</td> </tr>';
					}				
					content+= '</table>';

					$('#searchResult').html(content);
					
				} else if (data.response !== 'No results!'){
					$('#searchResult').html('<p class="results-num">No results found!</p>');
				} else {
					$('#searchResult').html('');
				}
				

							
			}
		}
		
	});
		
});