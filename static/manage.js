// add, find, update, clear buttons
var addButton = document.getElementById('add');
var findButton = document.getElementById('find');
var updateButton = document.getElementById('update');
var clearButton = document.getElementById('clear');
var searchDBButton = document.getElementById('searchDB');

// Feedback message
var msg = document.getElementById('msg');
var result = document.getElementById('result');

// text input fields
var id = document.getElementById('db_id');
var word = document.getElementById('word');
var categorySelectBox = document.getElementById('categoryList');
var meaning = document.getElementById('meaning');

// obtain the categories list when the page loads up
window.addEventListener('load', function(){
		// Make GET Request to obtain Speakers from db
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/get_cats', true);
		xhr.send();
		
		// Process the response
		xhr.onload = function(){
			if(xhr.status === 200){
				var data = JSON.parse(xhr.responseText);
				var categories = '';
				for (var i=0; i < data['catsList'].length; i++){
					categories += '<option value="' + i + '">' + data['catsList'][i] + '</option>';
				}

				categorySelectBox.innerHTML = categories;
				categorySelectBox.selectedIndex = -1; // set the select option to no value
				
			}
		}
	
	
}, false);

// adding a record to database - clicking the "add" button
addButton.addEventListener('click', function(){
		if (word.value.trim() && meaning.value.trim() && categorySelectBox.selectedIndex != -1){
			
			var toServer = JSON.stringify({
					'word': word.value.trim(),
					'meaning': meaning.value.trim(),
					'cat': categorySelectBox.options[categorySelectBox.selectedIndex].text
					});
			// Send data via POST request to server to be added to db 
			// Make the request
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/add_record', true);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.send(toServer);
			
			// process server response
			xhr.onload = function(){
				if(xhr.status === 200){
					data = JSON.parse(xhr.responseText);
					
					msg.textContent = data['res'];
					id.value = data['id'];
			
				}
			}
			
		} else {
			msg.textContent = 'One or more fields is empty!...';
			
		}
		

		
}, false);


// looking up a record in database using "find" button
findButton.addEventListener('click', function(){
		if(id.value.trim()) {
			var toServer = JSON.stringify({ 'id': id.value.trim()
											});
			
			// Make POST request to server to obtain data
			var xhr = new XMLHttpRequest();
			xhr.open('POST', '/find_record', true);
			xhr.setRequestHeader('Content-type', 'application/json');
			xhr.send(toServer);
			
			// Process the response
			xhr.onload = function(){
				if(xhr.status === 200){
					data = JSON.parse(xhr.responseText);
					// if the id isn't found in database
					if (data['res'].length == 1) { 
						msg.textContent = data['res'][0];
						word.value = '';
						categorySelectBox.selectedIndex = -1; // set the select option to no value
						meaning.value = '';	
						result.innerHTML = '';
					} else {
						word.value = data['res'][0];
						// set the selectBox option to the found word category
						for (var i=0; i < categorySelectBox.options.length; i++) {
							if (data['res'][1] === categorySelectBox.options[i].text) {
								categorySelectBox.selectedIndex = i;
								console.log(categorySelectBox.options[categorySelectBox.selectedIndex].text);
							}
							
						}
						meaning.value = data['res'][2];
						
						msg.textContent = 'Data successfully received from server.';
					}
				}
			}
		} else {
			msg.textContent = 'Please enter a valid id';
		}
		
}, false);


// update a record in database with "update" button
updateButton.addEventListener('click', function(){
		if(id.value.trim() && word.value.trim() && meaning.value.trim() && categorySelectBox.selectedIndex != -1){
				var toServer = JSON.stringify({
					'id': id.value.trim(),
					'word': word.value.trim(),
					'meaning': meaning.value.trim(),
					'cat': categorySelectBox.options[categorySelectBox.selectedIndex].text
					});
				
				// send data to server via POST request
				var xhr = new XMLHttpRequest();
				xhr.open('POST', 'update_record', true);
				xhr.setRequestHeader('Content-type', 'application/json');
				xhr.send(toServer);
				
				// analyse server response
				xhr.onload = function(){
					if(xhr.status === 200){
						data = JSON.parse(xhr.responseText);
						
						msg.innerHTML = '<p class=' + data['class'] + '>'  + data['res'] + '</p>';
						
					}
				}

			
			
		} else {
			msg.textContent = 'One of the fields is empty!...';
		}	
		
}, false);


// "clear" button functionality
clearButton.addEventListener('click', function(){
			id.value = ''; 
			word.value = '';
			categorySelectBox.selectedIndex = -1; // set the select option to no value
			meaning.value = '';
			msg.innerHTML = '';		
			result.innerHTML = '';
			
}, false);

// "SearchDB" button function
searchDBButton.addEventListener('click', function(){	
			if (word.value.trim() == '') {
				result.innerHTML = '<p>Please enter a valid input</p>';
			} else {
				var toServer = JSON.stringify({
						'clickedWord': word.value.trim()
						});
					
					// send data to server via POST request
					var xhr = new XMLHttpRequest();
					xhr.open('POST', 'find_word', true);
					xhr.setRequestHeader('Content-type', 'application/json');
					xhr.send(toServer);
					
					// analyse server response
					xhr.onload = function(){
						if(xhr.status === 200){
							data = JSON.parse(xhr.responseText);
							
							if (data["response"] == 'success'){
								result.innerHTML = '<p>1 result found with id = ' + data['id'] + ' and meaning = ' + data['meaning'] + '</p>';
								
							} else {
								result.innerHTML = '<p>' + data["response"] + '</p>';
								
							}
							
						}
			} }

}, false);