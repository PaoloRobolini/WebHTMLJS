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

@app.route('/')
def home():
    return "Benvenuto al servizio di generazione libri!"

@app.route("/helloWorld")
def hello_world():
    variabile = "<p>Hello, World!</p>"
    return variabile


@app.route('/api/data/genera')
def genera_libri():
    global libri
    libri = []
    n_libri = 20
    for _ in range(n_libri):
        isbn = fake.isbn13()
        while any(libro['isbn'] == isbn for libro in libri):
            isbn = fake.isbn13()
        libro = {
            "titolo": BookProvider(fake).book_title(),
            "autore": fake.name(),
            "isbn": isbn,
            "genere": BookProvider(fake).book_genre(),
            "anno": fake.year(),
            "formato": choices(formati, k=1)[0],
            "editore": fake.company()
    }
        libri.append(libro)
    return libri, 200

@app.route('/api/data/deleteAll', methods = ['DELETE'])
def elimina():
    global libri
    libri = []
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
    return libri, 200

@app.route('/api/data/generaUno')
def genera_uno():
    isbn = fake.isbn13()
    while any(libro['isbn'] == isbn for libro in libri):
        isbn = fake.isbn13()
    libro = {
            "titolo": BookProvider(fake).book_title(),
            "autore": fake.name(),
            "isbn": isbn,
            "genere": BookProvider(fake).book_genre(),
            "anno": fake.year(),
            "formato": choices(formati, k=1)[0],
            "editore": fake.company()
    }
    return libro, 200

@app.route('/api/data/get', methods=['GET'])
def get_data():
    return libri, 200

@app.route('/api/data/post', methods=['POST'])
def post_data():
    new_libro = request.get_json()
    libri.append(new_libro)
    return "Aggiunto nuovo libro: " + new_libro, 201

app.run("localhost", 11000, debug=True)