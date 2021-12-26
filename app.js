const express = require ("express");
const app = express();
const bodyParser = require ("body-parser");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-Fahad:Test123@cluster0.pobst.mongodb.net/todolistDB", {useNewUrlParser: true})
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');
const workItems =[];

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems =[item1, item2, item3];

const listSchema = {
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
    // const day = date.getDate();
    Item.find({},function(err, foundItems) {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log("Error");
                }else{
                    console.log("Successfully added initial items.");
                }
                res.redirect("/");
            });
        }else{
            res.render("lists", {listTitle: "Today"/*day*/, listOfItems: foundItems});
        }
    });
});

app.get("/:customListName",function(req,res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName}, function(err, foundList){
     if(!err){
         if(!foundList){
             const list = new List({
                 name:customListName,
                 items: defaultItems
             });
             list.save();
             res.redirect("/"+customListName);
         }else{
             res.render("lists", {listTitle: foundList.name, listOfItems: foundList.items});
         }
     }
    });
});


app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item ({
        name: itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

    
//     if(req.body.list === "Work"){
//         workItems.push(item);
//         res.redirect("/work");
//     }
//     else {
//         items.push(defaultItems);
//         res.redirect("/");
//     }
});

app.post("/delete", function (req,res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully Deleted item.");
                res.redirect("/");
            }});
    }else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}}, function(err,foundItem){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});



// app.get("/work", function(req,res){
//     res.render("lists", {listTitle:"Work", listOfItems: workItems});
// });

// app.get("/about", function(req,res){
//     res.render("about");
// });

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});