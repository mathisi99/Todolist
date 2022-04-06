
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
    var data = String(string).toLowerCase()
    return data.charAt(0).toUpperCase() + data.slice(1);
  }

module.exports.checkEmptyObject = function(obj){
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}