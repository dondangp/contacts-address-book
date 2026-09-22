from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    # One contact can have multiple email addresses.
    emails = relationship(
        "Email",
        back_populates="contact",
        cascade="all, delete-orphan",
    )


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)

    contact_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=False,
    )

    contact = relationship(
        "Contact",
        back_populates="emails",
    )