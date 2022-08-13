import csv
from turtle import position
import eel
from sre_constants import CATEGORY_LOC_NOT_WORD
import gspread
import sys
import time
from decimal import *
from datetime import datetime

# Change Decimal module to have only 2 decimal places as these values are currency
getcontext().prec = 2

# Get the file from the first command line arguement
#file = f'{sys.argv[1]}'

# Create empty lists to store transactions and each unique transaction category
transactions = []
categories = []

# Function for reading the .csv file returns list of transactions
def readCSV(file):
    with open(file, mode='r') as csv_file:
        csv_reader = csv.reader(csv_file)
        # Iterate through each row of the .csv file
        for row in csv_reader:
            # Change the format of the date in the .csv to a more human readable format
            date = str(datetime.strptime(row[2], '%m/%d/%Y'))
            name = row[4]
            category = row[5]
            # Store each unique category
            if category not in categories:
                categories.append(category)
            # My .csv files format positive transactions with a double hyphen
            # This if statement changes the double hypen to just be a positive number instead
            # If the number is just a regular negative it is stored as a negative
            if row[6][:2] == "--":
                amount = Decimal(row[6][2:])
            else:
                amount = Decimal(row[6])
            # Store all the data as a transaction element and add it to the transactions list
            transaction = (date, name, category, str(amount))
            transactions.append(transaction)
        return transactions

# Function that creates a table of each unique category
# so that you can track which categories cost you the most
def insertCategories(wks, startRow):
    for category in categories:
        wks.insert_row([category], int(startRow))
        time.sleep(2)

# Function that inputs all transactions into another table
def insertExpenses(wks, startRow):
    for row in reversed(rows):
        wks.insert_row([row[0], row[1], row[2], row[3]], int(startRow))
        time.sleep(2)

# Function that creates a new sheet in the linked Google Sheets project
def createSheet(sheetName):
    worksheet = sh.add_worksheet(title=sheetName, rows=200, cols=20)
    worksheet.insert_row(["Expense Name", "Total"], 1)
    insertCategories(worksheet, 2)
    worksheet.insert_row(["Date", "Description", "Category", "Amount (USD)"], len(categories) + 3)
    insertExpenses(worksheet, len(categories) + 4)

# Connect service account, open the correct Google Sheets project
sa = gspread.service_account()
sh = sa.open("Bank Tracker")

# Store all the rows extracted from .csv so they can be uploaded
#rows = readCSV(file)

#def main():
    # Create a sheet with name taken from second command line argument
    #createSheet(sys.argv[2])

# Push all arguments into main function to be used if necessary
if __name__ == "__main__":
    eel.init('web')
    eel.start('index.html', size=(1280,720), position=(0,0))