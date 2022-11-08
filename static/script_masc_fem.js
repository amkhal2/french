$(function(){
	var questionID, message, answerCorrect;
	var correctIDs = [];
	
	$('#start').on('click', function(){ 
		// Deselect radiobuttons
		$(':radio[name="quiz"]:checked').removeAttr('checked'); 
		// Empty the '#message' <div>
		$('#message').html('');
		// Show the form
		$('#container').fadeIn(1500);
		// Empty the "#searchResult" <div>
		$('#searchResult').html('')

		// Make GET request to get question/answer
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/get_masc_fem', true);
		xhr.send();
		
		// Process the response
		xhr.onload = function(){
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				
				$('#searchWord').text(data.question);
								
				questionID = data.questionID;
				answerCorrect = data.answer;

		}}})

	
	$('#check').on('click', function(){
		
		// get the selected radiobutton value attribute
		var answerSelect = $(':radio[name="quiz"]:checked').val();	
		
		if (answerSelect && answerSelect === answerCorrect) {
			
			if (correctIDs.includes(questionID) === false){ // includes() method to check if a value is inside an array
				correctIDs.push(questionID);	// push() method to add append a value to an array				
			}
			
			// console.log(correctIDs);
			message = 'Good Job :)! You have ' + correctIDs.length + ' correct answers.';
			
			$('#message').
			removeClass('success fail nail').
			html(message).addClass('success');
			
			
		} else if (answerSelect && answerSelect !== answerCorrect) {
			correctIDs = [];
			// console.log(correctIDs);
			$('#message').
			removeClass('success fail nail').
			html('Wrong answer! Try Again!').addClass('fail');			
		}	
		
	});
	
	
	
	$('#searchWord').on('click', function(){
		var userInput = $(this).text();
		
		// console.log(userInput);
		
		// Send userInput to server 
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/find_word', true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({"userInput": userInput}));
		
		// Process the response
		xhr.onload = function(){
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				
				// console.log(data.word + ' ' + data.cat + ' ' + data.meaning);
				
				if (data.response !== 'No results!'){
					
					var content ='<table><tr> <th>Word</th> <th>Category</th> <th>Meaning</th> </tr>';	
					content += '<tr> <td>' + data.word + '</td> <td>' 
					content += data.cat + '</td> <td>' + data.meaning + '</td> </tr>';
									
					content+= '</table>';

					$('#searchResult').html(content);
					
				} 	else {
					$('#searchResult').html('<p class="results-num">No results found!</p>');
				}			
						
			}
		}
		
	});
		
});