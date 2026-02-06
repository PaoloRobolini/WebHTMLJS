from pydantic import BaseModel, Field, field_validator

class Studente(BaseModel):
    id: str
    nome: str = Field(min_length=2, max_lenght=20)
    cognome: str
    eta: int
    email: str
    pdp: bool

    @field_validator('cognome')
    @classmethod
    def cognome_validate(cls, v: str) -> str | None:
        if len(v) > 30 or len(v) < 4:
            raise ValueError("Il cognome è troppo lungo o troppo corto")
        return v