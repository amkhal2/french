from flask import Flask, render_template, jsonify, request
from excel import get_rows
from flask_sqlalchemy import SQLAlchemy
import os, random
from itertools import cycle  # to go throw category list items continuosly
from unidecode import unidecode # to remove the french accents from string in db

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

##### Development database:
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "data.sqlite3")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

excel_file = r"Mon Dictionnaire.xlsx"
# excel_file = r"D:\Languages\learn french\Mon Dictionnaire.xlsx"
# excel_file = r"d:\Mon Dictionnaire.xlsx"

def unaccent_word(context):
    # This funciton will remove the accents from 'word' column
    # The 'context' is an internal SQLAlchemy object which contains all information about the statement 
    # being executed, including its source expression, the parameters associated with it  and the cursor.
    return unidecode(context.current_parameters['word'])

def unaccent_meaning(context):
    # This funciton will remove the accents from 'meaning' column
    return unidecode(context.current_parameters['meaning'])

# Create database table using SQLAlchemy
class French(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String, unique=True)
    # unaccented 'word' column will be created by default
    word_unaccented = db.Column(db.String, default=unaccent_word, index=True) 
    cat = db.Column(db.String)
    meaning = db.Column(db.String)
    # unaccented 'meaning' column will be created by default
    meaning_unaccented = db.Column(db.String, default=unaccent_meaning) 

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

@app.route('/manage')
def manage():
    return render_template('manage.html')
   

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

   
@app.route('/search_Database', methods=['POST'])
def search_Database():
    data = request.get_json()
    
    if data["userInput"].strip() and len(data["userInput"].strip()) > 1: 
        results = French.query.filter(French.word_unaccented.like(f'%{unidecode(data["userInput"])}%') | French.meaning_unaccented.like(f'%{unidecode(data["userInput"])}%')).all()
        
        l = [[i.id, i.word, i.cat, i.meaning] for i in results]
        if l:
            return jsonify({"res": l, 'status':'success'})
        
    return jsonify({"res": 'No results found!'})


@app.route('/get_masc_fem')
def get_masc_fem():
    
    cat = random.choice(['un', 'une'])
    query = db.engine.execute('''select id, word, cat from French where cat=? 
                    order by random() limit 1 ''', (cat,))
    
    r = [(i[0], i[1], i[2]) for i in query]
    
    id, question, answer = r[0][0], r[0][1], r[0][2]
    
    data = {"question": question, "questionID": id, "answer": answer}
    return jsonify(data)


@app.route('/find_word', methods=['POST'])
def find_word():
    data = request.get_json()
    
    result = French.query.filter_by(word=data["clickedWord"]).first()
    if result:
        return jsonify({"response": "success","id": result.id, "word": result.word, "cat": result.cat, "meaning": result.meaning})
    else:
        return jsonify({"response": "No results found!" })

@app.route("/add_record", methods=['POST'])
def add_record():
    # when the user clicks the "add" button
    data = request.get_json()
    entry = French(word=data['word'], cat=data['cat'], meaning=data['meaning'])
    db.session.add(entry)
    
    try:
        db.session.commit()
        db.session.refresh(entry)
        return jsonify({ 'res': 'Record successfully added to database :-)',
                        'id': entry.id
        })
        
    except Exception as e:
        return jsonify({ 'res': f'Error while writing record to db: {e}' })  

@app.route("/find_record", methods=['POST'])
def find_record():
    # when user clicks the find button
    data = request.get_json()
    db_id = int(data["id"])
    result = French.query.filter_by(id=db_id).first()    
    to_client = [result.word, result.cat, result.meaning, result.id] 

        
    return jsonify({'res': to_client})

@app.route('/update_record', methods = ['POST'])
def update_record():
    # when clicking "update" button
    data = request.get_json()
    id = data['id']
    word = data['word']
    cat = data['cat']
    meaning = data['meaning']
    word_u = unidecode(word)
    meaning_u = unidecode(meaning)
    
    db.engine.execute('update French set word = ?, cat = ?, meaning = ?, word_unaccented=?, meaning_unaccented=?  where id = ?',
                            (word, cat, meaning, word_u, meaning_u , id))
    return jsonify({
        'res': 'Record updated Successfully!'
         })
   
if __name__ == "__main__":
    app.run(debug=True)