import csv
from sre_constants import CATEGORY_LOC_NOT_WORD
import gspread
import sys
import time
from decimal import *
from datetime import datetime

getcontext().prec = 2

file = f'{sys.argv[1]}'

transactions = []
categories = []

def readCSV(file):
    with open(file, mode='r') as csv_file:
        csv_reader = csv.reader(csv_file)
        for row in csv_reader:
            date = str(datetime.strptime(row[2], '%m/%d/%Y'))
            name = row[4]
            category = row[5]
            if category not in categories:
                categories.append(category)
            if row[6][:2] == "--":
                amount = Decimal(row[6][2:])
            else:
                amount = Decimal(row[6])
            transaction = (date, name, category, str(amount))
            transactions.append(transaction)
        return transactions


def insertCategories(wks, startRow):
    for category in categories:
        wks.insert_row([category], int(startRow))
        time.sleep(2)

def insertExpenses(wks, startRow):
    for row in reversed(rows):
        wks.insert_row([row[0], row[1], row[2], row[3]], int(startRow))
        time.sleep(2)

def createSheet(sheetName):
    worksheet = sh.add_worksheet(title=sheetName, rows=200, cols=20)
    worksheet.insert_row(["Expense Name", "Total"], 1)
    insertCategories(worksheet, 2)
    worksheet.insert_row(["Date", "Description", "Category", "Amount (USD)"], len(categories) + 3)
    insertExpenses(worksheet, len(categories) + 4)

sa = gspread.service_account()
sh = sa.open("Bank Tracker")

rows = readCSV(file)

def main(argv):
    createSheet(sys.argv[2])

if __name__ == "__main__":
    main(sys.argv[1:])