const fs = require('fs');
const d3 = require('d3-dsv');
const stringSimilarity = require('string-similarity');

/**
@ Read in data and parse it
*/
const data = fs.readFileSync("data/office-hour-calendar-20180711.csv").toString()
let calendar = d3.csvParse(data);
// turn skills in to array
calendar.forEach(person => {
	person.specialties = person.specialties.split(',')
	person.specialties = person.specialties.map(skill => skill.trim())
})


/**
@ Get unique specialities from people calendar
*/
function getUniqueSpecialties(calendar){
	let specialties = [];
	
	calendar.forEach(person => {
		if(person.specialties){
			specialties.push(person.specialties);	
		}
		
	})
	specialties = specialties.reduce(function(prev, curr) {
	  return prev.concat(curr);
	});

	let uniqueSpecialties = Array.from(new Set(specialties))
	uniqueSpecialties = uniqueSpecialties.map(item => item.toUpperCase())

	return uniqueSpecialties
}


/**
@ Calculate specialty similarity index by stringSimilarity
*/
function calculateSpecialtySimilarity(specialties){
	let uniqueSpecialties = specialties.slice(0);

	let output = {}
	uniqueSpecialties.forEach( (skill1, idx1) => {
		let val = {skill: skill1, scores:{}}
		uniqueSpecialties.forEach( (skill2, idx2) => {
			if(skill1 !== skill2){
				val.scores[skill2] = stringSimilarity.compareTwoStrings(skill1, skill2)
			}
		})
		output[skill1] = val;
	})
	return output;
}

/**
@ Cluster specialties if the score is better than 0.5
*/
function clusterSpecialties(specialtySimilarityObject){

	let scoreKeys = Object.keys(specialtySimilarityObject)
	let usedKeys = []
	let clusters = [];

	scoreKeys.forEach( (score1, pos1, arr1) => {

		if(usedKeys.includes(score1) == false ){
			let group = [];
			arr1.forEach( (score2, pos2, arr2) => {
				if(specialtySimilarityObject[score1].scores[score2] > 0.5){
					usedKeys.push(score2)
					usedKeys.push(score1)
					group.push(score2)
					group.push(score1)
				}
			})
			group.sort()
			group = Array.from(new Set(group))
			if(group.length > 0) clusters.push(group);	
		}
		

	})
	
	clusters.sort()

	return clusters

}



/**
@ clusterPeopleBySkills()
@ determine the similarity of each person based on the number of shared skills they have
@ 
*/
function clusterPeopleBySkills(calendar, clusteredSpecialties){
	let newCalendar = calendar.slice(0);

	
	newCalendar.forEach(person => {
		// add a new property "similarStaff"
		person.similarStaff = [];
		person['tags'] = [];
		// add all associated Tags from clustered data
		clusteredSpecialties.forEach( (group) => {
			person.specialties.forEach( specialty => {
				let specialtyUpper = specialty.toUpperCase()
				if(group.includes(specialtyUpper) == true){
					// group.find( item => item == specialtyUpper)
					// group.reduce((a, b) => a.concat(b))
					person['tags'].push( group )
				}
			})
		})

		person.tags = [].concat(...person.tags)
	})

	// for each person
	// go through each of their skills
	// for each of their skills
	// check if they share any common skills, 
	// if so, add them to the current person's list
	newCalendar.forEach( (person1, pos1, arr1) => {

		
		arr1.forEach( (person2, pos2, arr2) => {
				if(person1.name !== person2.name){
					let addPerson = false;
					person1.tags.forEach( tag => {

						if( person2.tags.includes(tag)){
							addPerson = true;
						}

					})

					if(addPerson == true){
						person1.similarStaff.push(person2.name)
					}
				}
		})

	})

	// console.log(newCalendar[10] )

	return newCalendar;



}
let clusteredData = clusterSpecialties(calculateSpecialtySimilarity( getUniqueSpecialties(calendar) ))
let newCalendar = clusterPeopleBySkills(calendar, clusteredData)


/**
@ Create select option
*/
function createListItem(person){
	return `<option value="${person.appointmentCalendar}" data-specialties="${person.specialties.join(", ")}" data-email="${person.email}" data-similar="${person.similarStaff.join(", ")}">${person.name}</option>`
}

/**
@ Create dropdown
*/
function createDropdown(people){

	let options = people.map(person => {
		return createListItem(person);
	})

	return `<select id="myCalendarId">${options.join('')}</select>`
	
}
createDropdown(newCalendar)



// Write to file
fs.writeFile("calendarDropdown.html", createDropdown(calendar).toString(), function(err, data){
	if(err) return err
	console.log("done!")
} )



/* **************************
Sample Data
{ name: 'Aaron Montoya-Moraga',
   specialties: 'ICM, Comm Lab Sound, NIME, Immersive Listening, p5.js, Processing, Max/MSP, Puredata, Python, JavaScript, GitHub, audio recording, audio mixing',
   appointmentCalendar: 'https://calendar.google.com/calendar/selfsched?sstoken=UVAwZjVrNFBLLVhSfGRlZmF1bHR8NjliNWQzODQ2OGM2MzBkMDU1OTk4ZTEyOTY5ZjQxMjA',
   email: 'montoyamoraga@nyu.edu' },
*/