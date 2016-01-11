Compliments = new Mongo.Collection("compliments");

//if (Meteor.isClient){
//  Template.compliments.helpers({
//      compliment: function(){
//        var random = _.sample(Compliments.find().fetch());
//        var c = Compliments.findOne({_id: random && random._id}, {fields: {'text': 1}});
//        return c.text;
//      }
//    });
//  }

if (Meteor.isClient){
  var ONE_MIN = 1 * 60 * 1000;
  var chooseRandom = function() {
    var compliments = Compliments.find().fetch();
    var randomComp = Random.choice(compliments);
    console.log(randomComp);
    Session.set('currentComp', randomComp);
    console.log(currentComp);
  };

  Template.compliments.helpers({
    compliment: function() {
      var c = Compliments.findOne(Session.get('currentComp'));
      return c.text;
    }
  });

    Template.compliments.created = function() {
      this.handle = Meteor.setInterval(chooseRandom, ONE_MIN);
    };

    Template.compliments.destroyed = function() {
      Meteor.clearInterval(this.handle);
    };


}
