from flask import Flask, request
from faker import Faker
from flask_cors import CORS
import json
from random import randint

fake = Faker()

app = Flask(__name__)
CORS(app)

libri = []

@app.route('/')
def home():
    return "Benvenuto al servizio di generazione libri!"

@app.route("/helloWorld")
def hello_world():
    variabile = "<p>Hello, World!</p>"
    return variabile


@app.route('/api/data/genera')
def genera_libri():
    fake = Faker('it_IT')
    global libri
    libri = []
    n_libri = 20
    for i in range(n_libri):
        libro = {
            'id': i + 1,
            'titolo': fake.sentence(nb_words=4).replace('.', ''),
            'autore': fake.name(),
            'anno': fake.year(),
            'genere': fake.word(ext_word_list=['Romanzo', 'Giallo', 'Fantascienza', 'Storico', 'Fantasy'])    
        }
        libri.append(libro)
    return "<p>Libri generati con successo!</p>", 201  

@app.route('/api/data/test')
def test():
    n_parole = randint(1, 5)
    libro = {
            'id': 1,
            'titolo': fake.sentence(nb_words=n_parole),
            'autore': fake.name(),
            'anno': fake.year(),
            'genere': fake.word(ext_word_list=['Romanzo', 'Giallo', 'Fantascienza', 'Storico', 'Fantasy'])    
        }
    return json.dumps(libro), 200

@app.route('/api/data/get', methods=['GET'])
def get_data():
    global libri
    return json.dumps(libri), 200

@app.route('/api/data/post', methods=['POST'])
def post_data():
    new_libro = request.get_json()
    libri.append(new_libro)
    return "Aggiunto nuovo libro: " + json.dumps(new_libro), 201

app.run("localhost", 11000, debug=True)