import csv
import os.path
import tempfile
import eel
import tkinter as tk
import gspread
import gspread_formatting as gsf
import time
from decimal import *
from datetime import datetime as dt

# Variables for eel properties. This will allow user to change window size in the future
screen_width = tk.Tk().winfo_screenwidth()
screen_height = tk.Tk().winfo_screenheight()
win_width = 1280
win_height = 720

# Change Decimal module to have only 2 decimal places as these values are currency
getcontext().prec = 2

# Create empty lists to store transactions and each unique transaction category
categories = []

# Variables to store the name of the temp file and the OS temp directory
# For the sake of security Javascript cannot access all details of
# local storage. The workaround I have created is that the contents
# of the file added to the GUI are written to a temp file and then
# read by this script.
tmp_path = tempfile.gettempdir()
tmp_fileName = "tmp.csv"
completeName = os.path.join(tmp_path, tmp_fileName)

# Writing the content of the uploaded files to the temp file
def writeToTemp(fileContent):
    lines = fileContent.splitlines()
    print("Writing tmp file...")
    f = open(completeName, "w")

    # This overwrites the file everytime so new temp files don't
    # need to be created.
    f.seek(0)
    for line in lines[:-1]:
        f.write(line)
        f.write('\n')
    f.write(lines[-1])
    f.close()

# The function that starts to process of sheet creation exposed
# to the Javascript of the web based GUI.
@eel.expose
def startSheetCreation(file, sheetName, isLast):
    writeToTemp(file)
    rows = readCSV(completeName)
    eel.updateProgressBar(10, "Creating Sheet...")
    createSheet(sheetName, rows, isLast)

# Function for reading the .csv file returns list of transactions
def readCSV(file):
    transactions = []
    with open(file, mode='r') as csv_file:
        csv_reader = csv.reader(csv_file)
        # Iterate through each row of the .csv file
        for row in csv_reader:
            # Change the format of the date in the .csv to a more human readable format
            date = str(dt.strptime(row[2], '%m/%d/%Y'))
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
def insertCategories(wks, startRow, progress):
    # This allows the loading bar on the GUI to updated
    # a small percentage with each completed category insertion.
    addedProgress = progress / len(categories)
    print("Writing categories...")

    # Offset is needed for formatting purposes.
    offset = 0
    for category in categories:
        # time.sleep() prevents going over the maximum allowed
        # API calls. Writes the category and formats it all at once.
        wks.insert_row([category], int(startRow))
        time.sleep(1)
        wks.update(f'B2', f'=SUMIF(C:C,INDIRECT("A{(len(categories) + 1) - offset}"),D:D)', raw=False)
        time.sleep(1)
        # Calls updateProgressBar Javascript function to change
        # the fill of the loading bar.
        eel.updateProgressBar(addedProgress, "Inserting Categories...")
        offset = offset + 1
        time.sleep(2)
    print("Categories done!")

# Any formatting for titles and the Totals section is done here
def updateFormatting(wks, rows):
    # batch updating saves API calls allowing all formatting to be pushed at once
    batch = gsf.batch_updater(sh)
    # the formatting for a header
    headerFormat = gsf.cellFormat(
        backgroundColor=gsf.color(0.6, 0.6, 0.6),
        textFormat=gsf.textFormat(bold=True, fontSize=14),
        horizontalAlignment='CENTER',
        borders=gsf.borders(bottom=gsf.border('SOLID'), top=gsf.border('SOLID'), right=gsf.border('SOLID'), left=gsf.border('SOLID'))
    )
    # currency format for any cells that contain a currecny value
    currencyFormat = gsf.cellFormat(
        numberFormat=gsf.numberFormat(type='CURRENCY', pattern='$#,##0.00'),
        borders=gsf.borders(bottom=gsf.border('SOLID'), top=gsf.border('SOLID'), right=gsf.border('SOLID'), left=gsf.border('SOLID'))
    )
    # standardized date format
    dateFormat = gsf.cellFormat(
        numberFormat=gsf.numberFormat(type='DATE', pattern='yyyy-mm-dd'),
        borders=gsf.borders(bottom=gsf.border('SOLID'), top=gsf.border('SOLID'), right=gsf.border('SOLID'), left=gsf.border('SOLID'))
    )
    # complete outline to all cells
    borderFormat = gsf.cellFormat(
        borders=gsf.borders(bottom=gsf.border('SOLID'), top=gsf.border('SOLID'), right=gsf.border('SOLID'), left=gsf.border('SOLID'))
    )
    # creating the totals table and adding formulas
    wks.update('F6', 'Total Income')
    wks.update('F7', f'=SUMIF(B2:B{len(categories) + 1}, ">0", B2:B{len(categories) + 1})', value_input_option='USER_ENTERED')
    wks.update('G6', 'Total Expenses')
    wks.update('G7', f'=SUMIF(B2:B{len(categories) + 1}, "<0", B2:B{len(categories) + 1})', value_input_option='USER_ENTERED')
    wks.update('H6', 'Profit/ Loss')
    wks.update('H7', '=SUM(F7+G7)', value_input_option='USER_ENTERED')

    # All of these are conditional rules to add red / green background
    catNeg = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'B2:B{len(categories) + 1}', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_LESS', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.95,0.78,0.76))
        )
    )

    catPos = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'B2:B{len(categories) + 1}', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_GREATER', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.71,0.88,0.80))
        )
    )

    rowNeg = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'D{len(categories) + 4}:D{(len(categories) + 4) + (len(rows) - 1)}', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_LESS', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.95,0.78,0.76))
        )
    )

    rowPos = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'D{len(categories) + 4}:D{(len(categories) + 4) + (len(rows) - 1)}', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_GREATER', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.71,0.88,0.80))
        )
    )

    totalNeg = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'F7:H7', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_LESS', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.95,0.78,0.76))
        )
    )

    totalPos = gsf.ConditionalFormatRule(
        ranges=[gsf.GridRange.from_a1_range(f'F7:H7', wks)],
        booleanRule=gsf.BooleanRule(
            condition=gsf.BooleanCondition('NUMBER_GREATER', ['0']),
            format=gsf.CellFormat(textFormat=gsf.textFormat(bold=False), backgroundColor=gsf.color(0.71,0.88,0.80))
        )
    )

    # this adds all the conditional format rules to the sheet
    rules = gsf.get_conditional_format_rules(wks)
    rules.append(catNeg)
    rules.append(catPos)
    rules.append(rowNeg)
    rules.append(rowPos)
    rules.append(totalNeg)
    rules.append(totalPos)
    rules.save()

    # batch formatting each change is queued up
    batch.format_cell_range(wks, 'A1:B1', headerFormat)
    batch.format_cell_range(wks, f'A{len(categories) + 3}:D{len(categories) + 3}', headerFormat)
    batch.format_cell_range(wks, 'F6:H6', headerFormat)
    batch.format_cell_range(wks, f'B2:B{len(categories) + 1}', currencyFormat)
    batch.format_cell_range(wks, 'F7:H7', currencyFormat)
    batch.format_cell_range(wks, f'A2:A{len(categories) + 1}', borderFormat)
    batch.format_cell_range(wks, f'A{len(categories) + 4}:A{(len(categories) + 4) + (len(rows) - 1)}', dateFormat)
    batch.format_cell_range(wks, f'B{len(categories) + 4}:B{(len(categories) + 4) + (len(rows) - 1)}', borderFormat)
    batch.format_cell_range(wks, f'C{len(categories) + 4}:C{(len(categories) + 4) + (len(rows) - 1)}', borderFormat)
    batch.format_cell_range(wks, f'D{len(categories) + 4}:D{(len(categories) + 4) + (len(rows) - 1)}', currencyFormat)

    # width of columns was pre-determined
    batch.set_column_width(wks, 'A', 160)
    batch.set_column_width(wks, 'B', 320)
    batch.set_column_width(wks, 'C', 160)
    batch.set_column_width(wks, 'D', 150)
    batch.set_column_width(wks, 'F', 125)
    batch.set_column_width(wks, 'G', 150)
    batch.set_column_width(wks, 'H', 115)

    # sends all updates in one API call preventing the API from being overloaded
    batch.execute()

# removes the temp file created to make this function
def cleanup():
    os.remove(completeName)
    time.sleep(2)

# Function that inputs all transactions into another table
def insertExpenses(wks, startRow, rows, progress):
    addedProgress = progress / len(rows)
    offset = 0
    print("Writing expenses...")
    for row in reversed(rows):
        wks.insert_row([row[0], row[1], row[2], row[3]], int(startRow))
        time.sleep(2)
        wks.update(f'A{(len(categories) + 4)}', row[0], value_input_option='USER_ENTERED')
        time.sleep(2)
        wks.update(f'D{(len(categories) + 4)}', row[3], raw=False)
        time.sleep(2)
        eel.updateProgressBar(addedProgress, "Inserting Expenses...")
        time.sleep(2)
    print("Expenses done!")

# Function that creates a new sheet in the linked Google Sheets project
def createSheet(sheetName, rows, isLast):
    eel.updateSheetTitle(sheetName)
    worksheet = sh.add_worksheet(title=sheetName, rows=200, cols=20)
    worksheet.insert_row(["Expense Name", "Total"], 1)
    eel.updateProgressBar(10, "Inserting Categories...")
    catRows = len(categories) + len(rows)
    catProgress = 70 * (len(categories) / catRows)
    rowProgress = 70 * (len(rows) / catRows)
    insertCategories(worksheet, 2, catProgress)
    worksheet.insert_row(["Date", "Description", "Category", "Amount (USD)"], len(categories) + 3)
    eel.updateProgressBar(0, "Inserting Expenses...")
    insertExpenses(worksheet, len(categories) + 4, rows, rowProgress)
    eel.updateProgressBar(0, "Adding base formatting...")
    updateFormatting(worksheet, rows)
    eel.updateProgressBar(5, "Cleaning up...")
    cleanup()
    eel.updateProgressBar(5, "Done!")
    print("Finished worksheet!")
    time.sleep(2)
    if isLast:
        print("All worksheets Done!")
        eel.done()


# Connect service account, open the correct Google Sheets project
sa = gspread.service_account()
sh = sa.open("Bank Tracker")

#def main():
    # Create a sheet with name taken from second command line argument
    #createSheet(sys.argv[2])

# Push all arguments into main function to be used if necessary
if __name__ == "__main__":
    eel.init('web')
    eel.start('index.html', size=(win_width,win_height), position=((screen_width / 2) - (win_width / 2), (screen_height / 2) - (win_height / 2)))