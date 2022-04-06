const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { capitalizeFirstLetter } = require("./date");
const { stringify } = require("nodemon/lib/utils");
const PORT = process.env.PORT || 3000;
const date = require(__dirname + "\\date.js");

const app = new express();
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB")


const taskSchema = mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    addTime: { 
        type: Date, 
        default: Date.now
    },
})

const Task = mongoose.model("Task", taskSchema)

function createTaskObj(content){
    if (content === '') return undefined;
    const newTask = new Task({
        content,
    });
    newTask.save()
    return newTask
}

const listSchema = {
    name: {
        type:String,
        unique: true,
    },
    items: [taskSchema],
    
}
const list = mongoose.model("List", listSchema)

//can do the email, password validation, and adding encryption for password
const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "There are entry input for user first name, please check it"]
    },
    lastname: {
        type: String,
        required: [true, "There are entry input for user last name, please check it"]
    },
    username: {
        type: String,
        required: [true, "There are entry input for user username, please check it"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "There are entry input for user password, please check it"]
        // set: Data.prototype.saltySha1 // some function called before saving the data
    },
    emailaddress:{
        type: String,
        required: [true, "There are entry input for user email, please check it"],
        unique: true
    },
    // todolist: [taskSchema],

    customlist: [listSchema]
})



const User = mongoose.model("User", userSchema)


async function createNewUser(firstname, lastname, username, password, emailaddress){
    let user = await User.findOne({username}).exec() 
    if (Object.keys(user).length > 0){
        return
    }
    let newUser = new User({
        firstname,
        lastname,
        username,
        password,
        emailaddress,
        "customlist": [{
            name: "home",
            items: [{ content: "Typing your work then press + sign to add to list" }, { content: "<-- press this button to delete the item when you are done" }, { content: "Enjoy! Thank you for using ❤️❤️❤️"}]
        }]
    });
    newUser.save()
}

//comment this after 


createNewUser("Ron", "Pieces", "ronpieces", "Roncen@12", "chatzalo1@gmail.com")  
    


app.get("/", (req, res) => {
    res.redirect("/home")
})
async function newList(name){
    var listResult = await list.find({name}).exec() // new feature of ES6 
    // listResult = "" then if (listResult) will be true
    if (Object.keys(listResult).length === 0) {
        const listObj = list({
            name,
            items: []
        })

        listObj.save()
        return listObj
    }
}

function findItemObj(results, name){
    var itemObj;    
    for (let i = 0; i< results.customlist.length; i++){
        if (results.customlist[i].name == name){
            itemObj = results.customlist[i]
            break
        } 
    }
    return itemObj
}


app.get("/:id", async (req, res) => {
    if (req.params.id == "favicon.ico") return;
    const capitalizePath = capitalizeFirstLetter(req.params.id)
    const lowercaseName = String(req.params.id).toLowerCase()
    //check duplicate list
    // Home and home and HOme HOMe HOME are same to home lis    t 
    var listObj = await newList(lowercaseName)

    User.findOne(
        {'username': "ronpieces"},
        (err, results) => {
            
            // {$push: {'customlist': listObj}},
            if (err){
                console.log(err);
            }else{
                //find items obj
                var itemObj = findItemObj(results, lowercaseName)
                //itemObj.items.push(listObj) // this way will much faster than my own way
                //itemObj.save()
                if (itemObj == undefined) {
                    User.updateOne({username: "ronpieces"}, {$push : {customlist: listObj}}, (err) => {
                        if (err){
                            console.log(err);
                        }else{
                            console.log("Successfully add new list for user");
                        }
                    })
                }else{
                    res.render("home", {
                        "pageTitle": `${capitalizePath} List`,
                        "title" : capitalizePath,
                        "items": itemObj
                    })
                }
            }
        })
    
})


app.post("/", (req, res) => {
    let task = createTaskObj(req.body.newItem)
    let lowercaseURL = String(req.body.addButton).toLowerCase()
    
    if (task === undefined) return;
    
    User.findOneAndUpdate(
        {username: "ronpieces", 'customlist.name': lowercaseURL}, 
        {$push: {'customlist.$.items': task}},
        {},
        (err, success) => {
            if (err) {
                console.log(err);
            }else{
                console.log("update successfull");   
                res.redirect(`/${lowercaseURL}`);
            }
        }
    )
});


app.post("/delete", (req, res) => {
    //better to use the req.body.screenID, it will better

    const url = String(req.rawHeaders[37]).split("/").at(-1); 
    // if (req.route.path != "/"){
        User.updateOne(
            {"username": "ronpieces", "customlist.items._id": req.body.checkbox}, //itemsID
            {$pull: {"customlist.$.items": {_id: req.body.checkbox}}},
            (err, success) => {
                if (err) {
                    console.log(err);
                }else{
                    console.log("delete successfully");
                    res.redirect(`${url}`)
                }
            }
        )
        
    
})



app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(PORT, (req, res) => {
    console.log(`using http://localhost:${PORT}`);
});

