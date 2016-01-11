if (Meteor.isClient){

Template.time.helpers({
  time: function(){
    return Chronos.liveMoment().format("hh:mma");
  }
});
}
