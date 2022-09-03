# bank-tracker
Automated bank expense tool that uploads all expenses for the month into Google Sheets. Made using Python

# Set-Up
In order to get this to work properly you will need to:
+ You must have Google Chrome installed.
+ Create a project on the Google Developer Console.
+ Create a Service Account.
+ Download the Service Account's key and put it in the proper folder.
+ Create a new Google Sheet and share it with the Service Account as an Editor.
+ You will need to make sure you have enabled the Google Drive API and Google Sheets API.
[More detailed instructions can be found in Google's documentation](https://docs.gspread.org/en/latest/oauth2.html)

*NOTE*

Not all Bank CSV's are the same, the section where I pick out the rows that I want is specific to my Bank's format. You will need to adjust this depending on how your CSVs are formatted.

# Usage - Windows
In order to launch the app you will need to have [Python3](https://www.python.org/downloads/windows/) installed.

Open Windows Terminal/Powershell/Command Prompt and execute the following command:

`python <path-to-file>\banktracker.py`

# Usage - Linux
*FOR LINUX IT MAY ALREADY BE INSTALLED*

Install Python3 through your package manager.

Execute the following command:

`python <path-to-file>/banktracker.py`

## Debian

`sudo apt install python3`

## Arch

`sudo pacman -S python3`

# Example
As an example here is a similar .csv to what I used:

`posted,,03/29/2022,,TOTALLY REAL EXPENSE,Restaurants/Dining,-5.55`

`posted,,03/28/2022,,DEFINITELY NOT JUST AN EXAMPLE,General Merchandise,-43.4`

`posted,,03/28/2022,,THANKS FOR CHECKING OUT MY GITHUB,Pet Care/Pet Items,-17.9`

I then run the script:
`python .\banktracker.py`

The program is launched and you are presented with the file upload page:

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/tracker_gui_main_page.png "The file upload screen.")
*The file upload screen.*

After either drag-n-drop of the file or picking it through the file browser you will be prompted to name the sheet.
If you do not specify a name Google will by default name the sheet "Sheet<number>":

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/sheet_naming_page.png "The sheet naming page.")
*The sheet naming page.*

Click the submit button and the sheet will begin to be created. Depending on the length of your CSV this can take quite
some time. This is due to the fact that Google limits API calls and delays had to be inserted between each call:

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/uploading_page.png "Loading bar displayed while file is uploaded.")
*Loading bar displayed while file is uploaded.*

After the file has been uploaded it will do some basic formatting to make the data cleaner.

You can then format the data further to make it look nicer:

![alt text](https://github.com/Dbevan770/bank-tracker/blob/main/example_formatted.png "Example of Data Formatted.")
*Example of Data Formatted.*


# What's New?
## Version 0.3.0 (Current)
+ Changes to the background
+ Sheet Submit field is now a form; this allows you to start by pressing 'Enter' on your keyboard rather than clicking the button
+ Added automatic formatting matching the example above
+ Moved app version display to top-right
+ Added temporary icon (to be replaced later)

## Version 0.2.0 (Old)
+ Added support for multiple files across both drag-n-drop and click-to-browse
+ Limit of 5 files at a time
+ Tuned delays between API calls to try and prevent any over exertion
+ Added app version display in the bottom right-hand corner
+ Added footer with copyright and link to my GitHub
+ Bug fixes and misc. tweaks to automation and ease of use

## Version 0.1.0 (Old)
This program now has a fully functional GUI. However, upon completion of uploading one file you will need to restart the program to upload another one.

# Planned Additions
Future versions I would like to implement the ability to return to the main page and begin uploading again. I would also like to add more automation including telling the app which rows in your CSV correspond to which categories.
