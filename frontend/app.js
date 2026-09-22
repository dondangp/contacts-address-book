const API_URL = "/api/contacts";

const contactList = document.getElementById("contact-list");
const searchInput = document.getElementById("search-input");
const contactForm = document.getElementById("contact-form");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const emailList = document.getElementById("email-list");
const addContactButton = document.getElementById("add-contact-button");
const addEmailButton = document.getElementById("add-email-button");
const deleteButton = document.getElementById("delete-button");
const cancelButton = document.getElementById("cancel-button");
const messageElement = document.getElementById("message");

let contacts = [];
let selectedContactId = null;
let originalContact = null;


function showMessage(message, isSuccess = false) {
    messageElement.textContent = message;
    messageElement.classList.toggle("success", isSuccess);
}


function clearMessage() {
    messageElement.textContent = "";
    messageElement.classList.remove("success");
}


function cloneContact(contact) {
    return structuredClone(contact);
}


function updateEmailRemoveButtons() {
    const rows = emailList.querySelectorAll(".email-row");
    const canRemove = rows.length > 1;

    rows.forEach((row) => {
        row.classList.toggle("can-remove", canRemove);
    });
}


function createEmailInput(value = "") {
    const row = document.createElement("div");
    row.className = "email-row";

    const input = document.createElement("input");

    input.type = "email";
    input.required = true;
    input.className = "email-input";
    input.value = value;
    input.placeholder = "name@example.com";

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "remove-email-button";
    removeButton.textContent = "−";
    removeButton.setAttribute("aria-label", "Remove email");

    removeButton.addEventListener("click", () => {
        const rows = emailList.querySelectorAll(".email-row");

        if (rows.length <= 1) {
            return;
        }

        row.remove();

        updateEmailRemoveButtons();
        clearMessage();
    });

    row.appendChild(input);
    row.appendChild(removeButton);

    emailList.appendChild(row);

    updateEmailRemoveButtons();

    return input;
}


function populateForm(contact) {
    firstNameInput.value = contact.first_name;
    lastNameInput.value = contact.last_name;

    emailList.innerHTML = "";

    contact.emails.forEach((emailObject) => {
        createEmailInput(emailObject.email);
    });

    if (contact.emails.length === 0) {
        createEmailInput();
    }

    updateEmailRemoveButtons();
}


function renderContacts() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    contactList.innerHTML = "";

    const filteredContacts = contacts.filter((contact) => {
        const fullName =
            `${contact.first_name} ${contact.last_name}`.toLowerCase();

        return fullName.includes(searchTerm);
    });

    if (filteredContacts.length === 0) {
        if (contacts.length > 0) {
            const emptyMessage = document.createElement("div");

            emptyMessage.className = "empty-list";
            emptyMessage.textContent = "No contacts found.";

            contactList.appendChild(emptyMessage);
        }

        return;
    }

    filteredContacts.forEach((contact) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "contact-item";
        button.textContent =
            `${contact.first_name} ${contact.last_name}`;

        if (contact.id === selectedContactId) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            selectContact(contact.id);
        });

        contactList.appendChild(button);
    });
}


function selectContact(contactId) {
    const contact = contacts.find(
        (item) => item.id === contactId
    );

    if (!contact) {
        return;
    }

    selectedContactId = contact.id;
    originalContact = cloneContact(contact);

    populateForm(contact);
    renderContacts();

    deleteButton.disabled = false;

    clearMessage();
}


function startNewContact() {
    selectedContactId = null;
    originalContact = null;

    firstNameInput.value = "";
    lastNameInput.value = "";

    emailList.innerHTML = "";

    createEmailInput();

    deleteButton.disabled = true;

    renderContacts();
    clearMessage();

    firstNameInput.focus();
}


function getFormData() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    const emailInputs = Array.from(
        emailList.querySelectorAll(".email-input")
    );

    const emails = emailInputs.map((input) =>
        input.value.trim().toLowerCase()
    );

    if (!firstName) {
        throw new Error("First name is required.");
    }

    if (!lastName) {
        throw new Error("Last name is required.");
    }

    if (
        emails.length === 0 ||
        emails.some((email) => !email)
    ) {
        throw new Error(
            "At least one email address is required."
        );
    }

    if (
        emailInputs.some(
            (input) => !input.checkValidity()
        )
    ) {
        throw new Error(
            "Please enter a valid email address."
        );
    }

    if (new Set(emails).size !== emails.length) {
        throw new Error(
            "Duplicate email addresses are not allowed."
        );
    }

    return {
        first_name: firstName,
        last_name: lastName,
        emails: emails.map((email) => ({
            email
        }))
    };
}


async function loadContacts(preferredContactId = null) {
    try {
        const response = await fetch(API_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Unable to load contacts."
            );
        }

        contacts = await response.json();

        if (contacts.length === 0) {
            renderContacts();
            startNewContact();
            return;
        }

        const preferredContact = contacts.find(
            (contact) =>
                contact.id === preferredContactId
        );

        if (preferredContact) {
            selectContact(
                preferredContact.id
            );

            return;
        }

        const currentContactStillExists =
            contacts.some(
                (contact) =>
                    contact.id === selectedContactId
            );

        if (currentContactStillExists) {
            selectContact(
                selectedContactId
            );

            return;
        }

        selectContact(
            contacts[0].id
        );
    } catch (error) {
        showMessage(
            error.message
        );
    }
}


async function saveContact(event) {
    event.preventDefault();

    clearMessage();

    try {
        const contactData = getFormData();

        const isNewContact =
            selectedContactId === null;

        const url = isNewContact
            ? API_URL
            : `${API_URL}/${selectedContactId}`;

        const method = isNewContact
            ? "POST"
            : "PUT";

        const response = await fetch(
            url,
            {
                method,

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        contactData
                    )
            }
        );

        if (!response.ok) {
            let errorMessage =
                "Unable to save contact.";

            try {
                const errorData =
                    await response.json();

                if (
                    typeof errorData.detail ===
                    "string"
                ) {
                    errorMessage =
                        errorData.detail;
                }
            } catch {
                // Keep the default message.
            }

            throw new Error(
                errorMessage
            );
        }

        const savedContact =
            await response.json();

        await loadContacts(
            savedContact.id
        );

        showMessage(
            "Contact saved successfully.",
            true
        );
    } catch (error) {
        showMessage(
            error.message
        );
    }
}


async function deleteContact() {
    if (selectedContactId === null) {
        return;
    }

    const deletedContactId =
        selectedContactId;

    const deletedIndex =
        contacts.findIndex(
            (contact) =>
                contact.id ===
                deletedContactId
        );

    const contact =
        contacts[deletedIndex];

    if (!contact) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete ${contact.first_name} ${contact.last_name}?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${deletedContactId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to delete contact."
            );
        }

        // Remove the deleted contact from local state immediately.
        contacts = contacts.filter(
            (contact) =>
                contact.id !==
                deletedContactId
        );

        selectedContactId = null;
        originalContact = null;

        if (contacts.length === 0) {
            renderContacts();
            startNewContact();

            showMessage(
                "Contact deleted successfully.",
                true
            );

            return;
        }

        // Select the nearest remaining contact.
        const nextIndex = Math.min(
            deletedIndex,
            contacts.length - 1
        );

        const nextContact =
            contacts[nextIndex];

        selectContact(
            nextContact.id
        );

        // Re-fetch without browser caching so local state matches the database.
        await loadContacts(
            nextContact.id
        );

        showMessage(
            "Contact deleted successfully.",
            true
        );
    } catch (error) {
        showMessage(
            error.message
        );
    }
}


function cancelChanges() {
    if (originalContact !== null) {
        populateForm(
            cloneContact(
                originalContact
            )
        );

        clearMessage();

        return;
    }

    if (contacts.length > 0) {
        selectContact(
            contacts[0].id
        );
    } else {
        startNewContact();
    }
}


searchInput.addEventListener(
    "input",
    renderContacts
);


addContactButton.addEventListener(
    "click",
    startNewContact
);


addEmailButton.addEventListener(
    "click",
    () => {
        const input =
            createEmailInput();

        input.focus();

        clearMessage();
    }
);


contactForm.addEventListener(
    "submit",
    saveContact
);


deleteButton.addEventListener(
    "click",
    deleteContact
);


cancelButton.addEventListener(
    "click",
    cancelChanges
);


loadContacts();