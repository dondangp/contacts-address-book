import sqlite3


DATABASE_FILE = "contacts.db"


def run_query(query):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    try:
        cursor.execute(query)

        if query.strip().lower().startswith("select"):
            rows = cursor.fetchall()

            for row in rows:
                print(row)
        else:
            conn.commit()
            print("Query executed successfully.")

    except sqlite3.Error as error:
        print(f"Database error: {error}")

    finally:
        conn.close()


def main():
    print("Connected to contacts.db")
    print("Type SQL queries below.")
    print("Type 'exit' to quit.")
    print()

    while True:
        query = input("SQL> ").strip()

        if query.lower() in {"exit", "quit"}:
            break

        if not query:
            continue

        run_query(query)


if __name__ == "__main__":
    main()