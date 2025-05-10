// Declare the variables
var startButton = document.getElementById('start');
var checkButton = document.getElementById('check');
var word = document.getElementById('searchWord');
var searchResultDiv = document.getElementById('searchResult');
var message = document.getElementById('message');
var answer, questionID;
var inputTags = document.getElementsByTagName('input'); 	// all input tags 
var count = [];



// when the user presses the start button a random question will be obtained
startButton.addEventListener('click', function(){
	
		// first, uncheck all radio buttons
		for (var i=0; i < inputTags.length; i++) {
			if (inputTags[i].type == 'radio') {
				inputTags[i].checked = false;
			}
		}
		
		// clear the output message and searchResultDiv
		message.innerHTML = '';
		searchResultDiv.innerHTML = '';
		
		// Make GET Request to obtain Speakers from db
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/get_masc_fem', true);
		xhr.send();
		
		// Process the response
		xhr.onload = function(){
			if(xhr.status === 200){
				var data = JSON.parse(xhr.responseText);
				word.innerText = data['question'];
				questionID = data['questionID'];
				answer = data['answer'];
				// console.log(answer);
			}
		}
			
}, false);


// when the user clicks the word, its meaning will be shown
word.addEventListener('click', function(){
		var toServer = JSON.stringify({ 'clickedWord': word.innerText});
		
		// Make POST request to query database with selected "herb"
		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/find_word', true);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.send(toServer);
		
		// Process the response
				xhr.onload = function(){
				if (xhr.status === 200) {
					data = JSON.parse(xhr.responseText);
					var content = '';
					content += '<table><tr> <th>id</th> <th>Word</th> <th>Category</th> <th>Meaning</th></tr>';
					content += '<tr><td>' + data["id"] + '</td>  <td>' + data["word"] + '</td> <td>'; 
					content += data["cat"] + '</td> <td>' + data["meaning"] + '</td></tr>';
					
					searchResultDiv.innerHTML = content;

								
				}
			}
	
}, false);

// The selected answer will be checked when the user clicks the button
checkButton.addEventListener('click', function(){
	selectedAnswer = document.querySelector('input[name="quiz"]:checked').value; 
	// console.log(selectedAnswer);
	// console.log(answer);
	
	if (selectedAnswer === answer) {
		// check if 'questionID' is in 'count' array
		if (!count.includes(questionID)) {
			count.push(questionID);
		};
		
		message.innerHTML = '<p class="success">Well Done! You have ' + count.length + ' correct answer(s)...</p>';
	} else {
		count = [];
		message.innerHTML = '<p class="fail">Incorrect answer, please try again...</p>';
	}	
	
	
}, false);