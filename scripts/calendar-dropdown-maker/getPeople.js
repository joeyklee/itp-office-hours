const rp = require('request-promise');
const cheerio = require('cheerio'); // Basically jQuery for node.js
const Json2csvParser = require('json2csv').Parser;
const fields = ['name', 'appointmentCalendar', 'specialties','email'];
const json2csvParser = new Json2csvParser({ fields });
const fs = require('fs');

function newPerson(name, appointmentCalendar,specialties,email){
  return {
    name,
    appointmentCalendar,
    specialties,
    email
  }
}

var output = [];


var options = {
    uri: 'http://help.itp.nyu.edu/in-person/office-hours',
    transform: function (body) {
        return cheerio.load(body);
    }
};

rp(options)
    .then(function ($) {
        // Process html like you would with jQuery...
        $(".sites-tile-name-content-1 a").each( (idx, element) => {
          // if ($(element).css("font-weight") ){
          //   console.log($(element).text())
          // }
          // console.log($(element).text())
          // console.log($(element).attr("href") )
          let name = $(element).text()
          let calLink = $(element).attr("href")
          output.push( newPerson(name, calLink) )
        })

        console.log(output)

        const csv = json2csvParser.parse(output);

        console.log(csv)

        fs.writeFile("people-latest.csv", csv, (err, data) =>{
          if(err) console.log(err);
          console.log("success!")
        })
    })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
        console.log(err)
    });
