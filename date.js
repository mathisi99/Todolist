
//hoisting , so this one will work follow the flow
module.exports.getDate = function() {
    const d = new Date();
    const dayName = d.toLocaleDateString('en-US', {
        weekday: "long",
        day: "numeric",
        month: "long"
    })
    return dayName
}

module.exports.getDay = function (){
    const d = new Date();
    const  dayName = d.toLocaleDateString('en-US', {
        weekday: "long",
    })
    return dayName
}


module.exports.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }