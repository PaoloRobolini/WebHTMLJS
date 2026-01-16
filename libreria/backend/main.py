from flask import Flask
from faker import Faker
import json

fake = Faker()

app = Flask(__name__)

libri = []

@app.route('/')
def home():
    return "Benvenuto al servizio di generazione libri!"

@app.route("/helloWorld")
def hello_world():
    variabile = "<p>Hello, World!</p>"
    return variabile


@app.route('/generaLibri')
def genera_libri():
    fake = Faker('it_IT')
    global libri
    libri = []
    for i in range(20):
        libro = {
            'id': i + 1,
            'titolo': fake.sentence(nb_words=4),
            'autore': fake.name(),
            'anno_pubblicazione': fake.year(),
            'genere': fake.word(ext_word_list=['Romanzo', 'Giallo', 'Fantascienza', 'Storico', 'Fantasy'])    
        }
        libri.append(libro)
    return "<p>Libri generati con successo!</p>", 201  

@app.route('/api/data/test')
def test():
    libro = {
            'id': 1,
            'titolo': fake.sentence(nb_words=4),
            'autore': fake.name(),
            'anno_pubblicazione': fake.year(),
            'genere': fake.word(ext_word_list=['Romanzo', 'Giallo', 'Fantascienza', 'Storico', 'Fantasy'])    
        }
    return json.dumps(libro), 200

@app.route('/api/data/get', methods=['GET'])
def get_data():
    global libri
    return json.dumps(libri), 200

@app.route('/api/data/post', methods=['POST'])
def post_data():
    new_libro = json.loads(request.data)
    libri.append(new_libro)
    return json.dumps(new_libro), 201

app.run("0.0.0.0", 11000, debug=True)