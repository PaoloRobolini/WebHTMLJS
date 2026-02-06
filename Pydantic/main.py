from models import Studente

try:
        studente = Studente(
        id="1",
        nome="Paolo",
        cognome="Robolini",
        eta=18,
        email="mail@mail",
        pdp=False
    )
        print(studente)
except Exception as e:
        print(e)

