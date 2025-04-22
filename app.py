from flask import Flask, render_template, jsonify, request
from excel import get_rows
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql.functions import ReturnTypeFromArgs  # to be able to query letters with accents in db
import os, random
from itertools import cycle  # to go throw category list items continuosly

# use this class to unaccent the words having accents to search db
class unaccent(ReturnTypeFromArgs): 
    pass
        

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

##### Development database:
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "data.sqlite3")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

excel_file = r"Mon Dictionnaire.xlsx"
# excel_file = r"D:\Languages\learn french\Mon Dictionnaire.xlsx"
# excel_file = r"d:\Mon Dictionnaire.xlsx"

# Create database table using SQLAlchemy
class French(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String, unique=True)
    cat = db.Column(db.String)
    meaning = db.Column(db.String)

## 1) CREATE THE DATABASE: Run Python shell with "python" command --->
##    import db with "from app import db" ---> creat db with "db.create_all()"

## 2) FILL IN THE DATABASE TABLE:

# rows = get_rows(excel_file) # Parse "Mon Dictionnaire.xlsx" Excel file rows
# errors = ''
# for row in rows:
    # mot = French(word=row[0], cat=row[1], meaning=row[2])
    # db.session.add(mot)

## db.session.commit() --> saving items after they were added to database
# try:
    # db.session.commit()
# except Exception as e:
    # errors = errors + f"<p>{e}<p>" + "<br>"
      
     
# BUILD THE QUIZ - ONE QUESTION & 4 ANSWERS:    
def quiz(cat):
    # select all words in that category:
    results = French.query.filter_by(cat=cat).all()
    sample = random.sample(results, 4)  # a sample of 4 unique words, meanings
    question = random.choice(sample)    # a question picked randomly from the sample
        
    return question, sample
    # returns tuple made of question db object and a list of db objects for answers
    # (question, [dbObject1, dbObject2, dbObject3, dbObject4])    


## Categories for the dropdown select box
def get_categories():
    cats = db.engine.execute(''' SELECT cat, count(*) FROM French 
                                   GROUP BY cat ORDER BY count(*) DESC''')
    
    catsList = [cat[0] for cat in cats] # Categories list
    
    return catsList



@app.route('/')
def index():
    # show errors while filling the database (line 29 above)
    # return errors
    
    return render_template('index.html')

@app.route('/masc_fem')
def masc_fem():

    return render_template('masc_fem.html')


@app.route('/get_masc_fem')
def get_masc_fem():
    
    cat = random.choice(['un', 'une'])
    query = db.engine.execute('''select id, word, cat from French where cat=? 
                    order by random() limit 1 ''', (cat,))
    
    r = [(i[0], i[1], i[2]) for i in query]
    
    id, question, answer = r[0][0], r[0][1], r[0][2]
    
    data = {"question": question, "questionID": id, "answer": answer}
    return jsonify(data)
    

@app.route('/get_cats')
def categories():
    catsList = get_categories()
    
    data = {"catsList": catsList}
    return jsonify(data)
    

questionID = ''
@app.route('/get_quiz', methods=['POST'])
def get_quiz():
    global questionID 
    
    data = request.get_json()
    
    selectedCat = data["selectedCat"]
    
    # UNWRAP THE TUPLE --> the 'quiz()'function  
    # returns a tuple of two items (question, answers)
    # 'answers' is a list of 4 database objects    
    question_db, sample = quiz(selectedCat)
    
    question = question_db.word
    # question = "garçon"
    questionID = str(question_db.id)
    # questionID = '846'
    
    data = {
        "question": question,
        "questionID": questionID,
        "answers": [
                {'answer_id': sample[0].id, 'answer': sample[0].meaning},
                {'answer_id': sample[1].id, 'answer': sample[1].meaning},
                {'answer_id': sample[2].id, 'answer': sample[2].meaning},
                {'answer_id': sample[3].id, 'answer': sample[3].meaning}
            ]
        }
    
    return jsonify(data)


correctIDs = []
@app.route('/check_answer', methods=['POST'])
def check_answer():
    global correctIDs, questionID
    
    data = request.get_json()
        
    if questionID == data["answerID"]:
        if questionID not in correctIDs: correctIDs.append(questionID)
        
        return jsonify({'feedback': 'correct', 
                         'message': f'Good Job :)! You have {len(correctIDs)} correct answers.'})
    
    correctIDs = []
    return jsonify({'feedback': 'wrong',
                     'message': 'Wrong answer! Try Again!'})
    

@app.route('/search_Database', methods=['POST'])
def search_Database():
    data = request.get_json()
    
    if data["userInput"].strip(): 
        results = French.query.filter(French.word.like(f'%{data["userInput"]}%') | French.meaning.like(f'%{data["userInput"]}%')).all()
        
        l = [[i.word, i.cat, i.meaning] for i in results]
        
        return jsonify({"response": l})
   
    return jsonify({"response": 'No results!'})


@app.route('/find_word', methods=['POST'])
def find_word():
    data = request.get_json()
    
    if data["userInput"].strip(): 
        results = French.query.filter_by(word=data["userInput"]).first()
        
        return jsonify({"word": results.word, "cat": results.cat, "meaning": results.meaning})
   
    return jsonify({"response": 'No results!'})
   
if __name__ == "__main__":
    app.run(debug=True)