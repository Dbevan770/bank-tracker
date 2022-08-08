# bank-tracker
Automated bank expense tool that uploads all expenses for the month into Google Sheets. Made using Python

# Set-Up
In order to get this to work properly you will need to:
+ Create a project on the Google Developer Console.
+ Create a Service Account.
+ Download the Service Account's key and put it in the proper folder.
+ Create a new Google Sheet and share it with the Service Account as an Editor.
+ You will need to make sure you have enable the Google Drive API and Google Sheets API.

*NOTE*

Not all Bank CSV's are the same, the section where I pick out the rows that I want is specific to my Bank's format. You will need to adjust this depending on how your CSVs are formatted.

# Usage
In the command line this script is used as follows:

`python <path\to\file>\banktracker.py <.csv file name> <intended name of sheet>`

# Example
As an example here is a similar .csv to what I used:
`posted,,03/29/2022,,TOTALLY REAL EXPENSE,Restaurants/Dining,-5.55`
`posted,,03/28/2022,,DEFINITELY NOT JUST AN EXAMPLE,General Merchandise,-43.4`
`posted,,03/28/2022,,THANKS FOR CHECKING OUT MY GITHUB,Pet Care/Pet Items,-17.9`

I then run the script:
`python .\banktracker.py example.csv example`

A new sheet is created and the data is uploaded to Google Sheets:

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/example_unformatted.png "Example of Data Unformatted.")

You can then format the data yourself to make it look nicer:

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/example_formatted.png "Example of Data Formatted.")


# Current Features
At the moment it will create headings for 2 seperate tables where it will list all categories of expenses and then a separate table with all the expenses themselves.
If your CSV does not come with catergories you could write your own or add some sort of dictionary for that as well.

# Planned Additions
I plan to continue to make it as hands off as possible. Potentially I would like to add a GUI that allows you to drop in the .csv file instead of manually
typing it into the command line.
