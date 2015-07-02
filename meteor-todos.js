Tasks = new Mongo.Collection("tasks"); // Mongo db name "tasks"

if(Meteor.isClient){
  
  Template.body.helpers({     // define any new helpers inside "body" HTML tags
    tasks: function(){        // helper name "Tasks"
      if(Session.get('apples')) { // get the value of the session key name("apples") and checked its value
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});  // if TRUE return only data found from Tasks db that are NOT checked, sorted by newest -> oldest
      }else{
        return Tasks.find({}, {sort: {createdAt: -1}}); //if FALSE (not checked), return all tasks
      }
    },
    hideCompleted: function(){  //help name "hideCompleted"
      Session.get("apples"); // Session.get(key) - get the value of the session key name("apples")
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events ({     // Event listener
    "submit .new-task": function(event){  //perform action when submit/enter is pressed with the class of .new-task(form)
      var text = event.target.text.value; //get the value of the input form "event.target.text(is the name of the input tag).value"

      Tasks.insert({            // insert collection
        text: text,             // db field "text"
        createdAt: new Date(),  // db field "createdAt" to be able to sort data
        owner: Meteor.userId(), // db field of _id logged in user
        username: Meteor.user().username //username of logged in user
      });

      event.target.text.value = ""; // clear input form after submit

      return false; // tells the web browser to not do the default form submit action since it is already being handled
    },
    "change .hide-completed": function(event){ // perform action when value of class .hide-completed(checkbox) changes(checked/unchecked)
      Session.set("apples", event.target.checked); // Session.set("some key name", value) - set a variable in the session
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){ // perform action when class ".toggle-checked" (input type="checkbox") is clicked
      Tasks.update(this._id, {$set: {checked: !this.checked}}); // set the checked field to the opposite of its current value
    },
    "click .delete": function(){  // perform action when class ".delete" (button) is clicked
      Tasks.remove(this._id); // remove task when ".delete"(button) is clicked
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY" //configure accounts UI to use usernames instead of email addresses
  });
}