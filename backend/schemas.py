from typing import List

from pydantic import BaseModel, EmailStr, Field


class EmailBase(BaseModel):
    email: EmailStr


class EmailResponse(EmailBase):
    id: int

    model_config = {
        "from_attributes": True
    }


class ContactBase(BaseModel):
    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    emails: List[EmailBase] = Field(
        min_length=1
    )


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    pass


class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    emails: List[EmailResponse]

    model_config = {
        "from_attributes": True
    }