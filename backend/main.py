from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Contacts Address Book"
)

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static",
)


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


@app.get(
    "/api/contacts",
    response_model=list[schemas.ContactResponse],
)
def get_contacts(
    db: Session = Depends(get_db),
):
    contacts = (
        db.query(models.Contact)
        .order_by(
            models.Contact.first_name,
            models.Contact.last_name,
        )
        .all()
    )

    return contacts


@app.get(
    "/api/contacts/{contact_id}",
    response_model=schemas.ContactResponse,
)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
):
    contact = (
        db.query(models.Contact)
        .filter(
            models.Contact.id == contact_id
        )
        .first()
    )

    if contact is None:
        raise HTTPException(
            status_code=404,
            detail="Contact not found",
        )

    return contact


@app.post(
    "/api/contacts",
    response_model=schemas.ContactResponse,
    status_code=201,
)
def create_contact(
    contact: schemas.ContactCreate,
    db: Session = Depends(get_db),
):
    first_name = contact.first_name.strip()
    last_name = contact.last_name.strip()

    if not first_name:
        raise HTTPException(
            status_code=400,
            detail="First name is required",
        )

    if not last_name:
        raise HTTPException(
            status_code=400,
            detail="Last name is required",
        )

    normalized_emails = [
        str(item.email).strip().lower()
        for item in contact.emails
    ]

    # Prevent duplicate emails for the same contact.
    if len(normalized_emails) != len(
        set(normalized_emails)
    ):
        raise HTTPException(
            status_code=400,
            detail="Duplicate email addresses are not allowed",
        )

    new_contact = models.Contact(
        first_name=first_name,
        last_name=last_name,
    )

    for email in normalized_emails:
        new_contact.emails.append(
            models.Email(
                email=email
            )
        )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return new_contact


@app.put(
    "/api/contacts/{contact_id}",
    response_model=schemas.ContactResponse,
)
def update_contact(
    contact_id: int,
    contact: schemas.ContactUpdate,
    db: Session = Depends(get_db),
):
    existing_contact = (
        db.query(models.Contact)
        .filter(
            models.Contact.id == contact_id
        )
        .first()
    )

    if existing_contact is None:
        raise HTTPException(
            status_code=404,
            detail="Contact not found",
        )

    first_name = contact.first_name.strip()
    last_name = contact.last_name.strip()

    if not first_name:
        raise HTTPException(
            status_code=400,
            detail="First name is required",
        )

    if not last_name:
        raise HTTPException(
            status_code=400,
            detail="Last name is required",
        )

    normalized_emails = [
        str(item.email).strip().lower()
        for item in contact.emails
    ]

    if len(normalized_emails) != len(
        set(normalized_emails)
    ):
        raise HTTPException(
            status_code=400,
            detail="Duplicate email addresses are not allowed",
        )

    existing_contact.first_name = first_name
    existing_contact.last_name = last_name

    # Rebuild email records from submitted values.
    existing_contact.emails.clear()

    for email in normalized_emails:
        existing_contact.emails.append(
            models.Email(
                email=email
            )
        )

    db.commit()
    db.refresh(existing_contact)

    return existing_contact


@app.delete(
    "/api/contacts/{contact_id}",
    status_code=204,
)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
):
    contact = (
        db.query(models.Contact)
        .filter(
            models.Contact.id == contact_id
        )
        .first()
    )

    if contact is None:
        raise HTTPException(
            status_code=404,
            detail="Contact not found",
        )

    db.delete(contact)
    db.commit()

    return Response(
        status_code=204
    )