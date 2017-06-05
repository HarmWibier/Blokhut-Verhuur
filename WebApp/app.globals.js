/*
Determines the week number of the given date object.

@param  dDate   Date object.
@return The week number.
*/
function dateToWeek(dDate) {
    var week1, date;

    date = new Date(dDate.getTime());

    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}


var globals = {
    dagdelen : [ 
        { id : 0, value : "Ochtend" },
        { id : 1, value : "Middag" },
        { id : 2, value : "Avond" }
    ],
    
    statussen : { 
        0 : "Aangevraagd"   ,
        10 : "Gereserveerd" ,
        20 : "Betaald" ,
        90: "Geannuleerd" 
    }
    
    
}