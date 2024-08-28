import pandas as pd
import mysql.connector
from mysql.connector import Error
import re
import os
from dotenv import load_dotenv
from icecream import ic


def read_user_data():
    file_path = "./cmf_users.xlsx"
    df = pd.read_excel(file_path)

    user_data = []

    for index, row in df.iterrows():
        user_id = row["No"]
        # Ignore partners and employees not from CM Portugal
        if pd.notnull(user_id):
            user_id = int(user_id)
            name = row["Name"]
            email = row["E-Mail"]
            appraiser = row["Appraiser"]

            # Extract appraiser_id from the appraiser field using regex
            appraiser = str(appraiser) if pd.notnull(appraiser) else None
            appraiser_id_match = (
                re.search(r"\((\d+)\)", appraiser) if appraiser else None
            )
            appraiser_id = (
                int(appraiser_id_match.group(1)) if appraiser_id_match else None
            )

            encrypted_password = "-"  # placeholder

            user_data.append(
                (
                    user_id,
                    name,
                    email,
                    encrypted_password,
                    appraiser_id,
                    10228,
                )  # TODO: add real managers, 10228 is Bernardete's employee number
            )

    return user_data


def createDatabase(cursor):
    try:
        sql_script = """
        DROP DATABASE IF EXISTS performance_feedback_circle;
        CREATE DATABASE IF NOT EXISTS performance_feedback_circle;
        USE performance_feedback_circle;
        """
        statements = sql_script.split(";")
        for statement in statements:
            statement = statement.strip()
            if statement:
                cursor.execute(statement)
        print("Database created successfully")

    except Error as e:
        print(f"Error creating database: {e}")


def createTables(cursor):
    try:
        file_path = "./create_tables.sql"
        with open(file_path, "r") as file:
            sql_script = file.read()

        # Split script by ';' to handle multiple statements
        statements = sql_script.split(";")
        for statement in statements:
            statement = statement.strip()
            if statement:
                cursor.execute(statement)
        print("Tables created successfully")

    except Error as e:
        print(f"Error creating tables: {e}")


def insertUsers(cursor, user_data):
    insert_user_query = """
        INSERT INTO users (user_id, name, email, encrypted_password)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            email = VALUES(email),
            encrypted_password = VALUES(encrypted_password)
    """
    for (
        user_id,
        name,
        email,
        encrypted_password,
        appraiser_id,
        manager_id,
    ) in user_data:
        try:
            cursor.execute(
                insert_user_query, (user_id, name, email, encrypted_password)
            )
        except Error as e:
            print(f"Error inserting user {name}: {e}")

    update_appraiser_and_manager_query = """
        UPDATE users
        SET appraiser_id = %s, 
            manager_id = %s
        WHERE user_id = %s;
    """
    for (
        user_id,
        name,
        email,
        encrypted_password,
        appraiser_id,
        manager_id,
    ) in user_data:
        try:
            cursor.execute(
                update_appraiser_and_manager_query,
                (appraiser_id, manager_id, user_id),
            )
        except Error as e:
            print(f"Error updating user {name}: {e}")

    print("Users inserted successfully")


def insertUserAccess(cursor, user_data):
    insert_user_access_query = """
        INSERT INTO user_access (user_id, user, appraiser, manager, admin)
        VALUES (%s, %s, %s, %s, %s)
    """

    # get appraisers and managers
    managers = set()
    appraisers = set()
    for (
        user_id,
        name,
        email,
        encrypted_password,
        appraiser_id,
        manager_id,
    ) in user_data:
        managers.add(manager_id)
        appraisers.add(appraiser_id)

    for (
        user_id,
        name,
        email,
        encrypted_password,
        appraiser_id,
        manager_id,
    ) in user_data:
        try:
            is_user = True
            is_appraiser = user_id in appraisers
            is_manager = user_id in managers
            # TODO: add real admins, duarte pereira is the only admin for now
            is_admin = user_id == 10639
            cursor.execute(
                insert_user_access_query,
                (user_id, is_user, is_appraiser, is_manager, is_admin),
            )
        except Error as e:
            print(f"Error inserting user_access for user {name}: {e}")

    print("User access inserted successfully")


def insertDummyData(cursor):
    try:
        file_path = "./insert_dummy_data.sql"
        with open(file_path, "r") as file:
            sql_script = file.read()

        # Split script by ';' to handle multiple statements
        statements = sql_script.split(";")
        for statement in statements:
            statement = statement.strip()
            if statement:
                cursor.execute(statement)
        print("Dummy data inserted successfully")

    except Error as e:
        print(f"Error inserting dummy data: {e}")


if __name__ == "__main__":
    load_dotenv()

    db_connection = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
    )

    cursor = db_connection.cursor()

    user_data = read_user_data()

    createDatabase(cursor)
    createTables(cursor)
    insertUsers(cursor, user_data)
    insertUserAccess(cursor, user_data)
    insertDummyData(cursor)

    db_connection.commit()
    cursor.close()
    db_connection.close()
