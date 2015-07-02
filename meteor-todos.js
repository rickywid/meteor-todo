Tasks = new Mongo.Collection("tasks"); // Mongo db name "tasks"

if(Meteor.isClient){
  Meteor.subscribe("tasks");
  
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

      Meteor.call("addTask", text); // call method "addTask", while passing argument text


      event.target.text.value = ""; // clear input form after submit

      return false; // tells the web browser to not do the default form submit action since it is already being handled
    },
    "change .hide-completed": function(event){ // perform action when value of class .hide-completed(checkbox) changes(checked/unchecked)
      Session.set("apples", event.target.checked); // Session.set("some key name", value) - set a variable in the session
    }
  });

  Template.task.helpers({
    isOwner: function(){
      return this.owner === Meteor.userId();
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){ // perform action when class ".toggle-checked" (input type="checkbox") is clicked
      Meteor.call("setChecked", this._id, !this.checked); // call method "setChecked", while passing argument !this.checked
    },
    "click .delete": function(){  // perform action when class ".delete" (button) is clicked
      Meteor.call("deleteTask", this._id); // call method "deleteTask", while passing argument this._id
    },
    "click .toggle-private": function(){
      Meteor.call("setPrivate",this._id, !this.private);
    }
  });

  // Accounts-UI package
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY" //configure accounts UI to use usernames instead of email addresses
  });
}

Meteor.methods({
  addTask: function(text){
    // Make sure the user is logged in before inserting a task
    if(!Meteor.userId()){
      throw new Meteor.Error("not authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId){
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked){
    Tasks.update(taskId, {$set: { checked: setChecked}});
  },
  setPrivate: function(taskId, setToPrivate){
    var task = Tasks.findOne(taskId);

    if(task.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: {private: setToPrivate}});
  }

});


if(Meteor.isServer){
  Meteor.publish("tasks", function(){
    return Tasks.find({
      $or: [
        {private: { $ne: true }},
        {owner: this.userId }
      ]
    });
  });
}