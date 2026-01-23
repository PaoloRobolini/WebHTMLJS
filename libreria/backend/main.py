from flask import Flask, request
from faker import Faker
from flask_cors import CORS
from faker import Faker
from faker_books import BookProvider
from random import choices


fake = Faker('it_IT')

app = Flask(__name__)

# Abilita CORS solo per le API e permette le origini usate in sviluppo
CORS(app)
libri = []

formati = ["Cartaceo", "Ebook", "Audiolibro"]
generi = ["Fantasy", "Romanzo Storico", "Giallo", "Thriller", "Fantascienza", "Horror", "Narrativa Contemporanea", "Biografia", "Autobiografia", "Saggio"]


def genera_libro():
    isbn = fake.isbn13()
    while any(libro['isbn'] == isbn for libro in libri):
        isbn = fake.isbn13()
    libro = {
            "titolo": BookProvider(fake).book_title(),
            "autore": fake.name(),
            "isbn": isbn,
            "genere": choices(generi, k=1)[0],
            "anno": fake.year(),
            "formato": choices(formati, k=1)[0],
            "editore": fake.company()
    }
    return libro

@app.route('/')
def home():
    return "Benvenuto al servizio di generazione libri!"

@app.route("/helloWorld")
def hello_world():
    variabile = "<p>Hello, World!</p>"
    return variabile

@app.route('/api/data/get/generi', methods=['GET'])
def get_generi():
    return generi, 200

@app.route('/api/data/get/formati', methods=['GET'])
def get_formati():
    return formati, 200

@app.route('/api/data/genera')
def genera_libri():
    n_libri = 5
    for _ in range(n_libri):
        libro = genera_libro()
        # print(f"Generato libro: {libro}")
        libri.append(libro)
    return libri, 200

@app.route('/api/data/deleteAll', methods = ['DELETE'])
def elimina():
    libri.clear()
    return [], 200

@app.route('/api/data/delete/<isbn>', methods = ['DELETE'])
def elimina_uno(isbn):
    # print(f"Eliminazione libro con ISBN: {isbn}")
    global libri
    libri = [libro for libro in libri if libro['isbn'] != isbn]
    # print(f"Eliminato libro con ISBN: {isbn}")
    # print(f"Libri rimanenti: {libri}")
    return libri, 200

@app.route('/api/data/patch', methods=['PATCH'])
def patch_libri():
    aggiornato = request.get_json()
    # print(f"Aggiornamento ricevuto: {aggiornato}")
    for libro in libri:
        if libro['isbn'] == aggiornato['isbn']:
            libro.update(aggiornato)
            break
    return aggiornato, 200

@app.route('/api/data/generaEsempio', methods=['GET'])
def genera_esempio():
    esempio = genera_libro()
    return esempio, 200


@app.route('/api/data/get', methods=['GET'])
def get_data():
    libri = []
    for _ in range(20):
        libro = genera_libro()
        libri.append(libro)
    return libri, 200


@app.route('/api/data/post', methods=['POST'])
def post_data():
    nuovo_libro = request.get_json()
    # print(f"Ricevuto nuovo libro: {nuovo_libro}")
    temp = genera_libro()
    for keys, values in nuovo_libro.items():
        temp[keys] = values
    libri.append(temp)
    return temp, 201

app.run("localhost", 11000, debug=True)