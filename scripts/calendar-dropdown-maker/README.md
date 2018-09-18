# Calendar Dropdown Maker

So far we don't have a great way to do this, so here's a kind of hacky way to build the calendar dropdown menu.

## Step 1: Copy people from webpage and munge

* Highlight all the faculty and SIRS from the website https://sites.google.com/a/itp.nyu.edu/help/in-person/office-hours
* paste them into atom or sublime or whatever text editor you're using
* add "undefined" to the skills for those people without skill listed
* make any skills with multiple lines into a single line
* do `find: nyu.edu` to get all cursors at the email address
* make sure that any extra faculty without a `nyu.edu` email address is also selected
* add quotations to the `email`, `specialties`, and `name` of the person
* add a comma in between `email`, `specialties`, and `name` and collapse to one line per entry
* copy all and paste into spreadsheet

## Step 2: add google calendar Link
* copy and paste the google calendar link from the website to their respective row in the spreadsheet you're working from.

## Step 3: run calendar dropdown maker

* make sure to change the input for the `office-hour-calendar-YYYMMDD.csv`
* make sure to change the input for the `calendarDropdown-YYYMMDD.html`

```
node index.js
```

## Step 4: update index.html
* copy the contents of  `calendarDropdown-YYYMMDD.html` and replace the contents in "index.html" under the `<select></select>`


## Step 5: update ITP website

* go to: https://sites.google.com/a/itp.nyu.edu/help/in-person/office-hours/request
* login
* click the pen button to edit the page
* click the gear icon
* copy and paste the entire `index.html` into the html editor and save
