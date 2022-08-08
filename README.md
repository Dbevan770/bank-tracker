# bank-tracker
Automated bank expense tool that uploads all expenses for the month into Google Sheets. Made using Python

# Set-Up
In order to get this to work properly you will need to create a project on the Google Developer Console and create a service account.
After that you will need to download the Service Account's key and put it in the proper folder.
Create a new Google Sheet and share it with the Service Account as an Editor.
Not all Bank CSV's are the same, the section where I pick out the rows that I want is specific to my Bank's format. You will need to adjust this depending on how you CSVs are formatted.

# Usage
In the command line this script is used as follows:
python <.csv file name> <intended name of sheet>

# Current Features
At the moment it will create headings for 2 seperate tables where it will list all categories of expenses and then a separate table with all the expenses themselves.
If your CSV does not come with catergories you could write your own or add some sort of dictionary for that as well.

# Planned Additions
I plan to continue to make it as hands off as possible. Potentially I would like to add a GUI that allows you to drop in the .csv file instead of manually
typing it into the command line.
